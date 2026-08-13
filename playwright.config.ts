import { defineConfig } from "@playwright/test"

/**
 * The showcase port, overridable with PARITY_PORT.
 *
 * `reuseExistingServer` below attaches to whatever is ALREADY listening on this port rather than
 * starting one, which is what makes local iteration fast - and which silently points the whole
 * suite at the wrong code the moment two checkouts of this repo exist. Measured: with a dev server
 * running from the main checkout, a parity run inside a git worktree reported a failure for
 * `tablepagination-rows`, a pair that does not exist in the worktree at all. Every number in that
 * run described the other checkout's uncommitted working tree.
 *
 * A worktree therefore needs its own port: `PARITY_PORT=5273 pnpm verify`. The default is unchanged,
 * so the primary checkout keeps working exactly as before.
 */
const PORT = process.env.PARITY_PORT ?? "5173"
const ORIGIN = `http://localhost:${PORT}`

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["**/*.spec.ts"],
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: ORIGIN,
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
  // `<theme>-<mode>`, parsed by e2e/lib/themes.ts. The mode half never sets the OS colorScheme:
  // every theme's dark mode is driven by the in-app toggle, so both halves stay "light" here.
  projects: [
    { name: "shadcn-light", use: { colorScheme: "light" } },
    { name: "shadcn-dark", use: { colorScheme: "light" } },
    { name: "kumo-light", use: { colorScheme: "light" } },
    { name: "kumo-dark", use: { colorScheme: "light" } },
  ],
  webServer: {
    command: `pnpm --filter showcase dev --port ${PORT} --strictPort`,
    url: ORIGIN,
    reuseExistingServer: !process.env.CI,
  },
})
