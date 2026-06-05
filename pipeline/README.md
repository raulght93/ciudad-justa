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
| **Cubierta arbórea REAL (b)** | ✅ | `ingest-canopy.mjs`: lee el **Urban Atlas Street Tree Layer** (vector FlatGeobuf `.fgb`, EPSG:3035), reproyecta (proj4) y calcula `tree_canopy_pct` por celda → recalcula el déficit (`canopy_proxy: false`). Sin GDAL ni QGIS. Córdoba 0–29 %, Málaga hechas. |
| **Vivienda real (c)** | ✅ | **Alquiler €/m²·mes** real por sección: `ingest-rent.mjs` lee la base de SERPAVI (Mitma, XLSX) y la une a la geometría INE. **Renta** real por sección: `ingest-housing.mjs` (INE Atlas). Málaga hechas (alquiler 5,3–20,9 €/m²). |
| **Teselado PMTiles** | ⛏️ | A escala ciudad: `tippecanoe` → PMTiles en R2 en vez de GeoJSON. (BACKLOG) |

## Uso

```bash
npm install                     # turf (para ingest-osm)

# Orden completo para una ciudad (datos reales):
node fetch-osm.mjs cordoba      # 1) Overpass → inputs/cordoba-green.geojson + -pois.geojson  (necesita red)
node ingest-osm.mjs cordoba     # 2) → public/data/cordoba-green-deficit.geojson (+ -services-deficit)
node ingest-canopy.mjs cordoba  # 3) copa arbórea REAL (Urban Atlas STL en inputs/treemaps/) → reescribe el déficit

# (demo a partir de indicadores ya tabulados en CSV)
node build-green-layer.mjs      # inputs/barcelona-green.sample.csv → public/data/green-deficit.geojson
```

> Orden importa: `ingest-osm` deja `green_within_300m` (acceso) y un proxy de copa;
> `ingest-canopy` sustituye el proxy por la copa real del Urban Atlas y recalcula el déficit.
> Si re-ejecutas `ingest-osm`, vuelve a poner el proxy → relanza `ingest-canopy` después.

### (b) Cubierta arbórea real (Urban Atlas STL) — ✅ ya automatizado
1. **Descargar** el *Urban Atlas — Street Tree Layer 2021* del FUA en
   <https://land.copernicus.eu/en/products/urban-atlas/street-tree-layer-2021> (alta gratuita).
2. **Descomprimir** la carpeta de la ciudad en `pipeline/inputs/treemaps/` (gitignored). El script
   busca dentro el archivo `*_STL_*.fgb`.
3. `node ingest-canopy.mjs <city>` — listo. (Detecta la ciudad por el nombre de la carpeta.)

No hace falta QGIS/GDAL: el STL es **vector** (FlatGeobuf), se lee con `flatgeobuf`, se reproyecta
de EPSG:3035 con `proj4` y se suma el área de copa por celda con `turf`.

### (c) Vivienda real — RENTA hecha; ALQUILER €/m² pendiente de descarga

Hay **dos cosas distintas** y conviene no confundirlas (lo aclaramos al revisar):
- **Renta (INE Atlas)** = lo que ingresan los hogares (€/persona/año). ✅ Hecho: `ingest-housing.mjs`.
- **Alquiler (SERPAVI/Mitma)** = lo que **cuesta** alquilar (**€/m²·mes**). ⛏️ Falta el fichero.

> Nota: lo que se descargó en `inputs/income/map` y `inputs/income/census` es la **cartografía de
> secciones del INE** (SECC_CE), **no** la capa de precios de Mitma. Sirve de geometría para ambos.

**Para el alquiler €/m² real — ✅ ya hecho para Málaga:**
- ⚠️ `serpavi.mivau.gob.es` es la **consulta por dirección/catastro** (un inmueble), NO la
  descarga masiva. La base completa por sección está en
  <https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi> → **"Base de datos
  completa"** (XLSX 2011–2024, ~71 MB; enlace directo en `cdn.mivau.gob.es/.../serpavi/`).
- Déjala en `pipeline/inputs/rent/serpavi.xlsx` (gitignored) y:
  ```bash
  node ingest-rent.mjs rent/serpavi.xlsx 29067 malaga-rent
  ```
  Lee la hoja "Secciones censales", columna **`ALQM2_LV_M_VC_24`** (alquiler vivienda colectiva,
  mediana, 2024, €/m²·mes), une por CUSEC a la geometría INE → `public/data/malaga-rent.geojson`.
  Otra ciudad: cambia el prefijo CUSEC (p. ej. Córdoba `29067`→`14021`... ojo: Málaga capital es
  `29067`). Otro año/indicador: `--col=ALQM2_LV_M_VC_23`.

### Renta (INE Atlas) — ✅ hecha · y otras fuentes
Dónde ir a por los datos (todo descarga gratuita):
1. **Alquiler · Mitma** — *Sistema Estatal de Índices de Precios del Alquiler de Vivienda*
   (€/m²/mes por **municipio y sección censal**). Buscar "SEIPAV" o vía
   <https://www.transportes.gob.es> → Vivienda → Índice de alquiler (descargable en CSV/XLSX).
2. **Renta · INE** — *Atlas de distribución de renta de los hogares* (renta media por **sección
   censal**), en <https://www.ine.es> → Mercado laboral/Renta → Atlas (CSV por sección).
3. **Geometría · INE** — *Cartografía de secciones censales* (Shapefile/GeoPackage) en
   <https://www.ine.es> → Productos y servicios → Cartografía → "Seccionado censal".
4. **Unir**: pegar (1)/(2) a (3) por el **código de sección** (`CUSEC`) → polígonos con
   `housing_pressure` real (normalizar a 0..1). Reproyectar a WGS84 si hace falta (proj4, como en
   `ingest-canopy.mjs`). Se podría escribir un `ingest-housing.mjs` análogo cuando tengas los CSV.
5. **Pins de precio**: sólo con **datos agregados con licencia** (p. ej. medias por zona), nunca
   raspando listados individuales de portales (Idealista/Booking lo prohíben — LSSI/ToS).

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
