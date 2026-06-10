// apps/web/src/components/Nav.jsx
import { useEffect, useRef, useState } from "react";
import { c, font } from "../styles/tokens.js";
import { NAV } from "../data/content.js";
import { useDirection } from "../context/Direction.jsx";
import { Brand, Button, Icon } from "./primitives.jsx";

export function DirectionToggle() {
  const [dir, setDir] = useDirection();
  const opts = [["cartel", "Cartel · A"], ["editorial", "Editorial · C"]];
  return (
    <div role="radiogroup" aria-label="Dirección visual" style={{ display: "flex", border: `2px solid ${c.lineStrong}` }}>
      {opts.map(([v, label]) => {
        const on = dir === v;
        return (
          <button key={v} role="radio" aria-checked={on} onClick={() => setDir(v)}
            style={{ fontFamily: font.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "7px 12px", cursor: "pointer", border: "none", background: on ? c.yellow : "transparent", color: on ? "#0a0a0b" : c.faint }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const dialogRef = useRef(null);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  // <dialog> nativo: showModal() da focus trap + Escape + backdrop. onClose sincroniza estado.
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  return (
    <nav aria-label="Principal" style={{ position: "sticky", top: 0, zIndex: 50, display: "flex", alignItems: "center",
      justifyContent: "space-between", gap: 18, padding: "12px 22px",
      background: solid ? "rgba(10,10,11,0.86)" : "transparent", backdropFilter: solid ? "blur(10px)" : "none",
      WebkitBackdropFilter: solid ? "blur(10px)" : "none", borderBottom: `1px solid ${solid ? c.line : "transparent"}`,
      transition: "background .16s, border-color .16s" }}>
      <Brand size={30} />

      <div className="cj-navlinks" style={{ display: "flex", alignItems: "center", gap: 22 }}>
        {NAV.map((s) => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.16em",
            textTransform: "uppercase", color: c.muted, textDecoration: "none" }}>
            <span style={{ color: c.faint }}>{s.n}</span>&nbsp;{s.label}
          </a>
        ))}
        <DirectionToggle />
        <Button href="#mapa" icon="arrowRight" style={{ padding: "9px 16px", fontSize: 13 }}>Explorar</Button>
      </div>

      <button className="cj-navburger" onClick={() => setOpen(true)} aria-label="Abrir índice"
        style={{ display: "none", background: "transparent", border: `2px solid ${c.lineStrong}`, color: c.text, padding: 9, cursor: "pointer" }}>
        <Icon name="menu" size={20} />
      </button>

      <dialog ref={dialogRef} className="cj-menu" aria-label="Índice" onClose={() => setOpen(false)}
        style={{ padding: "14px 22px calc(18px + env(safe-area-inset-bottom)) 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flex: "0 0 auto" }}>
          <Brand size={28} />
          <button onClick={() => setOpen(false)} aria-label="Cerrar índice" style={{ background: "transparent", border: `2px solid ${c.lineStrong}`, color: c.text, padding: 9, cursor: "pointer", flex: "0 0 auto" }}>
            <Icon name="x" size={20} />
          </button>
        </div>
        <ul style={{ listStyle: "none", margin: "20px 0 0", padding: 0, display: "grid", gap: 2 }}>
          {NAV.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "baseline", gap: 14,
                textDecoration: "none", padding: "11px 0", borderBottom: `1px solid ${c.lineSoft}` }}>
                <span style={{ fontFamily: font.mono, fontSize: 13, color: c.accent, fontWeight: 700 }}>{s.n}</span>
                <span style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "clamp(1.5rem,6vw,2rem)", lineHeight: 1, color: c.text }}>{s.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "auto", paddingTop: 24 }}><DirectionToggle /></div>
      </dialog>
    </nav>
  );
}
