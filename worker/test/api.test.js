// Tests del Worker con el runner nativo de Node (node --test) — sin dependencias.
// Request/Response/URL son globales en Node ≥18.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

// Mock de D1: captura el SQL y los args, devuelve filas fijas.
function mockDB(rows = []) {
  const calls = { sql: null, args: null };
  return {
    calls,
    prepare(sql) {
      calls.sql = sql;
      return {
        bind(...args) {
          calls.args = args;
          return { all: async () => ({ results: rows }) };
        },
      };
    },
  };
}

const req = (url, init) => new Request(`https://x${url}`, init);

test("GET /api/reports sin bbox → 400", async () => {
  const res = await worker.fetch(req("/api/reports"), {});
  assert.equal(res.status, 400);
});

test("GET /api/reports con bbox pero sin D1 → 501", async () => {
  const res = await worker.fetch(req("/api/reports?bbox=2.1,41.3,2.2,41.4"), {});
  assert.equal(res.status, 501);
});

test("GET /api/reports devuelve GeoJSON desde D1", async () => {
  const db = mockDB([
    { id: "r1", lat: 41.38, lng: 2.17, status: "confirmed", description: "Banco", score: 3 },
  ]);
  const res = await worker.fetch(req("/api/reports?bbox=2.1,41.3,2.2,41.4&status=confirmed"), { DB: db });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.type, "FeatureCollection");
  assert.equal(body.features.length, 1);
  assert.deepEqual(body.features[0].geometry.coordinates, [2.17, 41.38]);
  assert.equal(body.features[0].properties.status, "confirmed");
  // Consulta espacial por bbox + filtro de estado.
  assert.match(db.calls.sql, /lat BETWEEN \? AND \?/);
  assert.match(db.calls.sql, /status = \?/);
  assert.deepEqual(db.calls.args, [41.3, 41.4, 2.1, 2.2, "confirmed"]);
});

test("POST /api/reports sin coordenadas → 400", async () => {
  const res = await worker.fetch(
    req("/api/reports", { method: "POST", body: JSON.stringify({ foo: 1 }) }),
    {}
  );
  assert.equal(res.status, 400);
});

test("POST /api/reports válido → 201 con estado 'reported'", async () => {
  const res = await worker.fetch(
    req("/api/reports", { method: "POST", body: JSON.stringify({ lat: 41.38, lng: 2.17 }) }),
    {}
  );
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.received.status, "reported");
});

test("OPTIONS → CORS", async () => {
  const res = await worker.fetch(req("/api/reports", { method: "OPTIONS" }), {});
  assert.equal(res.headers.get("access-control-allow-origin"), "*");
});

test("ruta desconocida → 404", async () => {
  const res = await worker.fetch(req("/nope"), {});
  assert.equal(res.status, 404);
});
