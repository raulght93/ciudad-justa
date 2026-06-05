// Ciudad Justa · API (Cloudflare Worker) — fase E1a: lectura + escritura básica.
// Superficie de docs/04 §4.6. D1 = almacén de la capa caliente.
// Votación/reputación/moderación llegan en E1b-E1e (ver docs/07).

import { geohash } from "./geohash.js";

// Categorías válidas de la taxonomía (docs/04 §4.2). Espejo del CHECK del esquema.
const CATEGORIES = new Set([
  "anti_lie_down", "anti_sit", "spikes", "barrier",
  "surface", "surveillance", "light_sound", "ghost_amenity",
]);

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
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
        "SELECT id,lat,lng,status,description,score FROM reports " +
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
          properties: { id: r.id, status: r.status, description: r.description, score: r.score },
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
      // Categorías: filtra a las válidas de la taxonomía.
      const categories = Array.isArray(body.categories)
        ? [...new Set(body.categories.filter((k) => CATEGORIES.has(k)))]
        : [];

      // TODO E1d: verificar Turnstile + rate-limit antes de escribir.
      if (!env.DB) return json({ error: "D1 no vinculado" }, 501);

      const id = crypto.randomUUID();
      const now = Date.now();
      const gh = geohash(body.lat, body.lng);
      // Usuario anónimo por dispositivo (cabecera opcional). INSERT idempotente.
      const device = request.headers.get("x-device-id") || "anon";

      const stmts = [
        env.DB.prepare(
          "INSERT OR IGNORE INTO users (id, role, reputation, created_at) VALUES (?, 'user', 1.0, ?)"
        ).bind(device, now),
        env.DB.prepare(
          "INSERT INTO reports (id, lat, lng, geohash, status, taxonomy_version, score, description, created_by, created_at, updated_at) " +
          "VALUES (?, ?, ?, ?, 'reported', 1, 0, ?, ?, ?, ?)"
        ).bind(id, body.lat, body.lng, gh, body.description ?? null, device, now, now),
        ...categories.map((k) =>
          env.DB.prepare(
            "INSERT INTO report_categories (report_id, category_key) VALUES (?, ?)"
          ).bind(id, k)
        ),
      ];
      await env.DB.batch(stmts);

      return json({ id, status: "reported", categories, geohash: gh }, 201);
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

      // Autorización (E1e auth): secreto compartido por cabecera Bearer +
      // rol en BD (defensa en profundidad). Si MOD_TOKEN está configurado, el
      // token es obligatorio — no basta con declarar un rol desde el cliente.
      const device = request.headers.get("x-device-id") || "anon";
      if (env.MOD_TOKEN) {
        const auth = request.headers.get("authorization") || "";
        const tok = auth.startsWith("Bearer ") ? auth.slice(7) : "";
        if (tok !== env.MOD_TOKEN) return json({ error: "token de moderación inválido" }, 401);
      }
      const actor = await env.DB.prepare("SELECT role FROM users WHERE id = ?").bind(device).first();
      if (!actor || (actor.role !== "moderator" && actor.role !== "admin")) {
        return json({ error: "requiere rol de moderación" }, 403);
      }

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

    return json({ error: "not found" }, 404);
  },
};
