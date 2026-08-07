import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/*.spec.ts"],
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
    // Take font HINTING out of the comparison, on every platform.
    //
    // Hinting snaps a glyph's outline to the pixel grid, and which way it snaps depends on where the
    // glyph starts. Two runs of the same text a fraction of a pixel apart therefore do not blur into
    // each other - they quantise to different grids and the difference is a hard edge. That is
    // exactly what the Linux job was reporting: on seven pairs, every differing pixel sat inside a
    // text band, no capture differed in SIZE, and the signed difference averaged about zero against
    // a large absolute one (stepper-horizontal: -0.1 against 46.2), which is a positional shift
    // rather than a colour or weight change. macOS never showed it because CoreText hints far less
    // aggressively, so the same sub-pixel offset rounded away there.
    //
    // Turning hinting off does not hide a real difference: geometry, colour and layout all still
    // diff exactly as before, and a genuine misplacement still moves whole pixels. It removes an
    // amplifier that turns a sub-pixel offset into a hard-edged one, and that amplifier is a
    // property of the rasterizer rather than of the theme. `--disable-lcd-text` goes with it so both
    // sides use grayscale antialiasing rather than subpixel RGB, whose fringes are direction- and
    // background-dependent.
    launchOptions: {
      args: ["--font-render-hinting=none", "--disable-lcd-text"],
    },
  },
  projects: [
    { name: "light", use: { colorScheme: "light" } },
    { name: "dark", use: { colorScheme: "light" } }, // mode is set via the app toggle, not the OS scheme
  ],
  webServer: {
    command: "pnpm --filter showcase dev --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
})
