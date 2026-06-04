// Datos de ejemplo embebidos para que el mapa funcione sin backend (Fase 0
// divulgativa). En producción, la capa caliente vendría de GET /api/reports y
// las frías de PMTiles/GeoJSON en R2 (docs/03 §3.5). Coords aprox. de Barcelona,
// ILUSTRATIVAS — no son reportes verificados.

export const HOSTILE_POINTS = {
  type: "FeatureCollection",
  features: [
    f(2.1734, 41.3851, "confirmed", ["anti_lie_down", "barrier"], "Banco con apoyabrazos divisorios"),
    f(2.1700, 41.3870, "reported", ["spikes"], "Pinchos en repisa de portal"),
    f(2.1650, 41.3820, "disputed", ["anti_sit"], "Barra inclinada: ¿accesibilidad o anti-permanencia?"),
    f(2.1810, 41.3895, "confirmed", ["ghost_amenity"], "Banco y fuente retirados de la plaza"),
    f(2.1772, 41.3788, "confirmed", ["light_sound"], "Iluminación azul disuasoria bajo soportal"),
    f(2.1625, 41.3902, "reported", ["surveillance"], "Cámara orientada a zona de estancia"),
    f(2.1888, 41.3835, "confirmed", ["spikes", "barrier"], "Rocas y pinchos bajo paso elevado"),
    f(2.1690, 41.3955, "documented", ["anti_lie_down"], "Bancos segmentados retirados tras presión vecinal"),
    f(2.1605, 41.3868, "confirmed", ["anti_sit"], "Asientos individuales abatibles en parada"),
    f(2.1845, 41.3792, "reported", ["surface"], "Suelo de grava gruesa bajo cornisa"),
    f(2.1758, 41.3922, "confirmed", ["barrier"], "Bolardos cerrando hueco de soportal"),
    f(2.1920, 41.3878, "under_review", ["anti_lie_down", "anti_sit"], "Banco curvo de una sola plaza"),
    f(2.1668, 41.3788, "reported", ["light_sound"], "Dispositivo de sonido agudo en acceso a aparcamiento"),
    f(2.1712, 41.3812, "confirmed", ["ghost_amenity"], "Aseo público clausurado sin alternativa"),
    f(2.1870, 41.3940, "disputed", ["barrier"], "Maceteros alineados que bloquean el resguardo"),
    f(2.1583, 41.3835, "confirmed", ["spikes"], "Pinchos en alféizar a la altura de la calle"),
  ],
};

function f(lng, lat, status, categories, description) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [lng, lat] },
    properties: { status, categories, description },
  };
}

// Capa fría de ejemplo: déficit de verde por celda (coropleta).
export const GREEN_DEFICIT = {
  type: "FeatureCollection",
  features: [
    cell(2.155, 41.378, 0.02, 0.78, "11% cubierta · 38% a <300 m"),
    cell(2.175, 41.378, 0.02, 0.12, "33% cubierta · 91% a <300 m"),
    cell(2.155, 41.398, 0.02, 0.61, "18% cubierta · 55% a <300 m"),
    cell(2.175, 41.398, 0.02, 0.34, "27% cubierta · 74% a <300 m"),
    cell(2.195, 41.378, 0.02, 0.88, "8% cubierta · 22% a <300 m"),
    cell(2.195, 41.398, 0.02, 0.46, "24% cubierta · 66% a <300 m"),
    cell(2.155, 41.418, 0.02, 0.53, "21% cubierta · 60% a <300 m"),
    cell(2.175, 41.418, 0.02, 0.27, "29% cubierta · 80% a <300 m"),
    cell(2.195, 41.418, 0.02, 0.69, "14% cubierta · 44% a <300 m"),
  ],
};

function cell(lng, lat, s, deficit, detail) {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [lng, lat], [lng + s, lat], [lng + s, lat + s], [lng, lat + s], [lng, lat],
      ]],
    },
    properties: { green_deficit_score: deficit, detail },
  };
}

export const BARCELONA = { center: [2.174, 41.388], zoom: 12.3 };
