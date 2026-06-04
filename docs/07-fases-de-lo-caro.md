# 07 · Cómo trocear lo caro en fases

> Respuesta a "¿lo caro lo podemos hacer en fases?". **Sí.** Cada partida cara del backlog se
> descompone en incrementos **pequeños, baratos y verificables**, dejando aislada la parte
> realmente costosa para el final. Aquí está el troceo; el orden dentro de cada bloque ≈
> dependencia.

## A · Re-verificación adversarial (review C4) — por lotes

No hace falta relanzar el workflow de ~105 agentes de golpe (eso es lo caro).

- **A1** ✅ hecho: verificación dirigida de las afirmaciones de la UI (1.288, ISGlobal, 3-30-300,
  Rosenberger, Decidim).
- **A2:** verificar el **siguiente lote de 5-8 claims** con fetches puntuales (origen CPTED,
  taxonomía de National Coalition, texto exacto de la Estrategia, etc.). Barato.
- **A3:** repetir A2 hasta cubrir las 25. Cada sesión cierra un lote.
- **A4** (opcional, caro): un único pase del workflow completo solo si se quiere el sello formal.

## B · Blindaje legal + entidad (review C1/E4) — borrador → revisión → constitución

- **B1** ✅: **borradores** de aviso legal, términos de uso, política de privacidad, takedown y
  guion DPIA en [`legal/`](legal/). *Pendiente B2 (revisión jurídica) + B3 (constitución).*
- **B2:** **revisión por jurista** (LSSI + honor + RGPD). *Coste acotado, externo.*
- **B3:** **constitución de la asociación/fundación**. *Trámite, no técnico.*
- Regla: hasta B3, solo datos **agregados/curados**, sin señalar propiedades concretas.

## C · DPIA / EIPD (review C5, doc 06) — autoevaluación → revisión

- **C1:** **borrador de DPIA** (qué datos, riesgos, medidas: blur-gate, EXIF, retención). Barato.
- **C2:** revisión jurídica junto a B2.

## D · Ingesta raster del pipeline (capas frías) — 1 AOI → 1 ciudad → automatizado

La etapa de scoring ya está hecha; lo caro es la ingesta geoespacial.

- **D1:** documentar fuentes y método exacto (Urban Atlas/SIOSE/NDVI) y **descargar 1 área
  pequeña a mano**. Barato.
- **D2:** script **GDAL/turf** que extrae los indicadores por celda de esa AOI → alimenta el CSV
  que ya consume `build-green-layer.mjs`. Medio.
- **D3:** ampliar a la ciudad piloto + **teselado PMTiles** (tippecanoe) en R2.
- **D4:** automatizar en GitHub Action (recálculo trimestral).

## E · Backend social API→D1 (Fase 1) — lectura → escritura → votación → reputación → moderación

Cada subfase es pequeña y testeable; la D1 ya existe (`wrangler.toml`).

- **E1a** ✅: **lectura + escritura básica** — `GET` por bbox desde D1 real; `POST` que INSERTA
  el reporte (uuid + geohash + categorías validadas + usuario anónimo por dispositivo) vía
  `batch`; `db/seed.sql` curado; cliente front `api/reports.js` + consumo en el mapa con
  fallback; 9 tests del Worker. *(D1 ya creada; falta aplicar schema+seed y desplegar.)*
- **E1b** ✅: **votación** ponderada — `POST /api/reports/:id/vote`, `weight` congelado desde la
  reputación, upsert (1 voto/usuario), recálculo de `score` y transición de estado por umbral
  (sin tocar estados de moderación). 13 tests del Worker.
- **E1c** ✅: **reputación dinámica** — al confirmarse un reporte se liquida la reputación
  (premia votos +1 y al autor, penaliza −1), acotada a [0.2, 5.0]; los pesos ya emitidos no se
  tocan (congelados). Solo liquida en la **primera** confirmación. 16 tests del Worker.
  *Pendiente: liquidación al rechazar (llega con E1e moderación).*
- **E1d:** **subida de foto con blur-gate** en cliente + R2 (depende de C/DPIA antes de publicar).
- **E1e** ✅: **moderación** — `POST /api/mod/reports/:id { action, note }` con acciones
  confirm/reject/document/dispute/restore, **autorización por rol** (moderator/admin), escritura
  en `moderation_log` (audit) y **liquidación de reputación** en transiciones terminales
  (confirmar premia / rechazar penaliza, inversa). 22 tests del Worker. *Pendiente: auth real de
  sesión (hoy por cabecera `x-device-id`) y la UI de moderación.*

> Principio: cada subfase entra con sus tests y por CI. Lo verdaderamente caro (workflow de
> verificación completo, GDAL a escala, revisión jurídica, constitución) queda al final de su
> cadena, nunca como requisito para avanzar.
