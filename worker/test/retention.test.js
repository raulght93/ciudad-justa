// Tests del lifecycle de fotos (retención) y del serving desde R2.
import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { runRetention } from "../src/index.js";

// Mock D1 para runRetention: all() devuelve fotos rancias; run() registra DELETEs.
function mockDB({ stale = [] } = {}) {
  const log = [];
  const prepare = (sql) => ({
    sql,
    args: [],
    bind(...args) { this.args = args; log.push({ sql, args }); return this; },
    all: async () => ({ results: /FROM photos p JOIN reports/.test(sql) ? stale : [] }),
    run: async () => ({ success: true, meta: { changes: 1 } }),
    first: async () => null,
  });
  return { log, prepare };
}

// Mock R2 con set para verificar borrados.
function mockR2(objects = {}) {
  const deleted = [];
  return {
    deleted,
    get: async (k) => (objects[k] ? { body: objects[k].body, httpMetadata: { contentType: objects[k].ct } } : null),
    delete: async (k) => { deleted.push(k); },
  };
}

const req = (path, init) => new Request(`https://api.test${path}`, init);

test("runRetention sin D1 → no falla, recuento a cero", async () => {
  const r = await runRetention({});
  assert.deepEqual(r, { photos: 0, tokens: 0, sessions: 0 });
});

test("runRetention borra fotos de reportes retirados (R2 + BD)", async () => {
  const db = mockDB({ stale: [{ pid: "p1", key: "reports/r1/p1.jpg" }, { pid: "p2", key: "reports/r2/p2.jpg" }] });
  const r2 = mockR2();
  const res = await runRetention({ DB: db, PHOTOS: r2 }, 1_000_000_000_000);
  assert.equal(res.photos, 2);
  assert.deepEqual(r2.deleted, ["reports/r1/p1.jpg", "reports/r2/p2.jpg"]);
  assert.ok(db.log.some((q) => /DELETE FROM photos WHERE id/.test(q.sql)));
  assert.ok(db.log.some((q) => /DELETE FROM login_tokens/.test(q.sql)));
  assert.ok(db.log.some((q) => /DELETE FROM sessions/.test(q.sql)));
});

test("runRetention usa el corte de 30 días sobre updated_at", async () => {
  const db = mockDB({ stale: [] });
  const now = 2_000_000_000_000;
  await runRetention({ DB: db }, now);
  const q = db.log.find((x) => /FROM photos p JOIN reports/.test(x.sql));
  assert.equal(q.args[0], now - 30 * 24 * 60 * 60 * 1000);
});

test("GET /api/photos rechaza claves fuera del prefijo gestionado", async () => {
  const res = await worker.fetch(req("/api/photos/secret/etc-passwd"), { PHOTOS: mockR2() });
  assert.equal(res.status, 400);
});

test("GET /api/photos rechaza path traversal", async () => {
  const res = await worker.fetch(req("/api/photos/reports/..%2F..%2Fx"), { PHOTOS: mockR2() });
  assert.equal(res.status, 400);
});

test("GET /api/photos sirve la imagen difuminada desde R2", async () => {
  const r2 = mockR2({ "reports/r1/p1.jpg": { body: "BYTES", ct: "image/jpeg" } });
  const res = await worker.fetch(req("/api/photos/reports/r1/p1.jpg"), { PHOTOS: r2 });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "image/jpeg");
  assert.match(res.headers.get("cache-control"), /max-age/);
});

test("GET /api/photos inexistente → 404", async () => {
  const res = await worker.fetch(req("/api/photos/reports/r1/missing.jpg"), { PHOTOS: mockR2() });
  assert.equal(res.status, 404);
});
