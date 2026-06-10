// Flujo de reporte (#/reportar). Demo interno: tipo → subtipo, foto con blur-gate
// (preview), ubicación con zona (geocodificación inversa) y envío al Worker+D1.
// Hasta la DPIA + entidad jurídica (docs/06) es PREVIEW, no abierto al público.
import { useEffect, useState } from "react";
import { c, font } from "../styles/tokens.js";
import { REPORT_TYPES } from "../data/content.js";
import { prepareForUpload, stripOnly, GateBlocked } from "../lib/photoGate.js";
import { submitReport, uploadPhoto } from "../api/reports.js";
import { Brand, Icon } from "./primitives.jsx";

const ls = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch { return null; } };
function deviceId() {
  let d = ls("cj-device");
  if (!d) { d = "dev-" + Math.abs(Date.now() % 1e8).toString(36); ls("cj-device", d); }
  return d;
}

// Geocodificación inversa (OSM Nominatim) → "barrio · ciudad".
async function lookupZone(lat, lng) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=16&addressdetails=1&lat=${lat}&lon=${lng}`, { headers: { Accept: "application/json" } });
    const j = await r.json();
    const a = j.address || {};
    const barrio = a.neighbourhood || a.suburb || a.quarter || a.city_district || a.residential || "";
    const ciudad = a.city || a.town || a.village || a.municipality || a.county || "";
    return [barrio, ciudad].filter(Boolean).join(" · ") || (j.display_name ? j.display_name.split(",").slice(0, 2).join(", ") : null);
  } catch { return null; }
}

export default function ReportPanel() {
  const [type, setType] = useState("hostile");
  const [subs, setSubs] = useState([]);
  const [photo, setPhoto] = useState(null); // { url, blob, blurred, facesFound, unverified }
  const [lat, setLat] = useState("41.388");
  const [lng, setLng] = useState("2.174");
  const [zone, setZone] = useState(null);
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const typeDef = REPORT_TYPES.find((t) => t.key === type) || REPORT_TYPES[0];
  const col = typeDef.color;

  // Zona por geocodificación inversa (debounce; no spamear Nominatim).
  useEffect(() => {
    if (!lat || !lng || Number.isNaN(+lat) || Number.isNaN(+lng)) { setZone(null); return; }
    setZone("buscando…");
    const t = setTimeout(async () => setZone(await lookupZone(lat, lng)), 900);
    return () => clearTimeout(t);
  }, [lat, lng]);

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    try {
      const r = await prepareForUpload(file);
      setPhoto({ url: URL.createObjectURL(r.blob), blob: r.blob, blurred: r.blurred, facesFound: r.facesFound });
    } catch (err) {
      if (err instanceof GateBlocked && err.reason === "no-detector") {
        // Navegador sin detección de rostros: preview de demo (EXIF fuera), avisa.
        const r = await stripOnly(file);
        setPhoto({ url: URL.createObjectURL(r.blob), blob: r.blob, unverified: true });
        setMsg("Tu navegador no difumina rostros automáticamente: revisa/recorta las caras antes de publicar.");
      } else {
        setPhoto(null);
        setMsg(err instanceof GateBlocked ? `🚫 ${err.message}` : `Error procesando la imagen: ${err.message}`);
      }
    }
  }

  function geolocate() {
    if (!navigator.geolocation) return setMsg("Geolocalización no disponible.");
    navigator.geolocation.getCurrentPosition(
      (p) => { setLat(p.coords.latitude.toFixed(5)); setLng(p.coords.longitude.toFixed(5)); },
      () => setMsg("No se pudo obtener la ubicación."),
    );
  }

  const pickType = (k) => { setType(k); setSubs([]); };
  const toggleSub = (k) => setSubs((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]));

  async function submit() {
    setBusy(true); setMsg(null);
    try {
      const device = deviceId();
      const r = await submitReport({ lat: +lat, lng: +lng, type, categories: subs, description: desc || undefined, device });
      if (photo?.blob) await uploadPhoto(r.id, photo.blob, { device });
      setMsg(`✓ Reporte enviado (#${r.id.slice(0, 8)}, ${r.status}).`);
      setPhoto(null); setSubs([]); setDesc("");
    } catch (err) { setMsg(`Error al enviar: ${err.message}`); }
    setBusy(false);
  }

  return (
    <div style={{ background: c.bg, color: c.text, fontFamily: font.sans, minHeight: "100vh" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 22px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${c.text}`, paddingBottom: 18 }}>
          <Brand size={28} />
          <span style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: c.yellow }}>Reportar · preview</span>
        </div>

        <h1 style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "clamp(2rem,6vw,3.2rem)", letterSpacing: "0.02em", lineHeight: 0.95, margin: "26px 0 0" }}>
          Documenta una exclusión
        </h1>
        <p style={{ marginTop: 12, color: c.muted, lineHeight: 1.55, maxWidth: "60ch" }}>
          Barreras, falta de verde, calor, alquiler abusivo o falta de servicios. Si subes foto,
          fotografía el <strong style={{ color: c.text }}>objeto</strong>, no a las personas.
        </p>

        {/* 1 · Qué reportas — tipo general (botones con color) → detalle (subtipo) */}
        <div style={field()}>1 · Qué reportas</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginTop: 10 }}>
          {REPORT_TYPES.map((t) => {
            const on = type === t.key;
            return (
              <button key={t.key} onClick={() => pickType(t.key)} aria-pressed={on}
                style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left",
                  padding: "12px 14px", borderRadius: 0, border: `2px solid ${on ? t.color : c.lineStrong}`,
                  background: on ? t.color : "transparent", color: on ? "#0a0a0b" : c.text }}>
                <span aria-hidden style={{ width: 13, height: 13, flex: "0 0 auto", background: on ? "#0a0a0b" : t.color }} />
                <span style={{ fontFamily: font.sans, fontWeight: 700, fontSize: 14 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 16, paddingLeft: 14, borderLeft: `3px solid ${col}` }}>
          <div style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: c.faint }}>
            Detalle · {typeDef.label} <span style={{ color: c.lineStrong }}>· opcional</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {typeDef.subtypes.map(([k, label]) => {
              const on = subs.includes(k);
              return (
                <button key={k} onClick={() => toggleSub(k)} aria-pressed={on}
                  style={{ cursor: "pointer", fontFamily: font.mono, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em",
                    padding: "6px 12px", borderRadius: 999, border: `1.5px solid ${on ? col : c.lineStrong}`,
                    background: on ? col : "transparent", color: on ? "#0a0a0b" : c.muted }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2 · Foto */}
        <label style={field()}>2 · Foto (opcional)
          <input type="file" accept="image/*" capture="environment" onChange={onPhoto} style={{ display: "block", marginTop: 8, color: c.muted, fontFamily: font.mono, fontSize: 13 }} />
        </label>
        {photo && (
          <div style={{ marginTop: 12, border: `1px solid ${c.line}`, padding: 10, display: "inline-block", maxWidth: "100%" }}>
            <img src={photo.url} alt="Previsualización de la foto" style={{ maxWidth: "100%", maxHeight: 240, display: "block" }} />
            <div style={{ marginTop: 8, fontFamily: font.mono, fontSize: 11, color: photo.unverified ? c.hostileTx : photo.blurred ? c.yellow : c.faint }}>
              {photo.unverified ? "⚠ rostros sin verificar — difumina a mano" : photo.blurred ? `● ${photo.facesFound} rostro(s) difuminado(s)` : "○ sin rostros detectados"}
            </div>
          </div>
        )}

        {/* 3 · Ubicación */}
        <div style={field()}>3 · Ubicación
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input aria-label="Latitud" value={lat} onChange={(e) => setLat(e.target.value)} style={inp(120)} inputMode="decimal" />
            <input aria-label="Longitud" value={lng} onChange={(e) => setLng(e.target.value)} style={inp(120)} inputMode="decimal" />
            <button onClick={geolocate} style={ghostBtn()}><Icon name="arrowUpRight" size={13} /> Usar mi ubicación</button>
          </div>
          {zone && <div style={{ marginTop: 8, fontFamily: font.mono, fontSize: 12, color: c.muted, textTransform: "none", letterSpacing: 0 }}>Zona: <span style={{ color: c.text }}>{zone}</span> <span style={{ color: c.faint }}>· OSM</span></div>}
        </div>

        {/* 4 · Descripción */}
        <label style={field()}>4 · Descripción (opcional)
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={280}
            placeholder="Describe qué pasa y dónde. No identifiques a personas ni negocios concretos."
            style={{ display: "block", marginTop: 8, width: "100%", background: c.bg, color: c.text, border: `1px solid ${c.lineStrong}`, padding: "10px 12px", fontFamily: font.sans, fontSize: 15, borderRadius: 0, resize: "vertical" }} />
        </label>

        <div style={{ display: "flex", gap: 12, marginTop: 22, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={submit} disabled={busy} style={{ cursor: "pointer", background: col, color: "#0a0a0b", border: "2px solid transparent",
            fontFamily: font.sans, fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.02em", padding: "13px 24px", borderRadius: 0 }}>
            {busy ? "Enviando…" : "Enviar reporte"}
          </button>
          {msg && <span role="status" style={{ fontFamily: font.mono, fontSize: 12.5, color: c.muted, maxWidth: "44ch" }}>{msg}</span>}
        </div>

        <p style={{ marginTop: 28, fontFamily: font.mono, fontSize: 11, color: c.faint, lineHeight: 1.6 }}>
          <Icon name="arrowUpRight" size={12} /> Preview interno. Abrirlo al público con datos reales
          requiere antes la DPIA y la entidad jurídica (docs/06). Zona vía OpenStreetMap / Nominatim.
        </p>
      </div>
    </div>
  );
}

function field() { return { display: "block", marginTop: 24, fontFamily: font.mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: c.yellow }; }
function inp(w) { return { width: w, background: c.bg, color: c.text, border: `1px solid ${c.lineStrong}`, padding: "10px 12px", fontFamily: font.mono, fontSize: 14, borderRadius: 0 }; }
function ghostBtn() { return { cursor: "pointer", background: "transparent", border: `2px solid ${c.text}`, color: c.text, fontFamily: font.mono, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", padding: "9px 14px", borderRadius: 0, display: "inline-flex", alignItems: "center", gap: 7 }; }
