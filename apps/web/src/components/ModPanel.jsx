// Panel de moderación (E1e · UI). Vista mínima, accesible y on-brand, accesible
// en #/mod. No forma parte del dossier divulgativo: es herramienta interna.
// Requiere el token de moderación (MOD_TOKEN) — se guarda en localStorage.
import { useState } from "react";
import { c, font } from "../styles/tokens.js";
import { fetchReports, moderate } from "../api/reports.js";
import { Brand, StatusPill, Icon } from "./primitives.jsx";

const BCN_BBOX = [2.05, 41.32, 2.25, 41.47];
const ACTIONS = ["confirm", "reject", "document", "dispute", "restore"];
const ls = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch { return null; } };

export default function ModPanel() {
  const [token, setToken] = useState(() => ls("cj-mod-token") || "");
  const [device, setDevice] = useState(() => ls("cj-mod-device") || "");
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const save = () => { ls("cj-mod-token", token); ls("cj-mod-device", device); setMsg("Credenciales guardadas."); };

  async function load() {
    setBusy(true); setMsg(null);
    try {
      const gj = await fetchReports(BCN_BBOX, { status: "" }); // sin filtro → todos los estados
      setItems(gj.features.map((f) => ({ id: f.properties.id, status: f.properties.status, description: f.properties.description, score: f.properties.score })));
      if (!gj.features.length) setMsg("Sin reportes en el área.");
    } catch (e) { setMsg(`Error al cargar: ${e.message}`); }
    setBusy(false);
  }

  async function act(id, action) {
    setMsg(null);
    try {
      const r = await moderate(id, action, { token, device });
      setItems((xs) => xs.map((it) => (it.id === id ? { ...it, status: r.status } : it)));
      setMsg(`#${id.slice(0, 8)} → ${r.status}`);
    } catch (e) { setMsg(`Acción rechazada: ${e.message}`); }
  }

  const lbl = { ...inputLabel() };
  return (
    <div style={{ background: c.bg, color: c.text, fontFamily: font.sans, minHeight: "100vh" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 22px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `2px solid ${c.text}`, paddingBottom: 18 }}>
          <Brand size={28} />
          <span style={{ fontFamily: font.mono, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: c.yellow }}>Moderación · interno</span>
        </div>

        <h1 style={{ fontFamily: font.display, textTransform: "uppercase", fontSize: "clamp(2rem,6vw,3.2rem)", letterSpacing: "0.02em", lineHeight: 0.95, margin: "26px 0 0" }}>
          Cola de revisión
        </h1>

        {/* Credenciales */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginTop: 22, alignItems: "end" }}>
          <label style={lbl}>Token de moderación
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} style={inputStyle()} autoComplete="off" />
          </label>
          <label style={lbl}>Tu id de moderador (audit)
            <input value={device} onChange={(e) => setDevice(e.target.value)} style={inputStyle()} placeholder="p.ej. mod-ana" />
          </label>
          <button onClick={save} style={solidBtn(c.yellow)}>Guardar</button>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 18, alignItems: "center" }}>
          <button onClick={load} disabled={busy} style={solidBtn(c.accent)}>{busy ? "Cargando…" : "Cargar reportes"}</button>
          {msg && <span role="status" style={{ fontFamily: font.mono, fontSize: 12.5, color: c.muted }}>{msg}</span>}
        </div>

        {/* Lista */}
        <ul style={{ listStyle: "none", padding: 0, margin: "26px 0 0", display: "grid", gap: 12 }}>
          {items.map((it) => (
            <li key={it.id} style={{ border: `1px solid ${c.line}`, background: c.surface, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <StatusPill status={it.status} />
                  <span style={{ fontFamily: font.mono, fontSize: 12, color: c.faint }}>#{it.id.slice(0, 8)} · {Number(it.score ?? 0).toFixed(1)}</span>
                </div>
              </div>
              <p style={{ margin: "10px 0 0", color: c.text, lineHeight: 1.5 }}>{it.description || <em style={{ color: c.faint }}>(sin descripción)</em>}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {ACTIONS.map((a) => (
                  <button key={a} onClick={() => act(it.id, a)} style={actBtn(a)}>{a}</button>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <p style={{ marginTop: 30, fontFamily: font.mono, fontSize: 11.5, color: c.faint, lineHeight: 1.6 }}>
          <Icon name="arrowUpRight" size={12} /> El token nunca viaja en la URL ni se comparte. La acción queda registrada en el audit log con tu id. Auth de sesión real: pendiente (docs/07 §E).
        </p>
      </div>
    </div>
  );
}

function inputStyle() {
  return { display: "block", marginTop: 6, width: "100%", background: c.bg, color: c.text, border: `1px solid ${c.lineStrong}`,
    padding: "10px 12px", fontFamily: font.mono, fontSize: 14, borderRadius: 0 };
}
function inputLabel() {
  return { fontFamily: font.mono, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: c.muted };
}
function solidBtn(bg) {
  return { cursor: "pointer", background: bg, color: "#0a0a0b", border: "2px solid transparent",
    fontFamily: font.sans, fontWeight: 700, fontSize: 14, letterSpacing: "0.02em", textTransform: "uppercase",
    padding: "11px 20px", borderRadius: 0 };
}
function actBtn(a) {
  const col = a === "reject" ? c.hostile : a === "confirm" ? c.green : a === "document" ? c.service : a === "dispute" ? c.yellow : c.muted;
  return { cursor: "pointer", background: "transparent", border: `2px solid ${col}`, color: col, fontFamily: font.mono, fontSize: 11,
    fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "7px 12px", borderRadius: 0 };
}
