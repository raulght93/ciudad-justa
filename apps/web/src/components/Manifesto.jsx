import { c, font, radius } from "../styles/tokens.js";
import { MANIFESTO } from "../data/content.js";
import { Reveal, Section, Pill, Expandable } from "./primitives.jsx";
import { h2 } from "./Layers.jsx";

export default function Manifesto() {
  return (
    <div style={{ borderTop: `1px solid ${c.line}`, borderBottom: `1px solid ${c.line}`, background: c.bgAlt }}>
      <Section id="manifiesto">
        <Reveal>
          <Pill>No somos neutrales</Pill>
          <blockquote
            style={{
              fontFamily: font.serif,
              fontWeight: 600,
              fontSize: "clamp(1.8rem, 4.4vw, 3.1rem)",
              lineHeight: 1.18,
              letterSpacing: "-0.015em",
              margin: "22px 0 0",
              color: c.text,
            }}
          >
            «{MANIFESTO.claim}»
          </blockquote>
          <p style={{ maxWidth: 680, marginTop: 22, fontSize: "1.1rem", lineHeight: 1.65, color: c.muted }}>
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
      <Reveal>
        <h2 style={h2()}>Simple: detecta, valida, presiona</h2>
      </Reveal>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 18,
          marginTop: 38,
        }}
      >
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 90}>
            <div style={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: radius.lg, padding: 24, height: "100%" }}>
              <div style={{ fontFamily: font.serif, fontWeight: 900, fontSize: "2.4rem", color: c.accent, lineHeight: 1 }}>
                {String(s.n).padStart(2, "0")}
              </div>
              <h3 style={{ margin: "12px 0 0", fontSize: "1.25rem", color: c.text }}>{s.t}</h3>
              <p style={{ marginTop: 8, color: c.muted, lineHeight: 1.6 }}>{s.d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
