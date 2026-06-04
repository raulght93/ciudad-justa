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
| [`docs/fuentes.md`](docs/fuentes.md) | Bibliografía con valoración de calidad de cada fuente. |

### Artefactos

| Archivo | Contenido |
|---|---|
| [`db/schema.sql`](db/schema.sql) | Esquema D1 (SQLite) de la capa caliente, portable a Postgres/PostGIS. |
| [`data/seed-hostile.example.geojson`](data/seed-hostile.example.geojson) | Formato de la capa caliente (puntos hostiles). |
| [`data/cold-layer.example.geojson`](data/cold-layer.example.geojson) | Formato de las capas frías (coropletas verde/servicios). |

## Aviso sobre las fuentes

La investigación base se realizó con un harness de *deep research* (búsqueda multi-fuente +
extracción de afirmaciones). La fase de verificación adversarial **falló por un fallo técnico
del harness** (los agentes verificadores no emitieron voto), no por baja calidad del
contenido: las afirmaciones proceden de fuentes primarias. Cada documento marca explícitamente
qué es **fuente citable**, qué es **conocimiento de dominio a confirmar** y qué dato es de
**prensa pendiente de verificación**.
