# Cómo aplicar “Contradiseño” a tu proyecto (apps/web)

Tu app y este sistema comparten stack (React + estilos inline + `tokens.js`), así que la
migración es directa. Hay dos caminos; puedes empezar por el A y terminar en el B.

---

## Camino A · Re-skin rápido (1 archivo, ~15 min, ~80% del look)

1. **Sustituye** `apps/web/src/styles/tokens.js` por `integration/tokens.js` de este proyecto.
   Tus componentes ya importan `c`, `font`, `radius`, `maxW`, `kicker`, `shadow` — al cambiar
   los valores, **toda la app se re-tinta** (negro riso, rojo señal, esquinas duras, mono).
2. **Cambia las fuentes** en `apps/web/index.html`. Reemplaza el `<link>` de Fraunces/Inter por:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Anton&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
   ```
   y `meta theme-color` a `#0a0a0b`.
3. **Retoca los titulares** (lo único que un swap de tokens no resuelve): Anton va en CAJA ALTA
   y de un solo peso. En `Hero.jsx` / `primitives.jsx` (titleStyle) añade
   `textTransform:"uppercase"`, `letterSpacing:"0.01em"`, `lineHeight:0.9` y quita `fontWeight`.
   El `<em italic>` del hero no tiene cursiva en Anton → resáltalo con `color:c.accent`.

Con esto ya tienes el cambio de dirección visible. Ver comentarios al final de
`integration/tokens.js` para el detalle.

---

## Camino B · Adopción completa (pixel-perfect, la dirección entera)

El re-skin no trae lo que vive en los **componentes**: hero roto editorial, divisores de
sierra, grano, misregistro, bordes duros y sombras de tinta. Para eso, porta los componentes
del UI kit (`ui_kits/web/`) a tu estructura `apps/web/src/components/`:

| Tu archivo | Equivalente en el kit | Qué cambia |
|---|---|---|
| `components/Hero.jsx` | `Hero.jsx` (`HeroCartel` / `HeroEditorial`) | titular Anton, stat-strip con bordes duros, dirección A/C |
| `components/Nav.jsx` | `Nav.jsx` | sticky que se solidifica, kickers mono |
| `components/Layers.jsx` | `Sections.jsx → Layers` | tarjetas con numeral gigante + filete de capa |
| `components/Manifesto.jsx` | `Sections.jsx → Manifesto` | bloque sobre **papel** + sierra arriba/abajo |
| `components/Housing.jsx` | `Sections.jsx → Housing` | métricas con borde discontinuo violeta |
| `components/decor.jsx` | `primitives.jsx → Sawtooth` + clases CSS | sierra, grano, misregistro |
| `components/MapSection.jsx` | *(conserva tu MapLibre)* | re-tinta: usa `c.bg`/`c.hostile`; estilo de tiles `dark_all` ya encaja |

Pasos:
1. Copia las **clases de motivo** (`.sawtooth`, `.riso-grain`, `.offset-print`, `.reg-mark`,
   keyframe `cj-marquee`, foco amarillo, `prefers-reduced-motion`) desde
   `colors_and_type.css` a un CSS global tuyo (p. ej. `src/styles/global.css` importado en
   `main.jsx`), o conviértelas a estilos inline.
2. Sustituye el contenido de cada componente por su versión del kit, **manteniendo tus imports
   de datos reales** (`data/content.js`) — el kit usa tu mismo copy, así que encaja directo.
3. La **marca** (pin partido diagonal): usa el `Mark`/`Brand` de `primitives.jsx` y actualiza
   `public/favicon.svg` con la misma geometría (raya diagonal + mitades desalineadas).
4. El **conmutador A/C** es opcional en producción: si ya decides una dirección, deja sólo
   `HeroCartel` **o** `HeroEditorial` y borra el toggle.

> Tu `MapSection` con MapLibre se queda: sólo re-tinta los `paint` con los nuevos colores de
> capa (`c.hostile #ff3b12`, gradiente verde→rojo). El mock del kit era sólo para la maqueta.

---

## ¿Quieres que lo haga yo?

Puedo **portar todos los componentes** a la estructura `apps/web/src/` y entregártelos listos
para copiar (no puedo escribir dentro de tu carpeta montada, pero sí dejarlos en una carpeta
`apps-web-port/` de este proyecto). Dímelo y lo preparo — y antes, **confírmame qué dirección
quieres en producción: A (Cartel), C (Editorial) o ambas conmutables.**
