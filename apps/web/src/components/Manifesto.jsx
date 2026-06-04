import { c, font, radius, kicker } from "../styles/tokens.js";
import { MANIFESTO } from "../data/content.js";
import { Reveal, Section, Expandable, Kicker, SectionHead, titleStyle } from "./primitives.jsx";

export default function Manifesto() {
  return (
    <div style={{ borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}`, background: c.bgAlt }}>
      <Section id="manifiesto">
        <Reveal>
          <Kicker n="04">No somos neutrales</Kicker>
          <blockquote
            style={{
              fontFamily: font.serif,
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: "clamp(2rem, 5.4vw, 3.6rem)",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              margin: "22px 0 0",
              color: c.text,
              maxWidth: 18 + "ch",
            }}
          >
            «{MANIFESTO.claim}»
          </blockquote>
          <p style={{ maxWidth: 640, marginTop: 24, fontSize: "1.12rem", lineHeight: 1.65, color: c.muted }}>
            {MANIFESTO.body}
          </p>

          <Expandable label="Los derechos que ponemos en el centro">
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 14 }}>
              {MANIFESTO.rights.map((r) => (
                <li key={r.k} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                  <span aria-hidden style={{ color: c.accent, fontWeight: 900 }}>—</span>
                  <span>
                    <strong style={{ color: c.text }}>{r.k}.</strong>{" "}
                    <span style={{ color: c.muted }}>{r.v}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Expandable>
        </Reveal>
      </Section>
    </div>
  );
}

// Cómo funciona (3 pasos). Vive aquí para reutilizar estilos.
export function How({ steps }) {
  return (
    <Section id="como">
      <SectionHead n="03" kicker="Cómo funciona" title="Detecta, valida, revierte" />
      <ol style={{ listStyle: "none", padding: 0, margin: "38px 0 0", display: "grid", gap: 0,
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        border: `1px solid ${c.line}`, borderRadius: radius.lg, overflow: "hidden", background: c.surface }}>
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 90} as="li">
            <div style={{ padding: 28, height: "100%", borderRight: i < steps.length - 1 ? `1px solid ${c.line}` : "none" }}>
              <div style={{ ...kicker, color: c.accent, fontSize: 13 }}>Paso {String(s.n).padStart(2, "0")}</div>
              <h3 style={{ ...titleStyle(), fontSize: "1.5rem", margin: "12px 0 0" }}>{s.t}</h3>
              <p style={{ marginTop: 10, color: c.muted, lineHeight: 1.6 }}>{s.d}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
