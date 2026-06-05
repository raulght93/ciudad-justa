// apps/web/src/main.jsx
// IMPORTANTE: añade la línea de import del CSS del sistema.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/contradiseno.css";   // ← NUEVO: fuentes + motivos + accesibilidad

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
