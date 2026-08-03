/**
 * xui kumo theme - MUI v9 restyled 1:1 to Kumo, Cloudflare's design system (https://kumo-ui.com).
 *
 * Self-contained: imports only from @mui/material/styles, @phosphor-icons/react (Kumo's own icon
 * set) and React's createElement, so the file can be copied into any app as a single unit.
 *
 * Token source: the installed @cloudflare/kumo package, pinned to 2.9.0 -
 *   apps/showcase/node_modules/@cloudflare/kumo/dist/styles/theme-kumo.css   (colors, type scale)
 *   apps/showcase/node_modules/@cloudflare/kumo/dist/chunks/<component>-*.js (component classes)
 * The published dist ships readable component source with its Tailwind class strings intact - the
 * same files Kumo tells Tailwind to scan via `@source` - so it is the ground truth, exactly as the
 * CLI-installed component source is for the shadcn theme. The docs site's token table is a
 * cross-check only; where the two disagree, the installed file wins.
 *
 * Every value below carries a `// kumo:` provenance comment naming the token or class it came from.
 */
import { createTheme, type CssVarsTheme, type Theme } from "@mui/material/styles"

// ---------------------------------------------------------------------------
// Module augmentation
// ---------------------------------------------------------------------------
declare module "@mui/material/styles" {
  // Native background/text slots don't ship *Channel fields (MUI only types them on the
  // vars-internal shape, not the public Palette/PaletteOptions), so we add them here to match
  // what setColorChannel() actually populates. Same reasoning as the shadcn theme.
  interface TypeBackground {
    defaultChannel: string
    paperChannel: string
  }
  interface TypeText {
    primaryChannel: string
    secondaryChannel: string
  }

  /**
   * Kumo's semantic tokens, verbatim.
   *
   * MUI has no palette slot for most of these (a "recessed surface", a "hairline"), and forcing
   * them into primary/secondary would lose the names the ground truth is written in - every class
   * string in the package says `bg-kumo-tint`, not `bg-secondary`. They ride along as one
   * namespaced object instead: MUI's cssVariables pipeline emits a `--mui-palette-kumo-*` var for
   * every nested key, and it runs no channel derivation on slots it does not recognise, so the
   * oklch strings pass through untouched (which is what keeps parity - see oklchToRgbTriplet).
   */
  interface KumoPalette {
    // surfaces
    canvas: string
    base: string
    elevated: string
    recessed: string
    tint: string
    contrast: string
    overlay: string
    control: string
    interact: string
    fill: string
    fillHover: string
    // brand
    brand: string
    brandHover: string
    // lines, focus, shadow
    line: string
    hairline: string
    focus: string
    shadowEdge: string
    shadowDrop: string
    tipShadow: string
    tipStroke: string
    // text roles
    textDefault: string
    textInverse: string
    textStrong: string
    textSubtle: string
    textInactive: string
    textPlaceholder: string
    textBrand: string
    textLink: string
    // status: solid indicator, tint fill, and the darker text variant
    info: string
    infoTint: string
    textInfo: string
    success: string
    successTint: string
    textSuccess: string
    warning: string
    warningTint: string
    textWarning: string
    danger: string
    dangerTint: string
    textDanger: string
  }
  interface Palette {
    kumo: KumoPalette
  }
  interface PaletteOptions {
    kumo?: KumoPalette
  }

  // TouchRipple is a real themeable slot at runtime (ButtonBase/TouchRipple.js declares
  // `name: 'MuiTouchRipple', slot: 'Root'`) but MUI omits it from the public `Components` map,
  // so declaring it here is what lets the ripple backstop below typecheck.
  interface ComponentNameToClassKey {
    MuiTouchRipple: "root" | "ripple" | "rippleVisible" | "child" | "childLeaving"
  }
  interface Components {
    MuiTouchRipple?: {
      styleOverrides?: { root?: { display?: "none" } }
    }
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsSizeOverrides {
    // kumo: Button ships four sizes (xs/sm/base/lg) where MUI ships three. xs - the 20px-tall
    // `h-5 px-1.5 text-xs` button - has nowhere to land, so the theme adds it as a real size
    // rather than asking every call site to restate the dimensions.
    xsmall: true
  }
}

// ---------------------------------------------------------------------------
// Design tokens.
//
// These are the RESOLVED values every token computes to in a real Kumo app, read back out of the
// browser with getComputedStyle on the installed package's own stylesheets (once with
// `data-mode="light"`, once with `"dark"`), not transcribed from any single source file. Kumo
// writes each token as `light-dark(<light>, <dark>)` over `var(--color-neutral-900, <fallback>)`
// references into Tailwind's palette, and reading the source alone gets this wrong twice over:
//
//   - The inline fallback is NOT always Tailwind's real value. `--text-color-kumo-default` falls
//     back to oklch(21% 0.006 285.885) (that is zinc-900) while Tailwind's actual
//     --color-neutral-900 is oklch(20.5% 0 0), and the real var always wins. Same story for
//     --color-kumo-info, whose fallback is sky-500 but which resolves to blue-500.
//   - theme-kumo.css is not the last word. kumo.css redefines several tokens over the top of it,
//     so `recessed`, `contrast`, `overlay` and dark `fill-hover` all paint different values than
//     the theme file alone claims.
//
// Seven tokens were wrong on the first pass for exactly those two reasons. What paints is the
// ground truth; a source file is only evidence about it.
//
// Every value stays a literal here rather than a var() reference, so the theme carries no
// dependency on Tailwind or on Kumo's stylesheet being loaded at all - which
// e2e/preflight.spec.ts enforces by rendering every MUI cell again on a Tailwind-free page.
// ---------------------------------------------------------------------------
const light = {
  // --- surfaces ---
  canvas: "oklch(98.75% 0 0)", // kumo: --color-kumo-canvas
  base: "#ffffff", // kumo: --color-kumo-base
  elevated: "oklch(98% 0 0)", // kumo: --color-kumo-elevated
  recessed: "oklch(0.965 0 0)", // kumo: --color-kumo-recessed
  tint: "oklch(97% 0 0)", // kumo: --color-kumo-tint
  contrast: "oklch(0.12 0 0)", // kumo: --color-kumo-contrast
  overlay: "oklch(0.9875 0 0)", // kumo: --color-kumo-overlay
  control: "#ffffff", // kumo: --color-kumo-control
  interact: "oklch(87% 0 0)", // kumo: --color-kumo-interact
  fill: "oklch(92.2% 0 0)", // kumo: --color-kumo-fill
  fillHover: "oklch(96.5% 0 0)", // kumo: --color-kumo-fill-hover
  // --- brand ---
  brand: "oklch(0.5772 0.2324 260)", // kumo: --color-kumo-brand
  brandHover: "oklch(48.8% 0.243 264.376)", // kumo: --color-kumo-brand-hover
  // --- lines, focus, shadow ---
  line: "oklch(14.5% 0 0 / 0.1)", // kumo: --color-kumo-line
  hairline: "oklch(93.5% 0 0)", // kumo: --color-kumo-hairline
  focus: "oklch(15% 0 0)", // kumo: --color-kumo-focus
  shadowEdge: "oklch(0% 0 0 / 0.12)", // kumo: --color-kumo-shadow-edge
  shadowDrop: "oklch(0% 0 0 / 0.08)", // kumo: --color-kumo-shadow-drop
  tipShadow: "oklch(92.8% 0.006 264.531)", // kumo: --color-kumo-tip-shadow
  tipStroke: "transparent", // kumo: --color-kumo-tip-stroke
  // --- text roles ---
  textDefault: "oklch(0.205 0 0)", // kumo: --text-color-kumo-default (neutral-900; the source's inline fallback is zinc-900 and does NOT paint)
  textInverse: "oklch(97% 0 0)", // kumo: --text-color-kumo-inverse
  textStrong: "oklch(14.5% 0 0)", // kumo: --text-color-kumo-strong
  textSubtle: "oklch(55.6% 0 0)", // kumo: --text-color-kumo-subtle
  textInactive: "oklch(87% 0 0)", // kumo: --text-color-kumo-inactive
  textPlaceholder: "oklch(70.8% 0 0)", // kumo: --text-color-kumo-placeholder
  textBrand: "#f6821f", // kumo: --text-color-kumo-brand (Cloudflare orange, same in both schemes)
  textLink: "oklch(42.4% 0.199 265.638)", // kumo: --text-color-kumo-link
  // --- status ---
  info: "oklch(0.623 0.214 259.815)", // kumo: --color-kumo-info (blue-500; the source's inline fallback is sky-500 and does NOT paint)
  infoTint: "oklch(93.2% 0.032 255.6 / 0.45)", // kumo: --color-kumo-info-tint
  textInfo: "oklch(42.4% 0.199 265.638)", // kumo: --text-color-kumo-info
  success: "oklch(59.6% 0.145 163.225)", // kumo: --color-kumo-success
  successTint: "oklch(96.2% 0.043 156.7 / 0.57)", // kumo: --color-kumo-success-tint
  textSuccess: "oklch(43.2% 0.095 166.913)", // kumo: --text-color-kumo-success
  warning: "oklch(73.9% 0.177 58.2)", // kumo: --color-kumo-warning
  warningTint: "oklch(93.1% 0.107 94.6 / 0.2)", // kumo: --color-kumo-warning-tint
  textWarning: "oklch(59.7% 0.144 57.5)", // kumo: --text-color-kumo-warning
  danger: "oklch(63.7% 0.237 25.331)", // kumo: --color-kumo-danger
  dangerTint: "oklch(93.6% 0.032 17.7 / 0.42)", // kumo: --color-kumo-danger-tint
  textDanger: "oklch(50.5% 0.213 27.518)", // kumo: --text-color-kumo-danger
}

const dark: typeof light = {
  // --- surfaces ---
  canvas: "oklch(10% 0 0)", // kumo: --color-kumo-canvas (dark)
  base: "oklch(17% 0 0)", // kumo: --color-kumo-base (dark)
  elevated: "oklch(12% 0 0)", // kumo: --color-kumo-elevated (dark)
  recessed: "oklch(15% 0 0)", // kumo: --color-kumo-recessed (dark)
  tint: "oklch(26.9% 0 0)", // kumo: --color-kumo-tint (dark)
  contrast: "oklch(98.5% 0 0)", // kumo: --color-kumo-contrast (dark)
  overlay: "oklch(26.9% 0 0)", // kumo: --color-kumo-overlay (dark)
  control: "oklch(0.205 0 0)", // kumo: --color-kumo-control (dark, neutral-900)
  interact: "oklch(37.1% 0 0)", // kumo: --color-kumo-interact (dark)
  fill: "oklch(26.9% 0 0)", // kumo: --color-kumo-fill (dark)
  fillHover: "oklch(0.269 0 0)", // kumo: --color-kumo-fill-hover (dark; kumo.css overrides theme-kumo.css here)
  // --- brand ---
  // Transcribed as the color-mix Kumo itself writes, in the space it writes it (oklch, NOT oklab).
  brand: "color-mix(in oklch, oklch(0.5772 0.2324 260), black 10%)", // kumo: --color-kumo-brand (dark)
  brandHover: "oklch(48.8% 0.243 264.376)", // kumo: --color-kumo-brand-hover (dark, same as light)
  // --- lines, focus, shadow ---
  line: "oklch(32% 0 0)", // kumo: --color-kumo-line (dark) - opaque here, translucent in light
  hairline: "oklch(26.9% 0 0)", // kumo: --color-kumo-hairline (dark)
  focus: "oklch(93.5% 0 0)", // kumo: --color-kumo-focus (dark)
  shadowEdge: "oklch(100% 0 0 / 0.1)", // kumo: --color-kumo-shadow-edge (dark)
  shadowDrop: "oklch(0% 0 0 / 0.3)", // kumo: --color-kumo-shadow-drop (dark)
  tipShadow: "transparent", // kumo: --color-kumo-tip-shadow (dark)
  tipStroke: "oklch(26.9% 0 0)", // kumo: --color-kumo-tip-stroke (dark)
  // --- text roles ---
  textDefault: "oklch(97% 0 0)", // kumo: --text-color-kumo-default (dark)
  textInverse: "oklch(20.5% 0 0)", // kumo: --text-color-kumo-inverse (dark)
  textStrong: "oklch(98.5% 0 0)", // kumo: --text-color-kumo-strong (dark)
  textSubtle: "oklch(70.8% 0 0)", // kumo: --text-color-kumo-subtle (dark)
  textInactive: "oklch(43.9% 0 0)", // kumo: --text-color-kumo-inactive (dark)
  textPlaceholder: "oklch(55.6% 0 0)", // kumo: --text-color-kumo-placeholder (dark)
  textBrand: "#f6821f", // kumo: --text-color-kumo-brand (dark, same as light)
  textLink: "oklch(70.7% 0.165 254.624)", // kumo: --text-color-kumo-link (dark)
  // --- status ---
  info: "oklch(0.623 0.214 259.815)", // kumo: --color-kumo-info (dark, same as light)
  infoTint: "oklch(38% 0.145 265.5 / 0.22)", // kumo: --color-kumo-info-tint (dark)
  textInfo: "oklch(70.7% 0.165 254.624)", // kumo: --text-color-kumo-info (dark)
  success: "oklch(76.5% 0.177 163.223)", // kumo: --color-kumo-success (dark)
  successTint: "oklch(39.3% 0.096 152.3 / 0.2)", // kumo: --color-kumo-success-tint (dark)
  textSuccess: "oklch(90.5% 0.093 164.15)", // kumo: --text-color-kumo-success (dark)
  warning: "oklch(64.5% 0.168 50)", // kumo: --color-kumo-warning (dark)
  warningTint: "oklch(35.3% 0.079 65 / 0.37)", // kumo: --color-kumo-warning-tint (dark)
  textWarning: "oklch(75% 0.183 55.934)", // kumo: --text-color-kumo-warning (dark)
  danger: "oklch(57.7% 0.245 27.325)", // kumo: --color-kumo-danger (dark)
  dangerTint: "oklch(42.9% 0.176 28.7 / 0.17)", // kumo: --color-kumo-danger-tint (dark)
  textDanger: "oklch(70.4% 0.191 22.216)", // kumo: --text-color-kumo-danger (dark)
}

// ---------------------------------------------------------------------------
// Type scale - kumo: dist/styles/theme-kumo.css @theme block.
//
// Kumo REDEFINES Tailwind's own size tokens rather than adding to them, so `text-base` in any
// kumo class string is 14px, not Tailwind's 16px. Reading these off Tailwind's defaults instead of
// Kumo's file would put every label 2px out.
// ---------------------------------------------------------------------------
const TEXT_XS = { fontSize: "12px", lineHeight: 1 / 0.75 } // kumo: --text-xs / --text-xs--line-height
const TEXT_SM = { fontSize: "13px", lineHeight: 1 / 0.85 } // kumo: --text-sm / --text-sm--line-height
const TEXT_BASE = { fontSize: "14px", lineHeight: 1.5 } // kumo: --text-base / --text-base--line-height
const TEXT_LG = { fontSize: "16px", lineHeight: 1.5 } // kumo: --text-lg / --text-lg--line-height

// kumo-ui.com renders in Inter; the package's tokens do not pin a page font, so the app supplies it
// the same way apps/showcase/src/themes/kumo/kumo.css does.
const FONT_SANS = '"Inter Variable", ui-sans-serif, system-ui, sans-serif'

// ---------------------------------------------------------------------------
// oklch -> sRGB, for MUI's inert *Channel siblings.
//
// Same problem the shadcn theme has, same fix: MUI derives a "<slot>Channel" CSS var for every
// main-shaped palette entry by calling decomposeColor(), which cannot parse oklch() and warns.
// setColorChannel() skips derivation when a `<slot>Channel` field is already present, so we
// precompute it. The colors themselves stay oklch strings - converting them away from oklch is what
// breaks parity - and only the inert channel siblings become sRGB triplets.
//
// Kumo needs a wider parser than shadcn's did, because its token file mixes four notations:
// percentage lightness `oklch(21% 0.006 285.885)`, unit-interval lightness `oklch(0.5772 ...)`,
// an alpha suffix `/ 0.1`, plain hex, and one color-mix. Anything unparseable would otherwise
// throw at import time.
// ---------------------------------------------------------------------------
function oklchToRgbTriplet(css: string): string {
  const value = css.trim()

  if (value === "transparent") return "0 0 0"

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, (c) => c + c) : hex[1]
    return `${parseInt(h.slice(0, 2), 16)} ${parseInt(h.slice(2, 4), 16)} ${parseInt(h.slice(4, 6), 16)}`
  }

  // color-mix(in oklch, <color>, black|white N%) - the one form Kumo uses (dark --color-kumo-brand).
  // Mixing in oklch with black or white is linear on L and C at the stated weight, and the hue of
  // the chromatic side carries through unchanged (black and white have no hue of their own).
  const mix = value.match(/^color-mix\(\s*in oklch,\s*(.+),\s*(black|white)\s+([\d.]+)%\s*\)$/i)
  if (mix) {
    const [L, C, H] = parseOklch(mix[1])
    const weight = Number(mix[3]) / 100
    const targetL = mix[2].toLowerCase() === "white" ? 1 : 0
    return oklchTripletFrom(L * (1 - weight) + targetL * weight, C * (1 - weight), H)
  }

  const [L, C, H] = parseOklch(value)
  return oklchTripletFrom(L, C, H)
}

/** Returns [L (0-1), C, H]; accepts both `21%` and `0.21` lightness, and ignores any `/ alpha`. */
function parseOklch(css: string): [number, number, number] {
  const m = css.trim().match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/)
  if (!m) throw new Error(`oklchToRgbTriplet: cannot parse "${css}"`)
  const L = m[2] === "%" ? Number(m[1]) / 100 : Number(m[1])
  return [L, Number(m[3]), Number(m[4])]
}

/** CSS Color 4 / Ottosson oklch -> sRGB, identical math to the shadcn theme's converter. */
function oklchTripletFrom(L: number, C: number, H: number): string {
  const h = (H * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

  const gamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)
  const toByte = (linear: number) => Math.round(Math.min(1, Math.max(0, gamma(linear))) * 255)

  return `${toByte(rLin)} ${toByte(gLin)} ${toByte(bLin)}`
}

function schemePalette(t: typeof light) {
  return {
    // canvas is the page behind everything; base is a component's own surface. MUI's
    // background.default/paper split lines up with that exactly.
    background: {
      default: t.canvas, // kumo: bg-kumo-canvas
      defaultChannel: oklchToRgbTriplet(t.canvas),
      paper: t.base, // kumo: bg-kumo-base
      paperChannel: oklchToRgbTriplet(t.base),
    },
    text: {
      primary: t.textDefault, // kumo: text-kumo-default
      primaryChannel: oklchToRgbTriplet(t.textDefault),
      secondary: t.textSubtle, // kumo: text-kumo-subtle
      secondaryChannel: oklchToRgbTriplet(t.textSubtle),
    },
    // Kumo has one flat color per role, so light/dark are pinned to main - leaving them undefined
    // makes MUI derive them with lighten()/darken(), which call decomposeColor() and throw on
    // oklch ("MUI: Unsupported `oklch(...)` color") at createTheme() time.
    primary: {
      main: t.brand, // kumo: --color-kumo-brand
      mainChannel: oklchToRgbTriplet(t.brand),
      light: t.brand,
      dark: t.brand,
      contrastText: "#ffffff", // kumo: the emphasis variants force !text-white
    },
    error: {
      main: t.danger, // kumo: --color-kumo-danger
      mainChannel: oklchToRgbTriplet(t.danger),
      light: t.danger,
      dark: t.danger,
      contrastText: "#ffffff", // kumo: destructive is an emphasis variant, likewise !text-white
    },
    warning: {
      main: t.warning, // kumo: --color-kumo-warning
      mainChannel: oklchToRgbTriplet(t.warning),
      light: t.warning,
      dark: t.warning,
      contrastText: t.textWarning,
    },
    info: {
      main: t.info, // kumo: --color-kumo-info
      mainChannel: oklchToRgbTriplet(t.info),
      light: t.info,
      dark: t.info,
      contrastText: t.textInfo,
    },
    success: {
      main: t.success, // kumo: --color-kumo-success
      mainChannel: oklchToRgbTriplet(t.success),
      light: t.success,
      dark: t.success,
      contrastText: t.textSuccess,
    },
    divider: t.line, // kumo: --color-kumo-line
    kumo: { ...t },
  }
}

// createTheme's cssVariables-flavored overload types styleOverrides callbacks' `theme` param as
// `Theme & CssVarsTheme` (vars required), not the plain (vars-optional) `Theme` export.
export type KumoThemeWithVars = Theme & CssVarsTheme

export const kumoTheme = createTheme({
  cssVariables: {
    // kumo: `<html data-mode="dark">` is Kumo's own convention (its tokens resolve through CSS
    // light-dark(), switched by this attribute). MUI turns a `data-*` selector string that has no
    // `%s` into `[data-mode="%s"]` - see @mui/system cssVars/prepareCssVars.mjs - and
    // useColorScheme().setMode then writes the attribute itself, so ONE toggle moves the MUI theme
    // and Kumo's own stylesheet together. That is what makes this theme a drop-in for a real Kumo
    // app rather than something that needs its own mode plumbing.
    colorSchemeSelector: "data-mode",
  },
  colorSchemes: {
    light: { palette: schemePalette(light) },
    dark: { palette: schemePalette(dark) },
  },
  typography: {
    fontFamily: FONT_SANS,
    // Kumo's default body copy is `text-base`, which its own theme file redefines to 14px.
    fontSize: 14,
  },
  components: {
    // -----------------------------------------------------------------------
    // No ripple, anywhere
    //
    // Kumo has no ripple on any component, so the theme guarantees its absence in the same three
    // layers the shadcn theme needs (see that file for the full reasoning):
    //  1. MuiButtonBase.defaultProps covers everything that simply forwards the prop.
    //  2. Checkbox/Radio/Switch/ToggleButton resolve their OWN default before forwarding and never
    //     see layer 1, so each restates it in its own block below.
    //  3. MuiTouchRipple's styleOverrides as the backstop, because layers 1-2 are an enumeration
    //     and an enumeration is only correct until the next component or MUI version.
    // -----------------------------------------------------------------------
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
        disableTouchRipple: true,
        focusRipple: false,
      },
    },
    MuiTouchRipple: {
      styleOverrides: {
        root: {
          display: "none", // backstop - see the "No ripple, anywhere" banner above
        },
      },
    },
    MuiButtonGroup: {
      defaultProps: {
        // A group publishes its resolved disableRipple through ButtonGroupContext, and Button reads
        // context at higher priority than theme defaults - so without this it hands the ripple back
        // to every child.
        disableRipple: true,
      },
    },
  },
})

// Re-exported so component blocks added below (and the gallery's own sections) can name the scale
// without re-deriving it from the package.
export const KUMO_TEXT = { xs: TEXT_XS, sm: TEXT_SM, base: TEXT_BASE, lg: TEXT_LG }
