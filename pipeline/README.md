# Pipeline de capas frías

Genera, **offline y sin servidor**, las capas "frías" (objetivas, de datos abiertos) que el front
sirve como estáticos. Coste de ejecución ≈ 0 y coste de servir ≈ 0 (R2 / Pages). Ver
[`docs/03 §3.5`](../docs/03-arquitectura-tecnica.md).

## Estado

| Etapa | Estado | Detalle |
|---|---|---|
| **Scoring/transformación** | ✅ | `build-green-layer.mjs` + `lib/score.mjs`: indicadores por celda → coropleta con `green_deficit_score` (regla **3-30-300**). Sin deps. |
| **Descarga OSM real (a)** | ✅ | `fetch-osm.mjs` (Overpass): verde (polígonos) + POIs de servicios (salud/educación/comercio/transporte) de una ciudad → `inputs/<city>-green.geojson` y `-pois.geojson`. Córdoba: 1.152 polígonos + 849 POIs reales. |
| **Ingesta verde (OSM)** | ✅ | `ingest-osm.mjs` (turf): por celda `green_within_300m` (buffer 300 m) + `green_cover_pct` (verde ∩ celda). Usa el dato real si existe, si no la muestra. |
| **Capa de servicios 15-min (a)** | ✅ | `ingest-osm.mjs`: por celda `service_deficit` = % de categorías esenciales **sin POI a <800 m** (≈10 min). Córdoba real. |
| **Cubierta arbórea REAL (b · raster)** | ⛏️ | Hoy `green_cover_pct` es un **proxy OSM** (`canopy_proxy: true`). La cubierta arbórea real exige **NDVI (Sentinel-2) / Urban Atlas Street Tree Layer** con GDAL (zonal stats por celda) → alimenta el mismo campo. Procedimiento abajo. |
| **Vivienda real (c)** | ⛏️ | Málaga es muestra. Real: **Sistema Estatal de Índices de Precios de Alquiler (Mitma)** + **Atlas de renta (INE)** por sección censal + cartografía de secciones (INE). Sin scraping de portales (ToS). Procedimiento abajo. |
| **Teselado PMTiles** | ⛏️ | A escala ciudad: `tippecanoe` → PMTiles en R2 en vez de GeoJSON. (BACKLOG) |

## Uso

```bash
npm install                     # turf (para ingest-osm)

# A) DATOS REALES desde OpenStreetMap (requiere red):
node fetch-osm.mjs cordoba      # Overpass → inputs/cordoba-green.geojson + -pois.geojson
node ingest-osm.mjs cordoba     # → public/data/cordoba-green-deficit.geojson + -services-deficit.geojson

# (demo a partir de indicadores ya tabulados en CSV)
node build-green-layer.mjs      # inputs/barcelona-green.sample.csv → public/data/green-deficit.geojson
```

### (b) Cubierta arbórea real (NDVI / Urban Atlas) — pendiente, requiere GDAL
1. Descargar el **Street Tree Layer** o el land cover del FUA en Urban Atlas (land.copernicus.eu),
   o una escena **Sentinel-2** y calcular NDVI.
2. `gdalwarp`/`gdal_rasterize` a una rejilla y **zonal stats** por celda (`rasterstats`/`exactextract`)
   → CSV `id,tree_canopy_pct` que sustituye al proxy en el campo `green_cover_pct`.

### (c) Vivienda real — pendiente, fuentes oficiales (sin scraping)
1. **Mitma · Sistema Estatal de Índices de Precios de Alquiler** (€/m² por sección/municipio) y/o
   **INE · Atlas de distribución de renta de los hogares** por sección censal.
2. Unir con la **cartografía de secciones censales del INE** (Shapefile) → `housing_pressure` por
   polígono real (no rejilla). Los "pins de precio" sólo con **datos agregados con licencia**,
   nunca listados individuales de portales (LSSI/ToS).

El front consume el GeoJSON con *fallback*: si existe sustituye a los datos embebidos del mapa;
si no, usa los de ejemplo (`apps/web/src/data/geo.js`). No rompe el build si falta.

### Datos reales de verde (sustituir la muestra)

`inputs/<city>-green.sample.geojson` es una **muestra** para ejecutar sin red. Para datos reales,
descarga el verde de **OpenStreetMap** vía Overpass y guárdalo con el mismo nombre/formato:

```
[out:json][timeout:60];
( way["leisure"="park"]({{bbox}}); relation["leisure"="park"]({{bbox}});
  way["landuse"~"grass|forest|recreation_ground"]({{bbox}}); way["natural"="wood"]({{bbox}}); );
out geom;
```

(convertir a GeoJSON de polígonos). El `bbox` sale de `cities.js`. La **cubierta arbórea real**
(no el proxy) llega con NDVI/Urban Atlas + GDAL — ver tabla de estado.

## Fórmula (3-30-300)

```
canopyShort = clamp01((30 - cubierta%) / 30)     # objetivo 30% de cubierta arbórea
accessShort = clamp01(1 - fracción_a_<300m)      # objetivo 100% a <300 m de verde de calidad
deficit     = 0.5·canopyShort + 0.5·accessShort  # 0 = sin déficit, 1 = déficit máximo
```

Los pesos y el objetivo están en constantes al inicio del script para poder afinarlos.
