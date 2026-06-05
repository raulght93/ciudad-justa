#!/usr/bin/env node
// (b) Cubierta arbórea REAL desde el Urban Atlas Street Tree Layer (STL, vector
// FlatGeobuf .fgb en EPSG:3035). Calcula tree_canopy_pct por celda y RECALCULA
// el déficit de verde, sustituyendo el proxy OSM. Sin QGIS ni GDAL.
//
// Entrada: pipeline/inputs/treemaps/<...CITY...>/CLMS_UA_STL_*.fgb
//          + el green-deficit.geojson ya generado por ingest-osm.mjs (trae las
//            celdas y green_within_300m).
// Salida:  sobrescribe apps/web/public/data/<city>-green-deficit.geojson con
//          tree_canopy_pct real y canopy_proxy:false.
//
// Uso:  node ingest-canopy.mjs [city]

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deserialize } from "flatgeobuf/lib/mjs/geojson.js";
import proj4 from "proj4";
import * as turf from "@turf/turf";
import { deficitScore } from "./lib/score.mjs";
import { CITIES, DEFAULT_CITY } from "./cities.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cityKey = process.argv[2] || DEFAULT_CITY;
const city = CITIES[cityKey];
if (!city) { console.error(`Ciudad desconocida: ${cityKey}`); process.exit(1); }

// EPSG:3035 (ETRS89-LAEA Europa) → WGS84.
proj4.defs("EPSG:3035", "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs");
const to4326 = proj4("EPSG:3035", "WGS84");

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
const TREEDIR = resolve(__dirname, "inputs/treemaps");

// Localiza el .fgb del Street Tree Layer para la ciudad.
function findStl() {
  if (!existsSync(TREEDIR)) return null;
  const want = norm(city.name);
  for (const d of readdirSync(TREEDIR)) {
    if (!norm(d).includes(want)) continue;
    const dir = resolve(TREEDIR, d);
    const f = readdirSync(dir).find((x) => /_STL_.*\.fgb$/i.test(x));
    if (f) return resolve(dir, f);
  }
  return null;
}

// Área (m²) y centroide de un anillo en coords 3035 (planar) — shoelace.
function ringAreaM2(r) { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += r[j][0] * r[i][1] - r[i][0] * r[j][1]; return Math.abs(a / 2); }
function geomAreaM2(g) {
  if (g.type === "Polygon") return ringAreaM2(g.coordinates[0]);
  if (g.type === "MultiPolygon") return g.coordinates.reduce((s, p) => s + ringAreaM2(p[0]), 0);
  return 0;
}
function geomCentroid(g) {
  const r = g.type === "Polygon" ? g.coordinates[0] : g.coordinates[0][0];
  let x = 0, y = 0; for (const c of r) { x += c[0]; y += c[1]; } return [x / r.length, y / r.length];
}

const stl = findStl();
if (!stl) { console.error(`No encuentro el STL .fgb de ${city.name} en ${TREEDIR}`); process.exit(1); }

const greenPath = resolve(__dirname, `../apps/web/public/data/${cityKey}-green-deficit.geojson`);
if (!existsSync(greenPath)) { console.error(`Falta ${cityKey}-green-deficit.geojson (ejecuta antes ingest-osm.mjs ${cityKey})`); process.exit(1); }
const green = JSON.parse(readFileSync(greenPath, "utf8"));

// Rejilla (misma que ingest): para mapear cada copa a su celda por centroide.
const [minLng, minLat, maxLng, maxLat] = city.bbox, step = city.cell;
const nCols = Math.floor((maxLng - minLng) / step + 1e-9);
const nRows = Math.floor((maxLat - minLat) / step + 1e-9);
const cellIdx = (lng, lat) => {
  const col = Math.floor((lng - minLng) / step), row = Math.floor((lat - minLat) / step);
  if (col < 0 || row < 0 || col >= nCols || row >= nRows) return -1;
  return row * nCols + col;
};

// Área de copa (m²) acumulada por celda.
const treeM2 = new Array(green.features.length).fill(0);
let trees = 0;
const fc = deserialize(new Uint8Array(readFileSync(stl)));
for (const f of fc.features) {
  if (!f.geometry) continue;
  const aM2 = geomAreaM2(f.geometry);
  if (aM2 <= 0) continue;
  const [lng, lat] = to4326.forward(geomCentroid(f.geometry));
  const i = cellIdx(lng, lat);
  if (i >= 0 && i < treeM2.length) { treeM2[i] += aM2; trees++; }
}

// Recalcula tree_canopy_pct real + déficit por celda.
let updated = 0;
for (let i = 0; i < green.features.length; i++) {
  const ft = green.features[i];
  const cellM2 = turf.area(ft); // m² de la celda (WGS84)
  const canopy = Math.min(100, (treeM2[i] / cellM2) * 100);
  const within = ft.properties.green_within_300m ?? 0;
  ft.properties.tree_canopy_pct = Math.round(canopy * 10) / 10;
  ft.properties.green_deficit_score = deficitScore(canopy, within);
  ft.properties.detail = `${canopy.toFixed(0)}% copa · ${Math.round(within * 100)}% a <300 m`;
  ft.properties.canopy_proxy = false;
  updated++;
}
green._generated = { ...(green._generated || {}), canopy: "Urban Atlas Street Tree Layer 2021 (real)", canopy_proxy: false };
writeFileSync(greenPath, JSON.stringify(green) + "\n");

const worst = [...green.features].sort((a, b) => b.properties.green_deficit_score - a.properties.green_deficit_score)[0];
console.log(`✓ ${city.name}: ${trees} copas STL → ${updated} celdas con cubierta REAL. Peor: ${worst.properties.green_deficit_score} (${worst.properties.detail})`);
