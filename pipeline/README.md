# Pipeline de capas frías

Genera, **offline y sin servidor**, las capas "frías" (objetivas, de datos abiertos) que el front
sirve como estáticos. Coste de ejecución ≈ 0 y coste de servir ≈ 0 (R2 / Pages). Ver
[`docs/03 §3.5`](../docs/03-arquitectura-tecnica.md).

## Estado

| Etapa | Estado | Detalle |
|---|---|---|
| **Scoring/transformación** | ✅ implementado | `build-green-layer.mjs`: indicadores por celda → GeoJSON coropleta con `green_deficit_score` según la regla **3-30-300**. Sin dependencias. |
| **Ingesta raster** | ⛏️ pendiente | Extraer los indicadores reales (cubierta arbórea %, % población a <300 m) desde **Copernicus Urban Atlas / SIOSE / NDVI (Sentinel-2)** con GDAL/turf. Produce el mismo CSV → el scoring no cambia. (BACKLOG) |
| **Teselado PMTiles** | ⛏️ pendiente | Para escala ciudad/varias ciudades: `tippecanoe` → PMTiles en R2 en vez de GeoJSON. (BACKLOG) |
| **Capa de servicios (15-min)** | ⛏️ pendiente | Misma forma: POIs OSM → accesibilidad a pie → score por celda. (BACKLOG) |

## Uso

```bash
node build-green-layer.mjs      # lee inputs/barcelona-green.sample.csv
                                # escribe ../apps/web/public/data/green-deficit.geojson
```

El front lo consume con *fallback*: si el archivo existe, sustituye a los datos embebidos del
mapa; si no, usa los de ejemplo (`apps/web/src/data/geo.js`). No rompe el build si falta.

## Fórmula (3-30-300)

```
canopyShort = clamp01((30 - cubierta%) / 30)     # objetivo 30% de cubierta arbórea
accessShort = clamp01(1 - fracción_a_<300m)      # objetivo 100% a <300 m de verde de calidad
deficit     = 0.5·canopyShort + 0.5·accessShort  # 0 = sin déficit, 1 = déficit máximo
```

Los pesos y el objetivo están en constantes al inicio del script para poder afinarlos.
