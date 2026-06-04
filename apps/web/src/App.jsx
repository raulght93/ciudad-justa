import { lazy, Suspense } from "react";
import { c, font, kicker } from "./styles/tokens.js";
import { HOW } from "./data/content.js";
import { useIsMobile } from "./hooks/useMediaQuery.js";
import Nav, { MobileActionBar } from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import { Ticker, Spikes } from "./components/decor.jsx";
import Layers from "./components/Layers.jsx";
import Manifesto, { How } from "./components/Manifesto.jsx";
import Housing from "./components/Housing.jsx";

// MapLibre es pesado → su propio chunk, cargado al desplazarse.
const MapSection = lazy(() => import("./components/MapSection.jsx"));

export default function App() {
  const isMobile = useIsMobile();
  return (
    <div style={{ background: c.bg, color: c.text, fontFamily: font.sans, minHeight: "100vh" }}>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <Nav />
      <Hero />
      <Ticker />
      <main id="contenido">
        <Layers />
        <Spikes color={c.hostile} />
        <Suspense fallback={<div style={{ padding: "80px 22px", textAlign: "center", color: c.faint, fontFamily: font.mono }}>Cargando mapa…</div>}>
          <MapSection />
        </Suspense>
        <How steps={HOW} />
        <Manifesto />
        <Housing />
      </main>
      <Footer />
      {/* Espacio para la barra de acción inferior fija (solo móvil). */}
      {isMobile && <div style={{ height: 76 }} aria-hidden />}
      <MobileActionBar />
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${c.line}`, background: c.bgAlt }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "52px 22px", display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: font.serif, fontWeight: 900, fontSize: "1.7rem", color: c.text }}>Ciudad Justa</div>
          <p style={{ marginTop: 10, color: c.muted, maxWidth: 440, lineHeight: 1.6, fontSize: 14.5 }}>
            Dossier cívico abierto, sin ánimo de lucro. Código y datos libres. La dignidad por
            delante de la propiedad.
          </p>
        </div>
        <div style={{ ...kicker, fontSize: 11, color: c.faint, lineHeight: 2, textAlign: "right" }}>
          Datos · Arrels · ISGlobal · Konijnendijk<br />
          Estrategia de Sinhogarismo · Agenda Urbana<br />
          <span style={{ color: c.muted }}>Bibliografía → docs/fuentes.md</span>
        </div>
      </div>
    </footer>
  );
}
