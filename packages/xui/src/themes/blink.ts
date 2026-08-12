/**
 * xui blink theme - MUI v9 restyled 1:1 to the Pulse Kit, the design system of Pulse /
 * NeverBlink (an operational data-tool UI: dense, warm light-gray canvas, one indigo accent).
 *
 * Self-contained: imports only from @mui/material/styles, lucide-react (the kit's own icon set)
 * and React's createElement, so the file can be copied into any app as a single unit.
 *
 * Token source: the Pulse Kit as it exists in the app repo, vendored for the harness at
 *   apps/showcase/src/themes/blink/reference/tokens.css              (colors, spacing, type, radius)
 *   apps/showcase/src/themes/blink/reference/primitives/<Name>/*.css (per-component values)
 * Read apps/showcase/src/themes/blink/reference/README.md before changing anything here: it
 * records where the kit came from, that it was UNCOMMITTED upstream when copied, and that the kit
 * runs MUI v5 while this theme targets v9.
 *
 * Where sources disagree - and they do - the order is:
 *   the primitive's CSS module (what actually paints)  >  tokens.css  >  DESIGN.md prose
 * DESIGN.md says button labels are weight 500; Button.module.css says 600 and the live page
 * measures 600. The CSS module wins.
 *
 * Prior art, ported rather than reinvented: the app repo's `mui-themed` worktree
 * (commit e0a2c60b) holds the same design expressed as ~45 modular MUI override files. Values
 * here are ported from it and then re-verified against the primitive that paints them.
 *
 * Light scheme only. The kit ships a dark scheme (`[data-theme="dark"]`, dark-tokens.css) and
 * `mui-themed` a matching `colorDark`, but blink covers light for now; the `palette()` factory
 * below is kept in the shape that makes adding `colorSchemes.dark` a one-line change.
 *
 * Every value below carries a `// blink:` provenance comment naming the token or class it came
 * from.
 */
import { createTheme } from "@mui/material/styles"

export const blinkTheme = createTheme({
  cssVariables: true,
})
