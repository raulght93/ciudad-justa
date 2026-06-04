import { c, font, radius, kicker } from "../styles/tokens.js";
import { HOUSING } from "../data/content.js";
import { Reveal, Section, Kicker } from "./primitives.jsx";

// Área de expansión: la barrera del precio de la vivienda. Marcada como
// "en preparación" — marcador estructural, no contenido cerrado.
export default function Housing() {
  const col = HOUSING.color;
  return (
    <div style={{ background: `radial-gradient(900px 480px at 88% 0%, ${col}24, transparent 60%), ${c.bg}`, borderTop: `1px solid ${c.line}` }}>
      <Section id="vivienda">
        <Reveal>
          <Kicker n="05" color={col}>{HOUSING.kicker}</Kicker>
          <h2 style={{ fontFamily: font.serif, fontWeight: 900, fontSize: "clamp(2.2rem, 6vw, 4rem)", lineHeight: 1.02, letterSpacing: "-0.03em", margin: "18px 0 0", color: c.text }}>
            {HOUSING.title}
          </h2>
          <p style={{ maxWidth: 720, marginTop: 20, fontFamily: font.serif, fontStyle: "italic", fontSize: "clamp(1.3rem,3vw,1.8rem)", lineHeight: 1.35, color: c.text, fontWeight: 500 }}>
            {HOUSING.lead}
          </p>
          <p style={{ maxWidth: 700, marginTop: 16, fontSize: "1.05rem", lineHeight: 1.65, color: c.muted }}>
            {HOUSING.body}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginTop: 36 }}>
            {HOUSING.metrics.map((m) => (
              <div key={m.label} style={{ position: "relative", background: c.surface, border: `1px dashed ${col}55`, borderRadius: radius.md, padding: 22 }}>
                <div style={{ fontFamily: font.serif, fontWeight: 900, fontSize: "2.8rem", color: col, lineHeight: 1 }}>{m.value}</div>
                <div style={{ marginTop: 10, color: c.muted, lineHeight: 1.45, fontSize: 14.5 }}>{m.label}</div>
                {m.todo && (
                  <span style={{ ...kicker, position: "absolute", top: 14, right: 14, fontSize: 10, color: col, border: `1px solid ${col}55`, borderRadius: 99, padding: "3px 8px" }}>
                    Pronto
                  </span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={180}>
          <p style={{ marginTop: 26, fontSize: 14, color: c.muted }}>
            <strong style={{ color: c.text }}>{HOUSING.rightLink.k}:</strong> {HOUSING.rightLink.v}
          </p>
          <p style={{ marginTop: 12, fontFamily: font.mono, fontSize: 12, color: c.faint, lineHeight: 1.6, maxWidth: 720 }}>
            {HOUSING.note}
          </p>
        </Reveal>
      </Section>
    </div>
  );
}
