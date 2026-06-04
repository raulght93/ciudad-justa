#!/usr/bin/env node
// Pipeline de capa fría: déficit de verde urbano.
//
// Esta es la ETAPA DE TRANSFORMACIÓN/SCORING: toma indicadores por celda
// (cubierta arbórea %, fracción de población a <300 m de verde de calidad) y
// produce el GeoJSON coropleta que consume el front. El scoring se basa en la
// regla 3-30-300 (Konijnendijk 2021; ver docs/01 §1.4 y docs/03 §3.5).
//
// ⛏️  PENDIENTE (ingesta raster real, ver docs/BACKLOG.md):
//     reemplazar el CSV de muestra por la extracción real desde
//     Copernicus Urban Atlas / SIOSE / NDVI (Sentinel-2) con GDAL/turf.
//     Esa etapa produce el mismo CSV de indicadores por celda → este script
//     no cambia. Aquí está deliberadamente aislada la parte que SÍ podemos
//     hacer sin dependencias geoespaciales pesadas.
//
// Uso:  node pipeline/build-green-layer.mjs
// Salida: apps/web/public/data/green-deficit.geojson  (servido como estático)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const INPUT = resolve(__dirname, "inputs/barcelona-green.sample.csv");
const OUTPUT = resolve(__dirname, "../apps/web/public/data/green-deficit.geojson");

// Parámetros de la regla 3-30-300.
const CANOPY_TARGET = 30; // % de cubierta arbórea objetivo en el barrio
const W_CANOPY = 0.5; // peso del componente cubierta
const W_ACCESS = 0.5; // peso del componente acceso a verde a <300 m

const clamp01 = (x) => Math.max(0, Math.min(1, x));

// deficit ∈ [0,1]: 0 = sin déficit, 1 = déficit máximo.
function deficitScore(canopyPct, accessFrac) {
  const canopyShort = clamp01((CANOPY_TARGET - canopyPct) / CANOPY_TARGET);
  const accessShort = clamp01(1 - accessFrac);
  return Math.round((W_CANOPY * canopyShort + W_ACCESS * accessShort) * 100) / 100;
}

function parseCsv(text) {
  const [header, ...rows] = text.trim().split(/\r?\n/);
  const cols = header.split(",");
  return rows.map((line) => {
    const vals = line.split(",");
    return Object.fromEntries(cols.map((c, i) => [c, vals[i]]));
  });
}

function cellPolygon(minLng, minLat, size) {
  const a = +minLng, b = +minLat, s = +size;
  return {
    type: "Polygon",
    coordinates: [[[a, b], [a + s, b], [a + s, b + s], [a, b + s], [a, b]]],
  };
}

const rows = parseCsv(readFileSync(INPUT, "utf8"));

const features = rows.map((r) => {
  const canopy = +r.tree_canopy_pct;
  const access = +r.green_within_300m;
  return {
    type: "Feature",
    geometry: cellPolygon(r.minLng, r.minLat, r.size),
    properties: {
      id: r.id,
      barrio: r.barrio,
      tree_canopy_pct: canopy,
      green_within_300m: access,
      green_deficit_score: deficitScore(canopy, access),
      detail: `${canopy.toFixed(0)}% cubierta · ${Math.round(access * 100)}% a <300 m`,
    },
  };
});

const fc = {
  type: "FeatureCollection",
  name: "ciudad-justa · capa fría · déficit de verde (generado)",
  _generated: { source: "pipeline/build-green-layer.mjs", rule: "3-30-300", cells: features.length },
  features,
};

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(fc, null, 2) + "\n");

const worst = [...features].sort(
  (a, b) => b.properties.green_deficit_score - a.properties.green_deficit_score
)[0];
console.log(`✓ ${features.length} celdas → ${OUTPUT.replace(process.cwd() + "/", "")}`);
console.log(`  peor déficit: ${worst.properties.barrio} (${worst.properties.green_deficit_score})`);
