import { c, font, radius } from "../styles/tokens.js";
import { HOUSING } from "../data/content.js";
import { Reveal, Section, Pill } from "./primitives.jsx";

// Área de expansión: la barrera del precio de la vivienda. Marcada como
// "en preparación" — marcador estructural, no contenido cerrado.
export default function Housing() {
  const col = HOUSING.color;
  return (
    <div
      style={{
        background: `radial-gradient(900px 500px at 85% 0%, ${col}1f, transparent 60%), ${c.bg}`,
        borderTop: `1px solid ${c.line}`,
      }}
    >
      <Section id="vivienda">
        <Reveal>
          <Pill color={col}>{HOUSING.kicker}</Pill>
          <h2
            style={{
              fontFamily: font.serif,
              fontWeight: 900,
              fontSize: "clamp(1.9rem, 4.6vw, 3.1rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              margin: "20px 0 0",
              color: c.text,
            }}
          >
            {HOUSING.title}
          </h2>
          <p style={{ maxWidth: 700, marginTop: 18, fontSize: "1.25rem", lineHeight: 1.55, color: c.text, fontWeight: 500 }}>
            {HOUSING.lead}
          </p>
          <p style={{ maxWidth: 700, marginTop: 14, fontSize: "1.05rem", lineHeight: 1.65, color: c.muted }}>
            {HOUSING.body}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: 16,
              marginTop: 36,
            }}
          >
            {HOUSING.metrics.map((m) => (
              <div
                key={m.label}
                style={{
                  background: c.surface,
                  border: `1px dashed ${col}55`,
                  borderRadius: radius.md,
                  padding: 20,
                  position: "relative",
                }}
              >
                <div style={{ fontFamily: font.serif, fontWeight: 900, fontSize: "2.6rem", color: col, lineHeight: 1 }}>
                  {m.value}
                </div>
                <div style={{ marginTop: 8, color: c.muted, lineHeight: 1.45, fontSize: 14.5 }}>{m.label}</div>
                {m.todo && (
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: ".08em",
                      color: col,
                      border: `1px solid ${col}55`,
                      borderRadius: 99,
                      padding: "3px 8px",
                    }}
                  >
                    PRÓXIMAMENTE
                  </span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={180}>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: 14, color: c.muted }}>
              <strong style={{ color: c.text }}>{HOUSING.rightLink.k}:</strong> {HOUSING.rightLink.v}
            </div>
          </div>
          <p style={{ marginTop: 16, fontSize: 13, color: c.faint, lineHeight: 1.6, maxWidth: 720 }}>
            {HOUSING.note}
          </p>
        </Reveal>
      </Section>
    </div>
  );
}
