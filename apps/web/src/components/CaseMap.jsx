// Mapa de un "caso" (una ciudad · una o más capas). Monta MapLibre SOLO al
// entrar en viewport (3 mapas en la página → no 3 instancias vivas a la vez).
// Capas: points (hostil, popup), choropleth (coropleta + tooltip al pasar),
// price (pins HTML estilo Idealista, clicables). Toggle entre capas.
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { c, font } from "../styles/tokens.js";
import { fetchReports } from "../api/reports.js";

const STYLE = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap · © CARTO",
    },
  },
  layers: [{ id: "carto", type: "raster", source: "carto" }],
};
const STATUS_LABEL = { reported: "Sin verificar", under_review: "En revisión", confirmed: "Confirmado", disputed: "En discusión", documented: "Documentado", rejected: "Descartado" };
const TYPE_LABEL = { hostile: "Hostil", climate: "Clima y verde", housing: "Vivienda", service: "Servicios" };
const TYPE_COLOR = { hostile: c.hostile, climate: c.green, housing: c.housing, service: c.service };
const EMPTY = { type: "FeatureCollection", features: [] };

export default function CaseMap({ caseDef }) {
  const wrapRef = useRef(null);
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const dataRef = useRef({});
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(caseDef.layers[0].key);
  const [err, setErr] = useState(false);
  const color = caseDef.color;

  function clearMarkers() { markersRef.current.forEach((m) => m.remove()); markersRef.current = []; }

  async function addPriceMarkers(layer) {
    const map = mapRef.current;
    if (!map) return;
    let fc = dataRef.current[layer.key];
    if (!fc) {
      try { fc = await (await fetch(layer.url)).json(); dataRef.current[layer.key] = fc; } catch { return; }
    }
    for (const f of fc.features) {
      const el = document.createElement("div");
      el.style.cssText = `font-family:${font.mono};font-size:12px;font-weight:700;color:#0a0a0b;background:${color};border:2px solid #0a0a0b;padding:4px 8px;white-space:nowrap;cursor:pointer;box-shadow:2px 2px 0 0 #0a0a0b`;
      el.textContent = f.properties.price;
      const popup = new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(
        `<div style="font-family:${font.sans};max-width:230px">
           <strong style="color:${c.housingTx || color}">${f.properties.price}</strong>
           <span style="font-size:11px;color:#666"> · ${f.properties.kind || ""}</span>
           <div style="margin-top:4px;color:#111">${f.properties.detail || ""}</div>
           <div style="margin-top:6px;font-size:10px;color:#999">muestra ilustrativa · no es un listado real</div>
         </div>`);
      markersRef.current.push(new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat(f.geometry.coordinates).setPopup(popup).addTo(map));
    }
  }

  // Monta el mapa solo cuando el contenedor entra en viewport.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { setVisible(true); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !elRef.current || mapRef.current) return;
    let map;
    try {
      map = new maplibregl.Map({ container: elRef.current, style: STYLE, center: caseDef.center, zoom: caseDef.zoom,
        attributionControl: { compact: true }, cooperativeGestures: true,
        locale: {
          "CooperativeGesturesHandler.MobileHelpText": "Usa dos dedos para mover el mapa",
          "CooperativeGesturesHandler.WindowsHelpText": "Usa Ctrl + rueda para hacer zoom",
        } });
      mapRef.current = map;
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.on("error", () => setErr(true));
      const hover = new maplibregl.Popup({ closeButton: false, offset: 8 });

      map.on("load", () => {
        caseDef.layers.forEach((l, i) => {
          const id = `${caseDef.id}-${l.key}`;
          const visibility = i === 0 ? "visible" : "none";
          if (l.kind === "price") {
            if (i === 0) addPriceMarkers(l); // por defecto solo si es la primera capa
            return; // los precios son marcadores HTML, no capas de estilo
          }
          map.addSource(id, { type: "geojson", data: l.embedded || EMPTY });
          if (l.kind === "choropleth") {
            map.addLayer({ id, type: "fill", source: id, layout: { visibility }, paint: { "fill-color": ["interpolate", ["linear"], ["get", l.prop], ...l.ramp], "fill-opacity": 0.45, "fill-outline-color": c.line } });
            map.on("mousemove", id, (e) => { map.getCanvas().style.cursor = "pointer"; const p = e.features[0].properties; hover.setLngLat(e.lngLat).setHTML(`<div style="font-family:${font.mono};font-size:11px;color:#111"><strong>${p.barrio || p.zona || p.cusec || ""}</strong><br>${p.detail || ""}</div>`).addTo(map); });
            map.on("mouseleave", id, () => { map.getCanvas().style.cursor = ""; hover.remove(); });
          } else {
            map.addLayer({ id, type: "circle", source: id, layout: { visibility }, paint: {
              "circle-radius": ["match", ["get", "status"], "confirmed", 8, "documented", 8, 6],
              "circle-color": ["match", ["get", "type"], "climate", c.green, "housing", c.housing, "service", c.service, "hostile", c.hostile, color],
              "circle-opacity": ["match", ["get", "status"], "reported", 0.5, "disputed", 0.6, 0.92], "circle-stroke-width": 1.5, "circle-stroke-color": "#fff2" } });
            wirePopup(map, id);
          }
          if (l.url) fetch(l.url).then((r) => (r.ok ? r.json() : null)).then((gj) => gj && map.getSource(id)?.setData(gj)).catch(() => {});
          if (l.api) {
            const loadHot = () => { const b = map.getBounds(); fetchReports([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]).then((gj) => { if (gj.features.length) map.getSource(id)?.setData(gj); }).catch(() => {}); };
            loadHot();
            let t; map.on("moveend", () => { clearTimeout(t); t = setTimeout(loadHot, 350); });
          }
        });
      });
    } catch { setErr(true); }
    return () => { clearMarkers(); mapRef.current?.remove(); mapRef.current = null; };
  }, [visible, caseDef]);

  // Toggle de capa activa.
  function pick(key) {
    setActive(key);
    const map = mapRef.current;
    if (!map) return;
    clearMarkers();
    for (const l of caseDef.layers) {
      if (l.kind === "price") continue;
      const id = `${caseDef.id}-${l.key}`;
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", l.key === key ? "visible" : "none");
    }
    const al = caseDef.layers.find((l) => l.key === key);
    if (al?.kind === "price") addPriceMarkers(al);
  }

  const activeLayer = caseDef.layers.find((l) => l.key === active);

  return (
    <div ref={wrapRef}>
      {caseDef.layers.length > 1 && (
        <div role="group" aria-label="Capas" style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {caseDef.layers.map((l) => {
            const on = l.key === active;
            return (
              <button key={l.key} onClick={() => pick(l.key)} aria-pressed={on}
                style={{ cursor: "pointer", fontFamily: font.mono, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", padding: "7px 13px", borderRadius: 0, border: `2px solid ${on ? color : c.lineStrong}`, background: on ? color : "transparent", color: on ? "#0a0a0b" : c.muted }}>
                {l.label}
              </button>
            );
          })}
        </div>
      )}

      <div ref={elRef} role="application" aria-label={`Mapa de ${caseDef.city} · ${caseDef.title}`}
        style={{ height: "min(58vh, 520px)", width: "100%", border: `2px solid ${c.text}`, background: c.bgAlt }} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
        <Legend layer={activeLayer} color={color} />
      </div>
      {err && <p style={{ marginTop: 10, fontFamily: font.mono, fontSize: 12, color: c.faint }}>No se pudieron cargar las teselas. El resto de la página funciona igual.</p>}
    </div>
  );
}

function wirePopup(map, layerId) {
  const popup = new maplibregl.Popup({ closeButton: false, offset: 12 });
  map.on("mouseenter", layerId, () => (map.getCanvas().style.cursor = "pointer"));
  map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; popup.remove(); });
  map.on("click", layerId, (e) => {
    const p = e.features[0].properties;
    const cats = Array.isArray(p.categories) ? p.categories : JSON.parse(p.categories || "[]");
    const tcol = TYPE_COLOR[p.type] || c.accentDeep;
    popup.setLngLat(e.lngLat).setHTML(
      `<div style="font-family:${font.sans};max-width:220px">
         <span style="font-family:monospace;font-size:10px;font-weight:700;text-transform:uppercase;background:${tcol};color:#0a0a0b;padding:2px 6px">${TYPE_LABEL[p.type] || "Hostil"}</span>
         <strong style="color:#111;margin-left:6px">${STATUS_LABEL[p.status] || p.status}</strong>
         <div style="margin-top:5px;color:#111">${p.description || ""}</div>
         <div style="margin-top:6px;font-size:11px;color:#666">${cats.join(" · ")}</div>
       </div>`).addTo(map);
  });
}

function Legend({ layer, color }) {
  if (!layer) return null;
  if (layer.kind === "points") {
    return (
      <span style={ls()}>
        {Object.entries(TYPE_COLOR).map(([k, col]) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, marginRight: 12 }}>
            <span style={{ width: 11, height: 11, borderRadius: 999, background: col, border: `1px solid ${c.line}` }} /> {TYPE_LABEL[k]}
          </span>
        ))}
      </span>
    );
  }
  if (layer.kind === "price") {
    return <span style={ls()}><span style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 700, color: "#0a0a0b", background: color, border: "2px solid #0a0a0b", padding: "2px 6px" }}>€</span> Ejemplos de precio (muestra) · pulsa el pin</span>;
  }
  const lo = layer.ramp[1], hi = layer.ramp[layer.ramp.length - 1];
  const WORDS = { housing: "presión", income: "vulnerabilidad (menor renta)", rent: "€/m² alquiler", index: "exclusión combinada" };
  const word = WORDS[layer.key] || "déficit";
  return <span style={ls()}><span style={{ width: 64, height: 12, background: `linear-gradient(90deg, ${lo}, ${hi})`, border: `1px solid ${c.line}` }} /> menos → más {word}</span>;
}
function ls() { return { display: "inline-flex", alignItems: "center", gap: 8, fontFamily: font.mono, fontSize: 12, letterSpacing: "0.04em", color: c.muted }; }
