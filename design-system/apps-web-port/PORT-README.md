# Port a producción · apps/web (dirección A/C conmutable)

Componentes del rediseño **“Contradiseño”** portados a tu estructura real
(`apps/web/`) como **módulos ES limpios** (tu patrón Vite). Consumen tu
`src/data/content.js` y tu `src/data/geo.js` **sin cambios**, así que tu copy y tus
datos fluyen directos. La dirección **Cartel (A) / Editorial (C)** es conmutable en vivo
(barra de nav) y se persiste en `localStorage`.

## Cómo instalarlo

1. **Copia** el árbol `apps-web-port/` sobre tu `apps/web/`, respetando rutas:

   ```
   apps-web-port/index.html                       → apps/web/index.html        (sobrescribe: nuevas fuentes + theme-color)
   apps-web-port/public/favicon.svg               → apps/web/public/favicon.svg (pin partido diagonal)
   apps-web-port/src/main.jsx                      → apps/web/src/main.jsx       (añade import del CSS)
   apps-web-port/src/App.jsx                       → apps/web/src/App.jsx
   apps-web-port/src/styles/tokens.js             → apps/web/src/styles/tokens.js       (SOBRESCRIBE)
   apps-web-port/src/styles/contradiseno.css      → apps/web/src/styles/contradiseno.css (NUEVO)
   apps-web-port/src/context/Direction.jsx        → apps/web/src/context/Direction.jsx   (NUEVO)
   apps-web-port/src/components/*.jsx             → apps/web/src/components/*.jsx (SOBRESCRIBE primitives, Nav, Hero, decor, Layers, Manifesto, Housing, MapSection)
   ```

2. `npm install` no necesita nada nuevo (mismas deps: react, maplibre-gl). Las **fuentes**
   (Anton, Space Grotesk, Space Mono) se cargan por `<link>` en `index.html` y por `@import`
   en `contradiseno.css` (el navegador deduplica).

3. `npm run dev`. Verás el dossier con el conmutador **Cartel · A / Editorial · C** en la nav.

## Qué cambió respecto a tu código

- **`tokens.js`** — mismos exports (`c`, `font`, `radius`, `maxW`, `kicker`, `shadow`) con
  valores nuevos + tokens extra (`yellow`, `cyan`, `paper`, `redInk`, `lineStrong`, tintes de
  capa). `font.serif` queda como **alias de `font.display`** para no romper nada a mitad.
- **`contradiseno.css`** (nuevo, importado en `main.jsx`) — fuentes, motivos (`.riso-grain`,
  `.offset-print`, sierra vía componente, `.cj-marquee`, `.cj-reveal`), foco amarillo
  accesible, responsive de nav/hero y `prefers-reduced-motion`.
- **`context/Direction.jsx`** (nuevo) — estado global A/C. `App` ya envuelve todo con
  `DirectionProvider`; `Nav` trae el `DirectionToggle`.
- **Componentes** — reescritos al lenguaje nuevo: `Hero` con `HeroCartel`/`HeroEditorial`,
  `Layers`/`How` con bordes duros y numerales gigantes, `Manifesto` sobre papel con sierra,
  `Housing` con borde discontinuo, `primitives` (marca diagonal, botones, pills, kicker,
  sawtooth, reveal). `MapSection` conserva **tu MapLibre** y sólo re-tinta capas y popup.

## Notas

- **Tests:** `Hero.test.jsx` comprueba que aparece “diseño urbano” — sigue presente vía
  `HERO.sub` (negritas). El test de a11y (axe) debería pasar: contraste AA, foco visible,
  skip-link, `prefers-reduced-motion`. Revisa `content.test.js` si cambiaste algún dato.
- **Decidir una sola dirección más adelante:** borra `context/Direction.jsx` + el
  `DirectionToggle` de `Nav`, y deja en `Hero.jsx` sólo `HeroCartel` **o** `HeroEditorial`.
- **`og-card.svg`** no se reescribió aquí (es estático): si quieres, te lo regenero en la nueva
  estética para compartir en redes.
- Las fuentes vienen de Google Fonts (OFL); para producción conviene auto-alojarlas.
