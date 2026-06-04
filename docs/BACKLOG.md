# Backlog

Pila de trabajo viva. Lo **caro o no urgente se aparca aquí sin perderlo de vista**; se
priorizan piezas simples que aporten valor. Orden dentro de cada bloque ≈ prioridad.

## 🔴 Bloqueante antes de publicar datos reales (no antes)

- **Re-ejecutar la verificación adversarial completa** sobre las 25 afirmaciones del corpus
  (review C4). *Caro* (harness de deep-research) → diferido hasta tener fecha de publicación.
  Mientras tanto: verificación dirigida ya hecha (ver `fuentes.md`).
- **Contrastar con Arrels** la fecha de cierre exacta del recuento de 1.288 puntos.
- **Constituir entidad jurídica** + asesoría legal (LSSI/honor/RGPD) antes de señalar ubicaciones
  concretas (`06 §6.2`, §6.7).
- **DPIA / EIPD** redactada antes de la Fase 1 (`06 §6.6`, `03 §3.6`).

## 🟠 Antes de la Fase 1 social

- **Decisión plataforma propia vs. contribuir a Arrels** (`02 §2.3 bis`): explorar colaboración
  primero.
- **Bootstrap de moderación** operativo: curación manual + moderadores semilla (`06 §6.4`).
- **Política de takedown** y términos de uso publicados (`06 §6.3`).
- **Flujo de subida con blur-gate** real (cliente): MediaPipe/face-api.js, fallback "no subir",
  strip EXIF (`03 §3.6`). *Medio.* → fase E1d (`07`).
- **API Worker → D1**: E1a ✅ (lectura+escritura). Pendiente **E1b votación**, **E1c reputación
  + estados**, **E1e moderación** (`04 §4.4-4.6`, `07 §E`).

## 🟡 Mejora continua / piezas simples (candidatas a avanzar ya)

- **Pipeline de capas frías — ingesta raster**: la etapa de scoring ya está hecha
  (`pipeline/build-green-layer.mjs`); falta la **extracción real** desde Urban Atlas/SIOSE/NDVI
  con GDAL/turf que alimente el CSV de indicadores. *Requiere GDAL — medio.*
- **Pipeline — teselado PMTiles** (`tippecanoe`) y publicación a R2 para escala ciudad.
- **Pipeline — capa de servicios (15-min)**: POIs OSM → accesibilidad a pie → score por celda
  (misma forma que la de verde).
- **Contenido del área de vivienda**: incorporar datos verificados (INE, índice de alquiler,
  vivienda vacía) a la sección de expansión. *Requiere fuentes.*
- **Exportar `og-card.svg` → `og-card.png`** (1200×630) antes de campañas: varias redes solo
  renderizan PNG/JPG en `og:image`.
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
- Pipeline de capa fría (scoring 3-30-300): `pipeline/build-green-layer.mjs` → GeoJSON
  generado que el mapa consume con fallback. Ingesta raster real queda en backlog.
