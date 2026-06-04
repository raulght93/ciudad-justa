# Ciudad Justa

> Plataforma cívica y colaborativa para **cartografiar la exclusión por diseño** en ciudades españolas: arquitectura hostil, déficit de verde urbano y falta de servicios básicos.

**Naturaleza:** proyecto cívico-académico, sin ánimo de lucro, de código y datos abiertos.
**Ámbito:** ciudades españolas (piloto propuesto: Barcelona).
**Estado:** investigación / definición de POC.

---

## Qué problema aborda

El espacio público se diseña, cada vez más, para **expulsar** en lugar de acoger: pinchos
en repisas, bancos imposibles de usar para tumbarse, *amenidades fantasma* (bancos, fuentes
o aseos que se retiran o se diseñan para no poder usarse). A esto se suma el reparto
desigual del verde urbano y de los servicios básicos. Quien sufre primero es quien más
depende del espacio común: personas sin hogar, mayores, infancia, personas con
discapacidad, migrantes.

**Ciudad Justa** documenta esa exclusión combinando:

1. **Reporte ciudadano validado** de arquitectura hostil (capa "caliente", colaborativa).
2. **Capas de datos abiertos** de verde urbano y accesibilidad a servicios (capa "fría",
   automática) que aportan valor desde el día 1, sin esperar masa crítica de usuarios.

## Posición de valores

Esta herramienta **no es neutral, y lo declara**. Prima la **dignidad humana y los derechos
humanos universales** —empezando por el **derecho a la vivienda**, la **libertad de
circulación y el derecho a migrar**, y el **derecho a no ser ciudadano de segunda**— por
encima de los intereses de propiedad y mercado. La ideología elige las preguntas; el
**rigor metodológico** (datos verificables, taxonomía explícita, contra-argumentos
permitidos) responde con honestidad. Ver [`docs/00-principios-y-valores.md`](docs/00-principios-y-valores.md).

## Estructura de la documentación

| Documento | Contenido |
|---|---|
| [`docs/00-principios-y-valores.md`](docs/00-principios-y-valores.md) | Marco ético y anclaje en derechos humanos. Cómo los valores bajan a decisiones de diseño. |
| [`docs/01-arquitectura-hostil-estado-del-arte.md`](docs/01-arquitectura-hostil-estado-del-arte.md) | Estado del arte: definición, taxonomía, autores, consecuencias, alternativas y situación en España. |
| [`docs/02-producto-poc-mvp.md`](docs/02-producto-poc-mvp.md) | Benchmark de plataformas, retos (sesgo, moderación, VGI, privacidad), datos abiertos en España y propuesta de MVP. |
| [`docs/03-arquitectura-tecnica.md`](docs/03-arquitectura-tecnica.md) | Stack y despliegue: infra gratuita/barata para el POC, deltas vs tripcraft, capas frías, privacidad de media, escalado por fases. |
| [`docs/04-modelo-de-datos.md`](docs/04-modelo-de-datos.md) | Esquema relacional, ciclo de vida del reporte, votación ponderada + reputación, moderación y superficie de API. |
| [`docs/05-review-independiente.md`](docs/05-review-independiente.md) | Auditoría crítica de enfoque y contenido: hallazgos con severidad, mejoras concretas y backlog priorizado (bloqueantes antes de publicar). |
| [`docs/06-gobernanza-legal-y-sostenibilidad.md`](docs/06-gobernanza-legal-y-sostenibilidad.md) | Respuesta a los bloqueantes 🔴 de la review: entidad jurídica, política legal/takedown/anonimización, moderación de arranque, sostenibilidad y DPIA. |
| [`docs/fuentes.md`](docs/fuentes.md) | Bibliografía con valoración de calidad de cada fuente. |

### Artefactos

| Archivo | Contenido |
|---|---|
| [`db/schema.sql`](db/schema.sql) | Esquema D1 (SQLite) de la capa caliente, portable a Postgres/PostGIS. |
| [`data/seed-hostile.example.geojson`](data/seed-hostile.example.geojson) | Formato de la capa caliente (puntos hostiles). |
| [`data/cold-layer.example.geojson`](data/cold-layer.example.geojson) | Formato de las capas frías (coropletas verde/servicios). |

## POC ejecutable

| Carpeta | Qué es |
|---|---|
| [`apps/web/`](apps/web/) | Front page divulgativa (Vite + React + MapLibre). Landing dinámica con cifras animadas respaldadas por fuentes, las tres capas, mapa demo de Barcelona, manifiesto de valores y el área de expansión de **precio de la vivienda**. Progresiva: empieza simple, expandes para profundizar. |
| [`worker/`](worker/) | API stub (Cloudflare Worker + D1): `GET/POST /api/reports` con consulta espacial por bounding-box. |

```bash
# Front
cd apps/web && npm install && npm run dev      # desarrollo
npm test                                       # vitest: datos + render + axe (a11y)
npm run build                                  # producción → dist/ (Cloudflare Pages)

# Worker (requiere wrangler)
cd worker && npx wrangler d1 create ciudad-justa
npx wrangler d1 execute ciudad-justa --file=../db/schema.sql
npx wrangler deploy
```

El front funciona **sin backend** en la Fase 0 (datos de ejemplo embebidos): el mapa y las
cifras se sirven estáticos. La API se enchufa en la Fase 1. Ver [`docs/03`](docs/03-arquitectura-tecnica.md).

## Estado de verificación de las fuentes

La investigación base se realizó con un harness de *deep research* (búsqueda multi-fuente +
extracción de afirmaciones). La **verificación adversarial automática no llegó a completarse**
(los agentes verificadores no emitieron voto), así que **25 afirmaciones quedaron sin verificar**.
Sin verificar es sin verificar, sea cual sea la causa.

En lugar de justificar el fallo, se ha hecho una **verificación dirigida** de las afirmaciones
que aparecen en la UI o son más citadas:

- ✅ **1.288 puntos en Barcelona** — corroborado multi-fuente (Arrels + COPE + totbarcelona). Es
  una **cifra viva crowdsourced**, no un censo auditado: se cita como tal.
- ✅ **ISGlobal / 3-30-300 y salud** — verificado y datado (n=3.145, Barcelona Health Survey 2016;
  Nieuwenhuijsen et al., *Environmental Research* 2022).
- ✅ **Regla 3-30-300** (Konijnendijk 2021), **Rosenberger 2023**, **Decidim** — verificados.
- 🚫 **Caso Zaragoza** — fuente de baja fiabilidad: retirado como afirmación.
- ⚠️ **"9 m²/hab. (OMS)"** — estudio primario difícil de rastrear: **fuera de la UI**; se usa
  3-30-300.

Pendiente (backlog): re-ejecutar la verificación adversarial completa sobre las 25 afirmaciones.
Cada documento marca **[Fuente]** citable, *(dominio)* a confirmar y *(prensa, verificar)*.
