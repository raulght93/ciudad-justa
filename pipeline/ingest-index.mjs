#!/usr/bin/env node
// Índice combinado de exclusión por celda, cruzando SOLO capas OBJETIVAS:
//   déficit de verde + déficit de servicios + vulnerabilidad de vivienda (alquiler).
// NO incluye la capa hostil (subjetiva, sesgada por participación) — review C2:
// no contaminar lo objetivo con lo sesgado.
//
// Entradas (ya generadas): <city>-green-deficit, <city>-services-deficit y
//   vivienda: <city>-rent (rent_norm) o, si no hay, <city>-income (housing_vuln).
// Salida: apps/web/public/data/<city>-injustice.geojson (celdas + injustice 0..1).
//
// Uso:  node ingest-index.mjs [city]

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as turf from "@turf/turf";
import { CITIES, DEFAULT_CITY } from "./cities.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cityKey = process.argv[2] || DEFAULT_CITY;
if (!CITIES[cityKey]) { console.error(`Ciudad desconocida: ${cityKey}`); process.exit(1); }
const D = (f) => resolve(__dirname, `../apps/web/public/data/${cityKey}-${f}.geojson`);
const load = (f) => (existsSync(D(f)) ? JSON.parse(readFileSync(D(f), "utf8")) : null);

const green = load("green-deficit");
const services = load("services-deficit");
if (!green) { console.error(`Falta ${cityKey}-green-deficit.geojson (ejecuta ingest-osm).`); process.exit(1); }

// Vivienda: alquiler (rent_norm) preferido, si no renta (housing_vuln).
const rent = load("rent"), income = load("income");
const houseFc = rent || income;
const houseProp = rent ? "rent_norm" : "housing_vuln";

// Mapa servicios por id de celda (mismo grid que verde).
const svcByIdx = services ? services.features : null;

// Valor de vivienda en una celda = sección que contiene su centroide.
function houseAt(centroid) {
  if (!houseFc) return null;
  for (const s of houseFc.features) {
    try { if (turf.booleanPointInPolygon(centroid, s)) return s.properties[houseProp]; } catch { /* geom rara */ }
  }
  return null;
}

const allCells = green.features.map((cell, i) => {
  const parts = [];
  const g = cell.properties.green_deficit_score;
  if (Number.isFinite(g)) parts.push(g);
  const sv = svcByIdx?.[i]?.properties.service_deficit;
  if (Number.isFinite(sv)) parts.push(sv);
  const h = houseAt(turf.centroid(cell));
  if (Number.isFinite(h)) parts.push(h);

  const injustice = parts.length ? Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100) / 100 : 0;
  return {
    type: "Feature",
    geometry: cell.geometry,
    properties: {
      id: `${cityKey}-idx-${String(i).padStart(3, "0")}`,
      injustice,
      green: g ?? null, service: sv ?? null, housing: h ?? null,
      detail: `exclusión ${Math.round(injustice * 100)}/100 · ${parts.length} capas`,
    },
  };
});

// Solo celdas dentro del tejido urbano con vivienda (evita el artefacto de
// periferia: celdas sin sección censal y sin verde/servicios → falso máximo).
const features = houseFc ? allCells.filter((f) => Number.isFinite(f.properties.housing)) : allCells;

writeFileSync(D("injustice"), JSON.stringify({
  type: "FeatureCollection",
  name: `${CITIES[cityKey].name} · índice combinado de exclusión (verde + servicios + vivienda)`,
  _generated: { source: "ingest-index.mjs", city: cityKey, layers: ["green", services ? "service" : null, houseFc ? (rent ? "rent" : "income") : null].filter(Boolean), note: "objetivas; sin capa hostil (review C2)" },
  features,
}) + "\n");
const worst = [...features].sort((a, b) => b.properties.injustice - a.properties.injustice)[0];
console.log(`✓ ${CITIES[cityKey].name}: ${features.length} celdas · índice (${rent ? "alquiler" : income ? "renta" : "sin vivienda"}). Peor: ${worst.properties.injustice} (${worst.properties.detail})`);
