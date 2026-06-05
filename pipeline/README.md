# Pipeline de capas frías

Genera, **offline y sin servidor**, las capas "frías" (objetivas, de datos abiertos) que el front
sirve como estáticos. Coste de ejecución ≈ 0 y coste de servir ≈ 0 (R2 / Pages). Ver
[`docs/03 §3.5`](../docs/03-arquitectura-tecnica.md).

## Estado

| Etapa | Estado | Detalle |
|---|---|---|
| **Scoring/transformación** | ✅ | `build-green-layer.mjs` + `lib/score.mjs`: indicadores por celda → coropleta con `green_deficit_score` (regla **3-30-300**). Sin deps. |
| **Ingesta de geometría (OSM)** | ✅ | `ingest-osm.mjs` (turf): rejilla sobre la `bbox` de una ciudad (`cities.js`) → por celda calcula `green_within_300m` (buffer 300 m sobre el verde) y `green_cover_pct` (área de verde ∩ celda). Córdoba de piloto. |
| **Cubierta arbórea REAL (raster)** | ⛏️ | Hoy `green_cover_pct` es un **proxy OSM** (`canopy_proxy: true`). La cubierta arbórea real exige **NDVI (Sentinel-2) / Urban Atlas Street Tree Layer** con GDAL (zonal stats por celda) → alimenta el mismo campo. (BACKLOG) |
| **Teselado PMTiles** | ⛏️ | A escala ciudad: `tippecanoe` → PMTiles en R2 en vez de GeoJSON. (BACKLOG) |
| **Capa de servicios (15-min)** | ⛏️ | Misma forma: POIs OSM → accesibilidad a pie → score por celda. (BACKLOG) |

## Uso

```bash
npm install                     # turf (solo para ingest-osm)

# A) Demo a partir de indicadores ya tabulados (CSV):
node build-green-layer.mjs      # inputs/barcelona-green.sample.csv → public/data/green-deficit.geojson

# B) Ingesta desde geometría de verde (OSM) por ciudad:
node ingest-osm.mjs cordoba     # inputs/cordoba-green.sample.geojson → public/data/cordoba-green-deficit.geojson
node ingest-osm.mjs murcia      # otras ciudades en cities.js
```

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
