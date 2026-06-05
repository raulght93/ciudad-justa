// Tests del Worker con el runner nativo de Node (node --test) — sin dependencias.
// Request/Response/URL/crypto.randomUUID son globales en Node ≥18.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

// Mock de D1: registra cada sentencia (sql+args) y soporta all()/run()/first()/batch().
// Acepta un array (filas para GET) o un objeto de config para el flujo de voto:
//   { rows, report:{status}|undefined, reputation, voteScore }
function mockDB(arg = {}) {
  const cfg = Array.isArray(arg) ? { rows: arg } : arg;
  const { rows = [], report, reputation = 1.0, voteScore = 0, role } = cfg;
  const log = [];
  const prepare = (sql) => ({
    sql,
    args: null,
    bind(...args) {
      this.args = args;
      log.push({ sql, args });
      return this;
    },
    all: async () => ({ results: rows }),
    run: async () => ({ success: true }),
    first: async () => {
      if (/FROM reports WHERE id/.test(sql)) return report; // {status} | undefined
      if (/role FROM users/.test(sql)) return role === undefined ? undefined : { role };
      if (/reputation FROM users/.test(sql)) return { reputation };
      if (/SUM\(value \* weight\)/.test(sql)) return { score: voteScore };
      return null;
    },
  });
  return { log, prepare, batch: async (stmts) => stmts.map(() => ({ success: true })) };
}

const req = (url, init) => new Request(`https://x${url}`, init);
const post = (body, headers) =>
  req("/api/reports", { method: "POST", body: JSON.stringify(body), headers });

test("GET /api/reports sin bbox → 400", async () => {
  const res = await worker.fetch(req("/api/reports"), {});
  assert.equal(res.status, 400);
});

test("GET /api/reports con bbox pero sin D1 → 501", async () => {
  const res = await worker.fetch(req("/api/reports?bbox=2.1,41.3,2.2,41.4"), {});
  assert.equal(res.status, 501);
});

test("GET /api/reports devuelve GeoJSON desde D1 con consulta bbox", async () => {
  const db = mockDB([
    { id: "r1", lat: 41.38, lng: 2.17, status: "confirmed", description: "Banco", score: 3 },
  ]);
  const res = await worker.fetch(req("/api/reports?bbox=2.1,41.3,2.2,41.4&status=confirmed"), { DB: db });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.type, "FeatureCollection");
  assert.deepEqual(body.features[0].geometry.coordinates, [2.17, 41.38]);
  const q = db.log[0];
  assert.match(q.sql, /lat BETWEEN \? AND \?/);
  assert.match(q.sql, /status = \?/);
  assert.deepEqual(q.args, [41.3, 41.4, 2.1, 2.2, "confirmed"]);
});

test("POST /api/reports sin coordenadas → 400", async () => {
  const res = await worker.fetch(post({ foo: 1 }), {});
  assert.equal(res.status, 400);
});

test("POST /api/reports con lat/lng fuera de rango → 400", async () => {
  const res = await worker.fetch(post({ lat: 200, lng: 2 }), { DB: mockDB() });
  assert.equal(res.status, 400);
});

test("POST /api/reports sin D1 → 501", async () => {
  const res = await worker.fetch(post({ lat: 41.38, lng: 2.17 }), {});
  assert.equal(res.status, 501);
});

test("POST /api/reports inserta reporte + categorías + usuario y devuelve 201", async () => {
  const db = mockDB();
  const res = await worker.fetch(
    post({ lat: 41.38, lng: 2.17, categories: ["spikes", "barrier", "INVALID"], description: "x" },
      { "x-device-id": "dev-123" }),
    { DB: db }
  );
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.status, "reported");
  // Categoría inválida filtrada.
  assert.deepEqual(body.categories.sort(), ["barrier", "spikes"]);
  assert.match(body.geohash, /^[0-9b-z]{7}$/);

  const sqls = db.log.map((s) => s.sql);
  assert.ok(sqls.some((s) => /INSERT OR IGNORE INTO users/.test(s)), "inserta usuario");
  assert.ok(sqls.some((s) => /INSERT INTO reports/.test(s)), "inserta reporte");
  // Dos categorías válidas → dos inserts en report_categories.
  assert.equal(sqls.filter((s) => /INSERT INTO report_categories/.test(s)).length, 2);
  // El usuario anónimo viene de la cabecera.
  const userStmt = db.log.find((s) => /INSERT OR IGNORE INTO users/.test(s.sql));
  assert.equal(userStmt.args[0], "dev-123");
});

// ---- E1b: votación ----

test("POST vote con value inválido → 400", async () => {
  const res = await worker.fetch(
    req("/api/reports/r1/vote", { method: "POST", body: JSON.stringify({ value: 2 }) }),
    { DB: mockDB({ report: { status: "reported" } }) }
  );
  assert.equal(res.status, 400);
});

test("POST vote sobre reporte inexistente → 404", async () => {
  const res = await worker.fetch(
    req("/api/reports/nope/vote", { method: "POST", body: JSON.stringify({ value: 1 }) }),
    { DB: mockDB({ report: undefined }) }
  );
  assert.equal(res.status, 404);
});

test("POST vote suma score y confirma al cruzar el umbral", async () => {
  const db = mockDB({ report: { status: "reported" }, reputation: 1.0, voteScore: 5 });
  const res = await worker.fetch(
    req("/api/reports/r1/vote", { method: "POST", body: JSON.stringify({ value: 1 }) }),
    { DB: db }
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.score, 5);
  assert.equal(body.status, "confirmed"); // 5 ≥ CONFIRM_AT
  // El voto se inserta con upsert (un voto por usuario/reporte).
  assert.ok(db.log.some((s) => /INSERT INTO votes/.test(s.sql) && /ON CONFLICT/.test(s.sql)));
});

test("POST vote NO altera un estado de moderación (disputed)", async () => {
  const db = mockDB({ report: { status: "disputed" }, voteScore: 9 });
  const res = await worker.fetch(
    req("/api/reports/r1/vote", { method: "POST", body: JSON.stringify({ value: 1 }) }),
    { DB: db }
  );
  const body = await res.json();
  assert.equal(body.status, "disputed"); // se respeta la moderación
});

// ---- E1c: reputación dinámica ----

test("al confirmarse, liquida reputación (premia +1 y autor, penaliza -1)", async () => {
  const db = mockDB({ report: { status: "under_review" }, voteScore: 6 });
  const res = await worker.fetch(
    req("/api/reports/r1/vote", { method: "POST", body: JSON.stringify({ value: 1 }) }),
    { DB: db }
  );
  const body = await res.json();
  assert.equal(body.status, "confirmed");
  assert.equal(body.settled, true);
  const ups = db.log.filter((s) => /UPDATE users SET reputation/.test(s.sql));
  assert.equal(ups.length, 3); // upvoters, downvoters, autor
  assert.ok(ups.some((s) => /value = 1/.test(s.sql)), "premia upvoters");
  assert.ok(ups.some((s) => /value = -1/.test(s.sql)), "penaliza downvoters");
  assert.ok(ups.some((s) => /created_by FROM reports/.test(s.sql)), "premia autor");
});

test("si el voto no cruza el umbral, NO liquida reputación", async () => {
  const db = mockDB({ report: { status: "reported" }, voteScore: 1 });
  const res = await worker.fetch(
    req("/api/reports/r1/vote", { method: "POST", body: JSON.stringify({ value: 1 }) }),
    { DB: db }
  );
  const body = await res.json();
  assert.equal(body.status, "reported");
  assert.equal(body.settled, false);
  assert.equal(db.log.filter((s) => /UPDATE users SET reputation/.test(s.sql)).length, 0);
});

test("ya confirmado: votar de nuevo no vuelve a liquidar", async () => {
  const db = mockDB({ report: { status: "confirmed" }, voteScore: 8 });
  const res = await worker.fetch(
    req("/api/reports/r1/vote", { method: "POST", body: JSON.stringify({ value: 1 }) }),
    { DB: db }
  );
  const body = await res.json();
  assert.equal(body.settled, false);
  assert.equal(db.log.filter((s) => /UPDATE users SET reputation/.test(s.sql)).length, 0);
});

// ---- E1e: moderación ----

const mod = (id, body, headers) =>
  req(`/api/mod/reports/${id}`, { method: "POST", body: JSON.stringify(body), headers });

test("moderación con action inválida → 400", async () => {
  const res = await worker.fetch(mod("r1", { action: "explotar" }), { DB: mockDB({ role: "admin" }) });
  assert.equal(res.status, 400);
});

test("moderación sin rol de moderación → 403", async () => {
  const res = await worker.fetch(
    mod("r1", { action: "reject" }, { "x-device-id": "alguien" }),
    { DB: mockDB({ role: "user" }) }
  );
  assert.equal(res.status, 403);
});

test("moderación sobre reporte inexistente → 404", async () => {
  const res = await worker.fetch(
    mod("nope", { action: "reject" }, { "x-device-id": "mod1" }),
    { DB: mockDB({ role: "moderator", report: undefined }) }
  );
  assert.equal(res.status, 404);
});

test("rechazar registra en moderation_log y liquida reputación inversa", async () => {
  const db = mockDB({ role: "moderator", report: { status: "under_review" } });
  const res = await worker.fetch(
    mod("r1", { action: "reject", note: "spam" }, { "x-device-id": "mod1" }),
    { DB: db }
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, "rejected");
  assert.ok(db.log.some((s) => /INSERT INTO moderation_log/.test(s.sql)), "audit log");
  assert.equal(db.log.filter((s) => /UPDATE users SET reputation/.test(s.sql)).length, 3, "liquidación inversa");
});

test("confirmar por moderación liquida reputación de confirmación", async () => {
  const db = mockDB({ role: "moderator", report: { status: "reported" } });
  const res = await worker.fetch(
    mod("r1", { action: "confirm" }, { "x-device-id": "mod1" }),
    { DB: db }
  );
  const body = await res.json();
  assert.equal(body.status, "confirmed");
  assert.equal(db.log.filter((s) => /UPDATE users SET reputation/.test(s.sql)).length, 3);
});

test("restaurar no liquida reputación pero sí registra", async () => {
  const db = mockDB({ role: "admin", report: { status: "rejected" } });
  const res = await worker.fetch(
    mod("r1", { action: "restore" }, { "x-device-id": "boss" }),
    { DB: db }
  );
  const body = await res.json();
  assert.equal(body.status, "reported");
  assert.ok(db.log.some((s) => /INSERT INTO moderation_log/.test(s.sql)));
  assert.equal(db.log.filter((s) => /UPDATE users SET reputation/.test(s.sql)).length, 0);
});

test("con MOD_TOKEN configurado, sin Bearer correcto → 401", async () => {
  const res = await worker.fetch(
    mod("r1", { action: "reject" }, { "x-device-id": "mod1" }),
    { DB: mockDB({ role: "moderator", report: { status: "reported" } }), MOD_TOKEN: "s3cret" }
  );
  assert.equal(res.status, 401);
});

test("con MOD_TOKEN configurado y Bearer correcto + rol → 200", async () => {
  const res = await worker.fetch(
    mod("r1", { action: "document" }, { "x-device-id": "mod1", authorization: "Bearer s3cret" }),
    { DB: mockDB({ role: "moderator", report: { status: "confirmed" } }), MOD_TOKEN: "s3cret" }
  );
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, "documented");
});

test("OPTIONS → CORS", async () => {
  const res = await worker.fetch(req("/api/reports", { method: "OPTIONS" }), {});
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("ruta desconocida → 404", async () => {
  const res = await worker.fetch(req("/nope"), {});
  assert.equal(res.status, 404);
});
