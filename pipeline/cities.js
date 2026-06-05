// Ciudades piloto candidatas. Cada una es una Área Urbana Funcional cubierta por
// Copernicus Urban Atlas (788 FUAs > 50k hab. en EEA38) → datos de verde y suelo
// comparables. bbox = [minLng, minLat, maxLng, maxLat]; cell en grados.
//
// Selección deliberadamente FUERA de las "típicas" (Madrid/Barcelona): se prioriza
// valor marginal alto (calor, déficit de verde, sin actor de referencia saturando).

export const CITIES = {
  cordoba: {
    name: "Córdoba",
    center: [-4.7794, 37.8882],
    bbox: [-4.83, 37.855, -4.74, 37.905],
    cell: 0.01, // ≈ 0.9 km (lng) × 1.1 km (lat) a 37.9° N
    note: "Ciudad más calurosa de España (récord 47,6 °C); isla de calor por asfalto → el déficit de verde es salud pública.",
    fua: "ES (Urban Atlas FUA Córdoba)",
    // Fuentes/aliados locales además de Urban Atlas/OSM: Ecologistas en Acción
    // (Córdoba) — informes de arbolado, déficit de sombra y olas de calor.
    localSources: ["Ecologistas en Acción · Córdoba", "Urban Atlas (FUA)", "OSM / Overpass"],
  },
  malaga: {
    name: "Málaga",
    center: [-4.421, 36.721],
    bbox: [-4.49, 36.68, -4.36, 36.75],
    cell: 0.012,
    note: "Turistificación y gentrificación; presión de alquiler y desplazamiento. Cruce vivienda × verde × servicios.",
    fua: "ES (Urban Atlas FUA Málaga)",
  },
  murcia: {
    name: "Murcia",
    center: [-1.1307, 37.9847],
    bbox: [-1.18, 37.95, -1.08, 38.02],
    cell: 0.01,
    note: "Calor extremo del sureste árido; huerta vs. asfalto; déficit de sombra documentado.",
    fua: "ES (Urban Atlas FUA Murcia)",
  },
  "vitoria-gasteiz": {
    name: "Vitoria-Gasteiz",
    center: [-2.6727, 42.8467],
    bbox: [-2.72, 42.82, -2.62, 42.88],
    cell: 0.01,
    note: "Contrapunto: 'Green Capital' europea con anillo verde — sirve de referencia/control de cómo SÍ se hace.",
    fua: "ES (Urban Atlas FUA Vitoria/Gasteiz)",
  },
};

export const DEFAULT_CITY = "cordoba";
