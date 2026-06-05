# Backlog

Pila de trabajo viva. Lo **caro o no urgente se aparca aquí sin perderlo de vista**; se
priorizan piezas simples que aporten valor. Orden dentro de cada bloque ≈ prioridad.

## 🔴 Bloqueante antes de publicar datos reales (no antes)

- **Re-ejecutar la verificación adversarial completa** sobre las 25 afirmaciones del corpus
  (review C4). *Caro* (harness de deep-research) → diferido hasta tener fecha de publicación.
  Mientras tanto: verificación dirigida ya hecha (ver `fuentes.md`).
- **Contrastar con Arrels** la fecha de cierre exacta del recuento de 1.288 puntos.
- **Legal:** borradores B1 ✅ (`docs/legal/`: aviso legal, términos, privacidad, takedown, DPIA).
  Pendiente **B2** (revisión jurídica) y **B3** (constituir entidad) antes de señalar ubicaciones
  concretas (`06 §6.2`, §6.7, `07 §B`).
- **DPIA / EIPD** redactada antes de la Fase 1 (`06 §6.6`, `03 §3.6`).

## 🟠 Antes de la Fase 1 social

- **Decisión plataforma propia vs. contribuir a Arrels** (`02 §2.3 bis`): explorar colaboración
  primero.
- **Bootstrap de moderación** operativo: curación manual + moderadores semilla (`06 §6.4`).
- **Política de takedown** y términos de uso publicados (`06 §6.3`).
- **Blur-gate E1d** ✅: política + pipeline (`lib/photoGate.js`), UI `#/reportar` y subida a R2.
  Pendiente: enchufar un **detector real** (MediaPipe/face-api.js) como *fallback* si el navegador
  no trae FaceDetector (hoy, sin FaceDetector el gate bloquea); **DPIA + entidad** antes de abrir
  al público con datos reales (`03 §3.6`, `06`, `07 §E`).
- **Crear bucket R2**: `wrangler r2 bucket create ciudad-justa-photos` (binding `PHOTOS` ya en
  wrangler.toml). Servir/lifecycle de fotos pendiente.
- **API Worker → D1**: E1a–E1e ✅ (lectura, escritura, votación, reputación, moderación con auth
  por token + UI `#/mod`). Pendiente **auth de sesión completa** (magic-link) en vez del secreto
  compartido `MOD_TOKEN` (`07 §E`).
- **Secret del Worker**: fijar `MOD_TOKEN` con `wrangler secret put MOD_TOKEN` (si no se fija, la
  moderación cae al control por rol en BD; con él fijado, el token es obligatorio).

## 🟡 Mejora continua / piezas simples (candidatas a avanzar ya)

- **(c) ✅ Vivienda real (Málaga)**: alquiler €/m²·mes real (SERPAVI/Mitma 2024, `ingest-rent.mjs`,
  5,3–20,9 €/m²) + renta real (INE, `ingest-housing.mjs`). Pendiente: extender a más ciudades;
  pins de precio siguen siendo ejemplos (datos agregados con licencia, no scraping).
- **Simplificar geometría de secciones** (`malaga-rent`/`malaga-income` ~1 MB): turf.simplify para
  aligerar el GeoJSON servido.
- **Ecologistas en Acción (Córdoba)**: integrar sus informes de arbolado/sombra como capa o
  validación (ya citados en el front). Posible aliado.
- **Servicios/verde en más ciudades**: `fetch-osm.mjs` + `ingest-osm.mjs` ya son por-ciudad
  (Murcia, Vitoria… en `cities.js`).
- **Pipeline — teselado PMTiles** (`tippecanoe`) y publicación a R2 para escala ciudad.
- **Pipeline — capa de servicios (15-min)**: POIs OSM → accesibilidad a pie → score por celda
  (misma forma que la de verde).
- **Contenido del área de vivienda**: incorporar datos verificados (INE, índice de alquiler,
  vivienda vacía) a la sección de expansión. *Requiere fuentes.*
- **Exportar `og-card.svg` → PNG 1200×630** antes de campañas (varias redes no renderizan SVG
  en `og:image`). El SVG ya está en la estética nueva.
- **Decidir una sola dirección** (Cartel A vs Editorial C) cuando se valide: borrar
  `context/Direction.jsx` + `DirectionToggle` y dejar una sola variante de Hero.
- **i18n**: catalán para el piloto de Barcelona.

## ✅ Hecho (resumen)

- Investigación + estado del arte (`00`–`02`, `fuentes.md`).
- Arquitectura + modelo de datos + artefactos (`03`–`04`, `db/schema.sql`, GeoJSON).
- Review independiente atendida íntegra (`05 §5.8`): 🔴 mitigados/documentados, 🟠/🟡 resueltos.
- Gobernanza/legal/sostenibilidad (`06`).
- POC ejecutable: front page divulgativa (Vite + MapLibre) + Worker stub; build verde.
- Accesibilidad WCAG AA: contraste auditado + pase de teclado/landmarks; SEO/social meta.
- Tests del front: 14 verdes (integridad de datos, render del Hero, axe sin violaciones).
- Tests del Worker: 7 verdes (node --test, sin deps; bbox, CORS, 400/501/404).
- CI (GitHub Actions): front (test+build) + worker (test) en push/PR.
- Seed curado ampliado (16 puntos hostiles + 9 celdas de verde) para la demo del mapa.
- Branding: favicon.svg + tarjeta social og-card.svg.
- Pipeline de capa fría (scoring 3-30-300): `pipeline/build-green-layer.mjs` + `lib/score.mjs`
  → GeoJSON que el mapa consume con fallback.
- Mapas "tres casos" (`MapsSection` + `CaseMap`): Barcelona (hostil + toggle verde), Córdoba
  (déficit de verde) y Málaga (vivienda, muestra). Bloques tipo dossier, mapa montado al entrar
  en viewport, toggle de capas, popup, leyenda; estética Contradiseño (kicker, numeral, sierra).
- Cubierta arbórea REAL (b) (`ingest-canopy.mjs`): Urban Atlas Street Tree Layer (FlatGeobuf,
  EPSG:3035) → `tree_canopy_pct` por celda + recálculo del déficit. Córdoba (0–29%) y Málaga.
  Sin GDAL/QGIS (flatgeobuf + proj4 + turf).
- Ingesta OSM REAL (`fetch-osm.mjs` Overpass + `ingest-osm.mjs` turf, `cities.js`): **Córdoba,
  Málaga y Barcelona** con verde + servicios 15-min reales (Barcelona 8.174 POIs, Málaga 1.896,
  Córdoba 849). Copa arbórea real (Urban Atlas) en las tres. En el front: Barcelona = Hostil +
  Verde + Servicios reales; Córdoba = Verde + Servicios; Málaga = Renta + Verde + Servicios +
  Ejemplos. Ecologistas en Acción citado.
- Rediseño de la front (estética "dossier cívico"): tipografía display + monospace, índices de
  sección, ticker de cifras, divisor de pinchos, copies reescritos.
- Interfaz móvil dedicada: nav sticky translúcida + menú a pantalla completa + barra de acción
  inferior fija; cuenta animada con decimales.
- Design system "Contradiseño" (dark riso-punk) aplicado a toda la front: tokens, fuentes
  (Anton/Space Grotesk/Space Mono), motivos (sierra, grano, misregistro), marca de pin partido
  diagonal. Switch **Cartel ↔ Editorial** (`context/Direction.jsx`) persistido en localStorage.
- Pase de contraste AA de la paleta "Contradiseño": auditado con script; único fallo (`redInk`
  sobre papel, 4.0) corregido a `#c52507` (5.02). Resto ≥4.5.
- `og-card.svg` regenerada en la estética nueva (pin partido + sierra + señal) + `twitter:image`.
