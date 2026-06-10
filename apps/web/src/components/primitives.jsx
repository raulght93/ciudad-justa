// apps/web/src/components/primitives.jsx
// Primitivas del sistema "Contradiseño" como módulos ES (estilos inline + tokens).

import { useId, useState, useEffect, useRef } from "react";
import { c, font, radius, maxW, kicker as kickerBase } from "../styles/tokens.js";
import { SOURCES } from "../data/content.js";

// ---- Iconos (geometría Lucide, stroke 2.25) ----
const ICONS = {
  arrowRight: "M5 12h14 M12 5l7 7-7 7",
  arrowUpRight: "M7 7h10v10 M7 17L17 7",
  x: "M18 6 6 18 M6 6l12 12",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  chevronDown: "M6 9l6 6 6-6",
};
export function Icon({ name, size = 18, stroke = 2.25, style }) {
  const d = ICONS[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true"
      style={{ flex: "0 0 auto", ...style }}>
      {d.split(" M").map((seg, i) => <path key={i} d={(i ? "M" : "") + seg} />)}
    </svg>
  );
}

// ---- Marca: pin partido por raya DIAGONAL, mitades desalineadas + eco riso ----
const PIN = "M24 2C11.3 2 2 11 2 23.4 2 39 24 57 24 57S46 39 46 23.4C46 11 36.7 2 24 2Z";
export function Mark({ size = 30, ghost = true }) {
  const uid = "m" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg width={size} height={size * (72 / 56)} viewBox="-3 -6 56 72" role="img" aria-label="Ciudad Justa" style={{ flex: "0 0 auto" }}>
      <defs>
        <clipPath id={`tl${uid}`}><polygon points="-12,-12 62,-12 62,11 -12,46" /></clipPath>
        <clipPath id={`br${uid}`}><polygon points="-12,46 62,11 62,84 -12,84" /></clipPath>
      </defs>
      {ghost && <path d={PIN} fill={c.cyan} transform="translate(2.6,2.2)" opacity="0.85" />}
      <g transform="translate(2.6,-3.8)"><g clipPath={`url(#tl${uid})`}><path d={PIN} fill={c.accent} /></g></g>
      <g transform="translate(-2.6,3.8)"><g clipPath={`url(#br${uid})`}><path d={PIN} fill={c.accent} /></g></g>
    </svg>
  );
}

export function Brand({ size = 30, stacked = false, color = c.text }) {
  return (
    <a href="#top" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
      <Mark size={size} />
      <span style={{ fontFamily: font.display, textTransform: "uppercase", lineHeight: 0.82, fontSize: size * 0.62, color, letterSpacing: "0.01em" }}>
        {stacked ? <>Ciudad<br /><span style={{ color: c.accent }}>Justa</span></> : <>Ciudad <span style={{ color: c.accent }}>Justa</span></>}
      </span>
    </a>
  );
}

// Etiqueta-fuente clicable (mono, forense) que enlaza a la bibliografía.
export function SourceTag({ id }) {
  const s = SOURCES[id];
  if (!s) return null;
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" title={s.label}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: font.mono,
        fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: c.faint,
        textDecoration: "none", borderBottom: `1px solid ${c.lineStrong}`, paddingBottom: 2 }}>
      <Icon name="arrowUpRight" size={12} /> Fuente: {s.label}
    </a>
  );
}

export function Kicker({ n, children, color = c.accent }) {
  return (
    <div style={{ ...kickerBase, color, display: "flex", alignItems: "center", gap: 12 }}>
      {n && <span>{n}</span>}
      <span aria-hidden style={{ width: 30, height: 2, background: color }} />
      <span style={{ color: c.muted }}>{children}</span>
    </div>
  );
}

export function Button({ children, variant = "primary", href = "#", icon, onClick, style }) {
  const [pressed, setPressed] = useState(false);
  const variants = {
    primary: { background: c.accent, color: "#0a0a0b" },
    yellow: { background: c.yellow, color: "#0a0a0b" },
    ghost: { background: "transparent", color: c.text, borderColor: c.text },
  };
  return (
    <a href={href} onClick={onClick}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
      style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 15, letterSpacing: "0.01em", textTransform: "uppercase",
        padding: "13px 22px", border: "2px solid transparent", cursor: "pointer", textDecoration: "none",
        display: "inline-flex", alignItems: "center", gap: 10, borderRadius: 0,
        transform: pressed ? "translate(2px,2px)" : "none", transition: "transform 80ms cubic-bezier(.2,0,0,1)",
        ...variants[variant], ...style }}>
      {children}{icon && <Icon name={icon} size={16} />}
    </a>
  );
}

const STATUS = {
  confirmed: [c.green, "Confirmado"], reported: [c.hostileTx, "Sin verificar"],
  documented: [c.service, "Documentado"], disputed: [c.yellow, "En discusión"],
};
export function StatusPill({ status }) {
  const [col, label] = STATUS[status] || STATUS.reported;
  return (
    <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      borderRadius: 999, padding: "4px 11px", color: col, background: col + "1f", border: `1px solid ${col}66`,
      display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: col }} />{label}
    </span>
  );
}

export function Sawtooth({ flip = false, color = c.accent }) {
  return <div aria-hidden style={{ height: 14, width: "100%", transform: flip ? "scaleY(-1)" : "none",
    background: `linear-gradient(135deg, ${color} 50%, transparent 50%) 0 0 / 14px 14px repeat-x` }} />;
}

// Entrada al hacer scroll: añade la animación sólo cuando el elemento entra en
// viewport (más dinámico que animar todo al montar) y escalona con `i`. La
// opacidad nunca baja (siempre legible); sólo transforma. Respeta reduced-motion.
export function Reveal({ children, as: Tag = "div", style, i = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={shown ? "cj-reveal" : "cj-reveal-pre"} style={{ "--i": i, ...style }}>
      {children}
    </Tag>
  );
}

export function Section({ id, children, style, bg }) {
  return (
    <section id={id} style={{ background: bg, ...style }}>
      <div style={{ maxWidth: maxW, margin: "0 auto", padding: "clamp(56px,9vw,118px) 22px" }}>{children}</div>
    </section>
  );
}

export function SectionHead({ n, kicker, title, lead, color = c.accent }) {
  return (
    <Reveal>
      <Kicker n={n} color={color}>{kicker}</Kicker>
      <h2 style={{ ...displayHead(), margin: "16px 0 0", maxWidth: "16ch", paddingBottom: "0.12em" }}>{title}</h2>
      {lead && <p style={{ maxWidth: "60ch", marginTop: 20, fontSize: "clamp(1.05rem,1.6vw,1.35rem)", lineHeight: 1.5, color: c.muted }}>{lead}</p>}
    </Reveal>
  );
}

// Helpers de titular display (Anton, caja alta).
export function displayHead() {
  return { fontFamily: font.display, fontWeight: 400, textTransform: "uppercase",
    fontSize: "clamp(2rem,4.5vw,3.4rem)", lineHeight: 0.96, letterSpacing: "0.01em", color: c.text };
}
