import "@testing-library/jest-dom/vitest";

// jsdom no implementa matchMedia (lo usan los hooks de reveal / reduced-motion).
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// IntersectionObserver tampoco existe en jsdom: stub que revela de inmediato.
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    constructor(cb) {
      this.cb = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
