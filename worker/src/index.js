// Ciudad Justa · API stub (Cloudflare Worker)
// Superficie mínima de docs/04 §4.6. D1 como almacén de la capa caliente.
// Esto es un esqueleto: valida forma y devuelve GeoJSON; la lógica de
// reputación/moderación se implementa en fases posteriores.

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
      // TODO fase 1: verificar Turnstile, rate-limit, generar id, INSERT en D1,
      // estado inicial 'reported'. Aquí solo eco para el esqueleto.
      return json({ ok: true, received: { lat: body.lat, lng: body.lng, status: "reported" } }, 201);
    }

    return json({ error: "not found" }, 404);
  },
};
