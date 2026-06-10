// apps/web/src/components/Housing.jsx
import { c, font } from "../styles/tokens.js";
import { HOUSING } from "../data/content.js";
import { Section, Kicker, Reveal } from "./primitives.jsx";

export default function Housing() {
  const col = HOUSING.color;
  return (
    <Section id="vivienda" bg={c.bg}>
      <Reveal>
        <Kicker n="05" color={col}>{HOUSING.kicker}</Kicker>
        <h2 style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "clamp(2rem,6vw,4rem)", lineHeight: 0.96, letterSpacing: "0.01em", margin: "16px 0 0", maxWidth: "14ch", color: c.text, paddingBottom: "0.12em" }}>{HOUSING.title}</h2>
        <p style={{ maxWidth: "60ch", marginTop: 20, fontFamily: font.display, textTransform: "uppercase", fontSize: "clamp(1.4rem,3vw,2.1rem)", lineHeight: 1.04, color: c.text }}>{HOUSING.lead}</p>
        <p style={{ maxWidth: "62ch", marginTop: 18, fontSize: "clamp(1.05rem,1.6vw,1.35rem)", lineHeight: 1.5, color: c.muted }}>{HOUSING.body}</p>
      </Reveal>
      <Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 36 }}>
          {HOUSING.metrics.map((m) => (
            <div key={m.label} className="cj-card" style={{ position: "relative", background: c.panel, border: `1px dashed ${col}80`, padding: 22, "--cardc": col }}>
              <div style={{ fontFamily: font.display, fontSize: "3rem", lineHeight: 0.9, color: col }}>{m.value}</div>
              <div style={{ marginTop: 10, color: c.muted, lineHeight: 1.4, fontSize: 14.5 }}>{m.label}</div>
              {m.todo && <span style={{ position: "absolute", top: 14, right: 14, fontFamily: font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: col, border: `1px solid ${col}80`, borderRadius: 999, padding: "3px 9px" }}>Pronto</span>}
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal>
        <p style={{ marginTop: 26, fontSize: 14, color: c.muted }}><strong style={{ color: c.text }}>{HOUSING.rightLink.k}:</strong> {HOUSING.rightLink.v}</p>
        <p style={{ marginTop: 12, fontFamily: font.mono, fontSize: 12, color: c.faint, lineHeight: 1.6, maxWidth: "72ch" }}>{HOUSING.note}</p>
      </Reveal>
    </Section>
  );
}
