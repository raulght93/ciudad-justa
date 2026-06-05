#!/usr/bin/env node
// Ingesta de capas frías desde geometría OSM para una ciudad:
//   · VERDE     → green_within_300m (buffer 300 m) + green_cover_pct (verde ∩ celda)
//   · SERVICIOS → service_deficit (15-min: % de categorías esenciales sin POI a <800 m)
// Produce los GeoJSON coropleta que consume el front.
//
// Entrada (de fetch-osm.mjs, datos reales) con fallback a la muestra:
//   inputs/<city>-green.geojson      (o -green.sample.geojson)
//   inputs/<city>-pois.geojson       (opcional; si falta, no genera servicios)
//
// Uso:  node ingest-osm.mjs [city]

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as turf from "@turf/turf";
import { deficitScore, clamp01 } from "./lib/score.mjs";
import { CITIES, DEFAULT_CITY } from "./cities.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cityKey = process.argv[2] || DEFAULT_CITY;
const city = CITIES[cityKey];
if (!city) { console.error(`Ciudad desconocida: ${cityKey}. Opciones: ${Object.keys(CITIES).join(", ")}`); process.exit(1); }

const pick = (f) => {
  const real = resolve(__dirname, `inputs/${cityKey}-${f}.geojson`);
  const sample = resolve(__dirname, `inputs/${cityKey}-${f}.sample.geojson`);
  return existsSync(real) ? { path: real, real: true } : existsSync(sample) ? { path: sample, real: false } : null;
};
const outPath = (f) => resolve(__dirname, `../apps/web/public/data/${cityKey}-${f}.geojson`);
const grid = () => {
  const [minLng, minLat, maxLng, maxLat] = city.bbox, step = city.cell, cells = [];
  for (let lat = minLat; lat < maxLat - 1e-9; lat += step)
    for (let lng = minLng; lng < maxLng - 1e-9; lng += step)
      cells.push(turf.polygon([[[lng, lat], [lng + step, lat], [lng + step, lat + step], [lng, lat + step], [lng, lat]]]));
  return cells;
};
const safeArea = (g) => { try { return g ? turf.area(g) : 0; } catch { return 0; } };
const safeIntersect = (a, b) => { try { return turf.intersect(a, b); } catch { return null; } };

mkdirSync(dirname(outPath("x")), { recursive: true });
const cells = grid();

// ---------- VERDE ----------
const gsrc = pick("green");
if (gsrc) {
  const green = JSON.parse(readFileSync(gsrc.path, "utf8"));
  const greens = green.features.filter((f) => f.geometry?.type?.includes("Polygon"));
  let access = null;
  for (const g of greens) { const b = turf.buffer(g, 300, { units: "meters" }); access = access ? turf.union(access, b) : b; }

  const features = cells.map((cell, i) => {
    const cellArea = turf.area(cell);
    let greenArea = 0;
    for (const g of greens) greenArea += safeArea(safeIntersect(cell, g));
    const cover = Math.min(100, (greenArea / cellArea) * 100);
    const within = access ? Math.min(1, safeArea(safeIntersect(cell, access)) / cellArea) : 0;
    return { type: "Feature", geometry: cell.geometry, properties: {
      id: `${cityKey}-${String(i).padStart(3, "0")}`,
      green_cover_pct: Math.round(cover * 10) / 10, green_within_300m: Math.round(within * 100) / 100,
      green_deficit_score: deficitScore(cover, within),
      detail: `${cover.toFixed(0)}% verde · ${Math.round(within * 100)}% a <300 m`, canopy_proxy: true } };
  });
  writeFileSync(outPath("green-deficit"), JSON.stringify({ type: "FeatureCollection",
    name: `Córdoba · déficit de verde (${gsrc.real ? "OSM real" : "muestra"})`,
    _generated: { source: "ingest-osm.mjs", city: cityKey, rule: "3-30-300", greens: greens.length, real: gsrc.real, canopy: "proxy OSM (pendiente NDVI/Urban Atlas)" }, features }) + "\n");
  console.log(`✓ verde: ${features.length} celdas (${greens.length} polígonos ${gsrc.real ? "OSM" : "muestra"}) → ${cityKey}-green-deficit.geojson`);
}

// ---------- SERVICIOS (15-min) ----------
const psrc = pick("pois");
if (psrc) {
  const pois = JSON.parse(readFileSync(psrc.path, "utf8")).features.filter((f) => f.geometry?.type === "Point");
  const byCat = {};
  for (const p of pois) (byCat[p.properties.cat] ||= []).push(p);
  const cats = Object.keys(byCat);
  const THRESH = 800; // m ≈ 10 min a pie

  const features = cells.map((cell, i) => {
    const ctr = turf.centroid(cell);
    let satisfied = 0; const missing = [];
    for (const cat of cats) {
      let near = false;
      for (const p of byCat[cat]) { if (turf.distance(ctr, p, { units: "meters" }) <= THRESH) { near = true; break; } }
      if (near) satisfied++; else missing.push(cat);
    }
    const deficit = clamp01(1 - satisfied / cats.length);
    return { type: "Feature", geometry: cell.geometry, properties: {
      id: `${cityKey}-svc-${String(i).padStart(3, "0")}`,
      service_deficit: Math.round(deficit * 100) / 100,
      detail: missing.length ? `falta: ${missing.join(", ")}` : "todo a <800 m" } };
  });
  writeFileSync(outPath("services-deficit"), JSON.stringify({ type: "FeatureCollection",
    name: `Córdoba · déficit de servicios 15-min (${psrc.real ? "OSM real" : "muestra"})`,
    _generated: { source: "ingest-osm.mjs", city: cityKey, pois: pois.length, cats, threshold_m: THRESH, real: psrc.real }, features }) + "\n");
  const worst = [...features].sort((a, b) => b.properties.service_deficit - a.properties.service_deficit)[0];
  console.log(`✓ servicios: ${features.length} celdas (${pois.length} POIs) → ${cityKey}-services-deficit.geojson · peor: ${worst.properties.service_deficit}`);
}
