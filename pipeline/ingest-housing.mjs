#!/usr/bin/env node
// (c) Capa REAL de renta por sección censal (proxy socioeconómico de vivienda).
// Une la renta del INE (Atlas, CSV) con la geometría de secciones censales del
// INE (shapefile) por código CUSEC, recorta a un municipio y produce una
// coropleta. Sin QGIS/GDAL (shapefile + proj4 + turf).
//
// ⚠️ Es RENTA, no precio de alquiler. El €/m² real (Mitma SEIPAV) sigue
// pendiente; esto es el mejor proxy real disponible con lo descargado.
//
// Entradas (en pipeline/inputs/income/):
//   <tabla>.csv                          (INE Atlas, TAB-sep; col "Secciones" = CUSEC)
//   map/SECC_CE_*_INE_WM/*.shp + .dbf     (geometría INE, EPSG:3857 Web Mercator)
// Salida: apps/web/public/data/<out>.geojson
//
// Uso:  node ingest-housing.mjs <csv> <cusecPrefix> <out>
//   p.ej.  node ingest-housing.mjs 31106 29067 malaga-income

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as shapefile from "shapefile";
import * as turf from "@turf/turf";
import proj4 from "proj4";
import { cusec10, toNumberEs } from "./lib/parse.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const [csvId, prefix, outName] = process.argv.slice(2);
if (!csvId || !prefix || !outName) { console.error("Uso: node ingest-housing.mjs <csv> <cusecPrefix> <out>"); process.exit(1); }

const INC = resolve(__dirname, `inputs/income/${csvId}.csv`);
const MAPDIR = resolve(__dirname, "inputs/income/map");
const OUT = resolve(__dirname, `../apps/web/public/data/${outName}.geojson`);
const to4326 = proj4("EPSG:3857", "WGS84");

// --- 1) Renta por CUSEC desde el CSV del INE (renta neta media por persona, último año) ---
const income = {}; // cusec -> €
const lines = readFileSync(INC, "utf8").split(/\r?\n/);
for (const line of lines) {
  const col = line.split("\t");
  if (col.length < 6) continue;
  const cusec = cusec10(col[2]);                      // "2906701001 Málaga sección 01001"
  if (!cusec) continue;                               // solo filas de sección
  if (col[3] !== "Renta neta media por persona") continue;
  if (col[4] !== "2023") continue;                    // último año disponible
  const v = toNumberEs(col[5]);
  if (Number.isFinite(v) && v > 0) income[cusec] = v; // si está suprimido por privacidad, NaN → fuera
}
console.log(`Renta: ${Object.keys(income).length} secciones con dato (CSV ${csvId})`);

// --- 2) Geometría de las secciones del municipio (shapefile, filtrando por CUSEC) ---
const shpDir = readdirSync(MAPDIR).map((d) => resolve(MAPDIR, d)).find((d) => existsSync(d));
const shpName = readdirSync(shpDir).find((f) => /\.shp$/i.test(f)).replace(/\.shp$/i, "");
const shp = resolve(shpDir, shpName + ".shp"), dbf = resolve(shpDir, shpName + ".dbf");

function reproj(geom) {
  const fix = (ring) => ring.map((c) => to4326.forward(c));
  if (geom.type === "Polygon") return { type: "Polygon", coordinates: geom.coordinates.map(fix) };
  if (geom.type === "MultiPolygon") return { type: "MultiPolygon", coordinates: geom.coordinates.map((p) => p.map(fix)) };
  return geom;
}

const feats = [];
const source = await shapefile.open(shp, dbf);
let rec;
while (!(rec = await source.read()).done) {
  const f = rec.value;
  const cusec = f.properties.CUSEC || f.properties.cusec;
  if (!cusec || !cusec.startsWith(prefix)) continue;
  const inc = income[cusec];
  if (inc === undefined) continue;
  feats.push({ type: "Feature", geometry: reproj(f.geometry), properties: { cusec, income: inc } });
}
console.log(`Geometría: ${feats.length} secciones de ${prefix} con renta`);

// --- 3) Normaliza a vulnerabilidad (menor renta = más vulnerable = más rojo) ---
const vals = feats.map((f) => f.properties.income);
const lo = Math.min(...vals), hi = Math.max(...vals);
for (const f of feats) {
  const norm = hi > lo ? (f.properties.income - lo) / (hi - lo) : 0.5;
  f.properties.housing_vuln = Math.round((1 - norm) * 100) / 100;
  f.properties.detail = `${f.properties.income.toLocaleString("es-ES")} €/persona/año`;
}
// Simplifica geometría (~11 m) para aligerar el GeoJSON servido.
for (const f of feats) turf.simplify(f, { tolerance: 0.0001, highQuality: false, mutate: true });

writeFileSync(OUT, JSON.stringify({
  type: "FeatureCollection",
  name: `Renta por sección censal (real · INE Atlas 2023)`,
  _generated: { source: "ingest-housing.mjs", csv: csvId, prefix, sections: feats.length, indicator: "renta neta media por persona 2023", note: "RENTA, no precio de alquiler; €/m² (Mitma SEIPAV) pendiente", income_range: [lo, hi] },
  features: feats,
}) + "\n");
console.log(`✓ ${feats.length} secciones → ${outName}.geojson · renta ${lo.toLocaleString("es-ES")}–${hi.toLocaleString("es-ES")} €`);
