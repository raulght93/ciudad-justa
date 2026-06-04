# 06 · Gobernanza, blindaje legal y sostenibilidad

> Responde a los bloqueantes 🔴 de la review independiente ([`05`](05-review-independiente.md)):
> **C1** (responsabilidad legal de afirmar "hostil") y **E4** (entidad jurídica + moderación de
> arranque + sostenibilidad). Es el documento que separa "investigación interesante" de
> "herramienta cívica defendible ante un ayuntamiento, una universidad o un tribunal".
>
> **Aviso:** este documento fija requisitos y políticas de diseño; **no sustituye asesoría
> jurídica profesional**, que es ella misma un requisito previo a la Fase 1 (ver §6.6).

## 6.1 Por qué esto es bloqueante (no backlog)

Marcar un objeto concreto como "hostil" es una **afirmación de intención** sobre quien lo
instaló. Si además se acompaña de foto y dirección (`reports.address`), puede señalar a un
comercio o propiedad identificable. Eso expone a la plataforma a:

- **Protección del honor** (LO 1/1982): imputar intención excluyente a un titular concreto.
- **LSSI-CE (Ley 34/2002)**: responsabilidad del prestador de servicios sobre contenidos de
  terceros si no actúa con diligencia (régimen de *puerto seguro* condicionado a retirada).
- **RGPD / LOPDGDD**: tratamiento de imágenes que pueden captar a personas vulnerables.

Ninguno impide el proyecto; **sí condicionan cómo se publica**. La Fase 0 divulgativa puede
arrancar sin riesgo si se respeta §6.3.

## 6.2 Entidad jurídica (🔴, requisito previo a publicar datos reales)

- Constituir **asociación o fundación sin ánimo de lucro** *antes* de publicar cualquier dato que
  señale ubicaciones concretas. La entidad:
  - es lo que hace real el "sin ánimo de lucro" del [`00`](00-principios-y-valores.md);
  - **concentra la responsabilidad** (la asume la entidad, no una persona física);
  - habilita convenios con ayuntamientos, universidades y entidades sociales;
  - permite recibir subvención cívica y donaciones.
- Hasta que exista: trabajar **solo con datos agregados/curados** y sin señalamiento individual.

## 6.3 Política de contenido y anonimización (C1)

Reglas de producto, codificables en la app:

1. **No nombrar al titular.** Se describe el **objeto y la ubicación aproximada**, nunca "el bar
   X puso pinchos". `reports.address` se almacena con **granularidad reducida** (tramo de calle,
   no portal exacto) para datos públicos; la precisión fina queda para moderación interna.
2. **No fachadas identificables de negocios.** La foto documenta el **elemento** (banco, pincho),
   no el escaparate que lo identifica.
3. **Encuadre de intención.** La UI nunca afirma intención como hecho: usa los estados graduales
   (`reported`/`disputed`/`confirmed`, ver [`04 §4.3`](04-modelo-de-datos.md)) y permite
   **contra-argumento**. "Reportado por la comunidad", no "esto es hostil".
4. **Takedown.** Procedimiento público de retirada: formulario de objeción, **plazo de respuesta
   ≤ 72 h**, retirada cautelar mientras se revisa, y *log* en `moderation_log`. Es la condición
   del puerto seguro de la LSSI.
5. **Términos de uso + aviso legal** publicados antes de admitir aportaciones de terceros.

## 6.4 Moderación de arranque — el problema del huevo y la gallina (E4)

El sistema de reputación ([`04 §4.4`](04-modelo-de-datos.md)) necesita comunidad que aún no
existe. **Bootstrap:**

- **Fase 0:** **curación manual** por el equipo/entidad. Nada se publica como "confirmado" sin
  revisión humana. La capa caliente arranca con *seed* agregado, no con UGC abierto.
- **Moderadores semilla:** entidades aliadas (p. ej. Arrels) y voluntariado con rol `moderator`
  desde el día 1; su reputación inicial es alta por designación, no por histórico.
- **Umbrales relajados al inicio** y endurecidos a medida que crece la base de votantes, para que
  unos pocos votos no confirmen ni un *brigading* pequeño tumbe.
- **Cola de revisión** obligatoria entre `under_review` y `confirmed` mientras la comunidad sea
  pequeña.

## 6.5 Sostenibilidad y comunidad (E4)

El propio proyecto diagnostica que las plataformas VGI "viven o mueren por su comunidad"
([`02 §2.2`](02-producto-poc-mvp.md)). Plan mínimo:

- **Financiación:** subvenciones cívicas (ayuntamientos, Agenda Urbana), convenio universitario
  (la dimensión académica), microdonación/crowdfunding, *grants* de software libre. Coste de
  infra ≈ 0 en Fase 0 ([`03 §3.7`](03-arquitectura-tecnica.md)) → la presión financiera es de
  **personas** (moderación, dinamización), no de servidores.
- **Comunidad:** vincular la actividad a **victorias visibles** (reversión de mobiliario,
  reverdecimiento logrado) como combustible; campañas con centros educativos (modelo Arrels).
- **Mantenimiento:** responsable de moderación + recálculo trimestral de capas frías
  (automatizable, [`03 §3.5`](03-arquitectura-tecnica.md)).

## 6.6 Privacidad operativa (refuerza C5, ver `03 §3.6`)

- **DPIA / EIPD** (evaluación de impacto RGPD) **obligatoria** antes de la Fase 1, por tratar
  imágenes en contextos con personas vulnerables.
- Difuminado como **gate de subida**, no como recomendación (detalle técnico en
  [`03 §3.6`](03-arquitectura-tecnica.md)).

## 6.7 Checklist de bloqueantes antes de publicar datos reales

- [ ] Entidad jurídica constituida (§6.2).
- [ ] Asesoría jurídica revisada (LSSI + honor + RGPD).
- [ ] Términos de uso, aviso legal y política de takedown publicados (§6.3).
- [ ] Política de anonimización de propiedad implementada en la UI y en `reports.address` (§6.3).
- [ ] Moderación semilla y curación manual operativas (§6.4).
- [ ] DPIA/EIPD redactada; difuminado como gate (§6.6, `03 §3.6`).
- [ ] Afirmaciones gancho contrastadas (ver `fuentes.md` y review C3).
