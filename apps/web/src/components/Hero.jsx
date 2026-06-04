import { c, font, radius } from "../styles/tokens.js";
import { KEY_STATS } from "../data/content.js";
import { useReveal, useCountUp } from "../hooks/useReveal.js";
import { SourceTag } from "./primitives.jsx";

export default function Hero() {
  return (
    <header
      style={{
        position: "relative",
        overflow: "hidden",
        borderBottom: `1px solid ${c.line}`,
        background: `radial-gradient(1200px 600px at 15% -10%, ${c.hostile}22, transparent 60%),
                     radial-gradient(1000px 500px at 95% 10%, ${c.green}1f, transparent 55%),
                     linear-gradient(180deg, ${c.bgAlt}, ${c.bg})`,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(70px,12vw,150px) 22px clamp(40px,7vw,80px)" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: c.accent,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 99, background: c.accent, boxShadow: `0 0 12px ${c.accent}` }} />
          Ciudad Justa · España
        </div>

        <h1
          style={{
            fontFamily: font.serif,
            fontWeight: 900,
            fontSize: "clamp(2.6rem, 7vw, 5.2rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            margin: "22px 0 0",
            color: c.text,
          }}
        >
          La exclusión que el
          <br />
          <span style={{ color: c.accent }}>diseño urbano</span> esconde.
        </h1>

        <p
          style={{
            maxWidth: 640,
            marginTop: 22,
            fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)",
            lineHeight: 1.55,
            color: c.muted,
          }}
        >
          Pinchos donde alguien dormiría. Bancos imposibles de usar. Barrios sin un
          árbol ni un servicio a 15 minutos. Lo cartografiamos, lo votamos y lo
          hacemos visible —porque <strong style={{ color: c.text }}>la dignidad va por
          delante de la propiedad</strong>.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 34 }}>
          <a href="#mapa" style={btn(c.accent, true)}>
            Ver el mapa →
          </a>
          <a href="#manifiesto" style={btn(c.accent, false)}>
            Por qué lo hacemos
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginTop: "clamp(40px,7vw,72px)",
          }}
        >
          {KEY_STATS.map((s) => (
            <StatCard key={s.label} stat={s} />
          ))}
        </div>
      </div>
    </header>
  );
}

function StatCard({ stat }) {
  const [ref, shown] = useReveal({ threshold: 0.4 });
  const n = useCountUp(stat.value, shown);
  return (
    <div
      ref={ref}
      style={{
        background: c.surface,
        border: `1px solid ${c.line}`,
        borderRadius: radius.md,
        padding: "20px 20px 18px",
        borderTop: `3px solid ${stat.color}`,
      }}
    >
      <div style={{ fontFamily: font.serif, fontWeight: 900, fontSize: "2.6rem", lineHeight: 1, color: stat.color }}>
        {n.toLocaleString("es-ES")}
        {stat.suffix}
      </div>
      <div style={{ marginTop: 10, color: c.text, fontWeight: 600, lineHeight: 1.4 }}>{stat.label}</div>
      <div style={{ marginTop: 6, color: c.faint, fontSize: 13.5, lineHeight: 1.5 }}>{stat.note}</div>
      <div style={{ marginTop: 12 }}>
        <SourceTag id={stat.source} />
      </div>
    </div>
  );
}

function btn(color, filled) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 15,
    fontFamily: font.sans,
    padding: "13px 22px",
    borderRadius: radius.pill,
    color: filled ? "#1a1206" : color,
    background: filled ? color : "transparent",
    border: `1px solid ${color}${filled ? "" : "66"}`,
  };
}
