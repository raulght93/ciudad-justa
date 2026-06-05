// Flujo de reporte (E1d · UI). Ruta #/reportar. Demuestra el blur-gate de punta
// a punta: foto → difuminado en cliente (gate) → crear reporte → subir foto a R2.
// Aviso: hasta la DPIA + entidad jurídica (docs/06), esto es PREVIEW interno; no
// se abre al público con datos reales.
import { useState } from "react";
import { c, font } from "../styles/tokens.js";
import { prepareForUpload, GateBlocked } from "../lib/photoGate.js";
import { submitReport, uploadPhoto } from "../api/reports.js";
import { Brand, Icon } from "./primitives.jsx";

const CATS = [
  ["anti_lie_down", "Anti-tumbado"], ["anti_sit", "Anti-sentarse"], ["spikes", "Pinchos"],
  ["barrier", "Barreras"], ["surface", "Superficie"], ["surveillance", "Vigilancia"],
  ["light_sound", "Luz / sonido"], ["ghost_amenity", "Amenidad fantasma"],
];
const ls = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch { return null; } };
function deviceId() {
  let d = ls("cj-device");
  if (!d) { d = "dev-" + Math.abs(Date.now() % 1e8).toString(36); ls("cj-device", d); }
  return d;
}

export default function ReportPanel() {
  const [photo, setPhoto] = useState(null); // { url, blob, blurred, facesFound }
  const [lat, setLat] = useState("41.388");
  const [lng, setLng] = useState("2.174");
  const [cats, setCats] = useState([]);
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    try {
      const r = await prepareForUpload(file);
      setPhoto({ url: URL.createObjectURL(r.blob), blob: r.blob, blurred: r.blurred, facesFound: r.facesFound });
      setMsg(r.blurred ? `Difuminadas ${r.facesFound} cara(s). La original no sale de tu móvil.` : "Sin rostros detectados.");
    } catch (err) {
      setPhoto(null);
      setMsg(err instanceof GateBlocked ? `🚫 ${err.message}` : `Error procesando la imagen: ${err.message}`);
    }
  }

  function geolocate() {
    if (!navigator.geolocation) return setMsg("Geolocalización no disponible.");
    navigator.geolocation.getCurrentPosition(
      (p) => { setLat(p.coords.latitude.toFixed(5)); setLng(p.coords.longitude.toFixed(5)); },
      () => setMsg("No se pudo obtener la ubicación."),
    );
  }

  const toggle = (k) => setCats((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]));

  async function submit() {
    setBusy(true); setMsg(null);
    try {
      const device = deviceId();
      const r = await submitReport({ lat: +lat, lng: +lng, categories: cats, description: desc || undefined, device });
      if (photo?.blob) await uploadPhoto(r.id, photo.blob, { device });
      setMsg(`✓ Reporte enviado (#${r.id.slice(0, 8)}, ${r.status}).`);
      setPhoto(null); setCats([]); setDesc("");
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
          Documenta una barrera
        </h1>
        <p style={{ marginTop: 12, color: c.muted, lineHeight: 1.55, maxWidth: "60ch" }}>
          Fotografía el <strong style={{ color: c.text }}>objeto</strong>, no a las personas. El rostro se
          difumina en tu dispositivo antes de subir nada; si no se puede, la foto no se sube.
        </p>

        {/* Foto */}
        <label style={field()}>1 · Foto (opcional)
          <input type="file" accept="image/*" capture="environment" onChange={onPhoto} style={{ display: "block", marginTop: 8, color: c.muted, fontFamily: font.mono, fontSize: 13 }} />
        </label>
        {photo && (
          <div style={{ marginTop: 12, border: `1px solid ${c.line}`, padding: 10, display: "inline-block" }}>
            <img src={photo.url} alt="Previsualización (rostros difuminados)" style={{ maxWidth: "100%", maxHeight: 240, display: "block" }} />
            <div style={{ marginTop: 8, fontFamily: font.mono, fontSize: 11, color: photo.blurred ? c.yellow : c.faint }}>
              {photo.blurred ? `● ${photo.facesFound} rostro(s) difuminado(s)` : "○ sin rostros"}
            </div>
          </div>
        )}

        {/* Ubicación */}
        <div style={field()}>2 · Ubicación
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input aria-label="Latitud" value={lat} onChange={(e) => setLat(e.target.value)} style={inp(120)} inputMode="decimal" />
            <input aria-label="Longitud" value={lng} onChange={(e) => setLng(e.target.value)} style={inp(120)} inputMode="decimal" />
            <button onClick={geolocate} style={ghostBtn()}><Icon name="arrowUpRight" size={13} /> Usar mi ubicación</button>
          </div>
        </div>

        {/* Categorías */}
        <div style={field()}>3 · Tipo de barrera
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
            {CATS.map(([k, label]) => {
              const on = cats.includes(k);
              return (
                <button key={k} onClick={() => toggle(k)} aria-pressed={on}
                  style={{ cursor: "pointer", fontFamily: font.mono, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em",
                    padding: "8px 12px", borderRadius: 0, border: `2px solid ${on ? c.accent : c.lineStrong}`,
                    background: on ? c.accent : "transparent", color: on ? "#0a0a0b" : c.muted }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Descripción */}
        <label style={field()}>4 · Descripción (opcional)
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={280}
            placeholder="Describe el objeto y dónde está. No identifiques a personas ni negocios concretos."
            style={{ display: "block", marginTop: 8, width: "100%", background: c.bg, color: c.text, border: `1px solid ${c.lineStrong}`, padding: "10px 12px", fontFamily: font.sans, fontSize: 15, borderRadius: 0, resize: "vertical" }} />
        </label>

        <div style={{ display: "flex", gap: 12, marginTop: 22, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={submit} disabled={busy} style={{ cursor: "pointer", background: c.accent, color: "#0a0a0b", border: "2px solid transparent",
            fontFamily: font.sans, fontWeight: 700, fontSize: 15, textTransform: "uppercase", letterSpacing: "0.02em", padding: "13px 24px", borderRadius: 0 }}>
            {busy ? "Enviando…" : "Enviar reporte"}
          </button>
          {msg && <span role="status" style={{ fontFamily: font.mono, fontSize: 12.5, color: c.muted, maxWidth: "40ch" }}>{msg}</span>}
        </div>

        <p style={{ marginTop: 28, fontFamily: font.mono, fontSize: 11, color: c.faint, lineHeight: 1.6 }}>
          <Icon name="arrowUpRight" size={12} /> Preview interno. El reporte ciudadano abierto con datos reales
          requiere antes la DPIA y la entidad jurídica (docs/06).
        </p>
      </div>
    </div>
  );
}

function field() { return { display: "block", marginTop: 24, fontFamily: font.mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: c.yellow }; }
function inp(w) { return { width: w, background: c.bg, color: c.text, border: `1px solid ${c.lineStrong}`, padding: "10px 12px", fontFamily: font.mono, fontSize: 14, borderRadius: 0 }; }
function ghostBtn() { return { cursor: "pointer", background: "transparent", border: `2px solid ${c.text}`, color: c.text, fontFamily: font.mono, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", padding: "9px 14px", borderRadius: 0, display: "inline-flex", alignItems: "center", gap: 7 }; }
