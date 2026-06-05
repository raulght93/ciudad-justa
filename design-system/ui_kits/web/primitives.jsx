// Primitivas reutilizables del UI kit web. Estilos inline + tokens de
// colors_and_type.css. Iconos: SVG con geometría Lucide (stroke 2).

const { useState, useRef, useEffect } = React;

// ---- Iconos (geometría Lucide, stroke 2.25) ----
function Icon({ name, size = 18, stroke = 2.25, style }) {
  const paths = {
    arrowRight: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
    arrowUpRight: <><path d="M7 7h10v10"/><path d="M7 17 17 7"/></>,
    x: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
    menu: <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>,
    plus: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
    camera: <><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/></>,
    check: <path d="M20 6 9 17l-5-5"/>,
    chevronDown: <path d="m6 9 6 6 6-6"/>,
    pin: <><path d="M20 10c0 4.4-8 12-8 12s-8-7.6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="square" strokeLinejoin="miter"
      style={{ flex: "0 0 auto", ...style }} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

// ---- Marca: pin partido por una raya DIAGONAL, mitades desalineadas (cizalla),
//      con eco de misregistro riso (fantasma cian) asomando por el corte. ----
const CJ_PIN = "M24 2C11.3 2 2 11 2 23.4 2 39 24 57 24 57S46 39 46 23.4C46 11 36.7 2 24 2Z";
function Mark({ size = 30, ghost = true }) {
  const raw = React.useId();
  const uid = "m" + raw.replace(/[^a-zA-Z0-9]/g, "");
  const h = size * (72 / 56);
  return (
    <svg width={size} height={h} viewBox="-3 -6 56 72" role="img" aria-label="Ciudad Justa" style={{ flex: "0 0 auto" }}>
      <defs>
        <clipPath id={`tl${uid}`}><polygon points="-12,-12 62,-12 62,11 -12,46" /></clipPath>
        <clipPath id={`br${uid}`}><polygon points="-12,46 62,11 62,84 -12,84" /></clipPath>
      </defs>
      {ghost && <path d={CJ_PIN} fill="var(--signal-cyan)" transform="translate(2.6,2.2)" opacity="0.85" />}
      <g transform="translate(2.6,-3.8)"><g clipPath={`url(#tl${uid})`}><path d={CJ_PIN} fill="var(--signal-red)" /></g></g>
      <g transform="translate(-2.6,3.8)"><g clipPath={`url(#br${uid})`}><path d={CJ_PIN} fill="var(--signal-red)" /></g></g>
    </svg>
  );
}

function Brand({ size = 30, stacked = true, color = "var(--fg-1)" }) {
  return (
    <a href="#top" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
      <Mark size={size} />
      <span style={{ fontFamily: "var(--display)", textTransform: "uppercase", lineHeight: 0.82,
        fontSize: size * 0.62, color, letterSpacing: "0.01em" }}>
        {stacked ? <>Ciudad<br/><span style={{ color: "var(--signal-red)" }}>Justa</span></> : <>Ciudad <span style={{ color: "var(--signal-red)" }}>Justa</span></>}
      </span>
    </a>
  );
}

// ---- Kicker mono con índice + filete ----
function Kicker({ n, children, color = "var(--signal-red)" }) {
  return (
    <div style={{ fontFamily: "var(--mono)", fontSize: "var(--t-label)", fontWeight: 700,
      letterSpacing: "0.22em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 12, color }}>
      {n && <span>{n}</span>}
      <span aria-hidden style={{ width: 30, height: 2, background: color }} />
      <span style={{ color: "var(--fg-2)" }}>{children}</span>
    </div>
  );
}

// ---- Botón ----
function Button({ children, variant = "primary", href = "#", icon, onClick, style }) {
  const [pressed, setPressed] = useState(false);
  const base = {
    fontFamily: "var(--grotesk)", fontWeight: 700, fontSize: 15, letterSpacing: "0.01em",
    textTransform: "uppercase", padding: "13px 22px", border: "2px solid transparent",
    cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center",
    gap: 10, borderRadius: 0, transition: "transform var(--dur-fast) var(--ease-snap), background var(--dur)",
    transform: pressed ? "translate(2px,2px)" : "none", ...style,
  };
  const variants = {
    primary: { background: "var(--signal-red)", color: "#0a0a0b" },
    yellow:  { background: "var(--signal-yellow)", color: "#0a0a0b" },
    ghost:   { background: "transparent", color: "var(--fg-1)", borderColor: "var(--fg-1)" },
  };
  return (
    <a href={href} onClick={onClick} style={{ ...base, ...variants[variant] }}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}>
      {children}{icon && <Icon name={icon} size={16} />}
    </a>
  );
}

// ---- Pill de estado ----
function StatusPill({ status }) {
  const map = {
    confirmed: ["var(--layer-green)", "Confirmado"],
    reported:  ["var(--layer-hostile-tx)", "Sin verificar"],
    documented:["var(--layer-service)", "Documentado"],
    disputed:  ["var(--signal-yellow)", "En discusión"],
  };
  const [col, label] = map[status] || map.reported;
  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
      textTransform: "uppercase", borderRadius: 999, padding: "4px 11px", color: col,
      background: "color-mix(in srgb, " + col + " 12%, transparent)", border: "1px solid color-mix(in srgb, " + col + " 40%, transparent)",
      display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span style={{ width: 7, height: 7, borderRadius: 999, background: col }} />{label}
    </span>
  );
}

// ---- Fuente clicable ----
function SourceTag({ id }) {
  const s = window.SOURCES[id];
  if (!s) return null;
  return (
    <a href={s.url} target="_blank" rel="noopener noreferrer" title={s.label}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)",
        fontSize: 11, letterSpacing: "0.04em", color: "var(--fg-3)", textDecoration: "none",
        borderBottom: "1px dotted var(--line-strong)", paddingBottom: 2 }}>
      <Icon name="arrowUpRight" size={12} /> Fuente: {s.label}
    </a>
  );
}

// ---- Sawtooth divider ----
function Sawtooth({ flip = false, color = "var(--signal-red)" }) {
  return (
    <div aria-hidden style={{ height: 14, width: "100%",
      transform: flip ? "scaleY(-1)" : "none",
      background: `linear-gradient(135deg, ${color} 50%, transparent 50%) 0 0 / 14px 14px repeat-x` }} />
  );
}

// ---- Reveal: animación de entrada por CSS puro. El estado base es VISIBLE
//      (opacity 1) — si la línea de tiempo no avanza, el contenido se ve igual.
//      Robusto en iframes/captura, y respeta prefers-reduced-motion. ----
function Reveal({ children, as: Tag = "div", style }) {
  return <Tag className="cj-reveal" style={style}>{children}</Tag>;
}

Object.assign(window, { Icon, Mark, Brand, Kicker, Button, StatusPill, SourceTag, Sawtooth, Reveal });
