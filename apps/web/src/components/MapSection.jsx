import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { c, font, radius } from "../styles/tokens.js";
import { HOSTILE_POINTS, GREEN_DEFICIT, BARCELONA } from "../data/geo.js";

// Basemap raster de CARTO (sin API key, hot-linkable; mismo patrón que
// africa-trip-planning). En producción: estilo vector + capas frías en PMTiles.
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

const STATUS_LABEL = {
  reported: "Sin verificar",
  under_review: "En revisión",
  confirmed: "Confirmado",
  disputed: "En discusión",
  documented: "Documentado",
  rejected: "Descartado",
};

export default function MapSection() {
  const elRef = useRef(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!elRef.current) return;
    let map;
    try {
      map = new maplibregl.Map({
        container: elRef.current,
        style: STYLE,
        center: BARCELONA.center,
        zoom: BARCELONA.zoom,
        attributionControl: { compact: true },
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

      map.on("load", () => {
        // Capa fría: déficit de verde (coropleta). Se pinta al instante con los
        // datos embebidos y, si existe el GeoJSON generado por el pipeline
        // (pipeline/build-green-layer.mjs → /data/green-deficit.geojson), se
        // sustituye al vuelo. Fallback robusto si no está o falla la red.
        map.addSource("green", { type: "geojson", data: GREEN_DEFICIT });
        fetch("/data/green-deficit.geojson")
          .then((r) => (r.ok ? r.json() : null))
          .then((gj) => gj && map.getSource("green")?.setData(gj))
          .catch(() => {});
        map.addLayer({
          id: "green-fill",
          type: "fill",
          source: "green",
          paint: {
            "fill-color": [
              "interpolate", ["linear"], ["get", "green_deficit_score"],
              0, c.green, 0.5, "#d9c64a", 1, c.hostile,
            ],
            "fill-opacity": 0.32,
          },
        });

        // Capa caliente: puntos de arquitectura hostil.
        map.addSource("hostile", { type: "geojson", data: HOSTILE_POINTS });
        map.addLayer({
          id: "hostile-pts",
          type: "circle",
          source: "hostile",
          paint: {
            "circle-radius": ["match", ["get", "status"], "confirmed", 8, "documented", 8, 6],
            "circle-color": c.hostile,
            "circle-opacity": ["match", ["get", "status"], "reported", 0.5, "disputed", 0.6, 0.92],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#fff2",
          },
        });

        const popup = new maplibregl.Popup({ closeButton: false, offset: 12 });
        map.on("mouseenter", "hostile-pts", () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", "hostile-pts", () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });
        map.on("click", "hostile-pts", (e) => {
          const p = e.features[0].properties;
          const cats = Array.isArray(p.categories) ? p.categories : JSON.parse(p.categories || "[]");
          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div style="font-family:${font.sans};max-width:220px">
                 <strong style="color:${c.hostile}">${STATUS_LABEL[p.status] || p.status}</strong>
                 <div style="margin-top:4px;color:#111">${p.description}</div>
                 <div style="margin-top:6px;font-size:11px;color:#666">${cats.join(" · ")}</div>
               </div>`
            )
            .addTo(map);
        });
      });
      map.on("error", () => setErr(true));
    } catch {
      setErr(true);
    }
    return () => map?.remove();
  }, []);

  return (
    <div id="mapa" style={{ borderTop: `1px solid ${c.line}`, background: c.bgAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(56px,9vw,110px) 22px" }}>
        <h2
          style={{
            fontFamily: font.serif,
            fontWeight: 900,
            fontSize: "clamp(1.9rem,4.5vw,3rem)",
            margin: 0,
            letterSpacing: "-0.02em",
            color: c.text,
          }}
        >
          El mapa de la exclusión
        </h2>
        <p style={{ maxWidth: 620, marginTop: 14, color: c.muted, lineHeight: 1.6 }}>
          Demo con datos de ejemplo en Barcelona. Las zonas tintadas marcan déficit de verde
          (verde → rojo); los puntos, arquitectura hostil reportada. Pulsa un punto.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 18, margin: "20px 0 18px" }}>
          <Legend swatch={c.hostile} label="Arquitectura hostil (punto)" />
          <Legend swatch={c.green} label="Sin déficit de verde" />
          <Legend swatch={c.hostile} label="Déficit alto de verde" gradient />
        </div>

        <div
          ref={elRef}
          role="application"
          aria-label="Mapa de arquitectura hostil y déficit de verde en Barcelona"
          style={{
            height: "min(62vh, 560px)",
            width: "100%",
            borderRadius: radius.lg,
            overflow: "hidden",
            border: `1px solid ${c.line}`,
          }}
        />
        {err && (
          <p style={{ marginTop: 12, color: c.faint, fontSize: 14 }}>
            No se pudieron cargar las teselas del mapa (sin conexión o tiles bloqueados). El
            resto de la página funciona igual.
          </p>
        )}
        <p style={{ marginTop: 14, fontSize: 12.5, color: c.faint }}>
          Datos ilustrativos. La capa caliente vendría de la API (reportes validados) y las
          frías de Urban Atlas / NDVI / OSM precalculadas (ver docs/03–04).
        </p>
      </div>
    </div>
  );
}

function Legend({ swatch, label, gradient }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: c.muted }}>
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: 5,
          background: gradient ? `linear-gradient(90deg, ${c.green}, #d9c64a, ${c.hostile})` : swatch,
          display: "inline-block",
          border: `1px solid ${c.line}`,
        }}
      />
      {label}
    </span>
  );
}
