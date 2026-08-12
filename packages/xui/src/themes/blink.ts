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

// The kit carries neutral and semantic-text tokens that MUI's palette has no slot for. Declaring
// them here (rather than reaching for `sx` at every call site) is what turns them into real
// scheme-aware CSS variables - `theme.vars.palette.borderStrong` - so component overrides below can
// name a token instead of repeating a hex.
declare module "@mui/material/styles" {
  interface Palette {
    surface: string
    surfaceMuted: string
    border: string
    borderStrong: string
    borderInput: string
    textMuted: string
    textSubtle: string
    errorText: string
    warningText: string
    successText: string
    tooltipBg: string
    tooltipText: string
  }
  interface PaletteOptions {
    surface?: string
    surfaceMuted?: string
    border?: string
    borderStrong?: string
    borderInput?: string
    textMuted?: string
    textSubtle?: string
    errorText?: string
    warningText?: string
    successText?: string
    tooltipBg?: string
    tooltipText?: string
  }
}

/**
 * The kit's light token set, transcribed from reference/tokens.css exactly as written there -
 * `#5a63b0` stays hex, `rgb(229, 49, 10)` stays rgb(). Both parse; neither is converted, because a
 * rewritten colour is a value nobody can grep back to its source.
 *
 * Deliberately NOT here: the `-bg` tints and the focus ring. tokens.css builds those with
 * `color-mix(in srgb, ...)`, which MUI's colorManipulator cannot parse - putting one in the palette
 * breaks every `alpha()`/`lighten()` call that touches it. They are spelled inline, as the same
 * `color-mix` expression, in the component overrides that use them.
 */
const color = {
  primary: "#5a63b0", // blink: tokens.css --color-primary
  primaryHover: "#4f5589", // blink: tokens.css --color-primary-hover
  primaryText: "#ffffff", // blink: tokens.css --color-primary-text
  error: "rgb(229, 49, 10)", // blink: tokens.css --color-error
  warning: "rgb(244, 161, 36)", // blink: tokens.css --color-warning
  info: "rgb(70, 81, 176)", // blink: tokens.css --color-info
  success: "rgb(83, 166, 106)", // blink: tokens.css --color-success
  // AA-compliant text cuts of the semantic colours. tokens.css is explicit that the plain accent
  // above is for icons, dots, borders and solid fills, and that TEXT in a semantic colour uses
  // these instead - they are not decorative variants.
  errorText: "#b91c1c", // blink: tokens.css --color-error-text
  warningText: "#b45309", // blink: tokens.css --color-warning-text
  successText: "#15803d", // blink: tokens.css --color-success-text
  onError: "#ffffff", // blink: tokens.css --color-on-error
  onWarning: "#422c00", // blink: tokens.css --color-on-warning
  onSuccess: "#0a3a22", // blink: tokens.css --color-on-success
  onInfo: "#ffffff", // blink: tokens.css --color-on-info
  background: "#edeff0", // blink: tokens.css --color-background
  surface: "#ffffff", // blink: tokens.css --color-surface
  surfaceMuted: "#f7f8fa", // blink: tokens.css --color-surface-muted
  textDefault: "#262626", // blink: tokens.css --color-text-default
  textMuted: "#919299", // blink: tokens.css --color-text-muted
  textSubtle: "#b5b6bc", // blink: tokens.css --color-text-subtle
  border: "#edeff0", // blink: tokens.css --color-border
  borderInput: "#dddcf5", // blink: tokens.css --color-border-input
  borderStrong: "#e8e8e8", // blink: tokens.css --color-border-strong
  // Deliberately dark in a light-only theme: tokens.css calls the tooltip surface "always-dark
  // across themes", so this is the design, not an oversight.
  tooltipBg: "#454547", // blink: tokens.css --color-tooltip-bg
  tooltipText: "#f3f3f3", // blink: tokens.css --color-tooltip-text
}

/**
 * Kept as a factory over a token set rather than an inline object literal, even though it is called
 * once. The kit ships a dark scheme (dark-tokens.css) and `mui-themed` a matching `colorDark`;
 * blink covers light only for now, and this shape is what keeps adding it a one-line change
 * (`dark: { palette: palette(colorDark) }`) instead of a re-write.
 */
const palette = (c: typeof color) => ({
  primary: { main: c.primary, dark: c.primaryHover, contrastText: c.primaryText },
  error: { main: c.error, contrastText: c.onError },
  warning: { main: c.warning, contrastText: c.onWarning },
  success: { main: c.success, contrastText: c.onSuccess },
  info: { main: c.info, contrastText: c.onInfo },
  text: { primary: c.textDefault, secondary: c.textMuted },
  divider: c.borderStrong,
  background: { default: c.background, paper: c.surface },
  surface: c.surface,
  surfaceMuted: c.surfaceMuted,
  border: c.border,
  borderStrong: c.borderStrong,
  borderInput: c.borderInput,
  textMuted: c.textMuted,
  textSubtle: c.textSubtle,
  errorText: c.errorText,
  warningText: c.warningText,
  successText: c.successText,
  tooltipBg: c.tooltipBg,
  tooltipText: c.tooltipText,
})

export const blinkTheme = createTheme({
  cssVariables: true,
  colorSchemes: { light: { palette: palette(color) } },
  typography: {
    // The kit's own `--font-family-sans` is the bare string "Source Sans Pro" with no fallbacks.
    // This is the longer stack because it is what the APP's MUI theme uses (reference/
    // baselineTheme.ts, and `mui-themed` after it), and MUI is what this theme configures. Where
    // Source Sans Pro is present - the only case parity is measured in - the two resolve to the
    // same face and render identically.
    fontFamily: [
      "Source Sans Pro",
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "Noto Sans",
      "sans-serif",
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
      "Noto Color Emoji",
    ].join(","),
    // blink: baselineTheme.ts + mui-themed index.ts. The kit's Button.module.css never uppercases,
    // so MUI's default `uppercase` would be wrong on every button.
    button: { textTransform: "none" },

    // SCOPE: no pair covers the bare Typography variants, and cannot - the kit ships NO text
    // primitive (there is no Text/Typography entry among its 26, and none in its showcase). The
    // scale below is therefore the one surface in this file with no component to diff against.
    //
    // Sources, in the order the file's precedence rule applies them:
    //   - WHICH MUI slot maps to which kit step is `mui-themed`'s decision, kept as-is. It is the
    //     app author's own record and nothing in the kit overrules it. That is why body2 is the
    //     13px step: MUI's "smaller body" is the role the app gave text-xs.
    //   - The VALUES come from DESIGN.md's typography frontmatter, which the file calls normative.
    //     Where the port drifted from it, the frontmatter wins and the drift is noted per line.
    // h4/h5/h6 exist in neither the frontmatter nor tokens.css: the kit's scale has three heading
    // steps, not six. They are `mui-themed`'s extension (a 600 weight over the three body sizes),
    // kept because leaving them at MUI's Roboto-era defaults would look broken next to the rest.
    h1: { fontSize: 30, fontWeight: 600, lineHeight: 1.2 }, // blink: DESIGN.md text-2xl
    h2: { fontSize: 24, fontWeight: 600, lineHeight: 1.2 }, // blink: DESIGN.md text-xl (mui-themed had 1.25)
    h3: { fontSize: 18, fontWeight: 600, lineHeight: 1.2 }, // blink: DESIGN.md text-lg (mui-themed had 1.3)
    h4: { fontSize: 15, fontWeight: 600, lineHeight: 1.4 }, // blink: mui-themed index.ts (extends the kit scale)
    h5: { fontSize: 14, fontWeight: 600, lineHeight: 1.4 }, // blink: mui-themed index.ts (extends the kit scale)
    h6: { fontSize: 13, fontWeight: 600, lineHeight: 1.4 }, // blink: mui-themed index.ts (extends the kit scale)
    // 1.5, not DESIGN.md text-md's 1.4, and this one is deliberate: reset.css sets
    // `body { line-height: 1.5 }`, so 1.5 is what a paragraph of body text actually PAINTS in the
    // app. The file's precedence rule puts what paints above the written token, and `mui-themed`
    // reached the same 1.5.
    body1: { fontSize: 15, fontWeight: 400, lineHeight: 1.5 }, // blink: reset.css body + DESIGN.md text-md size
    body2: { fontSize: 13, fontWeight: 400, lineHeight: 1.4 }, // blink: DESIGN.md text-xs, mapped by mui-themed
  },
  // SCOPE: `shape.borderRadius` is deliberately left at MUI's own default. The kit has three radii
  // (4/6/8) chosen per component - a Button at 24px tall takes 6 and at 36px takes 8 - so a single
  // global value would be wrong somewhere no matter which of the three it picked, and it would
  // reach every untreated component besides. Each override below sets its own radius from the
  // primitive that proves it. `mui-themed` made the same call.

  components: {
    // ---- Link ----
    //
    // The kit has no Link primitive. Links are styled globally, by one rule in global.css:
    //
    //     a { text-decoration: none; color: #5a63b0; }
    //
    // That is the whole treatment - no hover style, no focus style, and no underlined variant
    // anywhere in the design system. `cursor: pointer` is the only thing `a:hover` adds.
    //
    // The colour needs no override: MUI's Link already defaults to `primary.main`, which the
    // palette above sets to the same brand hex the rule hardcodes. Only the underline has to go.
    MuiLink: {
      defaultProps: {
        // A default rather than a hard style, deliberately. It makes a plain <Link> match the app
        // while leaving `underline="always"` available to a consumer who explicitly wants one -
        // whereas forcing `text-decoration: none` in styleOverrides would break that prop for
        // everyone. MUI's own default is "always", which is what put the underline there.
        underline: "none", // blink: global.css `a { text-decoration: none }`
      },
    },
  },
})
