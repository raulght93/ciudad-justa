import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { decideGate, getFaceDetector } from "../lib/photoGate.js";

describe("blur-gate · política (decideGate)", () => {
  it("sin detector → bloquea (no se puede garantizar)", () => {
    expect(decideGate({ detectorAvailable: false, faces: [] })).toMatchObject({ action: "block" });
  });

  it("con rostros → difumina antes de subir", () => {
    const d = decideGate({ detectorAvailable: true, faces: [{}, {}] });
    expect(d.action).toBe("blur");
    expect(d.reason).toBe("faces:2");
  });

  it("sin rostros y con detector → permite subir", () => {
    expect(decideGate({ detectorAvailable: true, faces: [] })).toMatchObject({ action: "upload" });
  });

  it("nunca permite 'upload' si no hay detector, pase lo que pase", () => {
    // Defensa: aunque faces venga vacío, sin detector NO se sube.
    expect(decideGate({ detectorAvailable: false, faces: [] }).action).not.toBe("upload");
  });
});

describe("blur-gate · detector desacoplado", () => {
  afterEach(() => {
    delete window.FaceDetector;
  });

  it("reporta no disponible si el navegador no trae FaceDetector", () => {
    delete window.FaceDetector;
    expect(getFaceDetector().available).toBe(false);
  });

  it("usa FaceDetector del navegador cuando existe", () => {
    window.FaceDetector = class {
      detect() { return Promise.resolve([]); }
    };
    expect(getFaceDetector().available).toBe(true);
  });
});
