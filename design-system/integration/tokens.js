// ============================================================================
//  tokens.js  ·  DROP-IN para apps/web/src/styles/tokens.js
//  Reemplaza tu tokens.js actual por este. Mantiene EXACTAMENTE la misma forma
//  de exports (c, font, radius, maxW, kicker, shadow) que ya importan tus
//  componentes, pero con los valores del sistema "Contradiseño" (dark riso-punk).
//  → Re-skin instantáneo: colores, tipo, radios y kickers cambian en toda la app
//    sin tocar ningún componente. Ver notas al final para el 20% que sí conviene
//    retocar a mano (titulares Anton en caja alta, divisores de sierra, grano).
// ============================================================================

export const c = {
  bg: "#0a0a0b",        // papel negro (antes #0b0e14)
  bgAlt: "#0f0f11",
  surface: "#1a1a1d",   // tarjetas
  surface2: "#232327",  // hover / elevado
  text: "#f4f1ea",      // 17:1 sobre bg
  muted: "#b7b3a8",     // 8.4:1
  faint: "#8a867c",     // 4.7:1 (AA texto grande / UI)
  accent: "#ff3b12",    // ROJO SEÑAL — marca / dignidad (antes ocre #f4a259)
  accentDeep: "#e02e0a",
  hostile: "#ff3b12",   // capa hostil
  green: "#2fe08a",     // capa verde (más saturado)
  service: "#00e5ff",   // capa servicios (cian)
  housing: "#b084ff",   // capa vivienda
  line: "rgba(244,241,234,0.12)",
  lineSoft: "rgba(244,241,234,0.07)",
};

export const font = {
  // OJO: display de cartel, una sola anchura/peso, ideal en CAJA ALTA.
  serif: "'Anton', 'Arial Narrow', Impact, sans-serif",
  sans: "'Space Grotesk', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'Space Mono', ui-monospace, 'SF Mono', Menlo, monospace",
};

// Esquinas DURAS (la causa pide aristas, no suavidad). El pill se conserva
// sólo para pastillas de estado.
export const radius = { sm: 0, md: 0, lg: 0, pill: 999 };

export const maxW = 1240;

// Kicker mono en versalitas (igual que antes, tracking más amplio).
export const kicker = {
  fontFamily: font.mono,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
};

// Elevación = desplazamiento SÓLIDO de tinta (cartel serigrafiado), no sombra
// difusa. `card` queda como filete fino; `glow` ahora es un anillo duro.
export const shadow = {
  card: "0 0 0 1px rgba(244,241,234,0.08)",
  glow: (col) => `6px 6px 0 0 ${col}`,
};

// ============================================================================
//  RETOQUES MANUALES recomendados (lo que un re-skin de tokens no puede hacer):
//
//  1) Titulares: Anton luce en CAJA ALTA. En Hero/SectionHead añade a los <h1>/<h2>:
//        textTransform: "uppercase", letterSpacing: "0.01em", lineHeight: 0.9
//     y quita fontWeight (Anton es de un solo peso). El <em italic> del hero
//     ("no estés") no irá en cursiva (Anton no tiene itálica): resáltalo con
//     color: c.accent en vez de fontStyle: italic.
//
//  2) index.html: cambia el <link> de Google Fonts por:
//     https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap
//     y theme-color a #0a0a0b.
//
//  3) Bordes de tarjeta a 1–2px sólidos (ya tienes `1px solid c.line`); para el
//     gesto de cartel usa boxShadow: shadow.glow(c.accent) en hover.
//
//  4) Motivos nuevos (opcionales, gran impacto): sierra de pinchos como divisor,
//     grano risográfico y misregistro. Copia las clases .sawtooth / .riso-grain /
//     .offset-print de colors_and_type.css a un CSS global, o pásalas a inline.
// ============================================================================
