# Ciudad Justa — Design System (“Contradiseño”)

> Sistema de diseño **rupturista y vanguardista** para **Ciudad Justa**, la plataforma cívica
> que cartografía la *exclusión por diseño* en ciudades españolas: arquitectura hostil,
> déficit de verde urbano y falta de servicios básicos.

Este sistema **rompe deliberadamente** con la estética “noche cívica” del POC original
(navy profundo, serif Fraunces, ocre, suave) y la sustituye por un lenguaje **dark
riso-punk / activista-forense**: papel negro, tintas fluorescentes planas (rojo señal,
amarillo, cian), tipografía condensada de cartel, mono de máquina, motivos de sierra
(pinchos), coordenadas y marcas de registro, y movimiento **crudo y mecánico**.

El nombre interno del lenguaje es **“Contradiseño”**: si el espacio público se diseña para
expulsar, la herramienta que lo denuncia se diseña para **incomodar al poder, no a quien
sufre**. La accesibilidad (WCAG 2.1 AA) es una **línea roja**, no un extra — coherente con
los valores del proyecto.

---

## Contexto del producto

**Ciudad Justa** es un proyecto cívico-académico, sin ánimo de lucro, de **código y datos
abiertos**, centrado en ciudades españolas (piloto: **Barcelona**). Documenta cómo el
diseño urbano excluye, combinando dos tipos de capa:

1. **Capa caliente** — reporte ciudadano *validado* de arquitectura hostil (pinchos, bancos
   antitumbado, “amenidades fantasma”). Colaborativa, moderada, con voto ponderado.
2. **Capas frías** — datos abiertos de **déficit de verde** (regla 3-30-300, NDVI, Urban
   Atlas) y **acceso a servicios a 15 minutos** (OSM, Agenda Urbana Española). Aportan valor
   desde el día 1, sin esperar masa crítica.

Una **cuarta capa en preparación** cartografiará el **precio de la vivienda** (art. 47 CE).

**Posición de valores (no neutral, y lo declara):** prima la **dignidad humana y los
derechos humanos** —vivienda, libertad de circulación y migración, no ser “ciudadano de
segunda”— por encima de los intereses de propiedad y mercado. *La ideología elige las
preguntas; el rigor metodológico responde con honestidad.*

### Producto / superficies

| Superficie | Qué es | En este sistema |
|---|---|---|
| **Web / dossier divulgativo** | Landing + mapa de Barcelona + manifiesto + área de vivienda (Vite + React + MapLibre) | ✅ UI kit completo, rediseñado (`ui_kits/web/`) |
| App móvil de reporte | Definida en docs como fase futura (cámara, difuminado de rostros, validación) | ⛔ Fuera de alcance de esta entrega (no existe aún en código) |

---

## Fuentes utilizadas (el lector puede profundizar)

Este sistema se construyó leyendo el código real del POC, no de memoria. Si tienes acceso,
explóralas para construir mejores diseños:

- **Repositorio GitHub:** `raulght93/ciudad-justa` → <https://github.com/raulght93/ciudad-justa>
- **Codebase montado (local):** `ciudad-justa/` — en particular:
  - `apps/web/src/styles/tokens.js` — sistema de diseño original (“noche cívica”).
  - `apps/web/src/data/content.js` — **todo el copy real** y las fuentes citadas.
  - `apps/web/src/components/*` — Hero, Layers, Manifesto, MapSection, Nav, Housing.
  - `docs/00-principios-y-valores.md` — marco ético (clave para el tono).
  - `docs/01-arquitectura-hostil-estado-del-arte.md` — taxonomía (Rosenberger 2023).
- **Marca original (referencia):** `assets/legacy-favicon.svg`, `assets/legacy-og-card.svg`.

> El POC original es de dominio del proyecto; aquí lo **reinterpretamos**, no lo copiamos.

---

## CONTENT FUNDAMENTALS · cómo se escribe Ciudad Justa

El copy es **el alma del proyecto** y debe respetarse al pie de la letra: el tono es tan
importante como el visual. Reglas extraídas de `content.js` y `docs/00`:

- **Idioma:** español de España. Registro **culto pero directo**, sin jerga técnica gratuita.
- **Persona:** mayoritariamente **impersonal / “nosotros” colectivo** (“lo cartografiamos, lo
  votamos”), con **tú** ocasional y punzante (“sitios diseñados para que *no estés*”). Nunca
  “usted”. Nunca corporativo.
- **El enemigo es el diseño y la política, nunca la persona.** Línea roja del proyecto: jamás
  “indigentes”, “okupas”, “incívicos”, “limpiar”, “molestias”. Se habla de **barreras,
  exclusión por diseño, servicios negados, amenidades fantasma, expulsar**.
- **Frases-martillo, cortas y contundentes**, a menudo en paralelismo:
  - *“Hay sitios diseñados para que no estés.”*
  - *“El espacio público es de quien lo habita, no de quien lo blinda.”*
  - *“El banco con pinchos te echa de la acera. El precio de la vivienda te echa de la ciudad entera.”*
  - *“Documentar · votar · revertir.”*
- **Rigor citado, siempre.** Cada cifra lleva **fuente clicable** (“↗ Fuente: ISGlobal”). Se
  admite el matiz y el contra-argumento (“un reposabrazos puede ser accesibilidad de verdad”).
  Se distingue *dato vivo crowdsourced* de *censo auditado*.
- **Cifras-ancla** como gancho: `1.288` barreras, `30 %` copa arbórea, `4,7 %` con verde
  suficiente. Formato español: **coma decimal, punto de millar** (`1.288`, `4,7 %`).
- **Negritas** para resaltar el término clave dentro de la frase, no para gritar.
- **Sin emoji** en el producto (salvo marcadores de estado de docs internos 🔴✅). El tono es
  **grave, urgente, adulto**. La energía rupturista viene del **visual**, no de iconitos.
- **Kickers numerados** estilo dossier/expediente: `01 ——— LAS CAPAS`, `PRÓXIMA CAPA · EN
  PREPARACIÓN`. Voz de **investigación abierta**, no de marketing.

---

## VISUAL FOUNDATIONS · fundamentos visuales

El lenguaje es **dark riso-punk activista-forense**. Cada decisión está en
`colors_and_type.css` como token. Resumen:

**Color & vibe.** Base **near-black “papel de tinta”** (`--ink-900 #0A0A0B`) con una escala
de grises fríos para paneles y tarjetas. Sobre ella, **tintas señal fluorescentes y planas**
(estética risográfica): **rojo `#FF3B12`** (marca / alarma / capa hostil), **amarillo
`#FFE000`** (señal secundaria / resaltado / ticker) y **cian `#00E5FF`** (contrapunto frío /
servicios). Las capas de datos conservan su semántica (hostil rojo, verde, servicios cian,
vivienda violeta) pero **más saturadas y punkis**. Bloques invertidos sobre **papel cálido
`#F3EFE4`** para citas y manifiesto. La imaginería, cuando exista, va **fría/contrastada o en
b&n con grano**, nunca cálida-publicitaria.

**Tipografía.** Tres familias, cero serif (ruptura total con Fraunces):
- **Anton** — grotesca ultra-condensada de **cartel**, en **CAJA ALTA**, interlineado
  apretado (0.82–0.9), tracking +0.5%. Para titulares rotos y gigantes.
- **Space Grotesk** — grotesca técnica para **cuerpo y UI** (400/500/600/700), 17px base, 1.6.
- **Space Mono** — **mono de máquina** para kickers, coordenadas, estados y metadatos.
  Versalita tracking 0.22em. Es el tejido conectivo “forense”.

**Espaciado.** Base **4px**, pasos mecánicos (`--sp-1…--sp-10`). Generoso en vertical
(secciones `clamp(56px, 9vw, 120px)`).

**Bordes y radios.** **Esquinas duras (0px) por defecto** — la causa pide aristas, no
suavidad. Radio sólo en pastillas de estado (`--r-pill`). Bordes de **1–2px** sólidos;
marcos de cartel a **2px sobre `--fg-1`**.

**Elevación / sombra.** **No hay sombra difusa.** La elevación es un **desplazamiento sólido
de tinta** (`box-shadow: 6px 6px 0 0 var(--signal-red)`) — gesto de cartel serigrafiado. Para
inset, hairline de 1px.

**Fondos / textura.** Mayoría **plano sobre near-black**. Textura mediante:
- **Grano risográfico** (`.riso-grain`, overlay fractal-noise, `mix-blend-mode: overlay`).
- **Misregistro / doble impresión** (`.offset-print`, sombra de texto cian/rojo desplazada).
- **Sierra / pinchos** (`.sawtooth`) como divisor y banda de textura.
- **Marcas de registro y coordenadas** (`.reg-mark`, etiquetas mono `41.38° N`) — acento
  cartográfico-forense.
Nada de gradientes azul-morado, nada de blobs, nada de glow suave decorativo.

**Movimiento (crudo y mecánico).** Cortes duros, **`steps()`** en vez de easing suave,
**marquesina mecánica** (ticker), flicker/glitch puntual. Sin bounces, sin fades largos.
Todo se **congela con `prefers-reduced-motion`** (accesibilidad).

**Estados.**
- *Hover:* sube de tinta (`ink-700 → ink-600`), o invierte (fondo señal, texto ink), o aparece
  el desplazamiento de sombra. Nada de opacidades tímidas.
- *Press / active:* **desplazar 2–3px** hacia la sombra (el cartel “se pega”), o color más
  hundido (`--signal-red-ink`).
- *Focus:* **anillo duro amarillo** (`outline: 3px solid var(--signal-yellow)`), línea roja de
  accesibilidad.
- *Disabled:* opacidad 0.55, sin sombra.

**Transparencia / blur.** Mínimos. Sólo la barra de navegación usa `backdrop-blur` ligero
sobre `--ink-900cc`. El resto es **tinta plana y opaca**.

**Tarjetas.** Fondo `--ink-700`, **borde 1px** (no sombra), a veces **filete superior 3px**
del color de capa, y un **índice gigante de fondo** (numeral Anton al 7% de opacidad). Hover
opcional con desplazamiento de sombra dura. Esquinas a 0px.

**Layout.** Ancho máx `1240px`. Rejilla honesta y, en la dirección **editorial (C)**,
**rota/rompe** la rejilla (tipo que sangra del borde, etiquetas giradas, numerales enormes).
La barra de navegación es **sticky** con hairline inferior.

---

## ICONOGRAPHY · iconografía

El POC **no usa icon font**: emplea **glifos unicode geométricos** como iconos de capa
(`▲` hostil, `❋` verde, `◉` servicios) y **SVG propio** para la marca (pin partido). Este
sistema mantiene esa filosofía **mínima y geométrica** y la endurece:

- **Marca / pin partido** → SVG propio reinterpretado: pin de mapa relleno, **cortado por la
  barra del banco** que divide, con **misregistro riso** (fantasma cian detrás del rojo). Ver
  `preview/brand-logo.html` y el componente `ui_kits/web/Brand.jsx`.
- **Glifos de capa** → se conservan los unicode geométricos (`▲ ❋ ◉`) y se añade el **violeta**
  para vivienda. Stark, sin relleno fotográfico.
- **Sierra / pinchos** → patrón CSS (`.sawtooth`), no icono.
- **Iconos de UI de afordancia** (flecha, cerrar, menú, enlace externo, cámara, voto): se usa
  **[Lucide](https://lucide.dev)** vía CDN, **stroke 2–2.25px** (trazo grueso, coherente con
  el tono). *Sustitución señalada:* el POC no traía set de iconos UI, así que Lucide es la
  elección más cercana al trazo técnico-limpio del proyecto; se documenta y se puede cambiar.
- **Emoji:** **no** en producto. Sólo en docs internos como marcadores (🔴 bloqueante,
  ✅ verificado).
- **Caracteres como icono:** sí, con intención — `→ ↗ ▲ ❋ ◉ ◆ ·` en kickers y CTAs.

Assets en `assets/`: `legacy-favicon.svg`, `legacy-og-card.svg` (marca original, referencia).

---

## ÍNDICE · manifiesto del repositorio raíz

| Archivo / carpeta | Qué es |
|---|---|
| `README.md` | Este documento: contexto, fuentes, content + visual foundations, iconografía, índice. |
| `colors_and_type.css` | **Tokens fuente de verdad:** color, tipografía, espaciado, radios, sombras, motivos (grano, misregistro, sierra, marca de registro), motion, defaults semánticos `.cj`. |
| `SKILL.md` | Skill cross-compatible (Agent Skills) para generar diseños de marca Ciudad Justa. |
| `preview/` | 16 tarjetas del Design System (color, tipo, espaciado, componentes, marca). |
| `assets/` | Marca original de referencia (favicon, og-card). |
| `ui_kits/web/` | **UI kit de la web/dossier rediseñada**: `index.html` interactivo + componentes JSX. Incluye **ambas direcciones** A (cartel) y C (editorial) conmutables. |

### UI kits

- **`ui_kits/web/`** — Web / dossier divulgativo. Recreación de alta fidelidad de la landing
  rediseñada: nav, hero conmutable (Cartel ↔ Editorial), ticker mecánico, las tres capas,
  panel de mapa, cómo funciona, manifiesto sobre papel, área de vivienda, footer. Ver su
  propio `README.md`.

---

## Sustituciones señaladas (revisar)

- **Fuentes:** Anton, Space Grotesk y Space Mono se cargan desde **Google Fonts** (todas
  open-source / OFL). Para producción conviene **auto-alojarlas**. *Si prefieres otras
  familias de cartel/grotesca, dilo y las cambio.*
- **Iconos UI:** Lucide vía CDN como sustitución (el POC no traía set). Cambiable.
- **Color de marca:** elegí **rojo señal `#FF3B12`** como primario (con amarillo señal y cian)
  según la dirección oscura-radical y la energía “señal” que marcaste. Ajustable.
