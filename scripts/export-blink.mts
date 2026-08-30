/**
 * Writes the comment-free vendored copy of the blink theme into the app checkout.
 *
 * The app carries blink.ts as a single vendored file with no provenance comments and no
 * reference back to this repo; this script IS the copy mechanism, so the app never needs
 * to know where the file comes from. Run it after any change to the theme:
 *
 *   pnpm export:blink            # writes ../app/src/themes/blink.ts
 *   pnpm export:blink /path/app  # a different checkout
 *
 * The paired test in e2e/lib/app-copy-sync.test.ts fails `pnpm test:unit` while the app
 * copy is stale, so forgetting this step shows up here rather than as silent drift there.
 */
import { execSync } from "node:child_process"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { stripComments } from "../apps/showcase/src/gallery/stripComments.ts"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const appDir = resolve(process.argv[2] ?? resolve(root, "../app"))
const target = resolve(appDir, "src/themes/blink.ts")

if (!existsSync(target)) {
  console.error(`no vendored copy at ${target} - is ${appDir} an app checkout?`)
  process.exit(1)
}

// The header is the one comment the vendored file keeps, and this is its single home.
const HEADER = `/**
 * The NeverBlink design system as a MUI v9 theme.
 *
 * It styles every \`@mui/material\` component, so app code writes plain MUI and gets the
 * product's look without wrapper components. It also carries the token vocabulary the rest
 * of the app styles against - the semantic palette entries, \`theme.radius\`, \`theme.shadow\` -
 * documented in ./README.md. Read that; this file is the implementation.
 *
 * VENDORED, and deliberately comment-free: it is maintained as a single unit outside this
 * repo and copied in wholesale, so a hand-edit here is lost on the next update and silently
 * drifts the app away from the design system. Change it at the source and re-copy.
 *
 * Light scheme only. The \`palette()\` factory below is shaped so adding \`colorSchemes.dark\`
 * is a one-line change.
 */
`

const source = readFileSync(resolve(root, "packages/xui/src/themes/blink.ts"), "utf8")
writeFileSync(target, HEADER + stripComments(source))

// The app formats with its own prettier-via-eslint; run it there so the write is committable as-is.
execSync("npx eslint --fix src/themes/blink.ts", { cwd: appDir, stdio: "inherit" })
console.log(`exported blink theme -> ${target}`)
