import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Reset mínimo global (sin CSS externo: una hoja inline en <head>).
const reset = document.createElement("style");
reset.textContent = `
  *,*::before,*::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body { margin: 0; }
  a { color: inherit; }
  ::selection { background: #f4a25955; }
  .maplibregl-popup-content { border-radius: 12px; padding: 12px 14px; }

  /* Accesibilidad (review C6): foco de teclado siempre visible. */
  :focus-visible { outline: 2px solid #f4a259; outline-offset: 3px; border-radius: 4px; }

  /* Skip-link: oculto hasta recibir foco con Tab. */
  .skip-link {
    position: absolute; left: 12px; top: -48px; z-index: 1000;
    background: #f4a259; color: #1a1206; font-weight: 700;
    padding: 10px 16px; border-radius: 10px; text-decoration: none;
    transition: top .2s ease;
  }
  .skip-link:focus { top: 12px; }

  /* Ticker de cifras. */
  @keyframes cj-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .cj-marquee { animation: cj-marquee 38s linear infinite; }
  .cj-marquee:hover { animation-play-state: paused; }

  /* Respeta a quien prefiere menos movimiento. */
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .cj-marquee { animation: none !important; }
    *,*::before,*::after { animation-duration: .001ms !important; transition-duration: .001ms !important; }
  }
`;
document.head.appendChild(reset);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
