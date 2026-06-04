import { c, font, radius, shadow } from "../styles/tokens.js";
import { LAYERS } from "../data/content.js";
import { Reveal, Section, Expandable, SourceTag } from "./primitives.jsx";

export default function Layers() {
  return (
    <Section id="capas">
      <Reveal>
        <h2 style={h2()}>Tres capas de una misma injusticia</h2>
        <p style={lead()}>
          El mismo barrio que pierde el verde suele perder los servicios y llenarse de
          mobiliario que expulsa. Lo cruzamos en un solo mapa.
        </p>
      </Reveal>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 18,
          marginTop: 40,
        }}
      >
        {LAYERS.map((l, i) => (
          <Reveal key={l.id} delay={i * 90}>
            <article
              style={{
                height: "100%",
                background: c.surface,
                border: `1px solid ${c.line}`,
                borderRadius: radius.lg,
                padding: 24,
                boxShadow: shadow.card,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 12,
                  fontSize: 22,
                  color: l.color,
                  background: `${l.color}1a`,
                  border: `1px solid ${l.color}40`,
                }}
                aria-hidden
              >
                {l.icon}
              </div>
              <h3 style={{ fontFamily: font.serif, fontWeight: 700, fontSize: "1.5rem", margin: "16px 0 0", color: c.text }}>
                {l.title}
              </h3>
              <p style={{ color: c.muted, lineHeight: 1.6, marginTop: 10, flex: 1 }}>{l.short}</p>
              <div style={{ marginTop: 14, fontSize: 12.5, color: l.color, fontWeight: 600 }}>
                Capa {l.layer}
              </div>
              <Expandable color={l.color}>
                <p style={{ marginTop: 0 }}>{l.deep}</p>
                <div style={{ marginTop: 12 }}>
                  <SourceTag id={l.source} />
                </div>
              </Expandable>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

export function h2() {
  return {
    fontFamily: font.serif,
    fontWeight: 900,
    fontSize: "clamp(1.9rem, 4.5vw, 3rem)",
    lineHeight: 1.08,
    letterSpacing: "-0.02em",
    margin: 0,
    color: c.text,
  };
}
export function lead() {
  return { maxWidth: 620, marginTop: 16, fontSize: "1.15rem", lineHeight: 1.6, color: c.muted };
}
