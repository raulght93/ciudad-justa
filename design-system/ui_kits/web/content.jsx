// Contenido real del POC de Ciudad Justa (apps/web/src/data/content.js),
// reutilizado literalmente — el copy es parte del sistema y no se reinventa.

const SOURCES = {
  arrels:       { label: "Arrels Fundació / COPE (2026)", url: "https://www.arrelsfundacio.org/es/arquitectura-hostil-mapeo2023/" },
  rosenberger:  { label: "Rosenberger, «A Classification Scheme for Hostile Design» (2023)", url: "#" },
  isglobal:     { label: "ISGlobal — verde urbano y salud mental", url: "#" },
  konijnendijk: { label: "Konijnendijk (2021) — regla 3-30-300", url: "#" },
  aue:          { label: "Agenda Urbana Española — OE6", url: "#" },
};

const NAV = [
  { n: "01", id: "capas", label: "Las capas" },
  { n: "02", id: "mapa", label: "El mapa" },
  { n: "03", id: "como", label: "Cómo funciona" },
  { n: "04", id: "manifiesto", label: "Manifiesto" },
  { n: "05", id: "vivienda", label: "Vivienda" },
];

const HERO = {
  kicker: "Dossier cívico abierto · ciudades españolas",
  line1: "Hay sitios",
  line2: "diseñados",
  line3pre: "para que ",
  line3accent: "no estés",
  sub: "Pinchos donde alguien dormiría. Bancos partidos para que nadie se tumbe. Calles sin un árbol ni un servicio a quince minutos. Es exclusión por diseño urbano —y casi siempre es invisible. Aquí la cartografiamos, la votamos y la sacamos a la luz.",
  ctaPrimary: { label: "Ver el mapa", href: "#mapa" },
  ctaSecondary: { label: "Por qué importa", href: "#manifiesto" },
};

const TICKER = [
  "1.288 barreras hostiles mapeadas en Barcelona",
  "30 % de cubierta arbórea: el mínimo que casi ningún barrio alcanza",
  "300 m a un parque · 5 minutos a pie · menos ansiolíticos",
  "El espacio público es un derecho, no un activo",
  "Solo el 4,7 % de Barcelona cumple la regla 3-30-300",
  "Documentar · votar · revertir",
];

const KEY_STATS = [
  { value: "1.288", label: "barreras hostiles en el mapa de Barcelona", note: "y subiendo: es un recuento vivo, hecho a pie de calle", source: "arrels", color: "var(--layer-hostile)" },
  { value: "30 %", label: "de copa arbórea por barrio: el mínimo saludable", note: "la regla 3-30-300; la mayoría de barrios no llega", source: "konijnendijk", color: "var(--layer-green)" },
  { value: "4,7 %", label: "de Barcelona vive con verde suficiente cerca", note: "el resto, peor salud mental y más medicación (ISGlobal, n=3.145)", source: "isglobal", color: "var(--layer-service)" },
];

const MANIFESTO = {
  claim: "El espacio público es de quien lo habita, no de quien lo blinda.",
  body: "No fingimos neutralidad: esta herramienta toma partido por la dignidad y los derechos humanos antes que por la propiedad. La ideología decide qué preguntamos; el método —datos abiertos, fuentes citadas, contra-argumento— responde con honestidad.",
  rights: [
    { k: "Derecho a la vivienda", v: "DUDH 25 · PIDESC 11 · Constitución española 47" },
    { k: "Derecho a la ciudad", v: "habitarla pesa más que poseerla" },
    { k: "Libertad de circular y migrar", v: "DUDH 13 · ninguna frontera en la acera" },
    { k: "Nadie es ciudadano de segunda", v: "ningún cuerpo es «uso impropio»" },
  ],
};

const LAYERS = [
  { id: "hostile", color: "var(--layer-hostile)", icon: "▲", tag: "01", title: "Arquitectura hostil",
    short: "Mobiliario diseñado para echar: pinchos, bancos antitumbado, fuentes y aseos que desaparecen.",
    deep: "No prohíbe con un cartel: lo hace con el hierro y el hormigón. Se clasifica por su mecanismo (Rosenberger, 2023): antitumbado, pinchos, barreras, vigilancia, luz y sonido, y «amenidades fantasma». No resuelve el sinhogarismo —lo esconde.",
    source: "rosenberger", layer: "caliente · reporte ciudadano validado" },
  { id: "green", color: "var(--layer-green)", icon: "❋", tag: "02", title: "Déficit de verde",
    short: "Tu salud depende de tu código postal. El verde no es decoración: es medicina.",
    deep: "Vivir entre verde se asocia con mejor salud mental y menos ansiolíticos (ISGlobal, Barcelona). La regla 3-30-300: 3 árboles a la vista, 30 % de copa en el barrio, un parque a 300 m. Repartirlo mal es injusticia ambiental con nombre y dirección.",
    source: "isglobal", layer: "fría · datos abiertos (Urban Atlas · NDVI)" },
  { id: "service", color: "var(--layer-service)", icon: "◉", tag: "03", title: "Servicios a quince minutos",
    short: "Barrios donde lo básico no está a un paseo. La ciudad de dos velocidades.",
    deep: "Salud, escuela, comercio, transporte: lo esencial debería estar a quince minutos a pie. Medimos esa distancia con datos abiertos (OSM, AUE) y la normalizamos por población, para no confundir «barrio sin reportes» con «barrio sin problema».",
    source: "aue", layer: "fría · datos abiertos (OSM · AUE)" },
];

const HOW = [
  { n: 1, t: "Detecta", d: "Fotografías el objeto —nunca a la persona—. El rostro se difumina en tu móvil antes de subir nada; si no se puede, no se sube." },
  { n: 2, t: "Valida", d: "La comunidad confirma o rebate. Voto ponderado por reputación y derecho a réplica: un reposabrazos puede ser accesibilidad de verdad." },
  { n: 3, t: "Revierte", d: "Documentar para visibilizar, visibilizar para presionar. El final feliz es un pincho menos y un árbol más." },
];

const HOUSING = {
  color: "var(--layer-housing)",
  kicker: "Próxima capa · en preparación",
  title: "El precio de la vivienda",
  lead: "El banco con pinchos te echa de la acera. El precio de la vivienda te echa de la ciudad entera.",
  body: "La arquitectura hostil es el síntoma que se ve; el coste de la vivienda, la barrera que lo explica. Preparamos una capa para cartografiar la presión del alquiler en España y cruzarla con las otras tres: ¿son los mismos barrios los que pierden el verde, los servicios y, encima, el techo?",
  rightLink: { k: "Anclaje", v: "Derecho a la vivienda · art. 47 de la Constitución" },
  metrics: [
    { value: "—", label: "% de la renta que se va en alquiler" },
    { value: "—", label: "barrios en riesgo de desplazamiento" },
    { value: "—", label: "vivienda vacía frente a demanda" },
  ],
  note: "Cifras pendientes de incorporar con fuentes verificadas (INE, Índice de Precios del Alquiler, registros municipales). Marcador de expansión, no contenido cerrado.",
};

// Puntos de mapa (mock cartográfico, coords aprox. Barcelona, %-positions).
const MAP_POINTS = [
  { x: 28, y: 34, status: "confirmed", cat: "Pinchos", desc: "Pinchos metálicos en repisa de cajero, Eixample." },
  { x: 52, y: 26, status: "confirmed", cat: "Antitumbado", desc: "Banco con reposabrazos centrales, Pl. Catalunya." },
  { x: 64, y: 48, status: "reported", cat: "Amenidad fantasma", desc: "Fuente clausurada junto a parada de bus." },
  { x: 40, y: 58, status: "documented", cat: "Barrera", desc: "Bolardos y vallado bajo soportal, Raval." },
  { x: 74, y: 64, status: "disputed", cat: "Antitumbado", desc: "Segmentación de banco; ¿accesibilidad o expulsión?" },
  { x: 18, y: 62, status: "reported", cat: "Pinchos", desc: "Pavimento con relieve antiestancia." },
  { x: 58, y: 72, status: "confirmed", cat: "Vigilancia", desc: "Iluminación disuasoria + cámara en marquesina." },
];

const STATUS_LABEL = {
  confirmed: "Confirmado", reported: "Sin verificar",
  documented: "Documentado", disputed: "En discusión",
};

Object.assign(window, { SOURCES, NAV, HERO, TICKER, KEY_STATS, MANIFESTO, LAYERS, HOW, HOUSING, MAP_POINTS, STATUS_LABEL });
