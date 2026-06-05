#!/usr/bin/env node
// (c-bis) Capa REAL de ALQUILER €/m²·mes por sección censal, desde el fichero de
// SERPAVI (Sistema Estatal de Referencia del Precio del Alquiler, Mitma/Mivau).
// Une el €/m² con la geometría de secciones del INE por CUSEC. Sin QGIS/GDAL.
//
// SERPAVI da por sección: renta media €/m²·mes, importe €/mes y superficie m².
// Descárgalo en https://serpavi.mivau.gob.es (datos tabulares por sección).
// Si viene en XLSX, ábrelo y "Guardar como CSV" (este script lee CSV).
// Déjalo en pipeline/inputs/rent/.
//
// Uso:  node ingest-rent.mjs <csvRelaInputs> <cusecPrefix> <out> [--sep=;] [--sec=N] [--rent=N]
//   p.ej.  node ingest-rent.mjs rent/serpavi.csv 29067 malaga-rent
// --sec/--rent: índices de columna (0-based) por si la autodetección falla.

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as shapefile from "shapefile";
import proj4 from "proj4";

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (k) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.split("=")[1] : null; };
const pos = args.filter((x) => !x.startsWith("--"));
const [csvRel, prefix, outName] = pos;
if (!csvRel || !prefix || !outName) { console.error("Uso: node ingest-rent.mjs <csv> <cusecPrefix> <out> [--sep=;] [--sec=N] [--rent=N]"); process.exit(1); }

const CSV = resolve(__dirname, "inputs", csvRel);
if (!existsSync(CSV)) { console.error(`No existe ${CSV}. Descarga SERPAVI y déjalo ahí (ver README).`); process.exit(1); }
const SEP = flag("sep") || (readFileSync(CSV, "utf8").split(/\r?\n/)[0].includes(";") ? ";" : readFileSync(CSV, "utf8").split(/\r?\n/)[0].includes("\t") ? "\t" : ",");
const to4326 = proj4("EPSG:3857", "WGS84");
const num = (s) => parseFloat(String(s).replace(/"/g, "").replace(/\./g, "").replace(",", ".").trim());

// --- 1) Parseo del CSV de SERPAVI con autodetección de columnas ---
const rows = readFileSync(CSV, "utf8").split(/\r?\n/).filter(Boolean).map((l) => l.split(SEP));
const header = rows[0].map((h) => h.toLowerCase());
let secCol = flag("sec") !== null ? +flag("sec") : header.findIndex((h) => /secc|cusec|código.*secc|sección/.test(h));
let rentCol = flag("rent") !== null ? +flag("rent") : header.findIndex((h) => /m2|m²|€\s*\/\s*m|renta.*m|euros.*m/.test(h));
// Fallback: detectar por contenido (columna con códigos de 10 dígitos / valores ~3-25).
if (secCol < 0) secCol = rows[1]?.findIndex((v) => /^\d{10}$/.test(String(v).trim())) ?? -1;
if (secCol < 0 || rentCol < 0) { console.error(`No detecto columnas (sec=${secCol}, rent=${rentCol}). Usa --sec=N --rent=N. Cabecera:\n${rows[0].join(" | ")}`); process.exit(1); }

const rent = {}; // cusec -> €/m²·mes
for (let i = 1; i < rows.length; i++) {
  const cusec = String(rows[i][secCol] || "").trim().match(/\d{10}/)?.[0];
  const v = num(rows[i][rentCol]);
  if (cusec && Number.isFinite(v) && v > 0) rent[cusec] = v;
}
console.log(`SERPAVI: ${Object.keys(rent).length} secciones con €/m² (col sec=${secCol}, rent=${rentCol}, sep='${SEP}')`);

// --- 2) Geometría de secciones del INE (shapefile en inputs/income/map) ---
const MAPDIR = resolve(__dirname, "inputs/income/map");
const shpDir = readdirSync(MAPDIR).map((d) => resolve(MAPDIR, d)).find((d) => existsSync(d));
const base = readdirSync(shpDir).find((f) => /\.shp$/i.test(f)).replace(/\.shp$/i, "");
const reproj = (g) => {
  const fix = (r) => r.map((c) => to4326.forward(c));
  if (g.type === "Polygon") return { type: "Polygon", coordinates: g.coordinates.map(fix) };
  if (g.type === "MultiPolygon") return { type: "MultiPolygon", coordinates: g.coordinates.map((p) => p.map(fix)) };
  return g;
};
const feats = [];
const src = await shapefile.open(resolve(shpDir, base + ".shp"), resolve(shpDir, base + ".dbf"));
let rec;
while (!(rec = await src.read()).done) {
  const cusec = rec.value.properties.CUSEC;
  if (!cusec?.startsWith(prefix) || rent[cusec] === undefined) continue;
  feats.push({ type: "Feature", geometry: reproj(rec.value.geometry), properties: { cusec, rent_m2: rent[cusec] } });
}

// --- 3) Normaliza (más caro = más rojo) ---
const vals = feats.map((f) => f.properties.rent_m2);
const lo = Math.min(...vals), hi = Math.max(...vals);
for (const f of feats) {
  f.properties.rent_norm = hi > lo ? Math.round(((f.properties.rent_m2 - lo) / (hi - lo)) * 100) / 100 : 0.5;
  f.properties.detail = `${f.properties.rent_m2.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} €/m²·mes`;
}
const OUT = resolve(__dirname, `../apps/web/public/data/${outName}.geojson`);
writeFileSync(OUT, JSON.stringify({ type: "FeatureCollection", name: "Alquiler €/m²·mes por sección (real · SERPAVI/Mitma)",
  _generated: { source: "ingest-rent.mjs", prefix, sections: feats.length, indicator: "renta media €/m²·mes (SERPAVI)", range: [lo, hi] }, features: feats }) + "\n");
console.log(`✓ ${feats.length} secciones → ${outName}.geojson · alquiler ${lo}–${hi} €/m²·mes`);
