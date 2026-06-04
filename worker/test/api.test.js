// Tests del Worker con el runner nativo de Node (node --test) — sin dependencias.
// Request/Response/URL/crypto.randomUUID son globales en Node ≥18.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

// Mock de D1: registra cada sentencia preparada (sql+args), soporta all()/run()/batch().
function mockDB(rows = []) {
  const log = [];
  const prepare = (sql) => {
    const st = {
      sql,
      args: null,
      bind(...args) {
        this.args = args;
        log.push({ sql, args });
        return this;
      },
      all: async () => ({ results: rows }),
      run: async () => ({ success: true }),
    };
    return st;
  };
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

test("OPTIONS → CORS", async () => {
  const res = await worker.fetch(req("/api/reports", { method: "OPTIONS" }), {});
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("ruta desconocida → 404", async () => {
  const res = await worker.fetch(req("/nope"), {});
  assert.equal(res.status, 404);
});
