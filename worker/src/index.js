// Ciudad Justa · API (Cloudflare Worker) — fase E1a: lectura + escritura básica.
// Superficie de docs/04 §4.6. D1 = almacén de la capa caliente.
// Votación/reputación/moderación llegan en E1b-E1e (ver docs/07).

import { geohash } from "./geohash.js";

// Categorías válidas de la taxonomía (docs/04 §4.2). Espejo del CHECK del esquema.
const CATEGORIES = new Set([
  "anti_lie_down", "anti_sit", "spikes", "barrier",
  "surface", "surveillance", "light_sound", "ghost_amenity",
]);

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

    return json({ error: "not found" }, 404);
  },
};
