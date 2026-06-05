// "Tres casos": tres ciudades, cada una encarna una capa. Bloques apilados tipo
// dossier, con el lenguaje Contradiseño (kicker numerado, numeral gigante de
// fondo, sierra entre casos). Cada mapa (CaseMap) se monta al entrar en viewport.
import { c, font, maxW } from "../styles/tokens.js";
import { CASES } from "../data/cases.js";
import { Reveal, SectionHead, SourceTag, Sawtooth } from "./primitives.jsx";
import CaseMap from "./CaseMap.jsx";

export default function MapsSection() {
  return (
    <div id="mapa" style={{ borderTop: `1px solid ${c.line}`, background: c.bgAlt }}>
      <div style={{ maxWidth: maxW, margin: "0 auto", padding: "clamp(56px,9vw,110px) 22px 0" }}>
        <SectionHead n="02" kicker="El mapa" title="Tres ciudades, tres exclusiones"
          lead="La misma injusticia con tres caras. Barcelona la sufre en el mobiliario; Córdoba, en la falta de sombra; Málaga, en el precio del techo." />
        <KeyStrip />
      </div>

      {CASES.map((cs, i) => (
        <div key={cs.id}>
          {i > 0 && <Sawtooth color={cs.color} />}
          <section style={{ position: "relative", maxWidth: maxW, margin: "0 auto", padding: "clamp(40px,6vw,72px) 22px", overflow: "hidden" }}>
            <span aria-hidden style={{ position: "absolute", top: "-2vw", right: 8, fontFamily: font.display, fontSize: "clamp(7rem,22vw,18rem)", lineHeight: 1, color: cs.color, opacity: 0.06, pointerEvents: "none" }}>{cs.n}</span>
            <Reveal>
              <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: cs.color, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                Caso {cs.n} <span aria-hidden style={{ width: 28, height: 2, background: cs.color }} />
                <span style={{ color: c.muted }}>{cs.city} · {cs.title}</span>
                {cs.sample && <span style={{ color: cs.color, border: `1px solid ${cs.color}`, padding: "2px 8px", borderRadius: 999, fontSize: 10 }}>Muestra</span>}
              </div>

              <div style={{ display: "flex", gap: 22, alignItems: "baseline", flexWrap: "wrap", margin: "16px 0 4px" }}>
                <span style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "clamp(2.6rem,6vw,4rem)", lineHeight: 0.9, color: cs.color }}>{cs.stat.value}</span>
                <span style={{ color: c.muted, maxWidth: "34ch", lineHeight: 1.4 }}>{cs.stat.label}</span>
              </div>
              {cs.stat.source && <div style={{ marginBottom: 16 }}><SourceTag id={cs.stat.source} /></div>}
              <p style={{ maxWidth: "62ch", margin: "10px 0 22px", color: c.muted, lineHeight: 1.55 }}>{cs.note}</p>
            </Reveal>

            <CaseMap caseDef={cs} />
          </section>
        </div>
      ))}

      <p style={{ maxWidth: maxW, margin: "0 auto", padding: "0 22px clamp(40px,6vw,72px)", fontFamily: font.mono, fontSize: 11.5, color: c.faint, lineHeight: 1.6 }}>
        Capa caliente (hostil) desde reportes validados · capas frías desde Urban Atlas / NDVI / OSM
        precalculadas. La capa de vivienda es una muestra hasta incorporar datos reales (ver docs).
      </p>
    </div>
  );
}

function KeyStrip() {
  const keys = [["Hostil", c.hostile], ["Verde", c.green], ["Vivienda", c.housing]];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 18, margin: "22px 0 4px" }}>
      {keys.map(([label, col]) => (
        <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: font.mono, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: c.muted }}>
          <span style={{ width: 12, height: 12, background: col, border: `1px solid ${c.line}` }} /> {label}
        </span>
      ))}
    </div>
  );
}
