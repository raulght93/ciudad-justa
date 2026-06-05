// apps/web/src/context/Direction.jsx
// Contexto global de la dirección visual: "cartel" (A) | "editorial" (C).
// Persistido en localStorage. Envuelve <App/> con <DirectionProvider>.

import { createContext, useContext, useEffect, useState } from "react";

const DirectionCtx = createContext(["cartel", () => {}]);

export function DirectionProvider({ children }) {
  const [dir, setDir] = useState(() => {
    try { return localStorage.getItem("cj-dir") || "cartel"; } catch { return "cartel"; }
  });
  useEffect(() => {
    try { localStorage.setItem("cj-dir", dir); } catch {}
    document.documentElement.dataset.dir = dir;
  }, [dir]);
  return <DirectionCtx.Provider value={[dir, setDir]}>{children}</DirectionCtx.Provider>;
}

export function useDirection() {
  return useContext(DirectionCtx);
}
