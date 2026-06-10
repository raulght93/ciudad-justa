// apps/web/src/components/Hero.jsx
import { c, font, maxW } from "../styles/tokens.js";
import { HERO, KEY_STATS } from "../data/content.js";
import { useDirection } from "../context/Direction.jsx";
import { Kicker, Button, SourceTag } from "./primitives.jsx";

// Resalta **negritas** del copy.
function rich(text) {
  return text.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
    p.startsWith("**") ? <strong key={i} style={{ color: c.text, fontWeight: 600 }}>{p.slice(2, -2)}</strong> : p);
}

function StatStrip({ flush }) {
  return (
    <div className="cj-divcol" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      border: `2px solid ${c.text}`, marginTop: flush ? 0 : 48, background: c.bgAlt }}>
      {KEY_STATS.map((s, i) => {
        const decimals = Number.isInteger(s.value) ? 0 : 1;
        return (
          <div key={s.label} style={{ padding: "22px 20px", borderRight: i < KEY_STATS.length - 1 ? `2px solid ${c.text}` : "none", borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontFamily: font.display, fontSize: "clamp(2.4rem,4.5vw,3.2rem)", lineHeight: 0.9, color: s.color }}>
              {s.value.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{s.suffix}
            </div>
            <div style={{ marginTop: 10, color: c.text, fontWeight: 600, lineHeight: 1.35, fontSize: 15 }}>{s.label}</div>
            <div style={{ marginTop: 6, color: c.faint, fontSize: 12.5, lineHeight: 1.5 }}>{s.note}</div>
            <div style={{ marginTop: 12 }}><SourceTag id={s.source} /></div>
          </div>
        );
      })}
    </div>
  );
}

function HeroCartel() {
  return (
    <header id="top" className="riso-grain" style={{ position: "relative", overflow: "hidden", maxWidth: maxW, margin: "0 auto",
      padding: "clamp(40px,7vw,88px) 22px clamp(40px,6vw,72px)", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}><Kicker color={c.yellow}>{HERO.kicker}</Kicker></div>
      <h1 className="offset-print" style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "clamp(3.2rem,11vw,9.5rem)",
        lineHeight: 0.92, letterSpacing: "0.02em", wordSpacing: "0.04em", margin: "0 auto", maxWidth: "14ch", position: "relative", zIndex: 1, color: c.text }}>
        {HERO.line1}<br />{HERO.line2pre}<span style={{ color: c.accent }}>{HERO.line2accent}</span>{HERO.line2post}
      </h1>
      <p style={{ margin: "26px auto 0", maxWidth: "52ch", fontSize: "clamp(1.05rem,1.6vw,1.35rem)", lineHeight: 1.5, color: c.muted }}>{rich(HERO.sub)}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 30 }}>
        <Button href={HERO.ctaPrimary.href} icon="arrowRight">{HERO.ctaPrimary.label}</Button>
        <Button variant="ghost" href={HERO.ctaSecondary.href}>{HERO.ctaSecondary.label}</Button>
      </div>
      <StatStrip />
    </header>
  );
}

function HeroEditorial() {
  return (
    <header id="top" style={{ position: "relative", overflow: "hidden", borderBottom: `2px solid ${c.text}` }}>
      <div style={{ maxWidth: maxW, margin: "0 auto", padding: "clamp(28px,5vw,56px) 22px 0", display: "grid",
        gridTemplateColumns: "minmax(0,1fr) auto", gap: 18, alignItems: "start" }}>
        <Kicker color={c.yellow}>{HERO.kicker}</Kicker>
        <span style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: "0.1em", color: c.cyan, writingMode: "vertical-rl", transform: "rotate(180deg)", justifySelf: "end" }}>41.3851° N · 2.1734° E</span>
      </div>
      <div style={{ maxWidth: maxW, margin: "0 auto", padding: "8px 22px clamp(28px,5vw,52px)" }}>
        <h1 style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "clamp(3rem,10vw,8.5rem)", lineHeight: 0.94, letterSpacing: "0.02em", wordSpacing: "0.04em", color: c.text }}>
          <span style={{ display: "block" }}>{HERO.line1}</span>
          <span style={{ display: "block", textAlign: "right", marginTop: "0.06em" }}>{HERO.line2pre}<span style={{ color: c.accent }}>{HERO.line2accent}</span>{HERO.line2post}</span>
        </h1>
        <div className="cj-hero-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: 24, marginTop: 30, alignItems: "end" }}>
          <p style={{ fontSize: "clamp(1.05rem,1.6vw,1.35rem)", lineHeight: 1.5, color: c.muted, borderLeft: `3px solid ${c.accent}`, paddingLeft: 18 }}>{rich(HERO.sub)}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "flex-end" }}>
            <Button href={HERO.ctaPrimary.href} icon="arrowRight">{HERO.ctaPrimary.label}</Button>
            <Button variant="ghost" href={HERO.ctaSecondary.href}>{HERO.ctaSecondary.label}</Button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: maxW, margin: "0 auto", padding: "0 22px clamp(28px,5vw,52px)" }}><StatStrip flush /></div>
    </header>
  );
}

export default function Hero() {
  const [dir] = useDirection();
  return dir === "editorial" ? <HeroEditorial /> : <HeroCartel />;
}
