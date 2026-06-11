import { test } from "node:test";
import assert from "node:assert/strict";
import { blurCoord, SENSITIVE_TYPES } from "../src/index.js";

test("blurCoord redondea a 3 decimales (~100 m)", () => {
  assert.equal(blurCoord(41.385123), 41.385);
  assert.equal(blurCoord(2.173456), 2.173);
  assert.equal(blurCoord(-4.779812), -4.78);
});

test("blurCoord es idempotente (re-aplicar no cambia el valor)", () => {
  const a = blurCoord(41.385123);
  assert.equal(blurCoord(a), a);
});

test("blurCoord ofusca: el dígito de los ~10 m se pierde", () => {
  // 41.38512 y 41.38548 (~40 m de diferencia) colapsan al mismo valor.
  assert.equal(blurCoord(41.38512), blurCoord(41.38548));
});

test("solo 'hostile' es tipo sensible (infraestructura conserva precisión)", () => {
  assert.ok(SENSITIVE_TYPES.has("hostile"));
  assert.ok(!SENSITIVE_TYPES.has("housing"));
  assert.ok(!SENSITIVE_TYPES.has("service"));
  assert.ok(!SENSITIVE_TYPES.has("climate"));
});
