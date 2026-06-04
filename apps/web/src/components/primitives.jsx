import { useState } from "react";
import { c, font, radius } from "../styles/tokens.js";
import { useReveal } from "../hooks/useReveal.js";
import { SOURCES } from "../data/content.js";

// Contenedor que revela su contenido al entrar en viewport.
export function Reveal({ children, delay = 0, as: Tag = "div", style }) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(22px)",
        transition: `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

// Sección de página con ancho máximo y separación vertical generosa.
export function Section({ id, children, style, pad = true }) {
  return (
    <section
      id={id}
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: pad ? "clamp(56px, 9vw, 120px) 22px" : "0 22px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

// Etiqueta-fuente clicable que enlaza a la bibliografía.
export function SourceTag({ id }) {
  const s = SOURCES[id];
  if (!s) return null;
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: c.faint,
        textDecoration: "none",
        borderBottom: `1px dotted ${c.line}`,
        paddingBottom: 1,
      }}
      title={s.label}
    >
      <span aria-hidden>↗</span> Fuente: {s.label}
    </a>
  );
}

// Pequeña pastilla de etiqueta.
export function Pill({ children, color = c.accent }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color,
        background: `${color}1a`,
        border: `1px solid ${color}33`,
        borderRadius: radius.pill,
        padding: "5px 12px",
      }}
    >
      {children}
    </span>
  );
}

// Bloque expandible: "empieza simple, profundiza si quieres".
export function Expandable({ label = "Profundiza", children, color = c.accent }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 14 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          cursor: "pointer",
          background: "transparent",
          border: `1px solid ${open ? color : c.line}`,
          color: open ? color : c.muted,
          borderRadius: radius.pill,
          padding: "7px 14px",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: font.sans,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          transition: "all .25s ease",
        }}
      >
        {label}
        <span
          aria-hidden
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .25s ease" }}
        >
          ▾
        </span>
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows .35s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              marginTop: 14,
              paddingLeft: 16,
              borderLeft: `2px solid ${color}55`,
              color: c.muted,
              lineHeight: 1.7,
              fontSize: 15.5,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
