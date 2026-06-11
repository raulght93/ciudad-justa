// Tests de la auth de moderación (magic-link) con D1 simulado.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

// Mock D1 configurable por tabla. `users`/`sessions`/`login_tokens` son mapas por clave.
function mockDB({ users = {}, sessions = {}, loginTokens = {} } = {}) {
  const log = [];
  const prepare = (sql) => ({
    sql,
    args: [],
    bind(...args) {
      this.args = args;
      log.push({ sql, args });
      return this;
    },
    run: async () => ({ success: true }),
    first: async () => {
      const a = this_args(log);
      if (/FROM users WHERE email/.test(sql)) return users[a[0]] || null;
      if (/FROM users WHERE id/.test(sql)) {
        const byId = Object.values(users).find((u) => u.id === a[0]);
        return byId || null;
      }
      if (/FROM sessions WHERE token/.test(sql)) return sessions[a[0]] || null;
      if (/FROM login_tokens WHERE token/.test(sql)) return loginTokens[a[0]] || null;
      if (/FROM reports WHERE id/.test(sql)) return { status: "reported" };
      return null;
    },
  });
  // Devuelve los args de la última sentencia preparada (la que se está ejecutando).
  const this_args = (l) => (l.length ? l[l.length - 1].args : []);
  return { log, prepare, batch: async (stmts) => stmts.map(() => ({ success: true })) };
}

const req = (path, init) => new Request(`https://api.test${path}`, init);
const postJson = (path, body, headers = {}) =>
  req(path, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json", ...headers } });

test("OPTIONS permite Authorization y x-device-id en preflight", async () => {
  const res = await worker.fetch(req("/api/mod/reports/x", { method: "OPTIONS" }), {});
  assert.match(res.headers.get("access-control-allow-headers"), /authorization/);
  assert.match(res.headers.get("access-control-allow-headers"), /x-device-id/);
});

test("POST /api/auth/magic con email no-moderador → {ok:true} sin enlace (anti-enumeración)", async () => {
  const db = mockDB({ users: { "user@x.com": { id: "u1", role: "user" } } });
  const res = await worker.fetch(postJson("/api/auth/magic", { email: "user@x.com" }), { DB: db, AUTH_DEV_RETURN_LINK: "1" });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.equal(body.devLink, undefined); // no se emite enlace a un no-moderador
});

test("POST /api/auth/magic con email de moderador → emite enlace (devLink en modo dev)", async () => {
  const db = mockDB({ users: { "mod@x.com": { id: "m1", role: "moderator" } } });
  const res = await worker.fetch(postJson("/api/auth/magic", { email: "mod@x.com" }), {
    DB: db, AUTH_DEV_RETURN_LINK: "1", APP_ORIGIN: "https://ciudad-justa.pages.dev",
  });
  const body = await res.json();
  assert.equal(body.ok, true);
  assert.match(body.devLink, /^https:\/\/ciudad-justa\.pages\.dev\/#\/mod\?token=/);
  // Se insertó un login_token de un solo uso.
  assert.ok(db.log.some((q) => /INSERT INTO login_tokens/.test(q.sql)));
});

test("POST /api/auth/magic sin email → 400", async () => {
  const res = await worker.fetch(postJson("/api/auth/magic", { email: "noarroba" }), { DB: mockDB() });
  assert.equal(res.status, 400);
});

test("POST /api/auth/verify con token caducado → 401", async () => {
  const db = mockDB({ loginTokens: { tok1: { user_id: "m1", expires_at: 1, used: 0 } } });
  const res = await worker.fetch(postJson("/api/auth/verify", { token: "tok1" }), { DB: db });
  assert.equal(res.status, 401);
});

test("POST /api/auth/verify con token válido → sesión + rol", async () => {
  const db = mockDB({
    loginTokens: { tok2: { user_id: "m1", expires_at: Date.now() + 60000, used: 0 } },
    users: { "mod@x.com": { id: "m1", role: "moderator", handle: "mod" } },
  });
  const res = await worker.fetch(postJson("/api/auth/verify", { token: "tok2" }), { DB: db });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.role, "moderator");
  assert.ok(body.session && body.session.length >= 32);
  assert.ok(db.log.some((q) => /UPDATE login_tokens SET used = 1/.test(q.sql)));
  assert.ok(db.log.some((q) => /INSERT INTO sessions/.test(q.sql)));
});

test("POST /api/mod con sesión válida (Bearer) → autoriza sin MOD_TOKEN", async () => {
  const db = mockDB({
    sessions: { sess1: { user_id: "m1", role: "moderator", expires_at: Date.now() + 60000 } },
  });
  const res = await worker.fetch(
    postJson("/api/mod/reports/r1", { action: "confirm" }, { authorization: "Bearer sess1" }),
    { DB: db }
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "confirmed");
});

test("POST /api/mod sin credenciales válidas → 401", async () => {
  const db = mockDB({});
  const res = await worker.fetch(
    postJson("/api/mod/reports/r1", { action: "confirm" }, { authorization: "Bearer noexiste" }),
    { DB: db }
  );
  assert.equal(res.status, 401);
});

test("POST /api/mod con sesión de usuario normal (rol insuficiente) → 403", async () => {
  const db = mockDB({
    sessions: { sessU: { user_id: "u9", role: "user", expires_at: Date.now() + 60000 } },
  });
  const res = await worker.fetch(
    postJson("/api/mod/reports/r1", { action: "confirm" }, { authorization: "Bearer sessU" }),
    { DB: db }
  );
  assert.equal(res.status, 403);
});
