# 03 · Arquitectura técnica y despliegue

> **Base heredada:** este documento parte del estudio de hosting ya verificado por el proyecto
> hermano **tripcraft** (`~/workspace/dev/tripcraft/docs/hosting-comparison.md`, datos de junio
> 2026). No se repite la comparativa completa de plataformas; se **reutiliza su conclusión** y
> se analizan **solo los deltas** propios de Ciudad Justa.
>
> **Principio de coste:** infra **gratuita o barata** para el POC; escalar solo si hace falta.
> **Principio de producto (secuencia, no simultaneidad — review E1):** la **Fase 0 divulgativa es
> un producto completo y autosuficiente** y la prioridad real; la **capa social colaborativa es
> una hipótesis a validar *después***, no un destino asumido. Técnicamente el modelo de datos es
> el mismo desde el día 1 (no hay que reescribir), pero **producto, comunidad y captación son
> distintos**: lo divulgativo se gana con narrativa/prensa/SEO; lo social, con *outreach* barrio
> a barrio y moderación. Se construye la Fase 0 entera antes de comprometerse con la Fase 1.

## 3.1 Qué heredamos de tripcraft (y por qué aplica)

Conclusión de tripcraft, válida también aquí:

- **Cloudflare** (Pages + Workers + D1 + R2) es el de **free tier más generoso** para una carga
  "SPA estática + API ligera + DB pequeña", el **único de los grandes que permite uso comercial
  en el plan gratuito**, y **no ata a framework**.
- **Front: SPA Vite framework-agnóstica** → coste de cambiar de host casi nulo (sin lock-in).
- **Auth: propia y ligera sobre Workers** (token de dispositivo anónimo → magic-link opcional),
  evitando la pausa-por-inactividad de Supabase.
- **Supabase como plan B** de auth/DB.

Esto encaja además con el resto del ecosistema del usuario (Cloudflare Pages ya en
`africa-trip-planning`, stack CF en tripcraft) → **continuidad operativa, cero curva nueva.**

## 3.2 En qué Ciudad Justa NO es tripcraft (los deltas)

| Necesidad | tripcraft | Ciudad Justa | Implicación |
|---|---|---|---|
| **Naturaleza del dato** | JSON de "mis viajes" (privado, por usuario) | **Datos geoespaciales públicos**: puntos con lat/lng, consultas por *viewport*/cercanía | Necesitamos consulta espacial (bbox) y servir geometría a escala de ciudad |
| **Volumen de escritura** | Bajo (guardas tu viaje) | POC bajo; **fase social: alto** (reportes, votos de muchos) | El backend debe aguantar UGC creciente y moderación |
| **Media** | Hotlink a Wikimedia (cero storage) | **Fotos subidas por usuarios** | Storage propio (R2) + **difuminado de rostros obligatorio** (línea roja, doc 00) |
| **Capas derivadas** | No tiene | **Verde urbano + accesibilidad a servicios** precalculados por zona | Pipeline batch offline → capas estáticas (PMTiles/GeoJSON) |
| **Confianza del dato** | Es tuyo, no se discute | **Moderación, votación ponderada, reputación, anti-brigading** | Esquema relacional + estados + reputación (no existe en tripcraft) |
| **Foco visual** | Itinerario | **El mapa ES el producto** en la fase divulgativa | Inversión fuerte en visualización (coropletas, clústeres, narrativa) |

**Lectura:** el host gana igual (Cloudflare), pero Ciudad Justa **añade** tres piezas que
tripcraft no tiene: (1) **datos geoespaciales servidos a escala**, (2) **media de usuario con
privacidad**, y (3) **capa de confianza/moderación**. El diseño técnico gira en torno a estas
tres.

## 3.3 La decisión que sí hay que tomar: D1 vs PostGIS

Es el único punto donde el stack de tripcraft no resuelve solo lo nuestro:

- **D1 (SQLite, nativo CF):** no tiene PostGIS. Pero para el POC, las consultas espaciales que
  necesitamos son **bounding-box** ("dame los puntos visibles en este recuadro del mapa"), que
  se resuelven con índices sobre columnas `lat`/`lng` y un `WHERE lat BETWEEN … AND lng BETWEEN
  …`. **Suficiente y gratis** a escala de una ciudad piloto.
- **Supabase (Postgres + PostGIS):** consultas espaciales reales (radio, polígonos, "dentro del
  barrio X"), Auth + RLS + storage llave en mano. Free tier generoso **pero pausa el proyecto
  tras 7 días inactivo** — mal para algo "siempre on" en divulgación.

**Decisión escalonada:**
- **POC:** **D1 + bbox**. Cero coste, cero dependencia que se duerma, mismo stack que ya
  manejáis. Las capas frías (verde/servicios) **no van en DB**: se precalculan offline y se
  sirven como **archivos estáticos** (ver §3.5).
- **Escalado (fase social):** si las consultas espaciales superan al bbox (p. ej. "puntos a
  <200 m de mí", agregaciones por polígono de barrio en vivo), migrar la capa de reportes a
  **Supabase/PostGIS**, manteniendo el front intacto. La portabilidad (front agnóstico + API
  fina) hace barata esta migración — misma póliza de seguro que en tripcraft.

## 3.4 Arquitectura por fases (doble flanco)

### Fase 0 — POC divulgativo, visual, conciencia (objetivo: ~0 €)

El mapa es el producto. Mayoría **estático**, mínima escritura.

```
[ Cloudflare Pages ]  Vite SPA + MapLibre GL (o Leaflet)
        │
        ├── Capas FRÍAS (precalculadas, estáticas en R2):
        │     • verde urbano  → PMTiles / GeoJSON coropleta
        │     • acceso 15-min → PMTiles / GeoJSON coropleta
        │     • seed de arquitectura hostil (datos curados/Arrels) → GeoJSON
        │
        └── Worker (API fina)  →  D1  (solo los reportes nuevos del POC)
                                   R2  (fotos difuminadas)
```

- **Visualización potente con datos curados** desde el día 1 (no depende de masa crítica):
  coropletas de déficit de verde (regla 3-30-300) y de servicios, más una capa semilla de
  puntos hostiles (curada o importada de fuentes abiertas tipo Arrels, con permiso).
- **Narrativa**: *storytelling* por barrios, comparativas, "tu código postal", enlaces al marco
  normativo (doc 01). Es lo que crea conciencia.
- Escritura ciudadana **ya presente pero secundaria** (semilla de comunidad), sobre D1.

### Fase 1 — Herramienta social útil y masiva

Se activa la capa de confianza y el UGC a escala.

```
[ Pages SPA ]
   │
   ├── Worker API  ──►  D1 (o Supabase/PostGIS si la espacial lo pide)
   │                     • reports, votes, reputation, moderation_log
   │                     • estados: reportado→en revisión→confirmado→documentado
   │
   ├── R2  ── fotos (siempre difuminadas en cliente antes de subir)
   │
   └── Cloudflare Turnstile (anti-bot) + rate-limit en Worker (anti-brigading)
```

- **Votación ponderada por reputación**, revisión por pares, **contra-argumentos** (doc 02 §2.2).
- **Anti-brigading:** rate-limit por IP/usuario en el Worker, Turnstile (gratis, sin captcha
  molesto), votos ponderados (no "1 voto = 1 voto" plano).
- **Outreach contra el sesgo de participación** (doc 00 §5): no es infra, es proceso, pero la
  API debe permitir **normalizar por población/superficie** al pintar el mapa.

## 3.5 Pipeline de capas frías (clave del coste ~0)

Las capas de verde y servicios **no se calculan en producción**: se generan **offline** (script
local o GitHub Action) y se publican como **archivos estáticos en R2** (egress gratis en CF).
Esto elimina el coste de servidor de mapas.

```
Fuentes abiertas
  • Copernicus Urban Atlas / SIOSE / NDVI (Sentinel-2)   → verde
  • OSM POIs (salud, educación, comercio, transporte)    → acceso 15-min
        │
        ▼  (batch: tippecanoe / GDAL / turf.js)
  Índice por celda o barrio  →  GeoJSON / PMTiles
        │
        ▼
  R2 (estático)  →  MapLibre lo pinta como coropleta
```

- **PMTiles** = formato de tiles en un solo archivo, servible desde almacenamiento estático
  **sin servidor de tiles**. Patrón ideal para CF: súbelo a R2, MapLibre lo lee por *range
  requests*. Coste marginal cero.
- Recalcular es **re-ejecutar el batch** (mensual/trimestral); no hay infraestructura viva que
  mantener.

## 3.6 Privacidad y media (línea roja, no negociable)

Coherente con el doc 00 y reforzado tras la review (C5): el difuminado en cliente es la
decisión correcta, pero **"recomendar" no basta** — debe ser un **gate de subida**.

1. **Difuminado de rostros en el cliente, ANTES de subir** (p. ej. MediaPipe/face-api.js en el
   navegador). Así **la foto sin difuminar nunca toca el servidor**.
2. **Gate de subida, no recomendación.** Si el detector encuentra una persona/rostro y el blur
   **no se ha aplicado o no se ha podido aplicar, la subida se bloquea en el cliente** (no se
   sube "igual"). La UI obliga a difuminar o a re-encuadrar al objeto. Invariante reforzado en
   DB: `photos.blurred CHECK (blurred = 1)` ([`04`](04-modelo-de-datos.md) / `db/schema.sql`).
3. **Fallback explícito cuando el blur no puede ejecutarse** (móvil de gama baja, detector
   falla, sin WebGL): **no se sube la foto**; el reporte se crea sin imagen. Nunca se degrada a
   "subir sin difuminar". El rendimiento en gama baja es **criterio de validación** (§3.9), no un
   supuesto.
4. **Difuminar el rostro no anonimiza por contexto.** Política UX: *"fotografía el objeto, no a
   la persona"* — encuadrar el elemento (banco, pincho), evitar a personas identificables aunque
   se difuminen.
5. **Stripping de metadatos EXIF** (incluida geolocalización del propio archivo) en cliente.
6. **R2** guarda solo el resultado difuminado. Moderación con retirada rápida y *audit log*.
7. **DPIA / EIPD** (evaluación de impacto RGPD) **obligatoria antes de la Fase 1** — tratamiento
   de imágenes en contextos con personas vulnerables (ver [`06 §6.6`](06-gobernanza-legal-y-sostenibilidad.md)).

## 3.7 Estimación de coste y umbrales de escalado

| Recurso | Free tier CF (jun 2026, vía tripcraft) | Cuándo se queda corto |
|---|---|---|
| Pages (estático) | Ancho de banda **ilimitado** | Nunca por tráfico de front |
| Workers | ~100k req/día (~3M/mes) | Solo con uso masivo de la API social |
| D1 | 5 GB + 5M lecturas/día | Millones de reportes o lecturas espaciales intensivas |
| R2 | 10 GB + **egress gratis** | Muchas fotos propias (mitigado: 1 foto difuminada/punto) |
| Turnstile | Gratis | — |

**POC: previsiblemente 0 €.** Primer gasto probable: R2 si las fotos crecen, o salto a
Supabase/PostGIS si la consulta espacial supera el bbox. Ambos son **decisiones de escalado, no
de arranque**.

## 3.8 Stack recomendado (resumen)

- **Front:** Vite + React + **MapLibre GL** (vector, mejor para coropletas y narrativa; Leaflet
  + raster CARTO como alternativa más simple, ya probada en `africa-trip-planning`).
- **Hosting:** Cloudflare **Pages**.
- **API:** Cloudflare **Workers** (fina, portable).
- **DB:** **D1** en POC → Supabase/**PostGIS** si la espacial lo exige.
- **Storage:** **R2** (fotos difuminadas) + capas frías **PMTiles**.
- **Auth:** propia ligera (device token → magic-link), Supabase Auth como plan B.
- **Anti-abuso:** Turnstile + rate-limit en Worker + votación ponderada por reputación.
- **Pipeline de datos:** batch offline (GitHub Action) → estáticos en R2.
- **Accesibilidad (criterio de aceptación):** **WCAG 2.1 AA** — contraste ≥4.5:1 (tokens
  auditados con script, review C6), navegación por teclado, roles/labels ARIA, foco visible,
  `prefers-reduced-motion`. Es *gate*, no mejora opcional ([`00`](00-principios-y-valores.md) §4.7).
- **Licencia:** software libre (coherente con doc 00; alineable con Decidim AGPL si se integra).

> **Por qué este stack permite la secuencia (no obliga a la simultaneidad):** la Fase 0
> divulgativa se monta casi entera con piezas **estáticas** (mapa + capas frías en R2) → barata,
> visual y **completa por sí sola**. Si la hipótesis social se valida, la Fase 1 se construye
> **encima** del mismo modelo de datos (Worker+D1 + capa de confianza) sin tirar nada — pero no
> es un requisito para que la Fase 0 aporte valor.

## 3.9 Verificación pendiente antes de implementar

- Confirmar **cuotas free de CF** vigentes (cambian; tripcraft las fijó en jun 2026).
- Verificar **licencia/condiciones de reutilización** de los datos de Arrels y de Copernicus
  Urban Atlas / SIOSE para la capa semilla y las coropletas.
- Decidir basemap (MapLibre vector vs Leaflet+CARTO) según esfuerzo vs impacto visual.
- Validar viabilidad del **difuminado en cliente** en móviles de gama baja (rendimiento).
