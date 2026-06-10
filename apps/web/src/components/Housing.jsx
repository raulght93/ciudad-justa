// apps/web/src/components/Housing.jsx
import { c, font } from "../styles/tokens.js";
import { HOUSING } from "../data/content.js";
import { Section, Kicker, Reveal, SourceTag, Button } from "./primitives.jsx";

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

      <div className="cj-grid" style={{ marginTop: 36 }}>
        {HOUSING.metrics.map((m, i) => (
          <Reveal key={m.label} i={i}>
            <div className="cj-card" style={{ height: "100%", background: c.panel, border: `1px solid ${col}55`, borderTop: `4px solid ${col}`, padding: 22, "--cardc": col }}>
              <div style={{ fontFamily: font.display, fontSize: "clamp(2.4rem,5vw,3rem)", lineHeight: 0.9, color: col }}>{m.value}</div>
              <div style={{ marginTop: 10, color: c.muted, lineHeight: 1.4, fontSize: 14.5 }}>{m.label}</div>
              {m.source && <div style={{ marginTop: 12 }}><SourceTag id={m.source} /></div>}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginTop: 28 }}>
          <Button href={HOUSING.cta.href} icon="arrowRight" style={{ background: col }}>{HOUSING.cta.label}</Button>
          <p style={{ fontSize: 14, color: c.muted, margin: 0 }}><strong style={{ color: c.text }}>{HOUSING.rightLink.k}:</strong> {HOUSING.rightLink.v}</p>
        </div>
      </Reveal>
    </Section>
  );
}
