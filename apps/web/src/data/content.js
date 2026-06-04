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
};

// Cifras-ancla del hero (data-driven, con fuente).
export const KEY_STATS = [
  {
    value: 1288,
    suffix: "",
    label: "barreras hostiles documentadas en Barcelona",
    note: "pinchos, bolardos, barrotes en bancos, maceteros estratégicos",
    source: "arrels",
    color: c.hostile,
  },
  {
    value: 30,
    suffix: "%",
    label: "cubierta arbórea mínima por barrio (regla 3-30-300)",
    note: "muchos barrios no llegan ni a la mitad",
    source: "konijnendijk",
    color: c.green,
  },
  {
    value: 300,
    suffix: " m",
    label: "distancia máxima recomendada a un espacio verde de calidad",
    note: "≈ 5 minutos a pie; el verde mejora la salud mental",
    source: "isglobal",
    color: c.service,
  },
];

// Manifiesto de valores (doc 00). Empieza simple; se profundiza al expandir.
export const MANIFESTO = {
  claim:
    "El espacio público es un derecho, no un activo a proteger de quien lo necesita.",
  body: "Esta herramienta no es neutral, y lo declara. Prima la dignidad humana y los derechos humanos universales por encima de los intereses de propiedad y mercado. La ideología elige las preguntas; el rigor metodológico responde con honestidad.",
  rights: [
    { k: "Derecho a la vivienda", v: "DUDH art. 25 · PIDESC art. 11 · Constitución española art. 47" },
    { k: "Derecho a la ciudad", v: "el espacio urbano es de quien lo habita, no solo de quien lo posee" },
    { k: "Libertad de circulación y a migrar", v: "DUDH art. 13 · ninguna frontera interior en la calle" },
    { k: "No a la ciudadanía de segunda", v: "nadie es «uso impropio» del espacio público" },
  ],
};

// Las tres capas del mapa (+ la cuarta, en expansión).
export const LAYERS = [
  {
    id: "hostile",
    color: c.hostile,
    icon: "▲",
    title: "Arquitectura hostil",
    short:
      "Diseño pensado para expulsar: pinchos, bancos imposibles de usar, amenidades fantasma.",
    deep: "Estrategia que usa el entorno construido para restringir comportamientos «indeseables» —tumbarse, sentarse, refugiarse— y, con ello, expulsar a quienes más dependen del espacio público. Se clasifica por mecanismo (Rosenberger 2023): anti-tumbado, pinchos, barreras, vigilancia, luz/sonido, amenidades fantasma. No resuelve el sinhogarismo: lo desplaza y deshumaniza el espacio común.",
    source: "rosenberger",
    layer: "caliente · reporte ciudadano validado",
  },
  {
    id: "green",
    color: c.green,
    icon: "❋",
    title: "Déficit de verde",
    short:
      "Quién respira peor según su código postal. El verde no es estética: es salud.",
    deep: "Vivir en zonas más verdes se asocia con mejor salud mental y menor consumo de medicación (ISGlobal). La regla 3-30-300 fija el umbral: 3 árboles visibles desde casa, 30% de cubierta arbórea en el barrio, un verde de calidad a 300 m. El reparto desigual del verde es injusticia ambiental.",
    source: "isglobal",
    layer: "fría · precalculada de datos abiertos (Urban Atlas / NDVI)",
  },
  {
    id: "service",
    color: c.service,
    icon: "◉",
    title: "Falta de servicios",
    short:
      "Barrios donde lo básico no está a 15 minutos a pie. La ciudad desigual.",
    deep: "Accesibilidad peatonal a servicios esenciales —salud, educación, comercio, transporte— como indicador de equidad territorial (ciudad de 15 minutos). Se calcula con datos abiertos (OSM, indicadores de la Agenda Urbana Española) y se normaliza por población.",
    source: "aue",
    layer: "fría · precalculada de datos abiertos (OSM · AUE)",
  },
];

// Cómo funciona (3 pasos, simple).
export const HOW = [
  { n: 1, t: "Detecta", d: "Fotografías el objeto —nunca a la persona— y lo geolocalizas. El rostro se difumina en tu propio móvil antes de subir nada." },
  { n: 2, t: "Valida", d: "La comunidad confirma o rebate. Votación ponderada por reputación y contra-argumentos: un reposabrazos puede ser accesibilidad real." },
  { n: 3, t: "Presiona", d: "Documentar → visibilizar → presionar. El objetivo último es la reversión del mobiliario hostil y el reverdecimiento." },
];

// Área de expansión: la barrera del precio de la vivienda.
export const HOUSING = {
  color: c.housing,
  kicker: "Próxima capa · en preparación",
  title: "La barrera del precio de la vivienda",
  lead: "La arquitectura hostil es el síntoma visible. El precio de la vivienda es la barrera estructural que está detrás.",
  body: "Si el banco con pinchos expulsa de la acera, el precio de la vivienda expulsa de la ciudad entera. Ciudad Justa prepara una capa para cartografiar la presión del coste de la vivienda en España —esfuerzo de alquiler sobre la renta, desplazamiento de vecinos, turistificación, vivienda vacía— y cruzarla con las otras tres capas: ¿son los mismos barrios los que pierden verde, servicios Y acceso a la vivienda?",
  rightLink: { k: "Anclaje", v: "Derecho a la vivienda — art. 47 de la Constitución española" },
  // Métricas placeholder: se rellenarán con fuentes verificadas antes de publicar.
  metrics: [
    { value: "—", label: "% de la renta destinado al alquiler", todo: true },
    { value: "—", label: "barrios en riesgo de desplazamiento", todo: true },
    { value: "—", label: "viviendas vacías vs. demanda", todo: true },
  ],
  note: "Datos pendientes de incorporar con fuentes verificadas (INE, Índice de Precios del Alquiler, registros municipales). Esta sección es un marcador de expansión, no contenido cerrado.",
};
