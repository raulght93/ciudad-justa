# Evaluación de Impacto relativa a la Protección de Datos (EIPD/DPIA) — BORRADOR

> ⚠️ **Borrador de trabajo, sin validez jurídica.** Debe revisarlo y completarlo asesoría
> legal cualificada (fases B2/C2) antes de la **Fase 1 social**. No sustituye al criterio de un
> DPO ni a la consulta previa a la AEPD si procede. Base normativa: **art. 35 RGPD** y
> *Guía práctica para las Evaluaciones de Impacto* de la AEPD.
>
> El tratamiento es potencialmente de **alto riesgo** (imágenes del espacio público que pueden
> captar a personas en situación de vulnerabilidad, incluidas personas sin hogar), por lo que la
> EIPD es **obligatoria** (RGPD art. 35.1 y 35.3; lista AEPD de tratamientos del art. 35.4).

## 0. Control del documento

| Campo | Valor |
|---|---|
| Estado | Borrador (pre-validación jurídica) |
| Versión | 0.2 |
| Responsable del tratamiento | *Pendiente* — la entidad jurídica que se constituya (ver `06 §6.2`) |
| Delegado de Protección de Datos (DPO) | *Pendiente de designación* |
| Encargados / subencargados | Cloudflare, Inc. (Pages, Workers, D1, R2) |
| Documentos relacionados | `00-principios-y-valores.md`, `03 §3.6`, `04 §4.7`, `06 §6.6`, `db/schema.sql` |
| Próxima revisión | Antes de publicar datos reales y, en todo caso, al cambiar el tratamiento |

---

## 1. Descripción sistemática del tratamiento (art. 35.7.a)

### 1.1 Finalidad

Cartografía colaborativa y divulgativa de la **exclusión por diseño** en el espacio público
(arquitectura hostil, déficit de verde y de servicios, y —en expansión— precios de la vivienda).
Finalidad de **concienciación e investigación cívica sin ánimo de lucro**. Explícitamente **excluido**:
uso comercial, cesión a terceros con fines publicitarios y cualquier uso que pueda facilitar la
expulsión o el acoso de personas (ver línea roja en `00`).

### 1.2 Categorías de interesados

- **Personas usuarias** que reportan, votan o reclaman cuenta.
- **Terceros captados de forma incidental** en fotografías del espacio público, **incluidas personas
  en situación de sin hogar** (colectivo especialmente vulnerable).
- Titulares de propiedades/negocios que pudieran ser señalados (riesgo de honor, no RGPD en sí).

### 1.3 Categorías de datos tratados

| Dato | Origen | Almacenamiento | Notas |
|---|---|---|---|
| Imagen (foto del objeto) | Usuario | R2 (`photos.r2_key`) | **Sólo versión difuminada** (`photos.blurred CHECK = 1`) |
| Rostros / personas | Incidental en la foto | **No se almacena sin difuminar** (gate en cliente) | Posible **categoría especial** si la imagen revelara origen, salud, etc. (art. 9) |
| Coordenadas exactas | Geolocalización del dispositivo | `reports.lat`, `reports.lng` (REAL) | **Riesgo R-4**: precisión exacta puede reidentificar (ver §5) |
| Geohash (~150 m, p7) | Derivado | `reports.geohash` | Para clustering/dedupe |
| Texto libre | Usuario | `reports.description`, `reports.address` | Puede contener datos personales por error → moderación |
| Email | Usuario (opcional) | `users.email` (NULL hasta reclamar cuenta) | Sólo para autenticar/reclamar la cuenta |
| Reputación, rol, votos | Sistema | `users.reputation`, `votes` | Perfilado **interno de calidad**, sin efectos jurídicos sobre terceros |
| Metadatos EXIF | Foto original | **No se almacenan** (se eliminan en cliente al reencodar) | Evita GPS/fecha/dispositivo del EXIF |

### 1.4 Flujo de datos

1. **Cliente (navegador):** la foto se reencoda (se elimina EXIF) → detección de rostros
   (API nativa `FaceDetector` → MediaPipe como fallback) → **difuminado** → blob.
   *La foto sin difuminar nunca sale del dispositivo.*
2. **Worker (Cloudflare):** valida, asigna id/geohash, persiste el reporte en **D1** y la foto
   difuminada en **R2**. Moderación con cola de estados (`reported → under_review → confirmed/…`).
3. **Front estático:** consume capas frías (GeoJSON) + capa viva de reportes confirmados.

### 1.5 Destinatarios, encargados y transferencias

- **Encargado del tratamiento:** Cloudflare, Inc. (alojamiento, base de datos D1, almacén R2).
  Requiere **contrato de encargo (art. 28)** y verificar la **ubicación de los datos**.
- **Transferencias internacionales:** si los datos residen fuera del EEE, ampararlas en
  **cláusulas contractuales tipo (SCC)** y valorar el *Data Processing Addendum* de Cloudflare.
  *Acción:* fijar región de D1/R2 en UE si está disponible (ver §10).
- **Cesiones a terceros:** ninguna por defecto. No hay analítica de terceros con datos personales.

### 1.6 Plazos de conservación (propuesta a validar)

| Dato | Conservación propuesta | Criterio |
|---|---|---|
| Foto difuminada | Mientras el reporte esté publicado; purga a los 30 días de su retirada | Minimización |
| Reporte (datos no-imagen) | Mientras tenga valor divulgativo; revisión anual | Finalidad |
| Email de cuenta | Hasta que se solicite baja | Consentimiento/relación |
| Logs operativos | ≤ 90 días | Seguridad |
| Solicitudes de takedown | 1 año (prueba de diligencia LSSI) | Responsabilidad proactiva |

---

## 2. Base de legitimación (art. 6 y, en su caso, art. 9)

- **Hipótesis principal:** **interés legítimo** (art. 6.1.f) o **misión de interés público**
  (art. 6.1.e) por el fin de denuncia social e investigación cívica. Requiere **test de ponderación**
  documentado (idoneidad, necesidad, equilibrio frente a los derechos de los afectados).
- **Email de cuenta:** **consentimiento** (art. 6.1.a) o ejecución de la relación con la persona usuaria.
- **Categorías especiales (art. 9):** la difuminación obligatoria busca **evitar** tratar datos del
  art. 9. Si pese a las medidas se tratara incidentalmente, valorar el art. 9.2 (interés público
  esencial / datos manifiestamente públicos) **con asesoría legal** — no asumido por defecto.

> **Pendiente jurídico:** redactar el test de ponderación del interés legítimo (LIA) y decidir entre
> 6.1.e y 6.1.f según la naturaleza de la entidad (§6.2 del doc 06).

---

## 3. Necesidad y proporcionalidad (art. 35.7.b)

- **Minimización:** se documenta el **objeto** (banco, pincho, ausencia de árbol), **no a la persona**.
- **Difuminado en cliente** + **gate de subida** (no recomendación): si hay persona y no se difumina,
  **no se sube** (`03 §3.6`).
- **Limitación de finalidad:** sin uso comercial ni cesión; sin fusión del índice subjetivo con las
  capas frías objetivas (`04 §4.7`) para no estigmatizar barrios.
- **Exactitud:** moderación humana y mecanismo de corrección/retirada.
- **Limitación del plazo de conservación:** §1.6.

---

## 4. Consulta a los interesados (art. 35.9)

Antes de publicar datos reales, **recabar la opinión** de entidades que trabajan con los colectivos
afectados (p. ej. **Arrels Fundació** y organizaciones del sin hogar; ver `06`). Documentar la
consulta y las decisiones derivadas. Objetivo: validar que el enfoque "objeto, no persona" y las
medidas de anonimización no producen un daño no previsto al colectivo que se quiere proteger.

---

## 5. Identificación y evaluación de riesgos para los derechos y libertades

Escala: probabilidad (B/M/A) × impacto (B/M/A) → riesgo inherente. La columna *residual* es **tras**
aplicar las medidas de §6.

| # | Riesgo | Inherente | Medidas (§6) | Residual |
|---|---|---|---|---|
| R-1 | Exponer/identificar a una persona vulnerable en la foto | **Alto** | M-1, M-2, M-6 | Medio-bajo |
| R-2 | El blur falla en gama baja y se sube sin difuminar | **Alto** | M-2 (no-subir), M-3 | Bajo |
| R-3 | Reidentificación por **contexto** aunque se difumine el rostro | Alto-Medio | M-6 (revisión), M-1, M-7 | Medio |
| R-4 | Coordenadas exactas revelan el lugar habitual de una persona sin hogar | **Alto** | **M-7 (✅ hostil)**, M-6 | Bajo |
| R-5 | Texto libre con datos personales (matrícula, nombre, cara descrita) | Medio | M-6, M-8 | Bajo |
| R-6 | Señalamiento de propiedad/negocio (honor, no RGPD) | Medio | M-5 (takedown ≤72 h) | Bajo |
| R-7 | Filtración de la foto original | Bajo | M-1 (no sale del cliente) | Muy bajo |
| R-8 | Sesgo de participación → daño reputacional a barrios | Medio | M-4 (no fusionar índice) | Bajo |
| R-9 | Brecha de seguridad en D1/R2 | Medio | M-9, M-10 | Bajo |
| R-10 | Uso indebido del email | Bajo | M-8, minimización | Muy bajo |

---

## 6. Medidas para afrontar los riesgos (art. 35.7.d)

**Técnicas**

- **M-1.** Difuminado de rostros **en el cliente, antes de subir**; la imagen original **nunca toca el
  servidor**. Eliminación de EXIF al reencodar.
- **M-2.** **Gate de subida**: si se detecta persona y no se difumina (o el detector no está
  disponible), **se bloquea la subida**; el reporte se crea **sin imagen**. Invariante en BD:
  `photos.blurred CHECK (blurred = 1)`.
- **M-3.** Cadena de detección con *fallback* (API nativa → MediaPipe). Documentar criterio de
  aceptación de rendimiento en gama baja (`03 §3.9`).
- **M-7.** ✅ **Ofuscación de coordenadas para tipos sensibles** — implementado para `hostile`:
  el Worker redondea lat/lng a 3 decimales (~100 m, irreversible) **antes de persistir**, por lo que
  el punto exacto donde puede pernoctar una persona **nunca se almacena** (`worker/src/index.js`,
  `blurCoord`/`SENSITIVE_TYPES`; tests en `worker/test/coord-privacy.test.js`). Los tipos de
  infraestructura (`housing`/`service`/`climate`) conservan precisión. *Pendiente:* revisar si algún
  otro tipo debe considerarse sensible.
- **M-9.** Cifrado en tránsito (HTTPS) y en reposo (D1/R2); control de acceso por roles.
- **M-10.** Minimización de logs (§1.6) y rotación de secretos; auth de moderación con sesión real
  (sustituir el `MOD_TOKEN` compartido — ver backlog 🟠).

**Organizativas**

- **M-4.** **No fusionar** el índice subjetivo de reportes con las capas frías objetivas (`04 §4.7`).
- **M-5.** **Política de takedown** publicada y operativa, retirada **≤ 72 h** (LSSI); anonimización
  de la propiedad/negocio en `reports.address` y en la UI.
- **M-6.** **Moderación humana** con cola de estados y curación; criterio "objeto, no persona";
  rechazo de planos identificables.
- **M-8.** Términos de uso y aviso al reportar: prohibido subir datos personales en el texto libre.

---

## 7. Riesgo residual y decisión

Con M-1…M-6 y M-8…M-10 el riesgo residual es **bajo-medio**. **R-3 (reidentificación por contexto)** y
**R-4 (coordenadas exactas)** se mantienen como los más relevantes:

- **R-4 ya reducido a bajo**: implementada **M-7** (ofuscación de coordenadas) para `hostile`.
- **R-3** depende de la moderación humana; aceptar sólo si la curación previa a la publicación está
  operativa (`06 §6.4`).

---

## 8. Consulta previa a la AEPD (art. 36)

Si tras aplicar las medidas el **riesgo residual sigue siendo alto**, procede **consulta previa a la
AEPD antes de iniciar el tratamiento**. Reevaluar este punto una vez implementada M-7 y validada la
moderación; documentar la decisión (consultar / no consultar y por qué) con asesoría legal.

## 9. Derechos de los interesados

Habilitar canal para ejercer **acceso, rectificación, supresión, oposición y limitación**
(art. 15-22), incluido un mecanismo sencillo de **retirada de una foto/reporte** (enlazado con la
política de takedown, M-5). Identificar al responsable y la vía de contacto en el aviso legal y la
política de privacidad.

## 10. Plan de acción (acciones abiertas)

- [x] **M-7**: ofuscar la precisión de coordenadas para tipos sensibles — hecho para `hostile`
      (revisar si algún otro tipo debe incluirse).
- [ ] Validar rendimiento del difuminado en **móviles de gama baja** (`03 §3.9`).
- [ ] Redactar el **test de ponderación del interés legítimo** y fijar la base del art. 6.
- [ ] Definir **responsable del tratamiento** y, en su caso, **DPO** (al constituir la entidad, `06 §6.2`).
- [ ] **Contrato de encargo (art. 28)** con Cloudflare; fijar **región UE** de D1/R2 o amparar SCC.
- [ ] **Consulta a entidades** del colectivo afectado (art. 35.9) y registro de la misma.
- [ ] Sustituir `MOD_TOKEN` por **auth de sesión real** (M-10).
- [ ] Decidir sobre **consulta previa a la AEPD** (§8) tras reevaluar el riesgo residual.
- [ ] Publicar términos de uso, aviso legal, política de privacidad y de takedown (`06 §6.7`).

## 11. Revisión

Revisar esta EIPD **antes de publicar datos reales**, ante **cualquier cambio del tratamiento**
(nuevas categorías de datos, nuevos tipos de reporte, cambio de encargado) y, como mínimo, **una vez
al año**.
