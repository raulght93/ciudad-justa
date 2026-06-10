import { test } from "node:test";
import assert from "node:assert/strict";
import { geohash } from "../src/geohash.js";

test("geohash: longitud y charset base32 correctos", () => {
  const h = geohash(41.3851, 2.1734);
  assert.equal(h.length, 7);
  assert.match(h, /^[0-9b-hjkmnp-z]{7}$/); // base32 geohash (sin a,i,l,o)
});

test("geohash: precisión configurable", () => {
  assert.equal(geohash(41.3851, 2.1734, 5).length, 5);
});

test("geohash: determinista (mismo punto → mismo hash)", () => {
  assert.equal(geohash(37.8882, -4.7794), geohash(37.8882, -4.7794));
});

test("geohash: puntos distintos → hashes distintos", () => {
  assert.notEqual(geohash(41.3851, 2.1734), geohash(37.8882, -4.7794));
});

test("geohash: prefijo común para puntos cercanos", () => {
  const a = geohash(41.3851, 2.1734);
  const b = geohash(41.3855, 2.1738);
  assert.equal(a.slice(0, 5), b.slice(0, 5)); // mismos ~5 chars de prefijo
});
