import { lazy, Suspense } from "react";
import { c, font } from "./styles/tokens.js";
import { HOW } from "./data/content.js";
import Hero from "./components/Hero.jsx";
import Layers from "./components/Layers.jsx";
import Manifesto, { How } from "./components/Manifesto.jsx";
import Housing from "./components/Housing.jsx";

// MapLibre es pesado → su propio chunk, cargado al desplazarse.
const MapSection = lazy(() => import("./components/MapSection.jsx"));

export default function App() {
  return (
    <div style={{ background: c.bg, color: c.text, fontFamily: font.sans, minHeight: "100vh" }}>
      <Hero />
      <Layers />
      <Suspense
        fallback={
          <div style={{ padding: "80px 22px", textAlign: "center", color: c.faint }}>
            Cargando mapa…
          </div>
        }
      >
        <MapSection />
      </Suspense>
      <How steps={HOW} />
      <Manifesto />
      <Housing />
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${c.line}`, background: c.bgAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 22px", display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: font.serif, fontWeight: 900, fontSize: "1.6rem", color: c.text }}>
            Ciudad Justa
          </div>
          <p style={{ marginTop: 8, color: c.muted, maxWidth: 420, lineHeight: 1.6, fontSize: 14.5 }}>
            Proyecto cívico-académico, sin ánimo de lucro, de código y datos abiertos. La
            dignidad por encima de la propiedad.
          </p>
        </div>
        <div style={{ fontSize: 13, color: c.faint, lineHeight: 1.7 }}>
          Datos: Arrels · ISGlobal · Konijnendijk · Estrategia de Sinhogarismo · AUE.
          <br />
          Ver <code style={{ color: c.muted }}>docs/fuentes.md</code> para la bibliografía completa.
        </div>
      </div>
    </footer>
  );
}
