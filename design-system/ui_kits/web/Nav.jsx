// Barra de navegación sticky + conmutador de dirección (Cartel / Editorial).

const { useState: useStateNav, useEffect: useEffectNav } = React;

function DirectionToggle({ dir, setDir }) {
  const opts = [["cartel", "Cartel · A"], ["editorial", "Editorial · C"]];
  return (
    <div role="radiogroup" aria-label="Dirección visual" style={{ display: "flex", border: "2px solid var(--line-strong)" }}>
      {opts.map(([v, label]) => {
        const on = dir === v;
        return (
          <button key={v} role="radio" aria-checked={on} onClick={() => setDir(v)}
            style={{ fontFamily: "var(--mono)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", padding: "7px 12px", cursor: "pointer", border: "none",
              background: on ? "var(--signal-yellow)" : "transparent", color: on ? "#0a0a0b" : "var(--fg-3)" }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Nav({ dir, setDir }) {
  const [open, setOpen] = useStateNav(false);
  const [solid, setSolid] = useStateNav(false);
  useEffectNav(() => {
    const onScroll = () => setSolid(window.scrollY > 20);
    window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav aria-label="Principal" style={{ position: "sticky", top: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18,
      padding: "12px 22px", background: solid ? "rgba(10,10,11,0.86)" : "transparent",
      backdropFilter: solid ? "blur(10px)" : "none", WebkitBackdropFilter: solid ? "blur(10px)" : "none",
      borderBottom: `1px solid ${solid ? "var(--line)" : "transparent"}`, transition: "background var(--dur), border-color var(--dur)" }}>
      <Brand size={30} stacked={false} />

      <div style={{ display: "flex", alignItems: "center", gap: 22 }} className="cj-navlinks">
        {window.NAV.map((s) => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--fg-2)", textDecoration: "none" }}>
            <span style={{ color: "var(--fg-3)" }}>{s.n}</span>&nbsp;{s.label}
          </a>
        ))}
        <DirectionToggle dir={dir} setDir={setDir} />
        <Button variant="primary" href="#mapa" icon="arrowRight" style={{ padding: "9px 16px", fontSize: 13 }}>Explorar</Button>
      </div>

      <button className="cj-navburger" onClick={() => setOpen(true)} aria-label="Abrir índice"
        style={{ display: "none", background: "transparent", border: "2px solid var(--line-strong)",
          color: "var(--fg-1)", padding: 9, cursor: "pointer" }}>
        <Icon name="menu" size={20} />
      </button>

      {open && (
        <div role="dialog" aria-modal="true" style={{ position: "fixed", inset: 0, zIndex: 100,
          background: "var(--ink-900)", display: "flex", flexDirection: "column", padding: "16px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Brand size={30} stacked={false} />
            <button onClick={() => setOpen(false)} aria-label="Cerrar" style={{ background: "transparent",
              border: "2px solid var(--line-strong)", color: "var(--fg-1)", padding: 9, cursor: "pointer" }}>
              <Icon name="x" size={20} />
            </button>
          </div>
          <ul style={{ listStyle: "none", margin: "auto 0", padding: 0, display: "grid", gap: 2 }}>
            {window.NAV.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "baseline",
                  gap: 14, textDecoration: "none", padding: "12px 0", borderBottom: "1px solid var(--line-soft)" }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--signal-red)", fontWeight: 700 }}>{s.n}</span>
                  <span style={{ fontFamily: "var(--display)", textTransform: "uppercase", fontSize: "2rem", color: "var(--fg-1)" }}>{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <DirectionToggle dir={dir} setDir={setDir} />
          </div>
        </div>
      )}
    </nav>
  );
}

Object.assign(window, { Nav });
