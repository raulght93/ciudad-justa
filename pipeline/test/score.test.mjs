import { test } from "node:test";
import assert from "node:assert/strict";
import { deficitScore, clamp01, CANOPY_TARGET, W_CANOPY, W_ACCESS } from "../lib/score.mjs";

test("clamp01 acota a [0,1]", () => {
  assert.equal(clamp01(-0.5), 0);
  assert.equal(clamp01(0.4), 0.4);
  assert.equal(clamp01(2), 1);
});

test("deficitScore: sin déficit cuando hay copa objetivo y acceso total", () => {
  assert.equal(deficitScore(CANOPY_TARGET, 1), 0); // 30% copa + 100% acceso → 0
});

test("deficitScore: déficit máximo sin copa ni acceso", () => {
  assert.equal(deficitScore(0, 0), 1);
});

test("deficitScore: punto medio", () => {
  // canopy 15 (→ short 0.5) y acceso 0.5 (→ short 0.5): 0.5*0.5 + 0.5*0.5 = 0.5
  assert.equal(deficitScore(CANOPY_TARGET / 2, 0.5), 0.5);
});

test("deficitScore: copa por encima del objetivo no resta de más (clamp)", () => {
  assert.equal(deficitScore(80, 1), 0); // copa 80% > 30% → componente copa 0
});

test("pesos suman 1", () => {
  assert.equal(W_CANOPY + W_ACCESS, 1);
});
