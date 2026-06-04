# 02 · Estado del arte de producto + propuesta de POC

> Convención de marcado: **[Fuente]** = respaldado por el corpus (ver [`fuentes.md`](fuentes.md)).
> *(dominio)* = conocimiento de dominio a confirmar.

## 2.1 Benchmark de plataformas comparables

El **crowdsourcing urbano** es un campo consolidado: una revisión sistemática con protocolo
PRISMA catalogó **30 estudios cubriendo 32 plataformas** y enmarca estas herramientas como
**cada vez más relevantes dentro del paradigma de *smart city*** por el giro hacia la
"centralidad ciudadana". **[ACM, *Urban Crowdsourcing Platforms* review]** Es decir: no se
inventa una categoría, se entra en un campo activo y con literatura.

| Plataforma | Modelo | Qué funciona | Qué falla / lección |
|---|---|---|---|
| **FixMyStreet** (mySociety, UK) | Reportes geolocalizados → se enrutan al ayuntamiento | Flujo "foto + pin + descripción" muy probado; código abierto reutilizable | **Sesgo de participación demostrado:** marginaliza a comunidades de renta baja y étnicamente diversas. **[arXiv 1708.02274]** Riesgo crítico para una app cuyo objeto es la exclusión. |
| **Sistemas 311 / resident crowdsourcing** (EE.UU.) | Reporte ciudadano de problemas municipales | Escala masiva | Los vecinos **no reportan a igual ritmo**; las disparidades se traducen en **desigualdades de servicio** aguas abajo, con sesgo espacial y socioeconómico medible. **[Nature Computational Science]** |
| **SeeClickFix** (EE.UU.) | 311 comercial/cívico | Integración con gobiernos locales | Dependencia de adopción institucional; mismo sesgo de participación. *(dominio)* |
| **Ushahidi** | Mapeo de crisis colaborativo, verificación distribuida | Open source, pensado para **verificación de reportes** en contextos sensibles | Modelo de verificación útil de imitar; requiere comunidad activa. *(dominio)* |
| **OpenStreetMap** | Edición libre + validación por pares | **Mejor modelo de gobernanza de datos colaborativos**: historial, *changesets*, reversión, validadores | Curva de entrada alta; vandalismo gestionado por comunidad madura. *(dominio)* Ideal como **capa base** (no reinventar el mapa). |
| **Mapillary** | Fotos de calle + visión por computador | Detección automática de mobiliario en imágenes | Posible fuente para **pre-detectar** elementos. *(dominio)* |
| **Decidim** (Barcelona) | Plataforma de participación democrática, open source, del Ajuntament | **Software cívico español con legitimidad institucional**; Ruby on Rails; lanzado en **2017** por el Ajuntament de Barcelona; licencia **AGPL v3** (código), **CC BY-SA** (contenido), **ODbL** (datos); comunidad **Metadecidim**; estructura de "espacios" + "componentes" (propuestas, votaciones, presupuestos participativos, encuestas, rendición de cuentas…). **[GitHub decidim; Wikipedia Decidim]** | No es de mapeo geográfico nativo, pero es **el aliado / anfitrión institucional natural** en España. |
| **defensiveTO** (Cara Chellew, Toronto) | Mapeo temático específico de *defensive design* | **Referente directo del proyecto**: mapa interactivo + tipología (asientos, repisas, barreras, superficies, vigilancia, luz+sonido, ghost amenities); demuestra impacto mediático. **[defensiveTO]** | Más proyecto-investigación que app social escalable: **ahí está el hueco**. |
| **Arrels** (Barcelona) | Mapeo colaborativo con mapa interactivo (campaña 2023 + recuento continuado) | Valida la demanda en España; 1.288 puntos documentados. **[Arrels; COPE]** | Herramienta temática puntual, no infraestructura permanente multi-capa → **oportunidad**. |

**Conclusión del benchmark:** el patrón técnico (foto + geolocalización + validación
comunitaria) está resuelto y hay código abierto reutilizable (FixMyStreet, Ushahidi, Decidim,
OSM). **Lo que nadie ha hecho bien es la combinación:** temática de arquitectura hostil +
permanente + social/colaborativa + multi-capa (hostil/verde/servicios) + España. El mayor
riesgo no es técnico, es de **sesgo de participación y moderación**.

## 2.2 Retos clave (y cómo la evidencia obliga a diseñar)

1. **Sesgo de participación (reto nº1).** Doble evidencia: FixMyStreet marginaliza rentas bajas
   y minorías **[arXiv]**; los 311 muestran disparidad espacial/socioeconómica que degrada el
   servicio **[Nature]**. **Paradoja crítica:** los barrios con más arquitectura hostil y menos
   verde/servicios son, probablemente, los que **menos reportarán** de forma espontánea. Si no
   se corrige activamente, el mapa reflejará dónde hay usuarios con smartphone y tiempo, no
   dónde está el problema. Mitigaciones: campañas dirigidas a barrios infrarrepresentados,
   alianzas con entidades sociales, normalización por población/superficie, y **no confundir
   "ausencia de reportes" con "ausencia de problema"**.
2. **Moderación, votación y anti-*brigading*.** Una app de denuncia es diana de troleo, falsos
   positivos y manipulación coordinada. Plantillas: OSM (historial + reversión + validadores
   con reputación) y Ushahidi (verificación distribuida). Conviene **votación ponderada por
   reputación** (no "un voto = un voto" puro, vulnerable a *brigading*) y **revisión por pares**
   antes de marcar un punto como "confirmado".
3. **Intencionalidad y matiz legal.** Marcar un objeto como "hostil" implica una afirmación de
   intención que puede ser falsa o difamatoria (un reposabrazos puede ser accesibilidad real).
   Estados graduales: *reportado → en revisión → confirmado por comunidad → documentado con
   contexto*, con **contra-argumentos** permitidos. La literatura insiste en la falta de
   claridad teórica del concepto **[Rosenberger, *Urban Studies*]** → la taxonomía debe ser
   explícita para reducir subjetividad. Usar la **tipología por mecanismos de Rosenberger
   (2023)** como ontología de categorías. **[ResearchGate]**
4. **Calidad de datos geográficos / VGI.** *Volunteered Geographic Information*: precisión
   variable, duplicados, geolocalización imprecisa. Solución: capa base OSM, *snapping* a
   mobiliario existente, fusión de reportes cercanos (dedupe espacial). *(dominio)*
5. **Privacidad.** Las fotos en espacio público pueden capturar a personas sin hogar → **riesgo
   ético grave**: la herramienta para defenderles podría exponerles. Difuminado de rostros
   automático y política de "fotografía el objeto, no a la persona". *(dominio — ver doc 00,
   líneas rojas)*
6. **Sostenibilidad de la comunidad.** Las plataformas VGI viven o mueren por su comunidad.
   Gamificación con cuidado (puede amplificar el sesgo de participación). Mejor combustible:
   vínculo con campañas reales y **victorias visibles** (reversión de mobiliario). *(dominio)*

## 2.3 Datos abiertos en España para "poco verde" y "pocos servicios"

Permiten **generar capas objetivas automáticamente**, complementando el reporte ciudadano
(subjetivo) con datos duros.

- **Verde urbano:**
  - **Copernicus Urban Atlas** (UE) — cobertura del suelo y verde urbano de alta resolución
    para ciudades europeas, incluidas las españolas. **[Copernicus Urban Atlas]** *La mejor capa
    base homogénea para "zonas poco verdes".*
  - **SIOSE** (Sistema de Información sobre Ocupación del Suelo de España, IGN) — ocupación del
    suelo nacional. **[siose.es]**
  - **NDVI** (índice de vegetación por satélite, derivable de Sentinel-2 / Copernicus) — para
    medir verde real a nivel de calle. *(dominio)*
  - **Estándar:** regla **3-30-300** de Konijnendijk (2021) como umbral de déficit; conecta con
    la evidencia de salud de ISGlobal. **[ver doc 01, §1.4]**
- **Servicios / "ciudad de 15 minutos":**
  - **Datos descriptivos de la AUE** — indicadores urbanos por municipio. **[aue.gob.es/datos-descriptivos]**
  - **POIs de OpenStreetMap** + portales de datos abiertos municipales para calcular
    **accesibilidad a pie** a servicios básicos (salud, educación, comercio, transporte) →
    índice de ciudad-15-min por zona. *(dominio)*
  - **Catastro / IGN** para geometría base de parcelas y equipamientos. *(dominio)*

**Implicación de diseño:** la app puede arrancar con **dos capas "frías" automáticas** (verde y
servicios, calculadas de datos abiertos) que **dan valor desde el día 1 sin necesitar masa
crítica de usuarios**, y reservar la **capa "caliente" colaborativa** (arquitectura hostil
reportada) para crecer encima. Esto mitiga el problema del arranque en frío típico de las apps
sociales.

## 2.3 bis · ¿Plataforma propia o contribución a Arrels? (review E2)

Honestidad estratégica: en **Fase 0** (seed curado + dos coropletas), el producto **se parece
mucho al mapa que Arrels ya tiene**. El argumento "infraestructura permanente multi-capa vs.
campaña puntual" (§1.5, §2.1) **solo se materializa en la Fase 1** — justo la que se aplaza (E1).
Por tanto la pregunta es real y hay que responderla por escrito **antes de levantar plataforma
paralela**:

- **Opción A — Contribuir a / integrarse con Arrels.** Menos duplicación, aprovecha su comunidad
  y legitimidad. Encaja si lo que aportamos cabe como módulo o capa sobre su mapa.
- **Opción B — Plataforma propia.** Solo se justifica si aporta algo que Arrels **no tiene ya**.
  Y lo que aporta **no es el mapa de puntos hostiles** (eso ya existe), sino:
  1. las **capas frías de verde y servicios** (datos abiertos, satélite) que Arrels no maneja;
  2. la **narrativa de índice territorial** que cruza exclusión + ambiente + servicios;
  3. la **infraestructura de validación/reputación** reutilizable por otras ciudades.

**Decisión pendiente** (no la cerramos aquí): si se opta por plataforma propia, este apartado fija
que su valor diferencial vive en las capas frías y la narrativa, **no** en competir con el mapa de
Arrels. Lo ideal es **explorar antes la vía de colaboración**.

## 2.4 Propuesta de POC / MVP cívico-académico

Coherente con la orientación (activismo + cívico-académico, sin ánimo de lucro) y con el marco
de valores (doc 00).

**Hipótesis del POC:** *Una plataforma colaborativa permanente que combine datos abiertos
(verde/servicios) con reportes ciudadanos validados (arquitectura hostil) puede visibilizar la
exclusión por diseño en ciudades españolas y servir de herramienta de presión e investigación.*

**Por qué Barcelona como piloto (review E3 — decisión, no obviedad).** A favor: máxima densidad
de **datos abiertos** (Urban Atlas + open data municipal maduro), **aliados** (Arrels, ISGlobal,
Decidim del propio Ajuntament) y **demanda ya validada** (los mapeos de Arrels). En contra: es la
ciudad con **más saturación** del tema, por lo que el **valor marginal** de una plataforma propia
es menor (ver E2). *Alternativa a considerar:* una ciudad **sin actor de referencia** (p. ej.
Zaragoza, Sevilla, Málaga) daría más valor incremental y menos solapamiento, a costa de menos
datos y aliados. **Se mantiene Barcelona para el POC** por madurez de datos y validación de
demanda, dejando constancia de que es una decisión y no un supuesto.

**Alcance MVP (1 ciudad piloto — Barcelona: Arrels + Decidim + datos Urban Atlas):**

1. **Mapa base** OSM + capas frías (Urban Atlas / NDVI para verde; OSM POIs para
   servicios-15min).
2. **Reporte de arquitectura hostil:** foto (con difuminado de rostros), geolocalización,
   **categoría según tipología de Rosenberger 2023**, descripción opcional.
3. **Validación comunitaria:** estados graduales (reportado → en revisión → confirmado),
   votación ponderada por reputación, contra-argumento posible, historial editable estilo OSM.
4. **Ficha de punto:** evidencia + contexto + enlace al marco normativo (Estrategia
   Sinhogarismo) para dar peso de denuncia.
5. **Salvaguardas:** anti-brigading, moderación, política de privacidad de personas vulnerables
   (líneas rojas del doc 00).

**Modelo de datos mínimo:**

```
Report  { id, geom, category[], photos[], status, score, createdBy, history[] }
Vote    { reportId, userId, weight }            // weight ~ reputación del usuario
Layer   { GreenIndex, ServiceAccessIndex }       // precalculado por celda/barrio
```

**Stack candidato (a decidir):** capa base OSM + Leaflet/MapLibre; backend ligero; o
**reutilizar/integrar con Decidim** (AGPL, Rails) para heredar legitimidad institucional y
módulos de participación. *(dominio)*

**Métricas de impacto (no de vanidad):** % de barrios cubiertos (vigilando el **sesgo de
participación**), nº de puntos confirmados, **nº de reversiones de mobiliario logradas**, uso
por entidades e investigadores.

**Riesgos top-3 (con mitigación de diseño):**
1. **Sesgo de participación** → el mapa miente. Mitigación: outreach dirigido + normalización.
2. **Exposición de personas sin hogar** → daño a quien se protege. Mitigación: difuminado +
   política "objeto, no persona".
3. **Afirmaciones de intencionalidad** → riesgo reputacional/legal. Mitigación: estados
   graduales + contra-argumento + taxonomía explícita.

**Aliados naturales:** Arrels Fundació, Ajuntament / Decidim, ISGlobal (validación salud-verde),
universidades (dimensión académica), entidades de sinhogarismo.
