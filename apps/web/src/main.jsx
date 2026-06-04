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
`;
document.head.appendChild(reset);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
