// apps/web/src/components/Manifesto.jsx  (Manifesto + How)
import { useState } from "react";
import { c, font, maxW } from "../styles/tokens.js";
import { MANIFESTO, HOW } from "../data/content.js";
import { Section, SectionHead, Reveal, Sawtooth, Icon, Button } from "./primitives.jsx";

export default function Manifesto() {
  const [open, setOpen] = useState(false);
  return (
    <div id="manifiesto" className="riso-grain" style={{ background: c.paper, color: "#0a0a0b", position: "relative" }}>
      <Sawtooth color={c.bg} />
      <div style={{ maxWidth: maxW - 140, margin: "0 auto", padding: "clamp(56px,9vw,110px) 22px" }}>
        <Reveal>
          <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: c.redInk, display: "flex", alignItems: "center", gap: 12 }}>
            04 <span style={{ width: 30, height: 2, background: c.redInk }} /> <span style={{ color: "#3a382f" }}>No somos neutrales</span>
          </div>
          <blockquote style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "clamp(2.2rem,6vw,4.4rem)", lineHeight: 0.92, margin: "22px 0 0", maxWidth: "16ch", color: "#0a0a0b" }}>
            «{MANIFESTO.claim}»
          </blockquote>
          <p style={{ maxWidth: "62ch", marginTop: 24, fontSize: "1.12rem", lineHeight: 1.6, color: "#2a2820", fontFamily: font.sans }}>{MANIFESTO.body}</p>
          <button onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ marginTop: 20, background: "transparent", border: "2px solid #0a0a0b", color: "#0a0a0b",
            cursor: "pointer", fontFamily: font.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "9px 15px", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Los derechos que ponemos en el centro <Icon name="chevronDown" size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .16s" }} />
          </button>
          <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .25s" }}>
            <div style={{ overflow: "hidden" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "grid", gap: 12 }}>
                {MANIFESTO.rights.map((r) => (
                  <li key={r.k} style={{ display: "flex", gap: 12, alignItems: "baseline", fontFamily: font.sans, fontSize: 16 }}>
                    <span style={{ color: c.redInk, fontWeight: 900 }}>—</span>
                    <span><strong>{r.k}.</strong> <span style={{ color: "#4a473c" }}>{r.v}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
      <Sawtooth flip color={c.bg} />
    </div>
  );
}

export function How() {
  return (
    <Section id="como">
      <SectionHead n="03" kicker="Cómo funciona" title="Detecta, valida, revierte" color={c.yellow} />
      <ol className="cj-divcol" style={{ listStyle: "none", padding: 0, margin: "38px 0 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", border: `2px solid ${c.text}`, background: c.surface }}>
        {HOW.map((s, i) => (
          <Reveal key={s.n} as="li" i={i} style={{ borderRight: i < HOW.length - 1 ? `2px solid ${c.text}` : "none" }}>
            <div style={{ padding: 28, height: "100%" }}>
              <div style={{ fontFamily: font.display, fontSize: "3.4rem", lineHeight: 0.85, color: c.accent }}>{String(s.n).padStart(2, "0")}</div>
              <h3 style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "1.7rem", margin: "12px 0 0", color: c.text }}>{s.t}</h3>
              <p style={{ marginTop: 10, color: c.muted, lineHeight: 1.55 }}>{s.d}</p>
            </div>
          </Reveal>
        ))}
      </ol>
      <Reveal>
        <div style={{ marginTop: 26, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <Button href="#/reportar" icon="arrowRight">Reportar una barrera</Button>
          <span style={{ fontFamily: font.mono, fontSize: 12, color: c.faint, letterSpacing: "0.04em" }}>demo · escribe en la API del proyecto</span>
        </div>
      </Reveal>
    </Section>
  );
}
