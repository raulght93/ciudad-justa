// Ciudad Justa · API (Cloudflare Worker) — fase E1a: lectura + escritura básica.
// Superficie de docs/04 §4.6. D1 = almacén de la capa caliente.
// Votación/reputación/moderación llegan en E1b-E1e (ver docs/07).

import { geohash } from "./geohash.js";

// Categorías válidas de la taxonomía (docs/04 §4.2). Espejo del CHECK del esquema.
const CATEGORIES = new Set([
  "anti_lie_down", "anti_sit", "spikes", "barrier",
  "surface", "surveillance", "light_sound", "ghost_amenity",
]);

// Tipos de exclusión (espejo del CHECK de reports.type).
const TYPES = new Set(["hostile", "climate", "housing", "service"]);

// EIPD/DPIA M-7 (docs/legal/dpia-borrador.md, riesgo R-4): para los tipos que pueden
// involucrar a personas (arquitectura hostil → donde alguien puede pernoctar), se OFUSCA
// la precisión de las coordenadas antes de persistir. 3 decimales ≈ 100 m, irreversible:
// el punto exacto nunca se almacena. Los tipos de infraestructura conservan precisión.
export const SENSITIVE_TYPES = new Set(["hostile"]);
export function blurCoord(v) {
  return Math.round(v * 1000) / 1000; // ~100 m
}

// Umbrales de transición de estado por score (docs/04 §4.4). Configurables.
const UNDER_REVIEW_AT = 2; // score ≥ → entra en cola de revisión
const CONFIRM_AT = 5; //       score ≥ → confirmado por la comunidad
// Estados que el score puede mover automáticamente (los demás son de moderación).
const AUTO_STATUS = new Set(["reported", "under_review", "confirmed"]);

function statusForScore(score) {
  if (score >= CONFIRM_AT) return "confirmed";
  if (score >= UNDER_REVIEW_AT) return "under_review";
  return "reported";
}

// Reputación dinámica (E1c, docs/04 §4.4). Se liquida cuando un reporte queda
// CONFIRMADO por la comunidad: premia a quien acertó (votó +1 y al autor),
// penaliza a quien votó en contra. Acotada a [REP_MIN, REP_MAX]. Los pesos de
// los votos ya emitidos NO se tocan (están congelados): solo cambia la
// reputación de cara a votos futuros.
const REP_REWARD = 0.2;
const REP_PENALTY = 0.3; // penalizar pesa más que premiar (frena cuentas desechables)
const REP_MIN = 0.2;
const REP_MAX = 5.0;

async function settleReputationOnConfirm(db, reportId) {
  await db.batch([
    db.prepare(
      "UPDATE users SET reputation = MIN(?, reputation + ?) " +
      "WHERE id IN (SELECT user_id FROM votes WHERE report_id = ? AND value = 1)"
    ).bind(REP_MAX, REP_REWARD, reportId),
    db.prepare(
      "UPDATE users SET reputation = MAX(?, reputation - ?) " +
      "WHERE id IN (SELECT user_id FROM votes WHERE report_id = ? AND value = -1)"
    ).bind(REP_MIN, REP_PENALTY, reportId),
    db.prepare(
      "UPDATE users SET reputation = MIN(?, reputation + ?) " +
      "WHERE id = (SELECT created_by FROM reports WHERE id = ?)"
    ).bind(REP_MAX, REP_REWARD, reportId),
  ]);
}

// Liquidación inversa al RECHAZAR (E1e): penaliza autor y votantes +1
// (apoyaron algo falso), premia a quien votó -1 (acertó al dudar).
async function settleReputationOnReject(db, reportId) {
  await db.batch([
    db.prepare(
      "UPDATE users SET reputation = MAX(?, reputation - ?) " +
      "WHERE id IN (SELECT user_id FROM votes WHERE report_id = ? AND value = 1)"
    ).bind(REP_MIN, REP_PENALTY, reportId),
    db.prepare(
      "UPDATE users SET reputation = MIN(?, reputation + ?) " +
      "WHERE id IN (SELECT user_id FROM votes WHERE report_id = ? AND value = -1)"
    ).bind(REP_MAX, REP_REWARD, reportId),
    db.prepare(
      "UPDATE users SET reputation = MAX(?, reputation - ?) " +
      "WHERE id = (SELECT created_by FROM reports WHERE id = ?)"
    ).bind(REP_MIN, REP_PENALTY, reportId),
  ]);
}

// Acción de moderación → estado destino (docs/04 §4.3).
const MOD_ACTIONS = {
  confirm: "confirmed",
  reject: "rejected",
  document: "documented",
  dispute: "disputed",
  restore: "reported",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

// --- Auth de moderación (magic-link). Sustituye al secreto compartido MOD_TOKEN,
// que se conserva como fallback. Ver docs/06 §6.4 y backlog 🟠. ---
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
const LOGIN_TTL_MS = 15 * 60 * 1000; // 15 min
// EIPD/DPIA §1.6: la foto difuminada se purga 30 días después de retirarse el reporte.
const PHOTO_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const opaqueToken = () =>
  (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");

// Envía el enlace mágico por email vía Resend. Devuelve true si se envió.
// Si no hay RESEND_API_KEY configurada, no envía (el caller decide el fallback dev).
async function sendMagicLink(env, email, url) {
  if (!env.RESEND_API_KEY) return false;
  const from = env.MAIL_FROM || "Ciudad Justa <login@ciudad-justa.org>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Tu enlace de acceso · Ciudad Justa",
      html:
        `<p>Entra al panel de moderación de Ciudad Justa:</p>` +
        `<p><a href="${url}">${url}</a></p>` +
        `<p>Caduca en 15 minutos y solo sirve una vez. Si no lo pediste, ignora este correo.</p>`,
    }),
  }).catch(() => null);
  return !!(res && res.ok);
}

// Resuelve el actor autorizado de una petición: (1) sesión magic-link por Bearer,
// (2) fallback legacy MOD_TOKEN + rol por x-device-id. Devuelve {id, role} | null.
async function resolveActor(env, request) {
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (bearer && env.DB) {
    const s = await env.DB
      .prepare("SELECT user_id, role, expires_at FROM sessions WHERE token = ?")
      .bind(bearer)
      .first();
    if (s && s.expires_at > Date.now()) return { id: s.user_id, role: s.role };
  }
  // Fallback legacy: si MOD_TOKEN está configurado, el Bearer debe coincidir.
  if (env.MOD_TOKEN && bearer !== env.MOD_TOKEN) return null;
  const device = request.headers.get("x-device-id") || "anon";
  const u = await env.DB.prepare("SELECT id, role FROM users WHERE id = ?").bind(device).first();
  return u ? { id: u.id, role: u.role } : null;
}

// Retención/lifecycle (EIPD/DPIA §1.6): borra de R2 + BD las fotos de reportes
// RETIRADOS (status 'rejected') hace más de 30 días, y limpia tokens/sesiones
// caducados. Idempotente; se invoca desde el cron `scheduled`. Devuelve un recuento.
export async function runRetention(env, now = Date.now()) {
  const counts = { photos: 0, tokens: 0, sessions: 0 };
  if (!env.DB) return counts;
  const cutoff = now - PHOTO_RETENTION_MS;
  const stale = await env.DB
    .prepare(
      "SELECT p.id AS pid, p.r2_key AS key FROM photos p JOIN reports r ON r.id = p.report_id " +
      "WHERE r.status = 'rejected' AND r.updated_at < ?"
    )
    .bind(cutoff)
    .all();
  for (const row of stale?.results || []) {
    if (env.PHOTOS) await env.PHOTOS.delete(row.key);
    await env.DB.prepare("DELETE FROM photos WHERE id = ?").bind(row.pid).run();
    counts.photos++;
  }
  const t = await env.DB.prepare("DELETE FROM login_tokens WHERE expires_at < ?").bind(now).run();
  const s = await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now).run();
  counts.tokens = t?.meta?.changes ?? 0;
  counts.sessions = s?.meta?.changes ?? 0;
  return counts;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type, authorization, x-device-id",
        },
      });
    }

    // GET /api/reports?bbox=minLng,minLat,maxLng,maxLat&status=confirmed
    if (pathname === "/api/reports" && request.method === "GET") {
      const bbox = (url.searchParams.get("bbox") || "").split(",").map(Number);
      const status = url.searchParams.get("status");
      if (bbox.length !== 4 || bbox.some(Number.isNaN)) {
        return json({ error: "bbox requerido: minLng,minLat,maxLng,maxLat" }, 400);
      }
      const [minLng, minLat, maxLng, maxLat] = bbox;

      // D1: consulta espacial por bounding-box (índice idx_reports_bbox).
      let sql =
        "SELECT id,lat,lng,type,status,description,score FROM reports " +
        "WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?";
      const args = [minLat, maxLat, minLng, maxLng];
      if (status) {
        sql += " AND status = ?";
        args.push(status);
      }
      sql += " LIMIT 2000";

      if (!env.DB) return json({ error: "D1 no vinculado (configura [[d1_databases]])" }, 501);
      const { results } = await env.DB.prepare(sql).bind(...args).all();

      return json({
        type: "FeatureCollection",
        features: (results || []).map((r) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [r.lng, r.lat] },
          properties: { id: r.id, type: r.type || "hostile", status: r.status, description: r.description, score: r.score },
        })),
      });
    }

    // POST /api/reports  { lat, lng, categories[], description? }  (+ Turnstile en prod)
    if (pathname === "/api/reports" && request.method === "POST") {
      const body = await request.json().catch(() => null);
      if (!body || typeof body.lat !== "number" || typeof body.lng !== "number") {
        return json({ error: "lat y lng numéricos requeridos" }, 400);
      }
      if (body.lat < -90 || body.lat > 90 || body.lng < -180 || body.lng > 180) {
        return json({ error: "lat/lng fuera de rango" }, 400);
      }
      // Tipo de exclusión (default hostil) + categorías válidas de la taxonomía.
      const reportType = TYPES.has(body.type) ? body.type : "hostile";
      const categories = Array.isArray(body.categories)
        ? [...new Set(body.categories.filter((k) => CATEGORIES.has(k)))]
        : [];

      // TODO E1d: verificar Turnstile + rate-limit antes de escribir.
      if (!env.DB) return json({ error: "D1 no vinculado" }, 501);

      const id = crypto.randomUUID();
      const now = Date.now();
      // M-7: ofusca coordenadas de tipos sensibles antes de persistir (el exacto no se guarda).
      const sensitive = SENSITIVE_TYPES.has(reportType);
      const lat = sensitive ? blurCoord(body.lat) : body.lat;
      const lng = sensitive ? blurCoord(body.lng) : body.lng;
      const gh = geohash(lat, lng);
      // Usuario anónimo por dispositivo (cabecera opcional). INSERT idempotente.
      const device = request.headers.get("x-device-id") || "anon";

      const stmts = [
        env.DB.prepare(
          "INSERT OR IGNORE INTO users (id, role, reputation, created_at) VALUES (?, 'user', 1.0, ?)"
        ).bind(device, now),
        env.DB.prepare(
          "INSERT INTO reports (id, lat, lng, type, geohash, status, taxonomy_version, score, description, created_by, created_at, updated_at) " +
          "VALUES (?, ?, ?, ?, ?, 'reported', 1, 0, ?, ?, ?, ?)"
        ).bind(id, lat, lng, reportType, gh, body.description ?? null, device, now, now),
        ...categories.map((k) =>
          env.DB.prepare(
            "INSERT INTO report_categories (report_id, category_key) VALUES (?, ?)"
          ).bind(id, k)
        ),
      ];
      await env.DB.batch(stmts);

      return json({ id, status: "reported", type: reportType, categories, geohash: gh }, 201);
    }

    // POST /api/reports/:id/vote  { value: +1 | -1 }   (E1b — votación ponderada)
    const voteMatch = pathname.match(/^\/api\/reports\/([^/]+)\/vote$/);
    if (voteMatch && request.method === "POST") {
      const reportId = decodeURIComponent(voteMatch[1]);
      const body = await request.json().catch(() => null);
      if (!body || (body.value !== 1 && body.value !== -1)) {
        return json({ error: "value debe ser +1 o -1" }, 400);
      }
      if (!env.DB) return json({ error: "D1 no vinculado" }, 501);

      // El reporte debe existir (y no estar en un estado terminal de moderación).
      const report = await env.DB.prepare("SELECT status FROM reports WHERE id = ?")
        .bind(reportId).first();
      if (!report) return json({ error: "reporte no encontrado" }, 404);

      const device = request.headers.get("x-device-id") || "anon";
      const now = Date.now();

      // Asegura el usuario y lee su reputación (peso que se CONGELA en el voto).
      await env.DB.prepare(
        "INSERT OR IGNORE INTO users (id, role, reputation, created_at) VALUES (?, 'user', 1.0, ?)"
      ).bind(device, now).run();
      const user = await env.DB.prepare("SELECT reputation FROM users WHERE id = ?")
        .bind(device).first();
      const weight = user?.reputation ?? 1.0;

      // Upsert del voto (un voto por usuario y reporte; re-votar actualiza).
      await env.DB.prepare(
        "INSERT INTO votes (id, report_id, user_id, value, weight, created_at) VALUES (?, ?, ?, ?, ?, ?) " +
        "ON CONFLICT(report_id, user_id) DO UPDATE SET value = excluded.value, weight = excluded.weight, created_at = excluded.created_at"
      ).bind(crypto.randomUUID(), reportId, device, body.value, weight, now).run();

      // Recalcula el score ponderado y la transición de estado (sin tocar
      // estados de moderación: disputed/documented/rejected).
      const agg = await env.DB.prepare(
        "SELECT COALESCE(SUM(value * weight), 0) AS score FROM votes WHERE report_id = ?"
      ).bind(reportId).first();
      const score = Math.round((agg?.score ?? 0) * 100) / 100;
      const status = AUTO_STATUS.has(report.status) ? statusForScore(score) : report.status;

      await env.DB.prepare("UPDATE reports SET score = ?, status = ?, updated_at = ? WHERE id = ?")
        .bind(score, status, now, reportId).run();

      // E1c: al CONFIRMARSE por primera vez, liquida la reputación de la comunidad.
      const justConfirmed = status === "confirmed" && report.status !== "confirmed";
      if (justConfirmed) await settleReputationOnConfirm(env.DB, reportId);

      return json({ id: reportId, score, status, settled: justConfirmed });
    }

    // POST /api/auth/magic  { email }  — solicita enlace mágico (solo moderadores/admin).
    if (pathname === "/api/auth/magic" && request.method === "POST") {
      if (!env.DB) return json({ error: "D1 no vinculado" }, 501);
      const body = await request.json().catch(() => null);
      const email = String(body?.email ?? "").trim().toLowerCase();
      if (!email || !email.includes("@")) return json({ error: "email requerido" }, 400);

      // Anti-enumeración: respondemos {ok:true} siempre. Solo emitimos enlace si el
      // email pertenece a un usuario con rol de moderación.
      const u = await env.DB
        .prepare("SELECT id, role FROM users WHERE email = ?")
        .bind(email)
        .first();
      let devLink = null;
      if (u && (u.role === "moderator" || u.role === "admin")) {
        const token = opaqueToken();
        const now = Date.now();
        await env.DB
          .prepare(
            "INSERT INTO login_tokens (token, user_id, expires_at, used, created_at) VALUES (?, ?, ?, 0, ?)"
          )
          .bind(token, u.id, now + LOGIN_TTL_MS, now)
          .run();
        const base = env.APP_ORIGIN || url.origin;
        const link = `${base}/#/mod?token=${token}`;
        const sent = await sendMagicLink(env, email, link);
        // En desarrollo, si no hay proveedor de email, devolvemos el enlace para poder probar.
        if (!sent && env.AUTH_DEV_RETURN_LINK === "1") devLink = link;
      }
      return json({ ok: true, ...(devLink ? { devLink } : {}) });
    }

    // POST /api/auth/verify  { token }  — canjea el enlace por una sesión.
    if (pathname === "/api/auth/verify" && request.method === "POST") {
      if (!env.DB) return json({ error: "D1 no vinculado" }, 501);
      const body = await request.json().catch(() => null);
      const token = String(body?.token ?? "").trim();
      if (!token) return json({ error: "token requerido" }, 400);

      const lt = await env.DB
        .prepare("SELECT user_id, expires_at, used FROM login_tokens WHERE token = ?")
        .bind(token)
        .first();
      if (!lt || lt.used || lt.expires_at < Date.now()) {
        return json({ error: "enlace inválido o caducado" }, 401);
      }
      const u = await env.DB
        .prepare("SELECT id, role, handle FROM users WHERE id = ?")
        .bind(lt.user_id)
        .first();
      if (!u) return json({ error: "usuario no encontrado" }, 404);

      const session = opaqueToken();
      const now = Date.now();
      const expiresAt = now + SESSION_TTL_MS;
      await env.DB.batch([
        env.DB.prepare("UPDATE login_tokens SET used = 1 WHERE token = ?").bind(token),
        env.DB
          .prepare(
            "INSERT INTO sessions (token, user_id, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?)"
          )
          .bind(session, u.id, u.role, expiresAt, now),
      ]);
      return json({ session, role: u.role, handle: u.handle ?? null, expires_at: expiresAt });
    }

    // POST /api/mod/reports/:id  { action, note? }   (E1e — moderación)
    const modMatch = pathname.match(/^\/api\/mod\/reports\/([^/]+)$/);
    if (modMatch && request.method === "POST") {
      const reportId = decodeURIComponent(modMatch[1]);
      const body = await request.json().catch(() => null);
      const action = body?.action;
      if (!action || !(action in MOD_ACTIONS)) {
        return json({ error: `action inválida (${Object.keys(MOD_ACTIONS).join("|")})` }, 400);
      }
      if (!env.DB) return json({ error: "D1 no vinculado" }, 501);

      // Autorización: sesión magic-link (Bearer) o fallback legacy MOD_TOKEN+rol
      // (defensa en profundidad). Ver resolveActor().
      const actor = await resolveActor(env, request);
      if (!actor) return json({ error: "autenticación requerida" }, 401);
      if (actor.role !== "moderator" && actor.role !== "admin") {
        return json({ error: "requiere rol de moderación" }, 403);
      }
      const device = actor.id;

      const report = await env.DB.prepare("SELECT status FROM reports WHERE id = ?").bind(reportId).first();
      if (!report) return json({ error: "reporte no encontrado" }, 404);

      const newStatus = MOD_ACTIONS[action];
      const now = Date.now();
      await env.DB.batch([
        env.DB.prepare("UPDATE reports SET status = ?, updated_at = ? WHERE id = ?")
          .bind(newStatus, now, reportId),
        env.DB.prepare(
          "INSERT INTO moderation_log (id, report_id, actor_id, action, note, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(crypto.randomUUID(), reportId, device, action, body.note ?? null, now),
      ]);

      // Liquidación de reputación en las transiciones terminales.
      if (newStatus === "confirmed" && report.status !== "confirmed") {
        await settleReputationOnConfirm(env.DB, reportId);
      } else if (newStatus === "rejected" && report.status !== "rejected") {
        await settleReputationOnReject(env.DB, reportId);
      }

      return json({ id: reportId, status: newStatus, action });
    }

    // POST /api/reports/:id/photo  — imagen YA difuminada en cliente (E1d + R2).
    // El servidor no puede verificar el difuminado; el gate del cliente es la
    // garantía y la columna photos.blurred (CHECK = 1) lo asienta como invariante.
    const photoMatch = pathname.match(/^\/api\/reports\/([^/]+)\/photo$/);
    if (photoMatch && request.method === "POST") {
      const reportId = decodeURIComponent(photoMatch[1]);
      if (!env.DB) return json({ error: "D1 no vinculado" }, 501);
      if (!env.PHOTOS) return json({ error: "R2 no vinculado" }, 501);

      const ct = request.headers.get("content-type") || "";
      if (!ct.startsWith("image/")) return json({ error: "se espera una imagen" }, 415);
      const buf = await request.arrayBuffer();
      if (buf.byteLength === 0) return json({ error: "imagen vacía" }, 400);
      if (buf.byteLength > 5_000_000) return json({ error: "imagen demasiado grande (máx 5 MB)" }, 413);

      const report = await env.DB.prepare("SELECT id FROM reports WHERE id = ?").bind(reportId).first();
      if (!report) return json({ error: "reporte no encontrado" }, 404);

      const photoId = crypto.randomUUID();
      const key = `reports/${reportId}/${photoId}.${ct.includes("png") ? "png" : "jpg"}`;
      await env.PHOTOS.put(key, buf, { httpMetadata: { contentType: ct } });
      await env.DB.prepare(
        "INSERT INTO photos (id, report_id, r2_key, blurred, created_at) VALUES (?, ?, ?, 1, ?)"
      ).bind(photoId, reportId, key, Date.now()).run();

      return json({ id: photoId, r2_key: key }, 201);
    }

    // GET /api/photos/<key>  — sirve la foto difuminada desde R2 (R2 no es público).
    const serveMatch = pathname.match(/^\/api\/photos\/(.+)$/);
    if (serveMatch && request.method === "GET") {
      if (!env.PHOTOS) return json({ error: "R2 no vinculado" }, 501);
      const key = decodeURIComponent(serveMatch[1]);
      // Solo claves bajo el prefijo gestionado (evita traversal/lecturas arbitrarias).
      if (!key.startsWith("reports/") || key.includes("..")) {
        return json({ error: "clave inválida" }, 400);
      }
      const obj = await env.PHOTOS.get(key);
      if (!obj) return json({ error: "foto no encontrada" }, 404);
      return new Response(obj.body, {
        headers: {
          "content-type": obj.httpMetadata?.contentType || "image/jpeg",
          "cache-control": "public, max-age=86400",
          "access-control-allow-origin": "*",
        },
      });
    }

    return json({ error: "not found" }, 404);
  },

  // Cron: retención de fotos + limpieza de tokens/sesiones (ver wrangler.toml [triggers]).
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runRetention(env));
  },
};
