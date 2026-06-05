// HERO — dos direcciones conmutables:
//  A · CARTEL    → poster centrado/apilado, titular sobreimpreso, grano, sellos.
//  C · EDITORIAL → rejilla rota asimétrica, tipo que sangra, numerales gigantes.

function StatStrip({ dir }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      border: "2px solid var(--fg-1)", marginTop: dir === "editorial" ? 0 : 48,
      background: "var(--ink-850)" }}>
      {window.KEY_STATS.map((s, i) => (
        <div key={s.label} style={{ padding: "22px 20px", borderRight: i < window.KEY_STATS.length - 1 ? "2px solid var(--fg-1)" : "none",
          borderTop: `4px solid ${s.color}` }}>
          <div style={{ fontFamily: "var(--display)", fontSize: "clamp(2.4rem,4.5vw,3.2rem)", lineHeight: 0.9, color: s.color }}>{s.value}</div>
          <div style={{ marginTop: 10, color: "var(--fg-1)", fontWeight: 600, lineHeight: 1.35, fontSize: 15 }}>{s.label}</div>
          <div style={{ marginTop: 6, color: "var(--fg-3)", fontSize: 12.5, lineHeight: 1.5 }}>{s.note}</div>
          <div style={{ marginTop: 12 }}><SourceTag id={s.source} /></div>
        </div>
      ))}
    </div>
  );
}

// ---------- A · CARTEL ----------
function HeroCartel() {
  return (
    <header id="top" className="riso-grain" style={{ position: "relative", overflow: "hidden",
      maxWidth: "var(--maxw)", margin: "0 auto", padding: "clamp(40px,7vw,88px) 22px clamp(40px,6vw,72px)", textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
        <Kicker color="var(--signal-yellow)">{window.HERO.kicker}</Kicker>
      </div>
      <h1 className="display offset-print" style={{ fontSize: "var(--t-mega)", lineHeight: 0.82,
        margin: "0 auto", maxWidth: "13ch", position: "relative", zIndex: 1 }}>
        {window.HERO.line1}<br/>{window.HERO.line2}<br/>
        {window.HERO.line3pre}<span style={{ color: "var(--signal-red)" }}>{window.HERO.line3accent}</span>.
      </h1>
      <p className="lead" style={{ margin: "26px auto 0", maxWidth: "52ch", color: "var(--fg-2)" }}>{window.HERO.sub}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginTop: 30 }}>
        <Button variant="primary" href={window.HERO.ctaPrimary.href} icon="arrowRight">{window.HERO.ctaPrimary.label}</Button>
        <Button variant="ghost" href={window.HERO.ctaSecondary.href}>{window.HERO.ctaSecondary.label}</Button>
      </div>
      <StatStrip dir="cartel" />
    </header>
  );
}

// ---------- C · EDITORIAL ----------
function HeroEditorial() {
  return (
    <header id="top" style={{ position: "relative", overflow: "hidden", borderBottom: "2px solid var(--fg-1)" }}>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "clamp(28px,5vw,56px) 22px 0",
        display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 18, alignItems: "start" }}>
        <Kicker color="var(--signal-yellow)">{window.HERO.kicker}</Kicker>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.1em", color: "var(--signal-cyan)",
          writingMode: "vertical-rl", transform: "rotate(180deg)", justifySelf: "end" }}>41.3851° N · 2.1734° E</span>
      </div>

      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "8px 22px clamp(28px,5vw,52px)", position: "relative" }}>
        <h1 className="display" style={{ fontSize: "clamp(3.6rem,15vw,12rem)", lineHeight: 0.8, letterSpacing: "0.005em" }}>
          <span style={{ display: "block" }}>Hay sitios</span>
          <span style={{ display: "block", marginLeft: "8vw", color: "var(--fg-1)" }}>diseñados</span>
          <span style={{ display: "block", textAlign: "right" }}>
            para que <span className="offset-print" style={{ color: "var(--signal-red)" }}>no estés</span>.
          </span>
        </h1>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: 24, marginTop: 30, alignItems: "end" }} className="cj-hero-grid">
          <p className="lead" style={{ color: "var(--fg-2)", borderLeft: "3px solid var(--signal-red)", paddingLeft: 18 }}>{window.HERO.sub}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "flex-end" }}>
            <Button variant="primary" href={window.HERO.ctaPrimary.href} icon="arrowRight">{window.HERO.ctaPrimary.label}</Button>
            <Button variant="ghost" href={window.HERO.ctaSecondary.href}>{window.HERO.ctaSecondary.label}</Button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: "var(--maxw)", margin: "0 auto", padding: "0 22px clamp(28px,5vw,52px)" }}>
        <StatStrip dir="editorial" />
      </div>
    </header>
  );
}

function Hero({ dir }) {
  return dir === "editorial" ? <HeroEditorial /> : <HeroCartel />;
}

Object.assign(window, { Hero, HeroCartel, HeroEditorial, StatStrip });
