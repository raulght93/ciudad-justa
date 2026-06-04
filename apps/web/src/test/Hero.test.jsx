import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "../components/Hero.jsx";
import { KEY_STATS, SOURCES } from "../data/content.js";

describe("<Hero>", () => {
  it("muestra el titular y un CTA al mapa", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/diseño urbano/i);
    const cta = screen.getByRole("link", { name: /ver el mapa/i });
    expect(cta).toHaveAttribute("href", "#mapa");
  });

  it("muestra la etiqueta de cada cifra clave", () => {
    render(<Hero />);
    for (const s of KEY_STATS) {
      expect(screen.getByText(s.label)).toBeInTheDocument();
    }
  });

  it("cada cifra enlaza a su fuente verificable", () => {
    render(<Hero />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((a) => a.getAttribute("href"));
    for (const s of KEY_STATS) {
      expect(hrefs).toContain(SOURCES[s.source].url);
    }
  });
});
