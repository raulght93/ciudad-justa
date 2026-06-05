// Los tres "casos" del dossier de mapas. Cada ciudad encarna una capa dominante
// (y su color de señal). Honestidad de datos: cada caso usa la capa donde hay
// datos reales; vivienda (Málaga) arranca con MUESTRA hasta meter INE/alquiler.
import { c } from "../styles/tokens.js";
import { HOSTILE_POINTS, GREEN_DEFICIT } from "./geo.js";

// Rampas de color por tipo de capa (rojo = peor).
const RAMP_GREEN = [0, c.green, 0.5, "#d9c64a", 1, c.hostile]; // déficit de verde
const RAMP_HOUSING = [0, "#2a2433", 0.5, c.housing, 1, c.hostile]; // presión de vivienda

export const CASES = [
  {
    n: "01",
    id: "bcn",
    city: "Barcelona",
    title: "Arquitectura hostil",
    color: c.hostile,
    center: [2.174, 41.388],
    zoom: 12.2,
    note: "Bancos mínimos, pinchos, amenidades fantasma: diseño planificado para expulsar. Pulsa un punto.",
    stat: { value: "1.288", label: "barreras en el mapa de Arrels", source: "arrels" },
    layers: [
      { key: "hostile", label: "Hostil", kind: "points", embedded: HOSTILE_POINTS, api: true },
      { key: "green", label: "Verde", kind: "choropleth", url: "/data/green-deficit.geojson", embedded: GREEN_DEFICIT, prop: "green_deficit_score", ramp: RAMP_GREEN },
    ],
  },
  {
    n: "02",
    id: "cordoba",
    city: "Córdoba",
    title: "Déficit de verde",
    color: c.green,
    center: [-4.7794, 37.8882],
    zoom: 12.4,
    note: "Cuanto más rojo, menos sombra y verde. La ciudad más calurosa de España: aquí el verde es salud. Datos OSM + Ecologistas en Acción.",
    stat: { value: "47,6 °C", label: "récord de calor · isla de calor por asfalto", source: "ecologistas" },
    layers: [
      { key: "green", label: "Verde", kind: "choropleth", url: "/data/cordoba-green-deficit.geojson", prop: "green_deficit_score", ramp: RAMP_GREEN },
    ],
  },
  {
    n: "03",
    id: "malaga",
    city: "Málaga",
    title: "Precio de la vivienda",
    color: c.housing,
    center: [-4.421, 36.721],
    zoom: 12.6,
    sample: true,
    note: "Muestra ilustrativa: cuanto más violeta, más presión de alquiler y desplazamiento. Pendiente de datos reales (INE · Índice de Precios del Alquiler).",
    stat: { value: "muestra", label: "presión de vivienda (datos reales pendientes)", source: null },
    layers: [
      { key: "housing", label: "Vivienda", kind: "choropleth", url: "/data/malaga-housing.example.geojson", prop: "housing_pressure", ramp: RAMP_HOUSING },
    ],
  },
];
