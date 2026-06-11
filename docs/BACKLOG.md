# Backlog

Pila de trabajo viva, **priorizada**. Lo caro/no urgente se aparca aquí sin perderlo de vista.
Orden = prioridad dentro de cada bloque.

## 🔴 Bloqueante antes de abrir el reporte ciudadano con DATOS REALES

> El flujo de reporte (`#/reportar`) ya escribe en la API, pero está marcado como **demo/preview**.
> Para abrirlo al público señalando ubicaciones reales hace falta, en este orden:

1. **Entidad jurídica (B3)** + **revisión legal (B2)** de los borradores (`docs/legal/`): LSSI,
   honor (LO 1/1982), RGPD. Sin esto, no se señalan propiedades concretas (`06 §6.2`, §6.7).
2. **DPIA / EIPD**: ✅ borrador completo redactado (`docs/legal/dpia-borrador.md`, metodología
   AEPD: descripción, base legal, riesgos R-1…R-10, medidas M-1…M-10, riesgo residual, plan de
   acción). **Pendiente: validación jurídica (B2)** y cerrar M-7 (ofuscar coordenadas sensibles).
3. ✅ **Detector facial real** en el blur-gate (MediaPipe lazy como *fallback* de `FaceDetector`).
4. **Bootstrap de moderación** (curación + moderadores semilla) y **takedown** publicado (`06 §6.4`).
5. **Re-ejecutar la verificación adversarial** completa de las 25 afirmaciones (review C4) y
   **contrastar con Arrels** la fecha/cifra del recuento (1.288). *Caro* → al fijar publicación.

## 🟠 Para la Fase 1 social (cuando se decida abrir)

- **Auth de sesión real** (magic-link) en vez del secreto compartido `MOD_TOKEN` de moderación.
- **Decisión: plataforma propia vs. contribuir a Arrels** (`02 §2.3 bis`) — explorar colaboración.
- **R2**: `wrangler r2 bucket create ciudad-justa-photos` + política de retención/servido de fotos.
- **Lifecycle de fotos** y panel de moderación enlazado desde la app (hoy `#/mod` por hash + token).

## 🟡 Mejora continua (piezas simples)

- **Extender vivienda + índice a más ciudades** (Murcia, Vitoria… ya en `cities.js`): `fetch-osm`
  → `ingest-osm` → `ingest-canopy` → `ingest-rent`/`ingest-housing` → `ingest-index`.
- **PMTiles a escala** (`tippecanoe`) + servir desde R2 cuando crezcan los GeoJSON.
- **Pins de precio reales** (datos agregados con licencia, nunca scraping de portales).
- **`og-card.svg` → PNG 1200×630** (algunas redes no renderizan SVG en `og:image`).
- **Decidir una sola dirección** (Cartel A vs Editorial C) y retirar el toggle si procede.
- **i18n catalán** para el piloto de Barcelona.
- **Verificar en dispositivos** reales adicionales (iOS Safari, plegables) tras cada cambio de UI.

## ✅ Hecho (resumen)

- Investigación + estado del arte (`00`–`02`, `fuentes.md`); arquitectura + modelo de datos
  (`03`–`04`); review independiente atendida (`05 §5.8`); gobernanza/legal (`06`); fases (`07`).
- **Front "Contradiseño"** (dark riso-punk): tokens, fuentes Anton/Space Grotesk/Space Mono,
  motivos (sierra, grano, misregistro), switch Cartel↔Editorial; contraste AA auditado.
- **Mapas "tres casos"** (`MapsSection`/`CaseMap`): Barcelona, Córdoba, Málaga; mapa montado al
  entrar en viewport, toggles de capa, popups, leyenda; gestos cooperativos (mensaje en español).
- **Datos REALES** (sin GDAL/QGIS, todo Node):
  · Verde + servicios 15-min (OSM/Overpass) en las 3 ciudades.
  · Cubierta arbórea (Urban Atlas Street Tree Layer, FlatGeobuf+proj4).
  · Alquiler €/m²·mes (SERPAVI/Mitma) + renta (INE Atlas) por sección censal, geometría INE.
  · **Índice combinado** de exclusión por barrio (verde+servicios+vivienda; sin la hostil, C2).
  · Geometría de secciones simplificada (`turf.simplify`).
- **Vivienda** deja de ser WIP: sección con cifras reales citadas (SERPAVI/INE) + CTA al mapa.
- **Backend** (Worker + D1): GET/POST reports, voto ponderado, reputación, moderación con token,
  R2 de fotos; blur-gate en cliente; conectado a la front (capa hostil viva + CTA `#/reportar`).
- **Tests**: 20 front (datos, Hero, axe) + 22 worker; **CI** (test+build) y **deploy del Worker**.
- **A11y/móvil**: rejilla 1-col ≤768px, cards sin recorte, menú `<dialog>` nativo (flujo bloque +
  ✕ sticky + `100svh` con scroll → no se corta; focus trap + Escape + backdrop), foco visible,
  `prefers-reduced-motion`, reveal por scroll, gestos del mapa en español.
- **Reporte (demo)**: "Qué reportas" rediseñado — tipo general (botones con swatch de color) y
  subtipo (pills anidadas bajo filete del color) bien diferenciados; preview de foto (con fallback
  si el navegador no difumina) y zona (barrio·ciudad) por geocodificación inversa (OSM/Nominatim).
- **Alquiler + ejemplos unificados** en el mapa: la capa "Alquiler" muestra coropleta €/m² +
  pins de precio juntos, en las 3 ciudades (Málaga, Córdoba, Barcelona).
- **Tipos de reporte persistidos**: `reports.type` en D1 (schema + migración 0001 + worker
  GET/POST + tests) y **puntos del mapa coloreados por tipo** (match en CaseMap) con leyenda y
  popup por tipo. Falta reaplicar la migración en la D1 desplegada + redeploy.
- **SEO/branding**: favicon + `og-card.svg` (estética nueva) + Open Graph/Twitter.
