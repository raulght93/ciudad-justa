import { c, font, radius, kicker } from "../styles/tokens.js";
import { LAYERS } from "../data/content.js";
import { Reveal, Section, Expandable, SourceTag, SectionHead } from "./primitives.jsx";

export default function Layers() {
  return (
    <Section id="capas">
      <SectionHead
        n="01"
        kicker="Las capas"
        title="Tres mapas de una misma injusticia"
        lead="El barrio que pierde el verde suele perder también los servicios y llenarse de mobiliario que expulsa. Los superponemos para que se vea junto."
      />

      <div style={{ marginTop: 44, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))" }}>
        {LAYERS.map((l, i) => (
          <Reveal key={l.id} delay={i * 90}>
            <article
              style={{
                position: "relative",
                height: "100%",
                background: c.surface,
                border: `1px solid ${c.line}`,
                borderTop: `3px solid ${l.color}`,
                borderRadius: radius.lg,
                padding: 26,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Índice gigante de fondo */}
              <span aria-hidden style={{
                position: "absolute", top: -18, right: 6, fontFamily: font.serif, fontWeight: 900,
                fontSize: 130, lineHeight: 1, color: l.color, opacity: 0.07, pointerEvents: "none",
              }}>{l.tag}</span>

              <div style={{ ...kicker, color: l.color }}>{l.icon}&nbsp;&nbsp;Capa {l.tag}</div>
              <h3 style={{ fontFamily: font.serif, fontWeight: 800, fontSize: "1.7rem", margin: "12px 0 0", color: c.text, letterSpacing: "-0.02em" }}>
                {l.title}
              </h3>
              <p style={{ color: c.muted, lineHeight: 1.6, marginTop: 12, flex: 1 }}>{l.short}</p>
              <div style={{ ...kicker, fontSize: 11, marginTop: 16, color: c.faint }}>{l.layer}</div>
              <Expandable color={l.color}>
                <p style={{ marginTop: 0 }}>{l.deep}</p>
                <div style={{ marginTop: 12 }}><SourceTag id={l.source} /></div>
              </Expandable>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
