import { useEffect, useState } from "react";

// Devuelve true si el media query casa. Reactivo a cambios de tamaño/orientación.
export function useMediaQuery(query) {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : false;
  const [matches, setMatches] = useState(get);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [query]);

  return matches;
}

// Atajo: móvil = ancho < 768px.
export const useIsMobile = () => useMediaQuery("(max-width: 767px)");
