// Contenido divulgativo respaldado por los datos del repo (ver docs/fuentes.md).
// Cada dato citable lleva una `source` que enlaza a la bibliografía.

import { c } from "../styles/tokens.js";

export const SOURCES = {
  arrels: {
    label: "Arrels Fundació / COPE (2026)",
    url: "https://www.arrelsfundacio.org/es/arquitectura-hostil-mapeo2023/",
  },
  rosenberger: {
    label: "Rosenberger, «A Classification Scheme for Hostile Design» (2023)",
    url: "https://www.researchgate.net/publication/374394747_A_Classification_Scheme_for_Hostile_Design",
  },
  isglobal: {
    label: "ISGlobal — verde urbano y salud mental",
    url: "https://www.isglobal.org/en/-/vivir-en-zonas-mas-verdes-se-asocia-con-una-mejor-salud-mental-y-menor-consumo-de-medicamentos",
  },
  konijnendijk: {
    label: "Konijnendijk (2021) — regla 3-30-300",
    url: "https://www.researchgate.net/publication/353571108_The_3-30-300_Rule_for_Urban_Forestry_and_Greener_Cities",
  },
  estrategia: {
    label: "Estrategia Nacional contra el Sinhogarismo 2023-2030",
    url: "https://www.dsca.gob.es/sites/default/files/derechos-sociales/servicios-sociales/docs/Estrategia.2_PSH20232030.pdf",
  },
  aue: {
    label: "Agenda Urbana Española — OE6",
    url: "https://www.aue.gob.es/que-es-la-aue",
  },
  defensiveto: {
    label: "defensiveTO — Cara Chellew",
    url: "https://www.defensiveto.org/about",
  },
  ecologistas: {
    label: "Ecologistas en Acción · Córdoba (arbolado y calor)",
    url: "https://www.ecologistasenaccion.org/territorios/andalucia/cordoba/",
  },
  ine: {
    label: "INE · Atlas de distribución de renta de los hogares (2023)",
    url: "https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177088",
  },
  urbanatlas: {
    label: "Copernicus · Urban Atlas Street Tree Layer 2021",
    url: "https://land.copernicus.eu/en/products/urban-atlas/street-tree-layer-2021",
  },
  serpavi: {
    label: "SERPAVI · Mitma — índice de alquiler €/m²·mes (2024)",
    url: "https://www.mivau.gob.es/vivienda/alquila-bien-es-tu-derecho/serpavi",
  },
};

// Navegación / índice del dossier.
export const NAV = [
  { n: "01", id: "capas", label: "Las capas" },
  { n: "02", id: "mapa", label: "El mapa" },
  { n: "03", id: "como", label: "Cómo funciona" },
  { n: "04", id: "manifiesto", label: "Manifiesto" },
  { n: "05", id: "vivienda", label: "Vivienda" },
];

// Hero.
export const HERO = {
  kicker: "Dossier cívico abierto · ciudades españolas",
  line1: "Hay sitios diseñados",
  line2pre: "para que ",
  line2accent: "no estés", // se resalta
  line2post: ".",
  // El test de accesibilidad/Hero comprueba que aparece "diseño urbano".
  sub: "Pinchos donde alguien dormiría. Bancos partidos para que nadie se tumbe. Calles sin un árbol ni un servicio a quince minutos. Es exclusión por **diseño urbano** —y casi siempre es invisible. Aquí la cartografiamos, la votamos y la sacamos a la luz.",
  ctaPrimary: { label: "Ver el mapa", href: "#mapa" },
  ctaSecondary: { label: "Por qué importa", href: "#manifiesto" },
};

// Ticker de cifras (banda en movimiento; respeta reduced-motion).
export const TICKER = [
  "1.288 barreras hostiles mapeadas en Barcelona",
  "30 % de cubierta arbórea: el mínimo que casi ningún barrio alcanza",
  "300 m a un parque · 5 minutos a pie · menos ansiolíticos",
  "El espacio público es un derecho, no un activo",
  "Solo el 4,7 % de Barcelona cumple la regla 3-30-300",
  "Documentar · votar · revertir",
];

// Cifras-ancla (data-driven, con fuente).
export const KEY_STATS = [
  {
    value: 1288,
    suffix: "",
    label: "barreras hostiles en el mapa de Barcelona",
    note: "y subiendo: es un recuento vivo, hecho a pie de calle",
    source: "arrels",
    color: c.hostile,
  },
  {
    value: 30,
    suffix: " %",
    label: "de copa arbórea por barrio: el mínimo saludable",
    note: "la regla 3-30-300; la mayoría de barrios no llega",
    source: "konijnendijk",
    color: c.green,
  },
  {
    value: 4.7,
    suffix: " %",
    label: "de Barcelona vive con verde suficiente cerca",
    note: "el resto, peor salud mental y más medicación (ISGlobal, n=3.145)",
    source: "isglobal",
    color: c.service,
  },
];

// Manifiesto de valores (doc 00).
export const MANIFESTO = {
  claim: "El espacio público es de quien lo habita, no de quien lo blinda.",
  body: "No fingimos neutralidad: esta herramienta toma partido por la dignidad y los derechos humanos antes que por la propiedad. La ideología decide qué preguntamos; el método —datos abiertos, fuentes citadas, contra-argumento— responde con honestidad.",
  rights: [
    { k: "Derecho a la vivienda", v: "DUDH 25 · PIDESC 11 · Constitución española 47" },
    { k: "Derecho a la ciudad", v: "habitarla pesa más que poseerla" },
    { k: "Libertad de circular y migrar", v: "DUDH 13 · ninguna frontera en la acera" },
    { k: "Nadie es ciudadano de segunda", v: "ningún cuerpo es «uso impropio»" },
  ],
};

// Las tres capas del mapa (+ la cuarta, en expansión).
export const LAYERS = [
  {
    id: "hostile",
    color: c.hostile,
    icon: "▲",
    tag: "01",
    title: "Arquitectura hostil",
    short:
      "Mobiliario diseñado para echar: pinchos, bancos antitumbado, fuentes y aseos que desaparecen.",
    deep: "No prohíbe con un cartel: lo hace con el hierro y el hormigón. Restringe tumbarse, sentarse o resguardarse para expulsar a quien más necesita la calle. Se clasifica por su mecanismo (Rosenberger, 2023): antitumbado, pinchos, barreras, vigilancia, luz y sonido, y «amenidades fantasma». No resuelve el sinhogarismo —lo esconde.",
    source: "rosenberger",
    layer: "caliente · reporte ciudadano validado",
  },
  {
    id: "green",
    color: c.green,
    icon: "❋",
    tag: "02",
    title: "Déficit de verde",
    short: "Tu salud depende de tu código postal. El verde no es decoración: es medicina.",
    deep: "Vivir entre verde se asocia con mejor salud mental y menos ansiolíticos y antidepresivos (ISGlobal, Barcelona). La regla 3-30-300 marca el listón: 3 árboles a la vista, 30 % de copa en el barrio, un parque a 300 m. Repartirlo mal es injusticia ambiental con nombre y dirección. En Córdoba —la ciudad más calurosa de España (récord 47,6 °C)— la falta de sombra es salud pública; cruzamos los datos abiertos con el trabajo de campo de Ecologistas en Acción.",
    source: "isglobal",
    ally: "ecologistas",
    layer: "fría · datos abiertos (Urban Atlas · NDVI · OSM)",
  },
  {
    id: "service",
    color: c.service,
    icon: "◉",
    tag: "03",
    title: "Servicios a quince minutos",
    short: "Barrios donde lo básico no está a un paseo. La ciudad de dos velocidades.",
    deep: "Salud, escuela, comercio, transporte: lo esencial debería estar a quince minutos a pie. Medimos esa distancia con datos abiertos (OSM, indicadores de la Agenda Urbana Española) y la normalizamos por población, para no confundir «barrio sin reportes» con «barrio sin problema».",
    source: "aue",
    layer: "fría · datos abiertos (OSM · AUE)",
  },
];

// Tipos de reporte: tipo global → subtipos, cada tipo con su color de capa.
export const REPORT_TYPES = [
  { key: "hostile", label: "Arquitectura hostil", color: c.hostile, subtypes: [
    ["anti_lie_down", "Anti-tumbado"], ["anti_sit", "Anti-sentarse"], ["spikes", "Pinchos"],
    ["barrier", "Barreras"], ["surface", "Superficie"], ["surveillance", "Vigilancia"],
    ["light_sound", "Luz / sonido"], ["ghost_amenity", "Amenidad fantasma"] ] },
  { key: "green", label: "Falta de árboles / verde", color: c.green, subtypes: [
    ["sin_arbolado", "Sin arbolado"], ["sin_sombra", "Sin sombra"], ["parque_lejos", "Parque lejos"], ["tala", "Tala reciente"] ] },
  { key: "climate", label: "Calor / clima", color: c.yellow, subtypes: [
    ["temp_alta", "Temperatura elevada"], ["isla_calor", "Isla de calor"], ["sin_fuentes", "Sin fuentes de agua"], ["asfalto", "Todo asfalto"] ] },
  { key: "housing", label: "Alquiler abusivo", color: c.housing, subtypes: [
    ["alquiler_alto", "Precio desorbitado"], ["subida", "Subida abusiva"], ["turistificacion", "Turistificación"], ["desahucio", "Desahucio / acoso"] ] },
  { key: "service", label: "Pocos servicios", color: c.service, subtypes: [
    ["sin_salud", "Sin salud"], ["sin_transporte", "Sin transporte"], ["sin_comercio", "Sin comercio"], ["sin_escuela", "Sin escuela"] ] },
];

// Cómo funciona (3 pasos).
export const HOW = [
  { n: 1, t: "Detecta", d: "Fotografías el objeto —nunca a la persona—. El rostro se difumina en tu móvil antes de subir nada; si no se puede, no se sube." },
  { n: 2, t: "Valida", d: "La comunidad confirma o rebate. Voto ponderado por reputación y derecho a réplica: un reposabrazos puede ser accesibilidad de verdad." },
  { n: 3, t: "Revierte", d: "Documentar para visibilizar, visibilizar para presionar. El final feliz es un pincho menos y un árbol más." },
];

// La barrera del precio de la vivienda — capa con datos reales (SERPAVI + INE).
export const HOUSING = {
  color: c.housing,
  kicker: "Alquiler y renta · datos reales",
  title: "El precio de la vivienda",
  lead: "El banco con pinchos te echa de la acera. El precio de la vivienda te echa de la ciudad entera.",
  body: "La arquitectura hostil es el síntoma que se ve; el coste de la vivienda, la barrera que lo explica. Ya está en el mapa: alquiler €/m²·mes real por barrio (SERPAVI/Mitma) y renta por sección (INE) en Málaga y Córdoba. La pregunta deja de ser retórica: ¿son los mismos barrios los que pierden el verde, los servicios y, encima, el techo? Cruza las capas y míralo.",
  rightLink: { k: "Anclaje", v: "Derecho a la vivienda · art. 47 de la Constitución" },
  cta: { label: "Ver en el mapa", href: "#mapa" },
  metrics: [
    { value: "20,9 €/m²", label: "alquiler máximo por barrio en Málaga — casi ×4 sobre el más barato", source: "serpavi" },
    { value: "5,7×", label: "brecha de renta entre las secciones más rica y más pobre de Málaga", source: "ine" },
    { value: "10,6 €/m²", label: "alquiler máximo por barrio en Córdoba (de 3,8 a 10,6)", source: "serpavi" },
  ],
};
