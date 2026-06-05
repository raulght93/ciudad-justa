#!/usr/bin/env node
// Descarga datos reales de OpenStreetMap (Overpass) para una ciudad:
//   · verde   → inputs/<city>-green.geojson   (polígonos)
//   · POIs    → inputs/<city>-pois.geojson     (puntos, con categoría de servicio)
// Estos alimentan ingest-osm.mjs. Requiere red (Overpass API).
//
// Uso:  node fetch-osm.mjs [city]
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CITIES, DEFAULT_CITY } from "./cities.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cityKey = process.argv[2] || DEFAULT_CITY;
const city = CITIES[cityKey];
if (!city) { console.error(`Ciudad desconocida: ${cityKey}`); process.exit(1); }
const [minLng, minLat, maxLng, maxLat] = city.bbox;
const BB = `${minLat},${minLng},${maxLat},${maxLng}`; // Overpass = (S,W,N,E)
const UA = "ciudad-justa/1.0 (civic mapping)";
const ENDPOINT = "https://overpass-api.de/api/interpreter";

async function overpass(query) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
    body: "data=" + encodeURIComponent(query),
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  return res.json();
}

// Categorías de servicio esencial (ciudad de 15 minutos).
const POI_CATS = {
  salud: 'nwr["amenity"~"pharmacy|hospital|clinic|doctors"]',
  educacion: 'nwr["amenity"~"school|kindergarten|college|university"]',
  comercio: 'nwr["shop"~"supermarket|convenience|greengrocer"];nwr["amenity"="marketplace"]',
  transporte: 'nwr["highway"="bus_stop"];nwr["railway"~"station|tram_stop"];nwr["public_transport"="platform"]',
};

function waysToPolygons(elements) {
  const feats = [];
  for (const e of elements) {
    if (e.type !== "way" || !Array.isArray(e.geometry) || e.geometry.length < 4) continue;
    const ring = e.geometry.map((g) => [g.lon, g.lat]);
    const [a] = ring, b = ring[ring.length - 1];
    if (a[0] !== b[0] || a[1] !== b[1]) ring.push(a); // cerrar anillo
    feats.push({ type: "Feature", properties: { osm: e.id }, geometry: { type: "Polygon", coordinates: [ring] } });
  }
  return feats;
}

function centroid(e) {
  if (e.type === "node") return [e.lon, e.lat];
  if (e.center) return [e.center.lon, e.center.lat];
  if (Array.isArray(e.geometry) && e.geometry.length) {
    const n = e.geometry.length;
    const s = e.geometry.reduce((acc, g) => [acc[0] + g.lon, acc[1] + g.lat], [0, 0]);
    return [s[0] / n, s[1] / n];
  }
  return null;
}

const OUT = (f) => resolve(__dirname, `inputs/${cityKey}-${f}.geojson`);
mkdirSync(resolve(__dirname, "inputs"), { recursive: true });

console.log(`Descargando OSM de ${city.name} (${BB})…`);

// --- Verde ---
const greenQ = `[out:json][timeout:90];(
  way["leisure"~"park|garden|nature_reserve"](${BB});
  way["landuse"~"grass|forest|recreation_ground|cemetery"](${BB});
  way["natural"~"wood|scrub|grassland"](${BB});
);out geom;`;
const greenRaw = await overpass(greenQ);
const greenFeats = waysToPolygons(greenRaw.elements);
writeFileSync(OUT("green"), JSON.stringify({ type: "FeatureCollection", name: `${city.name} · verde OSM`, _source: "OpenStreetMap via Overpass", features: greenFeats }) + "\n");
console.log(`  verde: ${greenFeats.length} polígonos → inputs/${cityKey}-green.geojson`);

// --- POIs de servicios ---
const poiFeats = [];
for (const [cat, sel] of Object.entries(POI_CATS)) {
  const q = `[out:json][timeout:90];(${sel.split(";").map((s) => `${s}(${BB});`).join("")});out center;`;
  const raw = await overpass(q);
  for (const e of raw.elements) {
    const cc = centroid(e);
    if (cc) poiFeats.push({ type: "Feature", properties: { cat }, geometry: { type: "Point", coordinates: cc } });
  }
  console.log(`  POIs ${cat}: ${raw.elements.length}`);
  await new Promise((r) => setTimeout(r, 1200)); // cortesía con el servidor
}
writeFileSync(OUT("pois"), JSON.stringify({ type: "FeatureCollection", name: `${city.name} · POIs servicios OSM`, _source: "OpenStreetMap via Overpass", features: poiFeats }) + "\n");
console.log(`  POIs total: ${poiFeats.length} → inputs/${cityKey}-pois.geojson`);
