import { describe, it, expect } from "vitest";
import { SOURCES, KEY_STATS, LAYERS, HOUSING, MANIFESTO, HOW } from "../data/content.js";

describe("integridad del contenido", () => {
  it("toda cifra del hero cita una fuente existente", () => {
    for (const s of KEY_STATS) {
      expect(SOURCES[s.source], `fuente '${s.source}'`).toBeDefined();
    }
  });

  it("toda capa cita una fuente existente", () => {
    for (const l of LAYERS) {
      expect(SOURCES[l.source], `fuente '${l.source}'`).toBeDefined();
    }
  });

  it("cada fuente tiene label y url http(s)", () => {
    for (const [k, s] of Object.entries(SOURCES)) {
      expect(s.label, k).toBeTruthy();
      expect(s.url, k).toMatch(/^https?:\/\//);
    }
  });

  it("las tres capas son hostil/verde/servicios y tienen id único", () => {
    const ids = LAYERS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(expect.arrayContaining(["hostile", "green", "service"]));
  });

  it("las métricas de vivienda son reales y citan una fuente existente", () => {
    expect(HOUSING.metrics.length).toBeGreaterThan(0);
    for (const m of HOUSING.metrics) {
      expect(m.todo, "ya no es WIP").toBeUndefined();
      expect(m.value).not.toBe("—");
      expect(SOURCES[m.source], `fuente '${m.source}'`).toBeDefined();
    }
  });

  it("el 'cómo funciona' tiene 3 pasos numerados", () => {
    expect(HOW).toHaveLength(3);
    expect(HOW.map((s) => s.n)).toEqual([1, 2, 3]);
  });

  it("el manifiesto enumera derechos con clave y valor", () => {
    expect(MANIFESTO.rights.length).toBeGreaterThanOrEqual(4);
    for (const r of MANIFESTO.rights) {
      expect(r.k).toBeTruthy();
      expect(r.v).toBeTruthy();
    }
  });
});
