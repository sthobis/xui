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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        pure: path.resolve(__dirname, "pure.html"),
      },
    },
  },
}))
