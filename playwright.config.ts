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
  },
  // `<theme>-<mode>`, parsed by e2e/lib/themes.ts. The mode half never sets the OS colorScheme:
  // every theme's dark mode is driven by the in-app toggle, so both halves stay "light" here.
  projects: [
    { name: "shadcn-light", use: { colorScheme: "light" } },
    { name: "shadcn-dark", use: { colorScheme: "light" } },
  ],
  webServer: {
    command: `pnpm --filter showcase dev --port ${PORT} --strictPort`,
    url: ORIGIN,
    reuseExistingServer: !process.env.CI,
  },
})
