// apps/web/src/components/Layers.jsx
import { useState } from "react";
import { c, font } from "../styles/tokens.js";
import { LAYERS } from "../data/content.js";
import { Section, SectionHead, Reveal, SourceTag, Icon } from "./primitives.jsx";

function LayerCard({ l, i }) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal i={i} style={{ height: "100%" }}>
      <article className="cj-card" style={{ position: "relative", height: "100%", background: c.surface, border: `1px solid ${c.line}`,
        borderTop: `4px solid ${l.color}`, padding: 26, overflow: "hidden", display: "flex", flexDirection: "column", "--cardc": l.color }}>
        <span aria-hidden style={{ position: "absolute", top: -14, right: 4, fontFamily: font.display, fontSize: "clamp(78px,14vw,130px)", lineHeight: 1, color: l.color, opacity: 0.07, pointerEvents: "none" }}>{l.tag}</span>
        <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: l.color, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{l.icon}</span> Capa {l.tag}
        </div>
        <h3 style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "1.9rem", lineHeight: 0.92, margin: "14px 0 0", color: c.text }}>{l.title}</h3>
        <p style={{ color: c.muted, lineHeight: 1.55, marginTop: 12, flex: 1 }}>{l.short}</p>
        <div style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: c.faint, marginTop: 16 }}>{l.layer}</div>
        <button onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ marginTop: 16, alignSelf: "flex-start", background: "transparent", cursor: "pointer",
          border: `2px solid ${open ? l.color : c.lineStrong}`, color: open ? l.color : c.muted, fontFamily: font.mono, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 13px", display: "inline-flex", alignItems: "center", gap: 8 }}>
          Profundiza <Icon name="chevronDown" size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .16s" }} />
        </button>
        <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .25s" }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{ marginTop: 14, paddingLeft: 14, borderLeft: `2px solid ${l.color}`, color: c.muted, lineHeight: 1.65, fontSize: 15 }}>
              <p>{l.deep}</p>
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 14 }}>
                <SourceTag id={l.source} />
                {l.ally && <SourceTag id={l.ally} />}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function Layers() {
  return (
    <Section id="capas">
      <SectionHead n="01" kicker="Las capas" title="Tres mapas de una misma injusticia"
        lead="El barrio que pierde el verde suele perder también los servicios y llenarse de mobiliario que expulsa. Los superponemos para que se vea junto." />
      <div className="cj-grid" style={{ marginTop: 44 }}>
        {LAYERS.map((l, i) => <LayerCard key={l.id} l={l} i={i} />)}
      </div>
    </Section>
  );
}
