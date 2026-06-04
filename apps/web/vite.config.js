import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// SPA Vite framework-agnóstica (docs/03 §3.1). Se despliega igual en Cloudflare
// Pages, Netlify o GitHub Pages — sin lock-in.
export default defineConfig({
  plugins: [react()],
  build: {
    // maplibre-gl es pesado: queda en su propio chunk (lazy en App).
    chunkSizeWarningLimit: 1200,
  },
});
