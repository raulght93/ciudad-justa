// Mapa de un "caso" (una ciudad · una o más capas). Monta MapLibre SOLO al
// entrar en viewport (3 mapas en la página → no 3 instancias vivas a la vez).
// Interactividad media: zoom/pan, popup en puntos, leyenda, toggle de capas.
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
const EMPTY = { type: "FeatureCollection", features: [] };

export default function CaseMap({ caseDef }) {
  const wrapRef = useRef(null);
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(caseDef.layers[0].key);
  const [err, setErr] = useState(false);

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
      map = new maplibreInit(elRef.current, caseDef);
      mapRef.current = map.map;
      map.map.on("error", () => setErr(true));
      map.ready.catch(() => setErr(true));
    } catch { setErr(true); }
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [visible, caseDef]);

  // Toggle de capa activa → visibilidad en MapLibre.
  function pick(key) {
    setActive(key);
    const map = mapRef.current;
    if (!map) return;
    for (const l of caseDef.layers) {
      const id = `${caseDef.id}-${l.key}`;
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", l.key === key ? "visible" : "none");
    }
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
                style={{ cursor: "pointer", fontFamily: font.mono, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em",
                  padding: "7px 13px", borderRadius: 0, border: `2px solid ${on ? caseDef.color : c.lineStrong}`,
                  background: on ? caseDef.color : "transparent", color: on ? "#0a0a0b" : c.muted }}>
                {l.label}
              </button>
            );
          })}
        </div>
      )}

      <div ref={elRef} role="application" aria-label={`Mapa de ${caseDef.city} · ${caseDef.title}`}
        style={{ height: "min(58vh, 520px)", width: "100%", border: `2px solid ${c.text}`, background: c.bgAlt }} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
        <Legend layer={activeLayer} color={caseDef.color} />
      </div>
      {err && <p style={{ marginTop: 10, fontFamily: font.mono, fontSize: 12, color: c.faint }}>No se pudieron cargar las teselas. El resto de la página funciona igual.</p>}
    </div>
  );
}

// Inicializa el mapa, fuentes y capas del caso. Devuelve { map, ready }.
function maplibreInit(container, caseDef) {
  const map = new maplibregl.Map({ container, style: STYLE, center: caseDef.center, zoom: caseDef.zoom, attributionControl: { compact: true } });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

  const ready = new Promise((res, rej) => {
    map.on("load", async () => {
      try {
        for (let i = 0; i < caseDef.layers.length; i++) {
          const l = caseDef.layers[i];
          const srcId = `${caseDef.id}-${l.key}`;
          const visibility = i === 0 ? "visible" : "none";
          map.addSource(srcId, { type: "geojson", data: l.embedded || EMPTY });

          if (l.kind === "choropleth") {
            map.addLayer({ id: srcId, type: "fill", source: srcId, layout: { visibility },
              paint: { "fill-color": ["interpolate", ["linear"], ["get", l.prop], ...l.ramp], "fill-opacity": 0.45, "fill-outline-color": c.line } });
          } else {
            map.addLayer({ id: srcId, type: "circle", source: srcId, layout: { visibility },
              paint: { "circle-radius": ["match", ["get", "status"], "confirmed", 8, "documented", 8, 6], "circle-color": caseDef.color,
                "circle-opacity": ["match", ["get", "status"], "reported", 0.5, "disputed", 0.6, 0.92], "circle-stroke-width": 1.5, "circle-stroke-color": "#fff2" } });
            wirePopup(map, srcId);
          }

          // Carga remota (con fallback al embedded ya pintado).
          if (l.url) {
            fetch(l.url).then((r) => (r.ok ? r.json() : null)).then((gj) => gj && map.getSource(srcId)?.setData(gj)).catch(() => {});
          }
          if (l.api) {
            const loadHot = () => {
              const b = map.getBounds();
              fetchReports([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()])
                .then((gj) => { if (gj.features.length) map.getSource(srcId)?.setData(gj); }).catch(() => {});
            };
            loadHot();
            let t; map.on("moveend", () => { clearTimeout(t); t = setTimeout(loadHot, 350); });
          }
        }
        res();
      } catch (e) { rej(e); }
    });
  });
  return { map, ready };
}

function wirePopup(map, layerId) {
  const popup = new maplibregl.Popup({ closeButton: false, offset: 12 });
  map.on("mouseenter", layerId, () => (map.getCanvas().style.cursor = "pointer"));
  map.on("mouseleave", layerId, () => { map.getCanvas().style.cursor = ""; popup.remove(); });
  map.on("click", layerId, (e) => {
    const p = e.features[0].properties;
    const cats = Array.isArray(p.categories) ? p.categories : JSON.parse(p.categories || "[]");
    popup.setLngLat(e.lngLat).setHTML(
      `<div style="font-family:${font.sans};max-width:220px">
         <strong style="color:${c.accentDeep}">${STATUS_LABEL[p.status] || p.status}</strong>
         <div style="margin-top:4px;color:#111">${p.description || ""}</div>
         <div style="margin-top:6px;font-size:11px;color:#666">${cats.join(" · ")}</div>
       </div>`).addTo(map);
  });
}

function Legend({ layer, color }) {
  if (!layer) return null;
  if (layer.kind === "points") {
    return (
      <span style={legendStyle()}>
        <span style={{ width: 14, height: 14, borderRadius: 999, background: color, border: `1px solid ${c.line}` }} /> Punto reportado · pulsa para detalle
      </span>
    );
  }
  const lo = layer.ramp[1], hi = layer.ramp[layer.ramp.length - 1];
  return (
    <span style={legendStyle()}>
      <span style={{ width: 64, height: 12, background: `linear-gradient(90deg, ${lo}, ${hi})`, border: `1px solid ${c.line}` }} /> menos → más {layer.key === "housing" ? "presión" : "déficit"}
    </span>
  );
}
function legendStyle() {
  return { display: "inline-flex", alignItems: "center", gap: 8, fontFamily: font.mono, fontSize: 12, letterSpacing: "0.04em", color: c.muted };
}
