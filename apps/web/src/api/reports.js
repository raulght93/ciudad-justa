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
