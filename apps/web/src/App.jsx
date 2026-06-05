// apps/web/src/App.jsx
import { lazy, Suspense, useEffect, useState } from "react";
import { c, font } from "./styles/tokens.js";
import { DirectionProvider } from "./context/Direction.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import { Ticker } from "./components/decor.jsx";
import { Sawtooth } from "./components/primitives.jsx";
import Layers from "./components/Layers.jsx";
import Manifesto, { How } from "./components/Manifesto.jsx";
import Housing from "./components/Housing.jsx";

// MapLibre es pesado → su propio chunk, cargado al desplazarse.
const MapSection = lazy(() => import("./components/MapSection.jsx"));
// Panel de moderación (interno, ruta #/mod) — chunk aparte.
const ModPanel = lazy(() => import("./components/ModPanel.jsx"));

// Mini-router por hash: solo distingue la herramienta interna de moderación.
function useHashRoute() {
  const get = () => (typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "");
  const [route, setRoute] = useState(get);
  useEffect(() => {
    const on = () => setRoute(get());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export default function App() {
  const route = useHashRoute();
  if (route === "/mod") {
    return (
      <DirectionProvider>
        <Suspense fallback={<div style={{ padding: "60px 22px", color: c.faint, fontFamily: font.mono }}>Cargando…</div>}>
          <ModPanel />
        </Suspense>
      </DirectionProvider>
    );
  }
  return (
    <DirectionProvider>
      <div style={{ background: c.bg, color: c.text, fontFamily: font.sans, minHeight: "100vh" }}>
        <a href="#capas" className="cj-skip">Saltar al contenido</a>
        <Nav />
        <Hero />
        <Ticker />
        <main>
          <Layers />
          <Sawtooth />
          <Suspense fallback={<div style={{ padding: "80px 22px", textAlign: "center", color: c.faint, fontFamily: font.mono }}>Cargando mapa…</div>}>
            <MapSection />
          </Suspense>
          <How />
          <Manifesto />
          <Housing />
        </main>
        <Footer />
      </div>
    </DirectionProvider>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `2px solid ${c.text}`, background: c.bgAlt }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "52px 22px", display: "flex", flexWrap: "wrap", gap: 28, justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ maxWidth: 460 }}>
          <div style={{ fontFamily: font.display, textTransform: "uppercase", fontWeight: 400, fontSize: "1.9rem", color: c.text }}>Ciudad <span style={{ color: c.accent }}>Justa</span></div>
          <p style={{ marginTop: 12, color: c.muted, lineHeight: 1.6, fontSize: 14.5 }}>Dossier cívico abierto, sin ánimo de lucro. Código y datos libres. La dignidad por delante de la propiedad.</p>
        </div>
        <div style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: c.faint, lineHeight: 2, textAlign: "right" }}>
          Datos · Arrels · ISGlobal · Konijnendijk<br />Estrategia de Sinhogarismo · Agenda Urbana<br />
          <span style={{ color: c.muted }}>Bibliografía → docs/fuentes.md</span>
        </div>
      </div>
    </footer>
  );
}
