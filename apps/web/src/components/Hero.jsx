import { c, font, radius, kicker } from "../styles/tokens.js";
import { HERO, KEY_STATS } from "../data/content.js";
import { useReveal, useCountUp } from "../hooks/useReveal.js";
import { SourceTag } from "./primitives.jsx";

// Resalta **negritas** del copy en color de texto fuerte.
function rich(text) {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith("**") ? (
      <strong key={i} style={{ color: c.text, fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

export default function Hero() {
  return (
    <header
      id="top"
      style={{
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(1100px 520px at 8% -8%, ${c.hostile}26, transparent 58%),
                     radial-gradient(900px 480px at 100% 8%, ${c.green}1c, transparent 55%),
                     linear-gradient(180deg, ${c.bgAlt}, ${c.bg})`,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(48px,9vw,110px) 22px clamp(36px,6vw,68px)" }}>
        <div style={{ ...kicker, color: c.accent, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: c.accent, boxShadow: `0 0 14px ${c.accent}` }} />
          {HERO.kicker}
        </div>

        <h1
          style={{
            fontFamily: font.serif,
            fontWeight: 900,
            fontSize: "clamp(3rem, 9vw, 6.4rem)",
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
            margin: "26px 0 0",
            color: c.text,
            maxWidth: 14 + "ch",
          }}
        >
          {HERO.line1}
          <br />
          {HERO.line2pre}
          <em style={{ fontStyle: "italic", fontWeight: 500, color: c.accent }}>{HERO.line2accent}</em>
          {HERO.line2post}
        </h1>

        <p style={{ maxWidth: 600, marginTop: 26, fontSize: "clamp(1.05rem, 2.1vw, 1.3rem)", lineHeight: 1.6, color: c.muted }}>
          {rich(HERO.sub)}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 32 }}>
          <a href={HERO.ctaPrimary.href} style={btn(true)}>{HERO.ctaPrimary.label} →</a>
          <a href={HERO.ctaSecondary.href} style={btn(false)}>{HERO.ctaSecondary.label}</a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 0,
            marginTop: "clamp(44px,7vw,76px)",
            border: `1px solid ${c.line}`,
            borderRadius: radius.lg,
            overflow: "hidden",
            background: c.surface,
          }}
        >
          {KEY_STATS.map((s, i) => (
            <StatCell key={s.label} stat={s} last={i === KEY_STATS.length - 1} />
          ))}
        </div>
      </div>
    </header>
  );
}

function StatCell({ stat, last }) {
  const [ref, shown] = useReveal({ threshold: 0.4 });
  const decimals = Number.isInteger(stat.value) ? 0 : 1;
  const n = useCountUp(stat.value, shown, decimals);
  return (
    <div
      ref={ref}
      style={{
        padding: "26px 22px",
        borderRight: last ? "none" : `1px solid ${c.line}`,
        borderTop: `3px solid ${stat.color}`,
      }}
    >
      <div style={{ fontFamily: font.serif, fontWeight: 900, fontSize: "clamp(2.6rem,5vw,3.4rem)", lineHeight: 1, color: stat.color }}>
        {n.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        {stat.suffix}
      </div>
      <div style={{ marginTop: 12, color: c.text, fontWeight: 600, lineHeight: 1.4, fontSize: 15.5 }}>{stat.label}</div>
      <div style={{ marginTop: 6, color: c.faint, fontSize: 13, lineHeight: 1.5 }}>{stat.note}</div>
      <div style={{ marginTop: 14 }}><SourceTag id={stat.source} /></div>
    </div>
  );
}

function btn(filled) {
  return {
    display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
    fontFamily: font.sans, fontWeight: 700, fontSize: 15,
    padding: "14px 24px", borderRadius: radius.pill,
    color: filled ? "#1a1206" : c.accent,
    background: filled ? c.accent : "transparent",
    border: `1px solid ${c.accent}${filled ? "" : "55"}`,
  };
}
