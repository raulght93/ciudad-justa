// apps/web/src/components/decor.jsx
import { c, font } from "../styles/tokens.js";
import { TICKER } from "../data/content.js";

// Marquesina mecánica de cifras (se congela con prefers-reduced-motion).
export function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div role="img" aria-label="Banda de cifras del proyecto" style={{ overflow: "hidden", borderTop: `2px solid ${c.text}`, borderBottom: `2px solid ${c.text}`, background: c.yellow, padding: "11px 0" }}>
      {/* Decorativo (texto duplicado para el bucle): se oculta a lectores de pantalla. */}
      <div className="cj-marquee" aria-hidden="true" style={{ display: "flex", whiteSpace: "nowrap", width: "max-content" }}>
        {items.map((t, i) => (
          <span key={i} style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 700, color: "#0a0a0b", padding: "0 26px",
            display: "inline-flex", alignItems: "center", gap: 26, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {t}<span aria-hidden>▲</span>
          </span>
        ))}
      </div>
    </div>
  );
}
