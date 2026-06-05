#!/usr/bin/env node
// Ingesta de la capa fría de VERDE desde geometría de zonas verdes (OSM/Urban
// Atlas) para una ciudad. Etapa "raster-lite": calcula por celda
//   · green_cover_pct   — % de la celda cubierto por verde (proxy de cubierta;
//                          la cubierta ARBÓREA real exige NDVI/Urban Atlas → ⛏️)
//   · green_within_300m — fracción de la celda a <300 m de un verde (3-30-300)
// y produce el GeoJSON coropleta que consume el front.
//
// Entrada: un FeatureCollection de polígonos de verde. Por defecto lee el cache
// local pipeline/inputs/<city>-green.sample.geojson (ejecuta sin red). En
// producción, sustituir por la descarga real de Overpass (ver README) → mismo
// formato, este script no cambia.
//
// Uso:  node pipeline/ingest-osm.mjs [city]      (city = clave de cities.js)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as turf from "@turf/turf";
import { deficitScore } from "./lib/score.mjs";
import { CITIES, DEFAULT_CITY } from "./cities.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cityKey = process.argv[2] || DEFAULT_CITY;
const city = CITIES[cityKey];
if (!city) {
  console.error(`Ciudad desconocida: ${cityKey}. Opciones: ${Object.keys(CITIES).join(", ")}`);
  process.exit(1);
}

const INPUT = resolve(__dirname, `inputs/${cityKey}-green.sample.geojson`);
const OUTPUT = resolve(__dirname, `../apps/web/public/data/${cityKey}-green-deficit.geojson`);

const green = JSON.parse(readFileSync(INPUT, "utf8"));
const greens = green.features.filter((f) => f.geometry?.type?.includes("Polygon"));

// Buffer de 300 m alrededor de todo el verde (acceso) → unión.
let access = null;
for (const g of greens) {
  const buf = turf.buffer(g, 300, { units: "meters" });
  access = access ? turf.union(access, buf) : buf;
}

const safeArea = (g) => {
  try { return g ? turf.area(g) : 0; } catch { return 0; }
};
const safeIntersect = (a, b) => {
  try { return turf.intersect(a, b); } catch { return null; }
};

const [minLng, minLat, maxLng, maxLat] = city.bbox;
const step = city.cell;
const features = [];
let i = 0;

for (let lat = minLat; lat < maxLat - 1e-9; lat += step) {
  for (let lng = minLng; lng < maxLng - 1e-9; lng += step) {
    const cell = turf.polygon([[
      [lng, lat], [lng + step, lat], [lng + step, lat + step], [lng, lat + step], [lng, lat],
    ]]);
    const cellArea = turf.area(cell);

    let greenArea = 0;
    for (const g of greens) greenArea += safeArea(safeIntersect(cell, g));
    const cover = Math.min(100, (greenArea / cellArea) * 100);

    const within = access ? Math.min(1, safeArea(safeIntersect(cell, access)) / cellArea) : 0;

    features.push({
      type: "Feature",
      geometry: cell.geometry,
      properties: {
        id: `${cityKey}-${String(i++).padStart(3, "0")}`,
        green_cover_pct: Math.round(cover * 10) / 10,
        green_within_300m: Math.round(within * 100) / 100,
        green_deficit_score: deficitScore(cover, within),
        detail: `${cover.toFixed(0)}% verde · ${Math.round(within * 100)}% a <300 m`,
        canopy_proxy: true, // ⛏️ cubierta = proxy OSM; sustituir por NDVI/Urban Atlas
      },
    });
  }
}

const fc = {
  type: "FeatureCollection",
  name: `ciudad-justa · capa fría · déficit de verde · ${city.name} (generado)`,
  _generated: { source: "pipeline/ingest-osm.mjs", city: cityKey, rule: "3-30-300", cells: features.length, canopy: "proxy OSM (pendiente NDVI/Urban Atlas)" },
  features,
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(fc) + "\n");

const worst = [...features].sort((a, b) => b.properties.green_deficit_score - a.properties.green_deficit_score)[0];
console.log(`✓ ${city.name}: ${features.length} celdas → ${OUTPUT.replace(process.cwd() + "/", "")}`);
console.log(`  peor déficit: ${worst.properties.green_deficit_score} (${worst.properties.detail})`);
