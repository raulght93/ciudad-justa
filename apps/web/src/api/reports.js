// Cliente de la capa caliente (reportes validados) servida por el Worker.
// La base se puede sobrescribir con VITE_API_URL (Pages → Settings → Env vars);
// por defecto apunta al Worker de producción.
export const API_URL =
  import.meta.env.VITE_API_URL || "https://ciudad-justa-api.raulght93.workers.dev";

/**
 * GET /api/reports?bbox=minLng,minLat,maxLng,maxLat[&status=...]
 * Devuelve un FeatureCollection GeoJSON. Lanza si la respuesta no es 2xx para que
 * el llamante pueda caer al dato local (HOSTILE_POINTS).
 *
 * @param {[number,number,number,number]} bbox  [minLng, minLat, maxLng, maxLat]
 * @param {{ status?: string, signal?: AbortSignal }} [opts]
 */
export async function fetchReports(bbox, opts = {}) {
  const params = new URLSearchParams({ bbox: bbox.join(",") });
  if (opts.status) params.set("status", opts.status);
  const res = await fetch(`${API_URL}/api/reports?${params}`, { signal: opts.signal });
  if (!res.ok) throw new Error(`reports ${res.status}`);
  const gj = await res.json();
  if (!gj || gj.type !== "FeatureCollection" || !Array.isArray(gj.features)) {
    throw new Error("respuesta no es FeatureCollection");
  }
  return gj;
}

/**
 * Acción de moderación. POST /api/mod/reports/:id { action, note }
 * Requiere token (Bearer MOD_TOKEN) y, opcionalmente, id de dispositivo (para el audit log).
 * @param {string} id  reportId
 * @param {string} action  confirm|reject|document|dispute|restore
 * @param {{ note?: string, token?: string, device?: string }} [opts]
 */
export async function moderate(id, action, opts = {}) {
  const headers = { "content-type": "application/json" };
  if (opts.token) headers.authorization = `Bearer ${opts.token}`;
  if (opts.device) headers["x-device-id"] = opts.device;
  const res = await fetch(`${API_URL}/api/mod/reports/${encodeURIComponent(id)}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, note: opts.note }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `mod ${res.status}`);
  return body;
}
