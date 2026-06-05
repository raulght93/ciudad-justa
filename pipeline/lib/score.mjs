// Fórmula de déficit de verde (regla 3-30-300). Compartida por los ingestores
// (build-green-layer.mjs, ingest-osm.mjs) para no duplicar la lógica.
// Ver docs/01 §1.4 y docs/03 §3.5.

export const CANOPY_TARGET = 30; // % de cubierta arbórea objetivo en el barrio
export const W_CANOPY = 0.5; // peso del componente cubierta
export const W_ACCESS = 0.5; // peso del componente acceso a verde a <300 m

export const clamp01 = (x) => Math.max(0, Math.min(1, x));

// deficit ∈ [0,1]: 0 = sin déficit, 1 = déficit máximo.
export function deficitScore(canopyPct, accessFrac) {
  const canopyShort = clamp01((CANOPY_TARGET - canopyPct) / CANOPY_TARGET);
  const accessShort = clamp01(1 - accessFrac);
  return Math.round((W_CANOPY * canopyShort + W_ACCESS * accessShort) * 100) / 100;
}
