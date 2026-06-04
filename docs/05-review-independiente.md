# 05 · Review independiente y plan de mejora

> Revisión crítica del **enfoque** y el **contenido** del proyecto en su fase de
> investigación/definición (docs `00`–`04`, `fuentes.md`, `db/schema.sql`, GeoJSON de ejemplo y
> el scaffold de `apps/web`). No es un documento de valores ni de arquitectura: es una **auditoría
> orientada a la acción**. Cada hallazgo lleva severidad y una mejora concreta; los bloqueantes
> están consolidados en §5.6.
>
> Convención de severidad: 🔴 **bloqueante** (no usar/publicar hasta resolver) · 🟠 **alta**
> (resolver antes de la Fase 1 social) · 🟡 **media** (mejora de calidad/coherencia).

## 5.1 Veredicto

Trabajo de investigación-definición **sólido y honesto** para su fase. La tesis estratégica
—**capa fría automática (datos abiertos) + capa caliente colaborativa (reporte ciudadano)**— es
la mejor decisión del proyecto y resuelve el *cold-start* que mata a las apps VGI. Arrastra, sin
embargo, tres puntos ciegos serios (**riesgo legal**, **gobernanza/sostenibilidad**, **índice de
injusticia compuesto**) y un **desajuste entre la ambición documentada y el estado real del
código** (el front es un esqueleto que no compila). Este documento los convierte en backlog.

## 5.2 Fortalezas a preservar (no tocar al refactorizar el plan)

1. **Estrategia fría/caliente** (`02 §2.3`, `03 §3.4`): valor desde el día 1 sin masa crítica. Es
   el activo diferencial; toda decisión posterior debe protegerlo.
2. **Sesgo de participación como columna vertebral** (`00 §5`, `02 §2.1/§2.2`, `04 §4.4`): elevado
   a *imperativo de valores*, no a un extra. Maduro y coherente entre documentos.
3. **Honestidad de fuentes**: el marcado `[Fuente]` / *(dominio)* / *(prensa, verificar)* es
   ejemplar. Mantener esta disciplina en todo contenido nuevo.
4. **Anclaje normativo** (Estrategia Nacional de Sinhogarismo 2023-30 + AUE OE6): convierte el
   proyecto en algo alineado con política pública declarada.
5. **Stack sobrio y reutilizado** (CF Pages/Workers/D1/R2; D1-bbox→PostGIS como decisión de
   escalado; PMTiles estáticos para coste ≈0). El `schema.sql` tiene invariantes reales
   (`blurred=1 CHECK`, `weight` congelado, `moderation_log` persistente).

## 5.3 Enfoque — hallazgos y mejoras

### E1 · 🟠 El "doble flanco" diluye foco
`03 §3` defiende bien que *el modelo de datos es el mismo* para el flanco divulgativo y el social.
Cierto técnicamente — pero **producto, comunidad y captación son distintos**: lo divulgativo se
gana con SEO/prensa/storytelling; lo social con outreach barrio a barrio y moderación.

**Mejora:** comprometerse explícitamente con la **Fase 0 divulgativa como producto completo y
autosuficiente**, y tratar la capa caliente como **hipótesis a validar después**, no como destino
asumido. Reescribir el encabezado de `03 §3` para que el "doble flanco" sea *secuencia*, no
*simultaneidad*.

### E2 · 🟠 Diferenciación frente a Arrels más fina de lo que se admite
En Fase 0 (seed curado o importado de Arrels + dos coropletas) el producto se parece mucho al mapa
que Arrels ya tiene. El argumento "infraestructura permanente multi-capa vs. campaña puntual"
(`01 §1.5`, `02 §2.1`) **solo se materializa en la Fase 1**, justo la que se aplaza.

**Mejora:** añadir a `02` un apartado **"¿plataforma propia o contribución a Arrels?"** que
discuta honestamente la opción de integrarse/aportar en lugar de levantar plataforma paralela. Si
se decide plataforma propia, dejar por escrito **qué aporta la Fase 0 que Arrels no tenga ya**
(las capas frías de verde/servicios y la narrativa de índice territorial — no el mapa de puntos).

### E3 · 🟡 Barcelona como piloto: la opción fácil, no la justificada
Es donde más datos, aliados y **saturación** hay. Una ciudad sin actor de referencia daría más
valor marginal y menos solapamiento.

**Mejora:** añadir a `02 §2.4` 3-4 líneas justificando Barcelona (datos + aliados + validación de
demanda) **o** proponiendo un piloto alternativo. No pido cambiarla; pido que la decisión deje de
darse por obvia.

### E4 · 🔴/🟠 Gobernanza y sostenibilidad ausentes
"Sin ánimo de lucro, datos abiertos, gobernanza comunitaria" (`00 §4`) es un valor, no un plan.
Faltan tres respuestas:

- **Entidad jurídica** (🔴): necesaria para ser realmente "sin ánimo de lucro" y, sobre todo, como
  **blindaje de responsabilidad** frente a las afirmaciones de "hostil" (ver C1). Asociación o
  fundación antes de cualquier publicación con datos señalando propiedades concretas.
- **Moderación de arranque** (🔴): el sistema de reputación (`04 §4.4`) es *chicken-and-egg* —
  necesita comunidad que aún no existe. Definir el **bootstrap**: moderadores semilla (entidades
  aliadas), umbrales relajados al inicio, o curación manual en Fase 0.
- **Financiación/comunidad** (🟠): el propio proyecto diagnostica que las plataformas VGI "viven o
  mueren por su comunidad" (`02 §2.2.6`) pero no se lo aplica. Esbozar fuentes (subvención cívica,
  universidad, crowdfunding) y un mínimo de mantenimiento.

**Mejora:** nuevo documento `docs/06-gobernanza-y-sostenibilidad.md` (o sección en `00`) con estos
tres puntos.

## 5.4 Contenido — hallazgos y mejoras

### C1 · 🔴 Riesgo legal infra-mitigado
`02 §2.2.3` reconoce que marcar un objeto como "hostil" es una **afirmación de intención
potencialmente difamatoria**. La mitigación propuesta (estados graduales + contra-argumento +
taxonomía) reduce la *subjetividad* pero **no resuelve la responsabilidad de la plataforma** bajo
la **LSSI** y la ley española de protección del honor, especialmente si el reporte señala una
propiedad o comercio concreto con foto y `reports.address`.

**Mejora:** sección legal propia (en `docs/06` o documento dedicado) con: política de **takedown**
y plazos, **anonimización de la propiedad señalada** (no nombrar al titular; describir el objeto y
la ubicación aproximada, no la fachada identificable de un negocio), aviso legal/términos de uso, y
**asesoría jurídica antes de la Fase 1**. Mientras tanto, la Fase 0 divulgativa debería trabajar
con **seed agregado/curado**, no con señalamiento individual sin verificar.

### C2 · 🟠 El "índice de injusticia" compuesto es una mina metodológica
`04 §4.7` propone `score = f(déficit_verde, déficit_servicios, densidad_hostil_normalizada)`,
fundiendo en **un solo número** dos capas objetivas (satélite/datos abiertos, completas) con una
capa **subjetiva y sesgada por participación** (la hostil). Es exactamente el error que el propio
proyecto critica: la densidad hostil refleja "dónde hay usuarios", no "dónde hay problema", y al
fundirla **contamina lo objetivo con lo sesgado** y produce un ranking de barrios atacable.

**Mejora:** **no fusionar** en un índice compuesto. Mostrar las tres capas en paralelo; si se
agrega un índice, construirlo **solo con las capas frías** (completas y comparables) y presentar la
capa hostil como **evidencia cualitativa superpuesta**, nunca como sumando ponderado. Reescribir
`04 §4.7` en consecuencia.

### C3 · 🔴 Afirmaciones que no deben salir del repo sin verificar
El propio corpus las marca; aquí se elevan a **bloqueantes de publicación**:

| Afirmación | Estado actual | Acción |
|---|---|---|
| **"1.288 barreras" (COPE, 2/3/2026)** | *secondary*, sin contrastar; es el dato-gancho más citado (`01`, `02`, README) | Contrastar con Arrels directamente antes de usarla en UI/prensa |
| **Caso Zaragoza (araInfo)** | *unreliable* por el propio harness | No usar como afirmación; solo pista interna |
| **"9 m² OMS/habitante"** | estudio primario difícil de rastrear | Mantener fuera de la UI; preferir 3-30-300 |

### C4 · 🔴 Re-ejecutar la verificación adversarial (no solo explicarla)
README (`L54-61`) y `fuentes.md` enmarcan el fallo de verificación como "técnico, no de calidad".
Es honesto reportarlo, pero **sin verificar es sin verificar, sea cual sea la causa**: 25
afirmaciones quedaron "refutadas por defecto". La acción correcta no es explicar el fallo, es
**re-ejecutar la verificación** antes de cualquier uso formal y suavizar el framing
auto-indulgente del README.

**Mejora:** relanzar el harness de verificación sobre las 25 afirmaciones; actualizar `fuentes.md`
con el resultado real; reescribir el "Aviso sobre las fuentes" del README para que diga "pendiente
de verificación" en lugar de justificar por qué no se hizo.

### C5 · 🔴 Privacidad: la "mejor garantía" tiene agujeros prácticos
El difuminado en cliente antes de subir (`03 §3.6`) es la decisión correcta. Pero:
(a) el rendimiento en móviles de gama baja está sin validar — si el blur falla y se sube igual, se
expone justo a quien se protege; (b) difuminar la cara **no anonimiza** si la persona es
identificable por contexto; (c) falta una **DPIA/EIPD** (evaluación de impacto RGPD), obligatoria
al tratar imágenes de colectivos vulnerables.

**Mejora:** convertir "objeto, no persona" en **gate de subida** (rechazar en cliente la foto si se
detecta una persona, no solo recomendarlo); documentar el *fallback* cuando el blur no puede
ejecutarse (no subir); añadir DPIA/EIPD al backlog de la Fase 1. Reescribir `03 §3.6` con estos
tres puntos.

### C6 · 🟡 Accesibilidad de la propia app (incoherencia con la causa)
Un proyecto sobre inclusión no menciona la accesibilidad de su propia interfaz (WCAG, lectores de
pantalla, contraste). La paleta de `tokens.js` (`bg #0b0e14`, `muted #9aa6bd`) debe auditarse a AA.

**Mejora:** añadir "Accesibilidad WCAG AA" como línea roja de producto en `00 §4` y como criterio
en `03 §3.8`. Auditar contraste de tokens antes de construir UI.

## 5.5 Desajuste estado real vs. documentación

🟡 `apps/web/index.html` carga `/src/main.jsx`, **que no existe** (el único archivo en
`apps/web/src/` es `tokens.js`): `npm run build` fallaría hoy. El `package.json` ya declara
`maplibre-gl`, lo que sugiere una app que aún no está.

**Mejora:** dejar el README explícito en que **no hay aplicación todavía, solo investigación +
scaffold de diseño**, para no inducir a error a colaboradores. (O crear un `main.jsx` mínimo que
renderice una landing, si se quiere que el scaffold compile.)

## 5.6 Backlog priorizado (resumen accionable)

| # | Sev | Hallazgo | Mejora | Doc afectado |
|---|---|---|---|---|
| C4 | 🔴 | Verificación adversarial fallida sin rehacer | Re-ejecutar; actualizar fuentes; suavizar README | `fuentes.md`, `README` |
| C3 | 🔴 | Afirmaciones gancho sin contrastar | Contrastar 1.288 / descartar Zaragoza / cautela 9 m² | `01`, `02`, `README` |
| C1 | 🔴 | Responsabilidad legal de afirmar "hostil" | Entidad jurídica + takedown + anonimizar propiedad + asesoría | nuevo `06` |
| E4 | 🔴 | Sin moderación de arranque ni entidad jurídica | Bootstrap de moderación + figura jurídica | nuevo `06` |
| C5 | 🔴 | Blur como recomendación, no gate; sin DPIA | Gate de subida + fallback + DPIA | `03 §3.6` |
| E1 | 🟠 | "Doble flanco" simultáneo diluye foco | Fase 0 como producto completo; capa caliente = hipótesis | `03 §3` |
| E2 | 🟠 | Diferenciación fina frente a Arrels | Apartado "¿plataforma propia o contribución?" | `02` |
| C2 | 🟠 | Índice de injusticia compuesto y sesgado | No fusionar; índice solo con capas frías | `04 §4.7` |
| E4b | 🟠 | Sostenibilidad/financiación sin plan | Esbozar fuentes y mantenimiento | nuevo `06` |
| E3 | 🟡 | Barcelona sin justificar | Justificar piloto o proponer alternativa | `02 §2.4` |
| C6 | 🟡 | Accesibilidad de la app no contemplada | WCAG AA como línea roja; auditar tokens | `00 §4`, `03 §3.8` |
| §5.5 | 🟡 | Front no compila / README sobre-promete | Aclarar estado o crear `main.jsx` mínimo | `README`, `apps/web` |

## 5.7 Secuencia recomendada

1. **Antes de publicar nada con datos reales** (🔴): C4 + C3 + C1 + E4(entidad) + C5.
2. **Antes de la Fase 1 social** (🟠): E1 + E2 + C2 + E4(sostenibilidad).
3. **Mejora continua** (🟡): E3 + C6 + arreglo del scaffold.

> Lectura de conjunto: el proyecto está bien pensado en lo estratégico y en lo técnico; sus
> debilidades no son de *visión* sino de **blindaje** (legal, de gobernanza, de método y de
> privacidad operativa). Resolver el bloque 🔴 es lo que separa "investigación interesante" de
> "herramienta cívica defendible ante un ayuntamiento, una universidad o un tribunal" — exactamente
> el listón que el propio `00` se fija.
