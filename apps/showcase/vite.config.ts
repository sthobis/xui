import path from "node:path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

// The production build is served from https://sthobis.github.io/xui/, so assets
// must resolve under the /xui/ subpath. Dev (and the Playwright parity harness,
// which navigates to localhost:5173/) stays at the root base.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/xui/" : "/",
  plugins: [react(), tailwindcss()],
  // Honour PORT so a second checkout can run its own dev server without colliding with the primary
  // one. Vite does not read PORT on its own, and this repo needs it: a worktree that shares 5173
  // with another checkout does not merely fail to start - Playwright's `reuseExistingServer`
  // silently ATTACHES to whichever server got there first and measures that checkout's code
  // instead (see PARITY_PORT in playwright.config.ts). Unset, this is Vite's usual 5173.
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    // Fail loudly on a collision rather than drifting to 5174, which would leave the harness
    // pointing at whatever else is on the port it expected.
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      // One entry per theme, plus its Tailwind-free preflight twin. Each page compiles its own
      // independent CSS graph, which is the point: the two design systems' Tailwind themes, base
      // layers and fonts must never load together, or a 0-threshold pixel harness would be
      // measuring whichever one won the cascade.
      input: {
        main: path.resolve(__dirname, "index.html"),
        pure: path.resolve(__dirname, "pure.html"),
        kumo: path.resolve(__dirname, "kumo.html"),
        kumoPure: path.resolve(__dirname, "kumo-pure.html"),
      },
    },
  },
}))
