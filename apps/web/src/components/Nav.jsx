import { useEffect, useState } from "react";
import { c, font, radius, kicker } from "../styles/tokens.js";
import { NAV } from "../data/content.js";
import { useIsMobile } from "../hooks/useMediaQuery.js";

// Marca: pin de mapa partido (mismo motivo que el favicon).
function Mark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false">
      <path d="M16 5c-4.4 0-8 3.5-8 7.9 0 5.6 8 14.1 8 14.1s8-8.5 8-14.1C24 8.5 20.4 5 16 5z"
        fill="none" stroke={c.accent} strokeWidth="2.2" />
      <rect x="11.3" y="11.6" width="9.4" height="2.2" rx="1.1" fill={c.accent} />
      <rect x="14.9" y="10" width="2.2" height="5.6" rx="1.1" fill={c.hostile} />
    </svg>
  );
}

function Brand() {
  return (
    <a href="#top" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
      <Mark />
      <span style={{ fontFamily: font.serif, fontWeight: 900, fontSize: 19, color: c.text, letterSpacing: "-0.01em" }}>
        Ciudad Justa
      </span>
    </a>
  );
}

export default function Nav() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Bloquea el scroll del fondo cuando el menú móvil está abierto.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const bar = {
    position: "sticky", top: 0, zIndex: 50,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: isMobile ? "12px 18px" : "14px 28px",
    background: `${c.bg}cc`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    borderBottom: `1px solid ${c.line}`,
  };

  return (
    <nav aria-label="Principal" style={bar}>
      <Brand />

      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {NAV.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              style={{ ...kicker, fontSize: 12.5, color: c.muted, textDecoration: "none" }}>
              <span style={{ color: c.faint }}>{s.n}</span>&nbsp;{s.label}
            </a>
          ))}
          <a href="#mapa" style={cta()}>Explorar →</a>
        </div>
      )}

      {isMobile && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir índice" aria-expanded={open}
          style={{ ...kicker, fontSize: 12, color: c.text, background: "transparent",
            border: `1px solid ${c.line}`, borderRadius: radius.pill, padding: "9px 16px", cursor: "pointer" }}
        >
          Índice ☰
        </button>
      )}

      {isMobile && open && (
        <div role="dialog" aria-modal="true" aria-label="Índice"
          style={{ position: "fixed", inset: 0, zIndex: 100, background: c.bg,
            display: "flex", flexDirection: "column", padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Brand />
            <button onClick={() => setOpen(false)} aria-label="Cerrar índice"
              style={{ ...kicker, fontSize: 13, color: c.text, background: "transparent",
                border: `1px solid ${c.line}`, borderRadius: radius.pill, padding: "9px 16px", cursor: "pointer" }}>
              Cerrar ✕
            </button>
          </div>
          <ul style={{ listStyle: "none", margin: "auto 0", padding: 0, display: "grid", gap: 4 }}>
            {NAV.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={() => setOpen(false)}
                  style={{ display: "flex", alignItems: "baseline", gap: 14, textDecoration: "none",
                    padding: "14px 0", borderBottom: `1px solid ${c.lineSoft}` }}>
                  <span style={{ ...kicker, fontSize: 13, color: c.accent }}>{s.n}</span>
                  <span style={{ fontFamily: font.serif, fontWeight: 700, fontSize: "2rem", color: c.text }}>
                    {s.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <a href="#mapa" onClick={() => setOpen(false)} style={{ ...cta(), justifyContent: "center", padding: "16px" }}>
            Explorar el mapa →
          </a>
        </div>
      )}
    </nav>
  );
}

function cta() {
  return {
    display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
    fontFamily: font.sans, fontWeight: 700, fontSize: 14,
    color: "#1a1206", background: c.accent, borderRadius: radius.pill, padding: "10px 18px",
  };
}

// Barra inferior fija con CTA (solo móvil). Se monta desde App.
export function MobileActionBar() {
  const isMobile = useIsMobile();
  if (!isMobile) return null;
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40,
      display: "flex", gap: 10, padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
      background: `${c.bg}e6`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderTop: `1px solid ${c.line}` }}>
      <a href="#mapa" style={{ flex: 1, textAlign: "center", textDecoration: "none", fontFamily: font.sans,
        fontWeight: 700, fontSize: 15, color: "#1a1206", background: c.accent, borderRadius: radius.pill, padding: "14px" }}>
        Ver el mapa
      </a>
      <a href="#manifiesto" style={{ textAlign: "center", textDecoration: "none", fontFamily: font.sans,
        fontWeight: 700, fontSize: 15, color: c.text, background: "transparent",
        border: `1px solid ${c.line}`, borderRadius: radius.pill, padding: "14px 20px" }}>
        Por qué
      </a>
    </div>
  );
}
