# Evaluación de Impacto (EIPD/DPIA) — BORRADOR (fase C)

> ⚠️ Guion de partida, sin validez jurídica · pendiente de revisión (fase B2/C2). Obligatoria
> **antes de la Fase 1 social** (tratamiento de imágenes en contextos con personas vulnerables).
> Base: art. 35 RGPD.

## 1. Descripción del tratamiento

Cartografía colaborativa del espacio público con **fotografías** aportadas por la ciudadanía,
geolocalización y clasificación. Posible captación incidental de personas (incluidas personas sin
hogar) → tratamiento potencialmente de **alto riesgo**.

## 2. Necesidad y proporcionalidad

- **Minimización:** se documenta el **objeto**, no a la persona. Difuminado de rostros **en cliente**
  antes de subir; **gate** que bloquea la subida si hay persona y no se difumina; borrado de EXIF.
- **Finalidad legítima y acotada:** concienciación e investigación cívica, sin ánimo de lucro, sin
  cesión comercial ni uso para expulsar personas.

## 3. Riesgos identificados y medidas

| Riesgo | Medida |
|---|---|
| Exponer a una persona vulnerable | Blur-gate en cliente + "objeto, no persona" + moderación con retirada rápida |
| Blur falla en gama baja → subida sin difuminar | **Fallback: no subir**; reporte sin foto |
| Reidentificación por contexto aunque se difumine el rostro | Revisión humana + retirada; evitar planos identificables |
| Señalamiento de propiedad/negocio (honor) | Anonimización de la propiedad + takedown ≤72 h (LSSI) |
| Sesgo de participación → daño reputacional a barrios | No fusionar índice; mostrar capas frías objetivas aparte (doc 04 §4.7) |

## 4. Pendiente para cerrar la EIPD (C2)

- Validar rendimiento del difuminado en **móviles de gama baja** (criterio de aceptación, doc 03 §3.9).
- Definir plazos de retención concretos y responsable del tratamiento.
- Consulta previa a la AEPD si el riesgo residual sigue siendo alto tras las medidas.
