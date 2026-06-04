import { c, font } from "../styles/tokens.js";
import { TICKER } from "../data/content.js";

// Banda de cifras en movimiento continuo. La animación (cj-marquee, definida en
// main.jsx) se congela con prefers-reduced-motion gracias a la regla global.
export function Ticker() {
  const items = [...TICKER, ...TICKER]; // duplicado para bucle sin costura
  return (
    <div
      aria-label="Cifras del proyecto"
      style={{
        overflow: "hidden",
        borderTop: `1px solid ${c.line}`,
        borderBottom: `1px solid ${c.line}`,
        background: c.bgAlt,
        padding: "14px 0",
      }}
    >
      <div className="cj-marquee" style={{ display: "flex", whiteSpace: "nowrap", width: "max-content" }}>
        {items.map((t, i) => (
          <span
            key={i}
            style={{
              fontFamily: font.mono,
              fontSize: 13.5,
              color: i % TICKER.length === 0 ? c.accent : c.muted,
              padding: "0 28px",
              display: "inline-flex",
              alignItems: "center",
              gap: 28,
            }}
          >
            {t}
            <span aria-hidden style={{ color: c.faint }}>◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Divisor: fila de pinchos (nod literal a la arquitectura hostil). Decorativo.
export function Spikes({ color = c.line, height = 22 }) {
  const w = 22;
  return (
    <div aria-hidden style={{ width: "100%", height, lineHeight: 0, opacity: 0.5 }}>
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none"
        style={{ display: "block", width: "100%" }}>
        <defs>
          <pattern id="cj-spikes" width={w} height={height} patternUnits="userSpaceOnUse">
            <path d={`M0 ${height} L${w / 2} 2 L${w} ${height} Z`} fill="none" stroke={color} strokeWidth="1.2" />
          </pattern>
        </defs>
        <rect width="100%" height={height} fill="url(#cj-spikes)" />
      </svg>
    </div>
  );
}
