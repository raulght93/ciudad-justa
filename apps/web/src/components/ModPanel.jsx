// Panel de moderación (E1e · UI). Vista mínima, accesible y on-brand, accesible
// en #/mod. No forma parte del dossier divulgativo: es herramienta interna.
// Requiere el token de moderación (MOD_TOKEN) — se guarda en localStorage.
import { useState, useEffect } from "react";
import { c, font } from "../styles/tokens.js";
import { fetchReports, moderate, requestMagicLink, verifyMagicLink } from "../api/reports.js";
import { Brand, StatusPill, Icon } from "./primitives.jsx";

const BCN_BBOX = [2.05, 41.32, 2.25, 41.47];
const ACTIONS = ["confirm", "reject", "document", "dispute", "restore"];
const ls = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch { return null; } };

// El enlace mágico llega como #/mod?token=XYZ — extrae el token de la query del hash.
function tokenFromHash() {
  const h = window.location.hash || "";
  const qi = h.indexOf("?");
  if (qi === -1) return null;
  return new URLSearchParams(h.slice(qi + 1)).get("token");
}

export default function ModPanel() {
  const [session, setSession] = useState(() => ls("cj-mod-session") || "");
  const [role, setRole] = useState(() => ls("cj-mod-role") || "");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(() => ls("cj-mod-token") || ""); // MOD_TOKEN legacy (fallback)
  const [device, setDevice] = useState(() => ls("cj-mod-device") || "");
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  // Al cargar: si el enlace mágico trae token, canjéalo por una sesión y límpialo de la URL.
  useEffect(() => {
    const t = tokenFromHash();
    if (!t) return;
    (async () => {
      setBusy(true);
      try {
        const r = await verifyMagicLink(t);
        ls("cj-mod-session", r.session); ls("cj-mod-role", r.role);
        setSession(r.session); setRole(r.role);
        setMsg(`Sesión iniciada como ${r.role}.`);
      } catch (e) { setMsg(`No se pudo iniciar sesión: ${e.message}`); }
      history.replaceState(null, "", window.location.pathname + "#/mod");
      setBusy(false);
    })();
  }, []);

  async function sendLink() {
    setMsg(null);
    if (!email.includes("@")) return setMsg("Introduce un email válido.");
    setBusy(true);
    try {
      const r = await requestMagicLink(email.trim());
      setMsg(r.devLink
        ? `Enlace (modo dev): ${r.devLink}`
        : "Si el email pertenece a un moderador, recibirás un enlace de acceso.");
    } catch (e) { setMsg(`Error: ${e.message}`); }
    setBusy(false);
  }

  function logout() {
    ls("cj-mod-session", ""); ls("cj-mod-role", "");
    setSession(""); setRole(""); setMsg("Sesión cerrada.");
  }

  const save = () => { ls("cj-mod-token", token); ls("cj-mod-device", device); setMsg("Credenciales legacy guardadas."); };

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
      // Sesión magic-link preferente (el actor se resuelve en el servidor);
      // si no hay sesión, cae al MOD_TOKEN + id de dispositivo legacy.
      const r = await moderate(id, action, session
        ? { token: session }
        : { token, device });
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

        {/* Acceso por enlace mágico */}
        {session ? (
          <div style={{ display: "flex", gap: 12, marginTop: 22, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontFamily: font.mono, fontSize: 12.5, color: c.green }}>
              <Icon name="check" size={13} /> Sesión activa · rol <strong>{role || "?"}</strong>
            </span>
            <button onClick={logout} style={ghostBtn(c.muted)}>Cerrar sesión</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginTop: 22, alignItems: "end" }}>
            <label style={lbl}>Email de moderador/a
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle()}
                placeholder="tu@correo.org" autoComplete="email"
                onKeyDown={(e) => { if (e.key === "Enter") sendLink(); }} />
            </label>
            <button onClick={sendLink} disabled={busy} style={solidBtn(c.yellow)}>Enviar enlace</button>
          </div>
        )}

        {/* Fallback legacy MOD_TOKEN (mientras se migra) */}
        {!session && (
          <details style={{ marginTop: 14 }}>
            <summary style={{ cursor: "pointer", fontFamily: font.mono, fontSize: 11.5, color: c.faint, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Acceso legacy (token compartido)
            </summary>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginTop: 12, alignItems: "end" }}>
              <label style={lbl}>Token de moderación
                <input type="password" value={token} onChange={(e) => setToken(e.target.value)} style={inputStyle()} autoComplete="off" />
              </label>
              <label style={lbl}>Tu id de moderador (audit)
                <input value={device} onChange={(e) => setDevice(e.target.value)} style={inputStyle()} placeholder="p.ej. mod-ana" />
              </label>
              <button onClick={save} style={solidBtn(c.yellow)}>Guardar</button>
            </div>
          </details>
        )}

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
          <Icon name="arrowUpRight" size={12} /> Acceso por enlace mágico (sesión de 30 días, ligada a tu rol en la BD). El enlace caduca en 15 min y solo sirve una vez. Cada acción queda en el audit log con tu id. El token compartido legacy queda como fallback durante la migración.
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
function ghostBtn(col) {
  return { cursor: "pointer", background: "transparent", border: `2px solid ${col}`, color: col,
    fontFamily: font.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    padding: "7px 14px", borderRadius: 0 };
}
function actBtn(a) {
  const col = a === "reject" ? c.hostile : a === "confirm" ? c.green : a === "document" ? c.service : a === "dispute" ? c.yellow : c.muted;
  return { cursor: "pointer", background: "transparent", border: `2px solid ${col}`, color: col, fontFamily: font.mono, fontSize: 11,
    fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "7px 12px", borderRadius: 0 };
}
