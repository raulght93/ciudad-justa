import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import axe from "axe-core";
import Layers from "../components/Layers.jsx";
import Manifesto, { How } from "../components/Manifesto.jsx";
import Housing from "../components/Housing.jsx";
import { HOW } from "../data/content.js";

// Reglas a nivel de documento que no aplican al renderizar componentes sueltos,
// y color-contrast (jsdom no computa estilos; el contraste se audita aparte).
const DISABLED = [
  "color-contrast",
  "region",
  "landmark-one-main",
  "page-has-heading-one",
  "heading-order",
];

async function violations(ui) {
  const { container } = render(
    <main>
      <h1 style={{ position: "absolute", left: -9999 }}>Test</h1>
      {ui}
    </main>
  );
  const results = await axe.run(container, {
    rules: Object.fromEntries(DISABLED.map((r) => [r, { enabled: false }])),
  });
  return results.violations;
}

describe("accesibilidad (axe-core)", () => {
  it("la sección de capas no tiene violaciones", async () => {
    expect(await violations(<Layers />)).toEqual([]);
  });

  it("el manifiesto no tiene violaciones", async () => {
    expect(await violations(<Manifesto />)).toEqual([]);
  });

  it("el 'cómo funciona' no tiene violaciones", async () => {
    expect(await violations(<How steps={HOW} />)).toEqual([]);
  });

  it("el área de vivienda no tiene violaciones", async () => {
    expect(await violations(<Housing />)).toEqual([]);
  });
});
