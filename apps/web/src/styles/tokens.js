// apps/web/src/styles/tokens.js  ·  Sistema "Contradiseño" (dark riso-punk).
// Mantiene la API de tu tokens.js original y la amplía. `font.serif` se conserva
// como alias de display para que tus componentes aún sin portar no rompan durante
// la migración.

export const c = {
  bg: "#0a0a0b",
  bgAlt: "#0f0f11",
  panel: "#141416",
  surface: "#1a1a1d",
  surface2: "#232327",
  text: "#f4f1ea",   // 17:1 sobre bg
  muted: "#b7b3a8",  // 8.4:1
  faint: "#8a867c",  // 4.7:1 (AA grande / UI)

  accent: "#ff3b12",     // ROJO SEÑAL — marca / dignidad
  accentDeep: "#e02e0a",
  redInk: "#c52507",     // rojo sobre papel (≥4.5:1 sobre paper, WCAG AA — review AA)
  yellow: "#ffe000",     // señal secundaria / ticker / foco
  cyan: "#00e5ff",       // contrapunto frío

  paper: "#f3efe4",      // bloques invertidos
  paperDim: "#e2ddd0",

  hostile: "#ff3b12",
  green: "#2fe08a",
  service: "#00e5ff",
  housing: "#b084ff",
  hostileTx: "#ff6a48",  // tintes legibles para texto pequeño sobre bg
  greenTx: "#45e89a",
  serviceTx: "#4cecff",
  housingTx: "#c4a3ff",

  line: "rgba(244,241,234,0.12)",
  lineSoft: "rgba(244,241,234,0.07)",
  lineStrong: "#2e2e33",
};

export const font = {
  display: "'Anton', 'Arial Narrow', Impact, sans-serif", // cartel, caja alta
  sans: "'Space Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'Space Mono', ui-monospace, 'SF Mono', Menlo, monospace",
};
font.serif = font.display; // alias de compatibilidad durante la migración

// Esquinas duras por defecto; pill sólo para pastillas de estado.
export const radius = { sm: 0, md: 0, lg: 0, pill: 999 };

export const maxW = 1240;

export const kicker = {
  fontFamily: font.mono,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};

// Elevación = desplazamiento sólido de tinta; nada de sombra difusa.
export const shadow = {
  card: "0 0 0 1px rgba(244,241,234,0.08)",
  glow: (col) => `6px 6px 0 0 ${col}`,
};
