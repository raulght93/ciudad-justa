// apps/web/src/components/MapSection.jsx
// Tu MapSection original con MapLibre, RE-TINTADO al sistema "Contradiseño".
// Lógica intacta (tiles CARTO dark_all, capa fría verde, capa caliente puntos,
// popup). Sólo cambian colores/tipografía vía tokens y un par de detalles.

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { c, font } from "../styles/tokens.js";
import { HOSTILE_POINTS, GREEN_DEFICIT, BARCELONA } from "../data/geo.js";
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

export default function MapSection() {
  const elRef = useRef(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!elRef.current) return;
    let map;
    try {
      map = new maplibregl.Map({ container: elRef.current, style: STYLE, center: BARCELONA.center, zoom: BARCELONA.zoom, attributionControl: { compact: true } });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.on("load", () => {
        map.addSource("green", { type: "geojson", data: GREEN_DEFICIT });
        fetch("/data/green-deficit.geojson").then((r) => (r.ok ? r.json() : null)).then((gj) => gj && map.getSource("green")?.setData(gj)).catch(() => {});
        map.addLayer({ id: "green-fill", type: "fill", source: "green",
          paint: { "fill-color": ["interpolate", ["linear"], ["get", "green_deficit_score"], 0, c.green, 0.5, "#d9c64a", 1, c.hostile], "fill-opacity": 0.32 } });

        map.addSource("hostile", { type: "geojson", data: HOSTILE_POINTS });
        let hotCtl;
        const loadHot = () => {
          const b = map.getBounds();
          const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
          hotCtl?.abort(); hotCtl = new AbortController();
          fetchReports(bbox, { signal: hotCtl.signal }).then((gj) => { if (gj.features.length > 0) map.getSource("hostile")?.setData(gj); }).catch(() => {});
        };
        loadHot();
        let hotTimer;
        map.on("moveend", () => { clearTimeout(hotTimer); hotTimer = setTimeout(loadHot, 350); });
        map.addLayer({ id: "hostile-pts", type: "circle", source: "hostile",
          paint: { "circle-radius": ["match", ["get", "status"], "confirmed", 8, "documented", 8, 6], "circle-color": c.hostile,
            "circle-opacity": ["match", ["get", "status"], "reported", 0.5, "disputed", 0.6, 0.92], "circle-stroke-width": 1.5, "circle-stroke-color": "#fff2" } });

        const popup = new maplibregl.Popup({ closeButton: false, offset: 12 });
        map.on("mouseenter", "hostile-pts", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "hostile-pts", () => { map.getCanvas().style.cursor = ""; popup.remove(); });
        map.on("click", "hostile-pts", (e) => {
          const p = e.features[0].properties;
          const cats = Array.isArray(p.categories) ? p.categories : JSON.parse(p.categories || "[]");
          popup.setLngLat(e.lngLat).setHTML(
            `<div style="font-family:${font.sans};max-width:220px">
               <strong style="color:${c.accentDeep}">${STATUS_LABEL[p.status] || p.status}</strong>
               <div style="margin-top:4px;color:#111">${p.description}</div>
               <div style="margin-top:6px;font-size:11px;color:#666">${cats.join(" · ")}</div>
             </div>`).addTo(map);
        });
      });
      map.on("error", () => setErr(true));
    } catch { setErr(true); }
    return () => map?.remove();
  }, []);

  return (
    <div id="mapa" style={{ borderTop: `1px solid ${c.line}`, background: c.bgAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(56px,9vw,110px) 22px" }}>
        <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: c.service, display: "flex", alignItems: "center", gap: 12 }}>
          02 <span style={{ width: 30, height: 2, background: c.service }} /> <span style={{ color: c.muted }}>El mapa</span>
        </div>
        <h2 style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "clamp(1.9rem,4.5vw,3rem)", margin: "16px 0 0", letterSpacing: "0.01em", lineHeight: 0.96, color: c.text }}>El mapa de la exclusión</h2>
        <p style={{ maxWidth: 620, marginTop: 14, color: c.muted, lineHeight: 1.6 }}>
          Demo con datos de ejemplo en Barcelona. Las zonas tintadas marcan déficit de verde (verde → rojo); los puntos, arquitectura hostil reportada. Pulsa un punto.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, margin: "20px 0 18px" }}>
          <Legend swatch={c.hostile} label="Arquitectura hostil (punto)" />
          <Legend swatch={c.green} label="Sin déficit de verde" />
          <Legend label="Déficit alto de verde" gradient />
        </div>
        <div ref={elRef} role="application" aria-label="Mapa de arquitectura hostil y déficit de verde en Barcelona"
          style={{ height: "min(62vh, 560px)", width: "100%", overflow: "hidden", border: `2px solid ${c.text}` }} />
        {err && <p style={{ marginTop: 12, color: c.faint, fontSize: 14 }}>No se pudieron cargar las teselas del mapa. El resto de la página funciona igual.</p>}
        <p style={{ marginTop: 14, fontFamily: font.mono, fontSize: 12, color: c.faint }}>
          Datos ilustrativos. La capa caliente vendría de la API (reportes validados) y las frías de Urban Atlas / NDVI / OSM precalculadas.
        </p>
      </div>
    </div>
  );
}

function Legend({ swatch, label, gradient }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: c.muted, fontFamily: font.mono, letterSpacing: "0.04em" }}>
      <span style={{ width: 16, height: 16, background: gradient ? `linear-gradient(90deg, ${c.green}, #d9c64a, ${c.hostile})` : swatch, display: "inline-block", border: `1px solid ${c.line}` }} />
      {label}
    </span>
  );
}
