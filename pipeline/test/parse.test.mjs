import { test } from "node:test";
import assert from "node:assert/strict";
import { cusec10, toNumberEs } from "../lib/parse.mjs";

test("cusec10 extrae el código de 10 dígitos", () => {
  assert.equal(cusec10("2906701001 Málaga sección 01001"), "2906701001");
  assert.equal(cusec10("0801901001"), "0801901001");
});

test("cusec10 devuelve null sin código", () => {
  assert.equal(cusec10(""), null);
  assert.equal(cusec10("Total Nacional"), null);
  assert.equal(cusec10(undefined), null);
});

test("toNumberEs: entero con punto de millar (INE)", () => {
  assert.equal(toNumberEs("21.823"), 21823);
  assert.equal(toNumberEs("36.918"), 36918);
});

test("toNumberEs: decimal con coma (SERPAVI CSV)", () => {
  assert.equal(toNumberEs("5,79"), 5.79);
  assert.equal(toNumberEs("1.234,56"), 1234.56);
});

test("toNumberEs: número ya numérico (XLSX raw)", () => {
  assert.equal(toNumberEs(5.79), 5.79);
  assert.equal(toNumberEs(0), 0);
});

test("toNumberEs: vacío/suprimido → NaN", () => {
  assert.ok(Number.isNaN(toNumberEs("")));
  assert.ok(Number.isNaN(toNumberEs('""')));
  assert.ok(Number.isNaN(toNumberEs(null)));
});
