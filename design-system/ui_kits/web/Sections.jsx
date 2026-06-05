// Secciones del dossier: Ticker, Layers, MapPanel (interactivo), How,
// Manifesto (sobre papel), Housing, Footer.

const { useState: useStateS } = React;

function Section({ id, children, style, bg }) {
  return (
    <section id={id} style={{ background: bg, ...style }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "clamp(56px,9vw,118px) 22px" }}>{children}</div>
    </section>
  );
}

function SectionHead({ n, kicker, title, lead, color }) {
  return (
    <Reveal>
      <Kicker n={n} color={color}>{kicker}</Kicker>
      <h2 style={{ margin: "16px 0 0", maxWidth: "16ch", paddingBottom: "0.12em" }}>{title}</h2>
      {lead && <p className="lead" style={{ marginTop: 20, maxWidth: "60ch" }}>{lead}</p>}
    </Reveal>
  );
}

// ---- TICKER (marquesina mecánica) ----
function Ticker() {
  const items = [...window.TICKER, ...window.TICKER];
  return (
    <div aria-label="Cifras del proyecto" style={{ overflow: "hidden", borderTop: "2px solid var(--fg-1)",
      borderBottom: "2px solid var(--fg-1)", background: "var(--signal-yellow)", padding: "11px 0" }}>
      <div className="cj-marquee" style={{ display: "flex", whiteSpace: "nowrap", width: "max-content" }}>
        {items.map((t, i) => (
          <span key={i} style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "#0a0a0b",
            padding: "0 26px", display: "inline-flex", alignItems: "center", gap: 26, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            {t}<span aria-hidden>▲</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- LAYERS ----
function LayerCard({ l, i }) {
  const [open, setOpen] = useStateS(false);
  return (
    <Reveal delay={i * 80} style={{ height: "100%" }}>
      <article style={{ position: "relative", height: "100%", background: "var(--ink-700)",
        border: "1px solid var(--line)", borderTop: `4px solid ${l.color}`, padding: 26, overflow: "hidden",
        display: "flex", flexDirection: "column" }}>
        <span aria-hidden style={{ position: "absolute", top: -26, right: 2, fontFamily: "var(--display)",
          fontSize: 150, lineHeight: 1, color: l.color, opacity: 0.08, pointerEvents: "none" }}>{l.tag}</span>
        <div style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, letterSpacing: "0.16em",
          textTransform: "uppercase", color: l.color, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>{l.icon}</span> Capa {l.tag}
        </div>
        <h3 style={{ fontFamily: "var(--display)", textTransform: "uppercase", fontSize: "1.9rem",
          lineHeight: 0.92, margin: "14px 0 0", color: "var(--fg-1)" }}>{l.title}</h3>
        <p style={{ color: "var(--fg-2)", lineHeight: 1.55, marginTop: 12, flex: 1 }}>{l.short}</p>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--fg-3)", marginTop: 16 }}>{l.layer}</div>
        <button onClick={() => setOpen(o => !o)} aria-expanded={open}
          style={{ marginTop: 16, alignSelf: "flex-start", background: "transparent", cursor: "pointer",
            border: `2px solid ${open ? l.color : "var(--line-strong)"}`, color: open ? l.color : "var(--fg-2)",
            fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "7px 13px", display: "inline-flex", alignItems: "center", gap: 8 }}>
          Profundiza <Icon name="chevronDown" size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform var(--dur)" }} />
        </button>
        <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows var(--dur)" }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{ marginTop: 14, paddingLeft: 14, borderLeft: `2px solid ${l.color}`, color: "var(--fg-2)", lineHeight: 1.65, fontSize: 15 }}>
              <p>{l.deep}</p>
              <div style={{ marginTop: 12 }}><SourceTag id={l.source} /></div>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function Layers() {
  return (
    <Section id="capas">
      <SectionHead n="01" kicker="Las capas" title="Tres mapas de una misma injusticia"
        lead="El barrio que pierde el verde suele perder también los servicios y llenarse de mobiliario que expulsa. Los superponemos para que se vea junto." />
      <div style={{ marginTop: 44, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        {window.LAYERS.map((l, i) => <LayerCard key={l.id} l={l} i={i} />)}
      </div>
    </Section>
  );
}

// ---- MAP PANEL (mock cartográfico-forense, interactivo) ----
function MapPanel() {
  const [sel, setSel] = useStateS(null);
  const ticks = Array.from({ length: 9 });
  return (
    <div style={{ background: "var(--ink-850)", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(56px,9vw,110px) 22px" }} id="mapa">
        <Kicker n="02" color="var(--layer-service)">El mapa</Kicker>
        <h2 style={{ margin: "16px 0 0" }}>El mapa de la exclusión</h2>
        <p className="lead" style={{ marginTop: 14, maxWidth: "58ch" }}>
          Demo con datos de ejemplo en Barcelona. La mancha tintada marca déficit de verde; los puntos, arquitectura hostil reportada. Pulsa un punto.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, margin: "20px 0 18px" }}>
          <Legend swatch="var(--layer-hostile)" label="Arquitectura hostil (punto)" />
          <Legend gradient label="Déficit de verde (mancha)" />
        </div>

        <div role="application" aria-label="Mapa de Barcelona (demo)" style={{ position: "relative", width: "100%",
          height: "min(60vh, 520px)", border: "2px solid var(--fg-1)", background: "var(--ink-900)", overflow: "hidden" }}
          className="riso-grain">
          {/* rejilla de calles */}
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="none" aria-hidden>
            {ticks.map((_, i) => <line key={"v"+i} x1={`${(i+1)*10}%`} y1="0" x2={`${(i+1)*10}%`} y2="100%" stroke="var(--line)" strokeWidth="1" />)}
            {ticks.map((_, i) => <line key={"h"+i} x1="0" y1={`${(i+1)*10}%`} x2="100%" y2={`${(i+1)*10}%`} stroke="var(--line)" strokeWidth="1" />)}
            <line x1="6%" y1="14%" x2="92%" y2="78%" stroke="var(--line-strong)" strokeWidth="2" />
            <line x1="10%" y1="86%" x2="84%" y2="10%" stroke="var(--line-strong)" strokeWidth="2" />
          </svg>
          {/* mancha de déficit de verde */}
          <div aria-hidden style={{ position: "absolute", left: "40%", top: "38%", width: "46%", height: "52%",
            background: "radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--layer-hostile) 40%, transparent), color-mix(in srgb, var(--layer-hostile) 10%, transparent) 60%, transparent 72%)",
            mixBlendMode: "screen" }} />
          {/* coordenadas borde */}
          <span style={mapCoord(8, 10)}>41.39° N</span>
          <span style={mapCoord(null, 10, 8)}>2.17° E</span>
          {/* puntos hostiles */}
          {window.MAP_POINTS.map((p, i) => {
            const active = sel === i;
            return (
              <button key={i} onClick={() => setSel(active ? null : i)} aria-label={p.desc}
                style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-50%)",
                  width: active ? 20 : 14, height: active ? 20 : 14, borderRadius: 999, cursor: "pointer",
                  background: "var(--layer-hostile)", border: `2px solid ${active ? "var(--signal-yellow)" : "#fff"}`,
                  boxShadow: active ? "0 0 0 6px color-mix(in srgb, var(--layer-hostile) 30%, transparent)" : "none",
                  opacity: p.status === "reported" ? 0.6 : 1, transition: "all var(--dur-fast)", padding: 0 }} />
            );
          })}
          {/* popup */}
          {sel !== null && (
            <div style={{ position: "absolute", left: `min(${window.MAP_POINTS[sel].x}%, 70%)`, top: `${window.MAP_POINTS[sel].y}%`,
              transform: "translate(14px, -50%)", width: 240, background: "var(--paper)", color: "#0a0a0b",
              border: "2px solid #0a0a0b", padding: 14, zIndex: 5 }}>
              <StatusPill status={window.MAP_POINTS[sel].status} />
              <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.45, color: "#1a1813" }}>{window.MAP_POINTS[sel].desc}</p>
              <div style={{ marginTop: 8, fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#5a564a" }}>{window.MAP_POINTS[sel].cat}</div>
            </div>
          )}
        </div>
        <p style={{ marginTop: 14, fontFamily: "var(--mono)", fontSize: 12, color: "var(--fg-3)", lineHeight: 1.6 }}>
          Datos ilustrativos. En producción: capa caliente desde la API (reportes validados) y frías desde Urban Atlas / NDVI / OSM precalculadas.
        </p>
      </div>
    </div>
  );
}
function mapCoord(left, top, right) {
  return { position: "absolute", left: left != null ? left : "auto", right: right != null ? right : "auto", top,
    fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.08em", color: "var(--layer-service)", textTransform: "uppercase" };
}
function Legend({ swatch, label, gradient }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-2)", fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>
      <span style={{ width: 16, height: 16, background: gradient ? "linear-gradient(90deg, transparent, var(--layer-hostile))" : swatch, border: "1px solid var(--line)" }} />{label}
    </span>
  );
}

// ---- HOW ----
function How() {
  return (
    <Section id="como">
      <SectionHead n="03" kicker="Cómo funciona" title="Detecta, valida, revierte" color="var(--signal-yellow)" />
      <ol style={{ listStyle: "none", padding: 0, margin: "38px 0 0", display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", border: "2px solid var(--fg-1)", background: "var(--ink-700)" }}>
        {window.HOW.map((s, i) => (
          <Reveal key={s.n} as="li" delay={i * 80} style={{ borderRight: i < window.HOW.length - 1 ? "2px solid var(--fg-1)" : "none" }}>
            <div style={{ padding: 28, height: "100%" }}>
              <div style={{ fontFamily: "var(--display)", fontSize: "3.4rem", lineHeight: 0.85, color: "var(--signal-red)" }}>{String(s.n).padStart(2, "0")}</div>
              <h3 style={{ fontFamily: "var(--display)", textTransform: "uppercase", fontSize: "1.7rem", margin: "12px 0 0", color: "var(--fg-1)" }}>{s.t}</h3>
              <p style={{ marginTop: 10, color: "var(--fg-2)", lineHeight: 1.55 }}>{s.d}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

// ---- MANIFESTO (sobre papel) ----
function Manifesto() {
  const [open, setOpen] = useStateS(false);
  return (
    <div id="manifiesto" style={{ background: "var(--paper)", color: "#0a0a0b", position: "relative" }} className="riso-grain">
      <Sawtooth color="var(--ink-900)" />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(56px,9vw,110px) 22px" }}>
        <Reveal>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "var(--signal-red-ink)", display: "flex", alignItems: "center", gap: 12 }}>
            04 <span style={{ width: 30, height: 2, background: "var(--signal-red-ink)" }} /> <span style={{ color: "#3a382f" }}>No somos neutrales</span>
          </div>
          <blockquote style={{ fontFamily: "var(--display)", textTransform: "uppercase", fontSize: "clamp(2.2rem,6vw,4.4rem)",
            lineHeight: 0.92, margin: "22px 0 0", maxWidth: "16ch", color: "#0a0a0b" }}>
            «{window.MANIFESTO.claim}»
          </blockquote>
          <p style={{ maxWidth: "62ch", marginTop: 24, fontSize: "1.12rem", lineHeight: 1.6, color: "#2a2820", fontFamily: "var(--grotesk)" }}>{window.MANIFESTO.body}</p>
          <button onClick={() => setOpen(o => !o)} aria-expanded={open} style={{ marginTop: 20, background: "transparent",
            border: "2px solid #0a0a0b", color: "#0a0a0b", cursor: "pointer", fontFamily: "var(--mono)", fontSize: 11,
            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "9px 15px", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Los derechos que ponemos en el centro <Icon name="chevronDown" size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform var(--dur)" }} />
          </button>
          <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows var(--dur)" }}>
            <div style={{ overflow: "hidden" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "grid", gap: 12 }}>
                {window.MANIFESTO.rights.map((r) => (
                  <li key={r.k} style={{ display: "flex", gap: 12, alignItems: "baseline", fontFamily: "var(--grotesk)", fontSize: 16 }}>
                    <span style={{ color: "var(--signal-red-ink)", fontWeight: 900 }}>—</span>
                    <span><strong>{r.k}.</strong> <span style={{ color: "#4a473c" }}>{r.v}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
      <Sawtooth flip color="var(--ink-900)" />
    </div>
  );
}

// ---- HOUSING ----
function Housing() {
  const col = "var(--layer-housing)";
  return (
    <Section id="vivienda" bg="var(--ink-900)">
      <Reveal>
        <Kicker n="05" color={col}>{window.HOUSING.kicker}</Kicker>
        <h2 style={{ margin: "16px 0 0", maxWidth: "14ch" }}>{window.HOUSING.title}</h2>
        <p style={{ maxWidth: "60ch", marginTop: 20, fontFamily: "var(--display)", textTransform: "uppercase",
          fontSize: "clamp(1.4rem,3vw,2.1rem)", lineHeight: 1.04, color: "var(--fg-1)" }}>{window.HOUSING.lead}</p>
        <p className="lead" style={{ maxWidth: "62ch", marginTop: 18 }}>{window.HOUSING.body}</p>
      </Reveal>
      <Reveal delay={100}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 36 }}>
          {window.HOUSING.metrics.map((m) => (
            <div key={m.label} style={{ position: "relative", background: "var(--ink-800)", border: "1px dashed color-mix(in srgb, var(--layer-housing) 50%, transparent)", padding: 22 }}>
              <div style={{ fontFamily: "var(--display)", fontSize: "3rem", lineHeight: 0.9, color: col }}>{m.value}</div>
              <div style={{ marginTop: 10, color: "var(--fg-2)", lineHeight: 1.4, fontSize: 14.5 }}>{m.label}</div>
              <span style={{ position: "absolute", top: 14, right: 14, fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase", color: col, border: "1px solid color-mix(in srgb, var(--layer-housing) 50%, transparent)", borderRadius: 999, padding: "3px 9px" }}>Pronto</span>
            </div>
          ))}
        </div>
      </Reveal>
      <Reveal delay={160}>
        <p style={{ marginTop: 26, fontSize: 14, color: "var(--fg-2)" }}><strong style={{ color: "var(--fg-1)" }}>{window.HOUSING.rightLink.k}:</strong> {window.HOUSING.rightLink.v}</p>
        <p style={{ marginTop: 12, fontFamily: "var(--mono)", fontSize: 12, color: "var(--fg-3)", lineHeight: 1.6, maxWidth: "72ch" }}>{window.HOUSING.note}</p>
      </Reveal>
    </Section>
  );
}

// ---- FOOTER ----
function Footer() {
  return (
    <footer style={{ borderTop: "2px solid var(--fg-1)", background: "var(--ink-850)" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "52px 22px", display: "flex",
        flexWrap: "wrap", gap: 28, justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ maxWidth: 460 }}>
          <Brand size={34} stacked={false} />
          <p style={{ marginTop: 14, color: "var(--fg-2)", lineHeight: 1.6, fontSize: 14.5 }}>
            Dossier cívico abierto, sin ánimo de lucro. Código y datos libres. La dignidad por delante de la propiedad.
          </p>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "var(--fg-3)", lineHeight: 2, textAlign: "right" }}>
          Datos · Arrels · ISGlobal · Konijnendijk<br/>Estrategia de Sinhogarismo · Agenda Urbana<br/>
          <span style={{ color: "var(--fg-2)" }}>Bibliografía → docs/fuentes.md</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Section, SectionHead, Ticker, Layers, MapPanel, How, Manifesto, Housing, Footer });
