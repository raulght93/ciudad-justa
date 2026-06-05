# UI Kit · Web / Dossier (rediseño “Contradiseño”)

Recreación de alta fidelidad de la **web divulgativa de Ciudad Justa**, rediseñada con el
lenguaje dark riso-punk del sistema. Reproduce la estructura real del POC
(`apps/web/`) — nav, hero, ticker, las tres capas, mapa, cómo funciona, manifiesto,
vivienda, footer — con **el copy literal** del proyecto.

## Direcciones conmutables (A / C)

El kit incluye **las dos direcciones** que pediste, conmutables desde la barra de
navegación (el estado se guarda en `localStorage`):

- **A · Cartel** — hero como **póster centrado**: titular gigante sobreimpreso con grano
  risográfico, todo apilado y simétrico, energía de cartel pegado en la calle.
- **C · Editorial** — hero como **rejilla rota swiss-punk**: tipo que sangra y se desalinea,
  coordenadas verticales, numerales y composición asimétrica agresiva.

Ambas comparten tokens, tipografía, color y componentes; sólo cambia la composición del hero
(y se puede extender a otras secciones). Así puedes compararlas en vivo y decidir.

## Archivos

| Archivo | Qué contiene |
|---|---|
| `index.html` | Punto de entrada. Carga React 18 + Babel + tokens (`../../colors_and_type.css`) y los componentes. CSS responsive del nav + entrada `.cj-reveal`. |
| `content.jsx` | **Copy real** del POC (hero, ticker, capas, manifiesto, cómo, vivienda, fuentes, puntos de mapa). Exporta a `window`. |
| `primitives.jsx` | Primitivas: `Icon` (geometría Lucide), `Mark`/`Brand` (pin partido), `Kicker`, `Button`, `StatusPill`, `SourceTag`, `Sawtooth`, `Reveal`. |
| `Nav.jsx` | Barra sticky + `DirectionToggle` (A/C) + menú móvil. |
| `Hero.jsx` | `HeroCartel` (A) y `HeroEditorial` (C) + `StatStrip` (cifras-ancla). |
| `Sections.jsx` | `Ticker`, `Layers`, `MapPanel` (mapa cartográfico-forense interactivo con popup), `How`, `Manifesto` (sobre papel), `Housing`, `Footer`. |
| `app.jsx` | Ensambla todo y gestiona la dirección A/C. |

## Interacciones implementadas

- Conmutador de dirección **Cartel ↔ Editorial** (persistente).
- Tarjetas de capa **expandibles** (“Profundiza”).
- **Mapa interactivo** (mock): puntos hostiles clicables → popup sobre papel con estado,
  descripción y categoría; rejilla de calles, coordenadas y mancha de déficit de verde.
- Manifiesto con derechos **expandibles**.
- Nav **sticky** que se solidifica al hacer scroll; menú **móvil** a pantalla completa.
- Ticker de cifras en **marquesina mecánica** (se congela con `prefers-reduced-motion`).

## Notas de fidelidad

- Es una **recreación cosmética**, no producción: el mapa es un mock SVG/CSS (el POC usa
  **MapLibre + tiles CARTO**); la API de reportes no está conectada. La estructura, el copy y
  el sistema visual sí son fieles.
- Iconos UI = geometría **Lucide** inline (trazo 2.25). Marca = SVG propio (pin partido
  reinterpretado con misregistro riso).
- Accesibilidad: skip-link, foco visible amarillo, contraste AA, `prefers-reduced-motion`.

## Cómo se construyó

A partir del código real del POC (`apps/web/src/`): `data/content.js` (copy),
`components/*` (estructura) y `styles/tokens.js` (sistema original, aquí **roto a propósito**
hacia la nueva estética). Repo: <https://github.com/raulght93/ciudad-justa>.
