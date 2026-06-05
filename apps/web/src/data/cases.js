// Los tres "casos" del dossier de mapas. Cada ciudad encarna una capa dominante
// (y su color de señal). Honestidad de datos: cada caso usa la capa donde hay
// datos reales; vivienda (Málaga) arranca con MUESTRA hasta meter INE/alquiler.
import { c } from "../styles/tokens.js";
import { HOSTILE_POINTS, GREEN_DEFICIT } from "./geo.js";

// Rampas de color por tipo de capa (rojo = peor).
const RAMP_GREEN = [0, c.green, 0.5, "#d9c64a", 1, c.hostile]; // déficit de verde
const RAMP_SERVICE = [0, c.service, 0.5, "#d9c64a", 1, c.hostile]; // déficit de servicios (15-min)
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
      { key: "green", label: "Verde", kind: "choropleth", url: "/data/barcelona-green-deficit.geojson", embedded: GREEN_DEFICIT, prop: "green_deficit_score", ramp: RAMP_GREEN },
      { key: "service", label: "Servicios", kind: "choropleth", url: "/data/barcelona-services-deficit.geojson", prop: "service_deficit", ramp: RAMP_SERVICE },
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
    note: "Cuanto más rojo, menos copa de árbol/verde o más lejos quedan los servicios. La ciudad más calurosa de España: aquí el verde es salud. Cubierta arbórea real del Urban Atlas (Copernicus) + servicios de OpenStreetMap + Ecologistas en Acción.",
    stat: { value: "47,6 °C", label: "récord de calor · isla de calor por asfalto", source: "ecologistas" },
    layers: [
      { key: "green", label: "Verde", kind: "choropleth", url: "/data/cordoba-green-deficit.geojson", prop: "green_deficit_score", ramp: RAMP_GREEN },
      { key: "service", label: "Servicios", kind: "choropleth", url: "/data/cordoba-services-deficit.geojson", prop: "service_deficit", ramp: RAMP_SERVICE },
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
    note: "Alquiler €/m²·mes REAL por barrio (SERPAVI/Mitma 2024): de 5,3 a 20,9 €/m² — casi ×4 entre el barrio más caro y el más barato. Cruza con renta (INE), verde y servicios reales. Los pins son ejemplos ilustrativos.",
    stat: { value: "20,9 €/m²", label: "alquiler máx. por barrio (×4 sobre el más barato; SERPAVI 2024)", source: "serpavi" },
    layers: [
      { key: "rent", label: "Alquiler", kind: "choropleth", url: "/data/malaga-rent.geojson", prop: "rent_norm", ramp: RAMP_HOUSING },
      { key: "income", label: "Renta", kind: "choropleth", url: "/data/malaga-income.geojson", prop: "housing_vuln", ramp: RAMP_HOUSING },
      { key: "green", label: "Verde", kind: "choropleth", url: "/data/malaga-green-deficit.geojson", prop: "green_deficit_score", ramp: RAMP_GREEN },
      { key: "service", label: "Servicios", kind: "choropleth", url: "/data/malaga-services-deficit.geojson", prop: "service_deficit", ramp: RAMP_SERVICE },
      { key: "listings", label: "Ejemplos", kind: "price", url: "/data/malaga-listings.example.geojson" },
    ],
  },
];
