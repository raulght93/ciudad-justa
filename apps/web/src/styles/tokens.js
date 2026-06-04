// Sistema de diseño inline (sin CSS externo, coherente con la filosofía de
// africa-trip-planning y tripcraft). Estética: "noche cívica" — fondo profundo,
// serif expresiva (Fraunces) para titulares, acento ocre cálido (dignidad) y un
// color por capa (hostil / verde / servicios / vivienda).

export const c = {
  bg: "#0b0e14",
  bgAlt: "#0f1420",
  surface: "#161d2b",
  surface2: "#1d2638",
  text: "#eef2f9",
  muted: "#9aa6bd",
  faint: "#8893ab", // subido para WCAG AA en texto pequeño (≥4.5:1 sobre bg/surface) — review C6
  accent: "#f4a259", // ocre — color de marca / dignidad
  accentDeep: "#e07a3e",
  hostile: "#ef4444", // capa arquitectura hostil
  green: "#34d399", // capa verde urbano
  service: "#60a5fa", // capa servicios / 15-min
  housing: "#a78bfa", // área de expansión: precio vivienda
  line: "rgba(255,255,255,0.09)",
  lineSoft: "rgba(255,255,255,0.05)",
};

export const font = {
  serif: "'Fraunces', Georgia, 'Times New Roman', serif",
  sans: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
};

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };

export const maxW = 1100;

export const shadow = {
  card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 50px -28px rgba(0,0,0,0.8)",
  glow: (col) => `0 0 0 1px ${col}33, 0 18px 60px -24px ${col}66`,
};
