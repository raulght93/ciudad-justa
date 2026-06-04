# 04 · Modelo de datos, ciclo de vida y capa de confianza

> Concreta el doc 03. Define el esquema relacional (D1/SQLite en POC, portable a
> Postgres/PostGIS al escalar), el ciclo de vida de un reporte, el algoritmo de votación y
> reputación, la moderación y la superficie de API. Artefactos reales asociados:
> [`db/schema.sql`](../db/schema.sql), [`data/seed-hostile.example.geojson`](../data/seed-hostile.example.geojson),
> [`data/cold-layer.example.geojson`](../data/cold-layer.example.geojson).

## 4.1 Entidades

```
report        ── un punto reportado (arquitectura hostil)
 ├─ photo      ── imagen difuminada asociada (0..n)
 ├─ vote       ── voto ponderado de un usuario (confirma / refuta)
 ├─ counter    ── contra-argumento ("esto es accesibilidad legítima")
 └─ moderation ── acciones de moderación (audit log)
user          ── cuenta ligera (anónima por dispositivo → email opcional)
 └─ reputation ── puntuación derivada del histórico (no editable a mano)
category      ── taxonomía de mecanismos hostiles (Rosenberger 2023)
```

Las **capas frías** (verde / servicios) **no viven en la DB**: son archivos estáticos
precalculados (doc 03 §3.5). La DB solo guarda la **capa caliente** (lo que aporta la comunidad).

## 4.2 Taxonomía de categorías (de Rosenberger 2023 + defensiveTO)

Enum estable, versionado, para que "hostil" no sea subjetivo:

| key | etiqueta | ejemplo |
|---|---|---|
| `anti_lie_down` | Anti-tumbado | bancos segmentados, apoyabrazos divisorios |
| `anti_sit` | Anti-sentarse | *leaning bars*, repisas inclinadas |
| `spikes` | Pinchos / púas | alféizares, repisas, portales |
| `barrier` | Barreras físicas | bolardos, vallas, rocas bajo puentes |
| `surface` | Superficies disuasorias | suelo irregular, grava |
| `surveillance` | Vigilancia | cámaras orientadas a estancia |
| `light_sound` | Luz / sonido | iluminación azul, Mosquito, música disuasoria |
| `ghost_amenity` | Amenidad fantasma | banco/fuente/aseo retirado o inutilizado |

Un reporte puede llevar **varias** categorías. El enum se versiona (`taxonomy_version`) para no
romper datos históricos si evoluciona.

## 4.3 Ciclo de vida de un reporte

```
        crear                 alcanza umbral            revisión por pares
 (cualquiera) ──► reported ──────────────────► under_review ──────────────► confirmed
                     │                                │                          │
                     │  contra-argumento sólido       │  mod retira / spam       │ se documenta
                     ▼                                ▼                          ▼
                  disputed                         rejected                 documented
```

- **reported** — recién creado. Visible con etiqueta "sin verificar".
- **under_review** — supera un umbral mínimo de votos/score; entra en cola de revisión.
- **confirmed** — validado por la comunidad (score ponderado ≥ umbral y revisión pasada).
- **disputed** — contra-argumento con peso; queda visible pero marcado como "en discusión"
  (honestidad intelectual, doc 00: un reposabrazos puede ser accesibilidad real).
- **rejected** — spam, duplicado o falso; oculto del mapa, conservado en log.
- **documented** — confirmado + enriquecido (contexto, normativa, seguimiento de reversión).

El estado es **derivado y auditable**: nunca se fija "a dedo" salvo acción de moderación
registrada.

## 4.4 Votación ponderada y reputación (anti-brigading)

**Problema:** "1 usuario = 1 voto" plano es vulnerable a *brigading* coordinado (doc 02 §2.2).

**Diseño:**
- Cada voto tiene `weight` = función de la **reputación** del votante en el momento del voto
  (se **congela** en el voto para que recalcular reputación no reescriba el pasado).
- **Reputación** sube cuando tus reportes/votos coinciden con el consenso final y bajan cuando
  se demuestran falsos. Cuenta nueva = peso bajo (mitiga cuentas desechables).
- **Score de un reporte** = Σ(weight de votos *confirm*) − Σ(weight de votos *refute*),
  normalizado. Umbrales (`UNDER_REVIEW_AT`, `CONFIRM_AT`) configurables.
- **Anti-brigading adicional** (en el Worker, doc 03 §3.4): rate-limit por usuario/IP,
  Cloudflare Turnstile al crear/votar, detección de ráfagas (muchos votos iguales en poco
  tiempo desde reputación baja → se atenúan).

> **Aviso de diseño:** la reputación es un arma de doble filo respecto al **sesgo de
> participación** (doc 00 §5). Si solo los usuarios veteranos pesan, los barrios con comunidad
> incipiente quedan infrarrepresentados. Mitigación: la reputación pondera la **confianza** del
> dato, pero el mapa **siempre muestra también los `reported`** (sin verificar) y normaliza por
> población/superficie al agregar. La ausencia de votos ≠ ausencia de problema.

## 4.5 Esquema (resumen; SQL completo en `db/schema.sql`)

```
users(id, handle, email?, created_at, reputation, role)        role ∈ user|moderator|admin
reports(id, lat, lng, geohash, status, taxonomy_version,
        created_by, created_at, updated_at, score, address?)
report_categories(report_id, category_key)                     -- N:M
photos(id, report_id, r2_key, blurred, created_at)             -- blurred siempre TRUE
votes(id, report_id, user_id, value, weight, created_at)       value ∈ +1|-1, UNIQUE(report,user)
counters(id, report_id, user_id, reason, created_at)           -- contra-argumentos
moderation_log(id, report_id, actor_id, action, note, created_at)
```

- **Índice espacial POC:** `CREATE INDEX idx_reports_bbox ON reports(lat, lng)` + columna
  `geohash` para clustering/dedupe barato. En PostGIS esto pasaría a `geometry(Point,4326)` +
  índice GiST sin tocar la API.
- **Dedupe:** al crear, se buscan reportes a < X metros con categoría solapada (vía geohash +
  bbox) y se sugiere fusionar (calidad VGI, doc 02 §2.2).

## 4.6 Superficie de API (Worker, fina y portable)

```
GET  /api/reports?bbox=minLng,minLat,maxLng,maxLat&status=confirmed   → GeoJSON FeatureCollection
GET  /api/reports/:id                                                 → ficha completa
POST /api/reports            { lat,lng,categories[],desc? } + Turnstile → crea (status=reported)
POST /api/reports/:id/photo  (multipart, ya difuminada en cliente)     → sube a R2
POST /api/reports/:id/vote   { value: +1|-1 } + Turnstile              → voto ponderado
POST /api/reports/:id/counter{ reason }                                → contra-argumento
-- moderación (rol moderator):
POST /api/mod/reports/:id    { action, note }                          → cambia estado + log
```

- Respuestas en **GeoJSON** para que el front (MapLibre/Leaflet) las pinte directamente.
- La API **no devuelve fotos sin difuminar jamás** (no existen en R2; doc 03 §3.6).
- Portable: misma firma sobre D1 o Postgres → el salto de DB no toca al front.

## 4.7 Relación con las capas frías

El front compone **3 capas**:

1. **Verde** (coropleta, PMTiles estático) — déficit según 3-30-300.
2. **Servicios** (coropleta, PMTiles estático) — accesibilidad 15-min.
3. **Hostil** (puntos, GeoJSON desde la API + seed estático) — capa caliente.

El **índice de injusticia** de un barrio (narrativa divulgativa, Fase 0) puede combinar las tres
*en el cliente* sin coste de servidor: `score = f(déficit_verde, déficit_servicios,
densidad_hostil_normalizada)`.

## 4.8 Privacidad y retención

- Fotos: solo difuminadas (línea roja). Borrado en cascada al `reject`/eliminar reporte.
- Datos personales mínimos: email solo si el usuario reclama cuenta (magic-link). Anónimo por
  defecto (device token).
- `moderation_log` se conserva (auditoría) aunque el reporte se oculte.
- Cumplimiento RGPD: derecho de supresión sobre cuenta y sus aportaciones.
