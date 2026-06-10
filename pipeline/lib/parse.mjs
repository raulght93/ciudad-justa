// Helpers de parseo puros (sin dependencias) — compartidos por los ingestores y
// testeables de forma aislada.

// Extrae el código de sección censal (CUSEC, 10 dígitos) de un texto como
// "2906701001 Málaga sección 01001" → "2906701001". Devuelve null si no hay.
export function cusec10(s) {
  const m = String(s ?? "").match(/\d{10}/);
  return m ? m[0] : null;
}

// Convierte a número admitiendo formato español o numérico:
//   "21.823" → 21823 (punto = millar)   ·   "5,79" → 5.79 (coma decimal)
//   "1.234,56" → 1234.56   ·   5.79 → 5.79   ·   "" → NaN
export function toNumberEs(v) {
  if (typeof v === "number") return v;
  let s = String(v ?? "").replace(/"/g, "").trim();
  if (!s) return NaN;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(".")) s = s.replace(/\./g, ""); // solo puntos → millares
  return parseFloat(s);
}
