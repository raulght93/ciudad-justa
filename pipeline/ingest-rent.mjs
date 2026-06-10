#!/usr/bin/env node
// (c-bis) Capa REAL de ALQUILER €/m²·mes por sección censal, desde el fichero de
// SERPAVI (Sistema Estatal de Referencia del Precio del Alquiler, Mitma/Mivau):
//   https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi
//   → "Base de datos completa" (XLSX 2011–2024) en inputs/rent/serpavi.xlsx
// Une el €/m² con la geometría de secciones del INE por CUSEC. Sin QGIS/GDAL.
//
// Lee XLSX (SheetJS) o CSV. Columna por defecto ALQM2_LV_M_VC_24 = alquiler de
// vivienda colectiva (piso), mediana, año 2024, en €/m²·mes.
//
// Uso:  node ingest-rent.mjs <fileRelInputs> <cusecPrefix> <out> [--col=ALQM2_LV_M_VC_24] [--sheet="Secciones censales"]
//   p.ej.  node ingest-rent.mjs rent/serpavi.xlsx 29067 malaga-rent

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as shapefile from "shapefile";
import * as turf from "@turf/turf";
import proj4 from "proj4";
import XLSX from "xlsx";
import { cusec10, toNumberEs } from "./lib/parse.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.split("=").slice(1).join("=") : d; };
const pos = args.filter((x) => !x.startsWith("--"));
const [fileRel, prefix, outName] = pos;
if (!fileRel || !prefix || !outName) { console.error("Uso: node ingest-rent.mjs <file> <cusecPrefix> <out> [--col=COL] [--sheet=NombreHoja]"); process.exit(1); }

const FILE = resolve(__dirname, "inputs", fileRel);
if (!existsSync(FILE)) { console.error(`No existe ${FILE}. Descarga la base de datos de SERPAVI (ver README).`); process.exit(1); }
const RENT_COL = flag("col", "ALQM2_LV_M_VC_24");
const SHEET = flag("sheet", "Secciones censales");
const to4326 = proj4("EPSG:3857", "WGS84");

// --- 1) €/m² por CUSEC desde el fichero de SERPAVI ---
let header, dataRows;
if (/\.xlsx$/i.test(FILE)) {
  const wb = XLSX.readFile(FILE, { sheets: SHEET });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[SHEET], { header: 1, blankrows: false, raw: true });
  header = rows[0]; dataRows = rows.slice(1);
} else {
  const sep = readFileSync(FILE, "utf8").split(/\r?\n/)[0].includes(";") ? ";" : ",";
  const rows = readFileSync(FILE, "utf8").split(/\r?\n/).filter(Boolean).map((l) => l.split(sep));
  header = rows[0]; dataRows = rows.slice(1);
}
const secIdx = header.indexOf("CUSEC") >= 0 ? header.indexOf("CUSEC") : header.findIndex((h) => /cusec|secc/i.test(String(h)));
const rentIdx = header.indexOf(RENT_COL);
if (secIdx < 0 || rentIdx < 0) { console.error(`No encuentro columnas (CUSEC=${secIdx}, ${RENT_COL}=${rentIdx}).`); process.exit(1); }

const rent = {};
for (const r of dataRows) {
  const cusec = cusec10(r[secIdx]);
  const v = toNumberEs(r[rentIdx]);
  if (cusec && Number.isFinite(v) && v > 0) rent[cusec] = v;
}
console.log(`SERPAVI: ${Object.keys(rent).length} secciones con ${RENT_COL} (€/m²·mes)`);

// --- 2) Geometría de secciones del INE (shapefile en inputs/income/map, EPSG:3857) ---
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
  f.properties.detail = `${f.properties.rent_m2.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/m²·mes`;
}
// Simplifica geometría (~11 m) para aligerar el GeoJSON servido.
for (const f of feats) turf.simplify(f, { tolerance: 0.0001, highQuality: false, mutate: true });
const OUT = resolve(__dirname, `../apps/web/public/data/${outName}.geojson`);
writeFileSync(OUT, JSON.stringify({ type: "FeatureCollection", name: "Alquiler €/m²·mes por sección (real · SERPAVI/Mitma 2024)",
  _generated: { source: "ingest-rent.mjs", col: RENT_COL, prefix, sections: feats.length, range: [lo, hi] }, features: feats }) + "\n");
console.log(`✓ ${feats.length} secciones → ${outName}.geojson · alquiler ${lo}–${hi} €/m²·mes`);
