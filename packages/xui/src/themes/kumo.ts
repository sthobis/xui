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
import { CheckIcon, MinusIcon } from "@phosphor-icons/react"
// createElement rather than JSX, because this file is a plain .ts module - JSX syntax is only valid
// in .tsx. React is not a new dependency: it is already xui's peer, required by every MUI component
// the theme configures.
import { createElement } from "react"

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
    // badge fills (Badge's colour variants name these directly)
    badgeBlue: string
    badgeGreen: string
    badgeOrange: string
    badgeNeutral: string
    badgeRed: string
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

declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    // kumo: Badge's colour variants. Named for the hue exactly as Kumo names them, rather than
    // remapped onto MUI's primary/secondary, because that is the vocabulary its ground truth uses.
    blue: true
    green: true
    orange: true
    neutral: true
    red: true
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
  // --- badge fills (Badge names these directly; they are NOT the status indicator colours) ---
  badgeBlue: "oklch(0.546 0.245 262.881)", // kumo: --color-kumo-badge-blue
  badgeGreen: "oklch(0.596 0.145 163.225)", // kumo: --color-kumo-badge-green
  badgeOrange: "oklch(0.815 0.197 76)", // kumo: --color-kumo-badge-orange
  badgeNeutral: "oklch(0.556 0 0)", // kumo: --color-kumo-badge-neutral
  badgeRed: "oklch(0.577 0.245 27.325)", // kumo: --color-kumo-badge-red
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
  // --- badge fills ---
  badgeBlue: "oklch(0.488 0.243 264.376)", // kumo: --color-kumo-badge-blue (dark)
  badgeGreen: "oklch(0.508 0.118 165.612)", // kumo: --color-kumo-badge-green (dark)
  badgeOrange: "oklch(0.815 0.197 76)", // kumo: --color-kumo-badge-orange (dark, same as light)
  badgeNeutral: "oklch(0.439 0 0)", // kumo: --color-kumo-badge-neutral (dark)
  badgeRed: "oklch(0.505 0.213 27.518)", // kumo: --color-kumo-badge-red (dark)
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

// ---------------------------------------------------------------------------
// Button
//
// Ground truth: dist/chunks/button-eikucjpgqbsn5m5m.js (the real source; dist/components/button.js
// is a 200-byte re-export). Its class strings, verbatim:
//
//   base:  group flex w-max shrink-0 items-center font-medium select-none
//          border-0 shadow-xs
//          focus:ring-kumo-focus/50 focus:outline-none focus-visible:ring-2
//          focus-visible:ring-kumo-brand
//          cursor-pointer disabled:cursor-not-allowed disabled:text-kumo-subtle
//   size:  xs   h-5   gap-1   rounded-sm px-1.5 text-xs
//          sm   h-6.5 gap-1   rounded-md px-2   text-xs
//          base h-9   gap-1.5 rounded-lg px-3   text-base
//          lg   h-10  gap-2   rounded-lg px-4   text-base
//   shape: square  items-center justify-center p-0
//          circle  items-center justify-center p-0 rounded-full
//   compactSize (square/circle only): xs size-3.5  sm size-6.5  base size-9  lg size-10
//   variant:
//     primary      relative overflow-hidden bg-(--kumo-button-emphasis-bg) !text-white
//                  ring ring-(--kumo-button-emphasis-ring) disabled:opacity-50
//     secondary    bg-kumo-base !text-kumo-default ring ring-kumo-line
//                  not-disabled:hover:bg-kumo-tint disabled:bg-kumo-base/50
//                  disabled:!text-kumo-default/70
//     ghost        text-kumo-default hover:bg-kumo-tint shadow-none bg-inherit
//     destructive  (identical to primary; only the emphasis token differs)
//     secondary-destructive
//                  bg-kumo-base !text-kumo-danger ring ring-kumo-line
//                  not-disabled:hover:ring-kumo-danger/30 disabled:bg-kumo-base/50
//     outline      bg-transparent text-kumo-default ring ring-kumo-line transition-colors
//                  not-disabled:hover:text-kumo-strong not-disabled:hover:ring-kumo-focus/25
//
// and the root's own className adds `disabled && "cursor-not-allowed opacity-50"`, so EVERY
// disabled button is dimmed on top of whatever its variant does.
//
// GOTCHA 1 - the border is not a border. Kumo sets `border-0` and draws its outline with Tailwind's
// `ring`, which is a box-shadow layer, so the outline sits OUTSIDE the border box and adds nothing
// to layout. MUI's `outlined` variant uses a real 1px border, which would make every themed button
// 2px wider and taller than its twin. Every variant here therefore pins borderWidth to 0 and
// composes the ring into boxShadow instead.
//
// GOTCHA 2 - primary and destructive are not flat fills. Kumo renders an extra absolutely
// positioned span inside the button carrying a vertical gradient plus an inset highlight
// (`absolute inset-0 rounded-[inherit] bg-linear-to-b from-(--...-gradient-start)
// to-(--...-gradient-end) shadow-[inset_0_1px_0_0_var(--...-emphasis-bg)]`). MUI's Button has no
// such element and its children are bare text nodes, so there is nothing to wrap. Since the span is
// `inset: 0` on a border-width-0 box, its padding box IS the root's border box - which makes the
// span exactly equivalent to a background-image and an inset shadow on the root itself. That is how
// it is reproduced below: no pseudo-element, no wrapper, and nothing for the text to sit under.
// ---------------------------------------------------------------------------

/** kumo: Tailwind's `shadow-xs`, which the button's base classes apply to every variant but ghost. */
const SHADOW_XS = "0 1px 2px 0 rgb(0 0 0 / 0.05)"

/**
 * kumo: Tailwind's `shadow-lg`, which every kumo overlay wears.
 *
 * Its colour is Tailwind's own default black/10 and does NOT change with the colour scheme - only
 * the components that pass a `shadow-<color>` class (Tooltip and Popover, via `shadow-kumo-tip-
 * shadow`) replace it, and those spell their own shadow out rather than using this.
 */
const SHADOW_LG = "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"

/**
 * kumo: the three paths of the 20x10 arrow SVG that Tooltip and Popover both render, copied
 * verbatim from either component's own ArrowSvg.
 *
 * Three rather than one because the outer and inner strokes have different geometry, so the arrow's
 * border can meet the popup's outline correctly in both schemes; only one of the two is ever
 * opaque, since `tip-stroke` is transparent in light and `tip-shadow` is transparent in dark.
 */
const ARROW_FILL_PATH =
  "M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
const ARROW_OUTER_STROKE_PATH =
  "M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
const ARROW_INNER_STROKE_PATH =
  "M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"

type KumoButtonSize = "xsmall" | "small" | "medium" | "large"

/** kumo: the four size rows of KUMO_BUTTON_VARIANTS.size, resolved against Kumo's own type scale. */
const BUTTON_SIZES: Record<KumoButtonSize, { height: string; padX: string; radius: string; gap: string; text: { fontSize: string; lineHeight: number }; compact: string }> = {
  // MUI has no `xs`, so the theme adds one (see the ButtonPropsSizeOverrides augmentation above).
  xsmall: { height: "20px", padX: "6px", radius: "4px", gap: "4px", text: TEXT_XS, compact: "14px" }, // kumo: h-5 px-1.5 rounded-sm gap-1 text-xs / size-3.5
  small: { height: "26px", padX: "8px", radius: "6px", gap: "4px", text: TEXT_XS, compact: "26px" }, // kumo: h-6.5 px-2 rounded-md gap-1 text-xs / size-6.5
  medium: { height: "36px", padX: "12px", radius: "8px", gap: "6px", text: TEXT_BASE, compact: "36px" }, // kumo: h-9 px-3 rounded-lg gap-1.5 text-base / size-9
  large: { height: "40px", padX: "16px", radius: "8px", gap: "8px", text: TEXT_BASE, compact: "40px" }, // kumo: h-10 px-4 rounded-lg gap-2 text-base / size-10
}

/**
 * kumo: getEmphasisStyle() in the button chunk, which sets four custom properties from one token.
 * Transcribed as the color-mix expressions Kumo writes, in the space it writes them (oklch).
 */
function emphasis(token: string) {
  return {
    bg: `color-mix(in oklch, ${token}, white 30%)`, // kumo: --kumo-button-emphasis-bg
    ring: `color-mix(in oklch, ${token}, black 10%)`, // kumo: --kumo-button-emphasis-ring
    gradientStart: `color-mix(in oklch, ${token}, white 15%)`, // kumo: --kumo-button-emphasis-gradient-start
    gradientEnd: token, // kumo: --kumo-button-emphasis-gradient-end
  }
}

/** The shared geometry every Kumo button has, whatever its variant. */
function buttonBase(size: KumoButtonSize) {
  const s = BUTTON_SIZES[size]
  return {
    display: "flex", // kumo: flex (MUI's own default is inline-flex)
    width: "max-content", // kumo: w-max
    minWidth: 0, // MUI defaults to a 64px minWidth; Kumo has none, so a short label would be padded out
    flexShrink: 0, // kumo: shrink-0
    alignItems: "center", // kumo: items-center
    justifyContent: "normal", // kumo: base has no justify-* (only the square/circle shapes add one)
    boxSizing: "border-box" as const,
    height: s.height,
    padding: `0 ${s.padX}`, // kumo: px-* only; there is no py-* class, the height plus centering does it
    gap: s.gap,
    borderRadius: s.radius,
    border: 0, // kumo: border-0 - the visible outline is a `ring`, i.e. a box-shadow (see GOTCHA 1)
    fontSize: s.text.fontSize,
    lineHeight: s.text.lineHeight,
    fontWeight: 500, // kumo: font-medium
    textTransform: "none" as const,
    letterSpacing: "normal",
    userSelect: "none" as const, // kumo: select-none
    cursor: "pointer", // kumo: cursor-pointer
    "&.Mui-disabled": {
      cursor: "not-allowed", // kumo: disabled:cursor-not-allowed
      opacity: 0.5, // kumo: the root className's own `disabled && "opacity-50"`, applied to every variant
      pointerEvents: "auto" as const, // ...which MUI would otherwise suppress, hiding the cursor above
      // MUI's `outlined` variant grows a REAL 1px border once disabled, at a specificity the root's
      // own `border: 0` does not reach. Kumo's outline is a ring (a box-shadow) in every state, so
      // the border must be restated here or a disabled button is 2px wider and taller than its twin
      // - measured at exactly that, 84.19px against 82.19px.
      border: 0,
    },
    // MUI spaces its icons with margins on the icon wrapper; Kumo uses the flex `gap` set above, so
    // the margins have to go or every iconed button is wider than its twin.
    "& .MuiButton-startIcon, & .MuiButton-endIcon": {
      margin: 0,
    },
    // Kumo renders a Phosphor icon at its default `1em`, where MUI forces 20px on the first child.
    "& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)": {
      fontSize: "inherit",
    },
  }
}

/** kumo: `ring` is a 1px box-shadow layer, stacked in front of the base `shadow-xs`. */
function ringWith(color: string, width = 1) {
  return `0 0 0 ${width}px ${color}, ${SHADOW_XS}`
}

/**
 * kumo: Toolbar's bar chrome - `inline-flex w-fit items-stretch rounded-lg bg-kumo-control
 * shadow-xs ring ring-kumo-line` (dist/chunks/toolbar-gwd1orc8yl7lzaou.js, the `Root` className).
 *
 * ONE definition, two MUI shapes. MUI splits across two components what Kumo ships as one: a joined
 * bar of actions is `ButtonGroup`, a joined bar of selectable segments is `ToggleButtonGroup`, and
 * Kumo's answer to both is `Toolbar`. So both MUI blocks read this helper rather than one of them
 * copying values off the other - the thing this repo has been bitten by every time.
 */
function toolbarBarChrome(control: string, line: string) {
  return {
    display: "inline-flex", // kumo: inline-flex
    width: "fit-content", // kumo: w-fit
    alignItems: "stretch", // kumo: items-stretch
    borderRadius: "8px", // kumo: rounded-lg
    backgroundColor: control, // kumo: bg-kumo-control
    boxShadow: ringWith(line), // kumo: ring ring-kumo-line + shadow-xs
  }
}

/**
 * kumo: `toolbarControlClassName` in the same chunk - what a Toolbar puts on each child.
 *
 *   relative min-w-0 border-0 bg-transparent shadow-none ring-0
 *   not-first:border-l not-first:border-kumo-line
 *
 * The ring, the shadow and the fill all live on the BAR; a child is transparent and unringed, and
 * meets its neighbour over a single left rule rather than over two collapsed borders.
 */
function toolbarControlChrome(line: string, tint: string) {
  return {
    backgroundColor: "transparent", // kumo: bg-transparent
    boxShadow: "none", // kumo: shadow-none ring-0
    minWidth: 0, // kumo: min-w-0
    "&:hover, &:active, &.Mui-focusVisible": { boxShadow: "none" },
    "&:hover": { backgroundColor: tint }, // kumo: the ghost control's hover:bg-kumo-tint
    // kumo: neighbours are divided by a single rule rather than by each child's own ring
    "&:not(:first-of-type)": { borderLeft: `1px solid ${line}` },
    // MUI pulls each child 1px into its neighbour so their two borders collapse into one. Kumo has
    // only one border to begin with, so the bar came out 2px narrow.
    "&:not(:last-of-type)": { marginRight: 0 },
    marginLeft: 0,
  }
}

/** The Kumo tokens the input shells read. Structural, so `theme.vars.palette.kumo` satisfies it. */
type KumoInputTokens = {
  textDefault: string
  control: string
  line: string
  danger: string
  focus: string
  textPlaceholder: string
}

/**
 * kumo: the Input box - dist/chunks/input-o3mtvvtqf69j5k10.js. See the Input banner below for the
 * full class rows and the two ways it differs from Button.
 *
 * MUI ships THREE input shells for three Material looks - `Input` (underlined), `FilledInput`
 * (filled + underlined) and `OutlinedInput`. Kumo has exactly ONE input, so all three resolve to
 * this same box and the underline variants additionally clear their ::before/::after rules. That
 * is the same call shadcn's theme makes, and for the same reason: a drop-in theme should never
 * leave a variant rendering as Material.
 */
function kumoInputBox(k: KumoInputTokens, multiline: boolean) {
  return {
    boxSizing: "border-box" as const,
    ...TEXT_BASE, // kumo: text-base
    fontWeight: 400,
    letterSpacing: "normal",
    color: k.textDefault, // kumo: text-kumo-default
    backgroundColor: k.control, // kumo: bg-kumo-control
    borderRadius: "8px", // kumo: rounded-lg
    border: 0, // kumo: border-0
    padding: 0, // the padding belongs to the control itself, as it does in Kumo
    // kumo: ring ring-kumo-line - and NO shadow-xs, unlike every Button variant.
    boxShadow: `0 0 0 1px ${k.line}`,
    ...(multiline ? { height: "auto" } : { height: "36px" }), // kumo: InputArea's h-auto / h-9
  }
}

/** kumo: the Input box's focus, error and disabled rows - shared by all three MUI shells. */
function kumoInputBoxStates(k: KumoInputTokens) {
  return {
    // kumo: focus:ring-[1.5px] focus:ring-kumo-focus/50. Plain :focus on the control, so
    // `:has(:focus)` rather than MUI's `.Mui-focused` (which also fires for programmatic focus)
    // and rather than :focus-visible (which a click would not match).
    "&:has(:focus)": {
      boxShadow: `0 0 0 1.5px color-mix(in oklab, ${k.focus} 50%, transparent)`,
    },
    "&.Mui-error": {
      boxShadow: `0 0 0 1px ${k.danger}`, // kumo: !ring-kumo-danger
      "&:has(:focus)": {
        // kumo: `focus:ring-kumo-danger/50 focus:ring-[1.5px]` - but the `!` on the resting
        // `!ring-kumo-danger` makes that colour !important, so it BEATS the /50 tint while the
        // width still widens. A focused error ring is therefore solid danger at 1.5px, not a 50%
        // wash of it. Taking the class list at face value renders a visibly paler outline (Δ103).
        boxShadow: `0 0 0 1.5px ${k.danger}`,
      },
    },
    "&.Mui-disabled": {
      // Kumo's own `disabled:text-kumo-disabled` names a token the package does not define, so it
      // resolves to nothing and a disabled field keeps its normal colours. Restated here because
      // MUI otherwise greys both the text and the outline.
      color: k.textDefault,
      backgroundColor: k.control,
      boxShadow: `0 0 0 1px ${k.line}`,
    },
  }
}

/** kumo: the control inside the box - `px-3`, plus `py-2` when it is an InputArea. */
function kumoInputControl(k: KumoInputTokens, multiline: boolean) {
  return {
    padding: multiline ? "8px 12px" : "0 12px", // kumo: px-3, plus py-2 on InputArea
    // kumo: InputGroup tightens the field's padding on the side an addon sits, from 12px to 8px,
    // and the addon carries the rest of the gap itself.
    ".MuiInputBase-adornedEnd &": { paddingRight: "8px" },
    ".MuiInputBase-adornedStart &": { paddingLeft: "8px" },
    height: multiline ? "auto" : "100%",
    boxSizing: "border-box" as const,
    // Kumo's InputArea is a plain <textarea>, so it keeps the UA's vertical resize grip. MUI sets
    // `resize: none` on its own, which erased the grip - Δ153 over the ~40 corner pixels it takes.
    ...(multiline && { resize: "vertical" as const }),
    "&::placeholder": {
      color: k.textPlaceholder, // kumo: the `kumo-input-placeholder` class
      opacity: 1, // MUI dims its placeholder with opacity; Kumo sets a colour outright
    },
    "&.Mui-disabled": {
      WebkitTextFillColor: k.textDefault, // MUI greys disabled text via this
    },
  }
}

/**
 * MUI draws `Input` and `FilledInput` with an underline built from ::before / ::after, and
 * FilledInput additionally fills its box and rounds only the top corners. Kumo's input has no
 * underline in any state, so every one of those rules is cleared rather than restyled.
 */
const KUMO_NO_UNDERLINE = {
  "&::before, &::after": { borderBottom: "none", content: '""' },
  "&:hover:not(.Mui-disabled, .Mui-error)::before": { borderBottom: "none" },
} as const

/**
 * MUI TRAP - `disableElevation` erases the ring on hover, active and focus-visible.
 *
 * The prop is switched on because Kumo's shadow is a flat `shadow-xs`, not a Material elevation.
 * But MUI implements it as `.MuiButton-disableElevation { box-shadow: none; &:hover, &:active,
 * &.Mui-focusVisible { box-shadow: none } }`, and Kumo's outline IS a box-shadow (the `ring`) - so
 * every interactive state silently lost its 1px outline while the default state looked perfect.
 *
 * It is invisible in a computed-style probe that hovers the element directly, because that reads
 * the value the root rule sets; the class rule only wins during the real capture. What exposed it
 * was sampling the captured pixels: at the button's top edge the Kumo side painted the ring colour
 * (4,94,222) where the MUI side still painted page background (251,251,251) - a 2-device-pixel band
 * top and bottom, Δ247.
 *
 * Every variant therefore restates its shadow on all three states. Kumo itself has no `:active`
 * styling at all, so the active shadow is simply the hover shadow (a press is also a hover).
 */
/**
 * Places a Popper's arrow with `left`/`top` instead of the `transform` popper.js writes by default.
 *
 * Same position either way - this is about how the arrow RASTERIZES. `translate3d` promotes the
 * arrow to its own composited layer, so its (asymmetric) SVG is drawn into that layer and then
 * composited, while kumo's arrow is placed by plain `left` and drawn in its parent's raster. The
 * two routes land half a device pixel apart: a byte-identical shape, every intensity value the
 * same, one pixel to the left. It measured 1010 pixels at Δ27 on the tooltip's anchored capture -
 * far too big to write off, and invisible to a computed-style probe, since both arrows report the
 * same 20x10 box at the same coordinates.
 *
 * Popper's own `gpuAcceleration: false` fixes the arrow but drags the POPUP off the device grid
 * too, which reintroduces glyph ghosting across the whole label. This modifier changes only the
 * arrow, and it keeps popper's computed offset, so alignment and collision shifting still work.
 */
const ARROW_BY_LAYOUT = {
  name: "xuiArrowByLayout",
  enabled: true,
  phase: "beforeWrite" as const,
  requires: ["computeStyles"],
  fn: ({ state }: { state: { styles: Record<string, Record<string, string>>; modifiersData: { arrow?: { x?: number; y?: number } } } }) => {
    const offsets = state.modifiersData.arrow
    if (!offsets) return
    state.styles.arrow = {
      ...state.styles.arrow,
      transform: "", // clears popper's inline translate3d
      ...(offsets.x != null ? { left: `${offsets.x}px` } : {}),
      ...(offsets.y != null ? { top: `${offsets.y}px` } : {}),
    }
  },
}

function shadowStates(resting: string, hovered = resting, focused = resting) {
  return {
    "&:hover": { boxShadow: hovered },
    "&:active": { boxShadow: hovered },
    "&.Mui-focusVisible": { boxShadow: focused },
  }
}

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
  // ---- Text ----
  //
  // Ground truth: dist/chunks/text-e1ko7r96hsoz2tor.js. Kumo's Text is two orthogonal props -
  // `variant` (body / secondary / error / heading1-3 / mono) and, for the four "copy" variants
  // only, `size` (xs / sm / base / lg) plus a `bold` flag. MUI flattens that into one list of
  // typography variants, so the mapping is variant+size -> variant:
  //
  //   body   size=base   text-base                  -> body1      14px / 1.5      / 400
  //   body   size=sm     text-sm                    -> body2      13px / 1/0.85   / 400
  //   body   size=xs     text-xs                    -> caption    12px / 1/0.75   / 400
  //   body   size=lg     text-lg                    -> subtitle1  16px / 1.5      / 400
  //   body   bold        text-base font-medium      -> subtitle2  14px / 1.5      / 500
  //   heading3           text-lg font-semibold      -> h6         16px / 1.5      / 600
  //   heading2           text-2xl font-semibold     -> h5         24px / 1.3333   / 600
  //   heading1           text-3xl font-semibold     -> h4         30px / 1.2      / 600
  //
  // The xs/sm/base/lg sizes are Kumo's own redefinitions of Tailwind's tokens (see KUMO_TEXT);
  // 2xl and 3xl it leaves at Tailwind's defaults, measured at 24/32 and 30/36.
  //
  // A heading takes NO size class - `isCopy` is false for heading1-3 in the source - which is why
  // heading3 and a size=lg body are both 16px and differ only in weight.
  typography: {
    fontFamily: FONT_SANS,
    // Kumo's default body copy is `text-base`, which its own theme file redefines to 14px.
    fontSize: 14,
    body1: { ...TEXT_BASE, fontWeight: 400, letterSpacing: "normal" }, // kumo: Text variant=body size=base
    body2: { ...TEXT_SM, fontWeight: 400, letterSpacing: "normal" }, // kumo: Text size=sm
    caption: { ...TEXT_XS, fontWeight: 400, letterSpacing: "normal" }, // kumo: Text size=xs
    subtitle1: { ...TEXT_LG, fontWeight: 400, letterSpacing: "normal" }, // kumo: Text size=lg
    subtitle2: { ...TEXT_BASE, fontWeight: 500, letterSpacing: "normal" }, // kumo: Text bold (font-medium)
    h6: { ...TEXT_LG, fontWeight: 600, letterSpacing: "normal" }, // kumo: heading3 - text-lg font-semibold
    h5: { fontSize: "24px", lineHeight: 32 / 24, fontWeight: 600, letterSpacing: "normal" }, // kumo: heading2 - text-2xl font-semibold
    h4: { fontSize: "30px", lineHeight: 36 / 30, fontWeight: 600, letterSpacing: "normal" }, // kumo: heading1 - text-3xl font-semibold
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
    // ---- Toolbar ----
    //
    // kumo: dist/chunks/toolbar-gwd1orc8yl7lzaou.js
    //   root    inline-flex w-fit items-stretch rounded-lg bg-kumo-control shadow-xs
    //           ring ring-kumo-line
    //   button  relative min-w-0 border-0 bg-transparent shadow-none ring-0
    //
    // The ring, the shadow and the fill live on the BAR; each button is transparent and unringed,
    // separated from its neighbour by a single left rule. MUI does the opposite - every child keeps
    // its own outlined-button chrome - so both halves have to move.
    MuiButtonGroup: {
      styleOverrides: {
        root: ({ theme }) =>
          toolbarBarChrome(theme.vars.palette.kumo.control, theme.vars.palette.kumo.line),
        grouped: ({ theme }) =>
          toolbarControlChrome(theme.vars.palette.kumo.line, theme.vars.palette.kumo.tint),
      },
      defaultProps: {
        // A group publishes its resolved disableRipple through ButtonGroupContext, and Button reads
        // context at higher priority than theme defaults - so without this it hands the ripple back
        // to every child.
        disableRipple: true,
      },
    },

    // ---- ToggleButton / ToggleButtonGroup ----
    //
    // Same Kumo Toolbar as the ButtonGroup above (see toolbarBarChrome / toolbarControlChrome),
    // because MUI splits into two components what Kumo ships as one bar.
    //
    // One thing here is NOT ground truth and is marked as such: Kumo's Toolbar.Button has no
    // pressed or selected state at all - there is no `data-selected` or `aria-pressed` styling
    // anywhere in the toolbar chunk. So the SELECTED look is derived rather than extracted, from
    // `bg-kumo-tint`, which is Kumo's own selected semantic elsewhere in the package (Table's
    // `selected` row variant is exactly `bg-kumo-tint`). The unselected bar is a real pixel pair
    // against Toolbar; the selected segment is a look-match with no reference to diff against.
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) =>
          toolbarBarChrome(theme.vars.palette.kumo.control, theme.vars.palette.kumo.line),
        grouped: ({ theme }) =>
          toolbarControlChrome(theme.vars.palette.kumo.line, theme.vars.palette.kumo.tint),
      },
      // No `disableRipple` here: unlike ButtonGroup, ToggleButtonGroup does not publish one through
      // context, and its props type has no such key. MuiToggleButton restates it instead.
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            ...buttonBase("medium"), // kumo: Toolbar.Button resolves to a Kumo Button at the bar's size, default `base`
            color: k.textDefault, // kumo: text-kumo-default - MUI's own default is a 54%-alpha black
            textTransform: "none" as const, // MUI uppercases a ToggleButton's label; Kumo never does
            borderRadius: 0, // kumo: rounded-none, with the bar's ends restored by the group below
            ...toolbarControlChrome(k.line, k.tint),
            // DERIVED, not extracted - see the banner above.
            "&.Mui-selected": {
              backgroundColor: k.tint,
              color: k.textDefault,
              "&:hover": { backgroundColor: k.tint },
            },
            // kumo: focus:ring-[1.5px] focus:ring-kumo-focus/50, widened by
            // focus-visible:ring-2 focus-visible:ring-kumo-brand
            "&:focus": {
              boxShadow: `0 0 0 1.5px color-mix(in oklab, ${k.focus} 50%, transparent)`,
              zIndex: 2, // kumo: focus:z-2 - the ring draws over the neighbouring seam
            },
            "&.Mui-focusVisible": {
              boxShadow: `0 0 0 2px ${k.brand}`,
              outline: "none", // kumo: focus:outline-none
              zIndex: 2, // kumo: focus-visible:z-2
            },
          }
        },
      },
      defaultProps: {
        // MuiButtonBase's global disableRipple does not reach ToggleButton for the same reason it
        // misses Checkbox/Radio/Switch: it resolves its own default and forwards it.
        disableRipple: true,
      },
    },

    // ---- Button ---- (see the banner above for the extracted class strings and the two gotchas)
    MuiButton: {
      defaultProps: {
        // Kumo's shadow is the flat `shadow-xs` on every variant; MUI's elevation would stack its
        // own Material shadow on top of it.
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const size = (ownerState.size ?? "medium") as KumoButtonSize
          const k = theme.vars.palette.kumo
          const base = buttonBase(size)

          // MUI's variant+color pair selects the Kumo variant. contained -> the two emphasis
          // variants, outlined -> the two ring-on-surface variants (plus `outline` via
          // color="inherit"), text -> ghost.
          const isEmphasis = ownerState.variant === "contained"
          const isDestructive = ownerState.color === "error"

          if (isEmphasis) {
            const e = emphasis(isDestructive ? k.danger : k.brand)
            return {
              ...base,
              position: "relative", // kumo: relative
              overflow: "hidden", // kumo: overflow-hidden
              // Own stacking context, so the gradient layer below can sit at z-index -1: above this
              // root's background but still behind the label. Without it, a negative z-index would
              // escape past the background entirely and the gradient would never be seen.
              isolation: "isolate",
              color: "#ffffff", // kumo: !text-white (both emphasis variants, in both schemes)
              backgroundColor: e.bg, // kumo: bg-(--kumo-button-emphasis-bg)
              boxShadow: ringWith(e.ring), // kumo: ring ring-(--kumo-button-emphasis-ring) + shadow-xs
              // Kumo's gradient span, reproduced as a pseudo-element of the same geometry.
              //
              // This deliberately is NOT folded into the root's own background-image, which is
              // algebraically the same picture but does not RASTERIZE the same: Chrome dithers a
              // gradient differently when it paints one as an element's own background than when it
              // paints it onto a separate box, and the difference showed up as 450 dithered pixels
              // at Δ36 banded across the button face. Matching Kumo's structure matches its
              // dithering.
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0, // kumo: absolute inset-0
                zIndex: -1,
                borderRadius: "inherit", // kumo: rounded-[inherit]
                backgroundImage: `linear-gradient(${e.gradientStart} 0%, ${e.gradientEnd} 100%)`, // kumo: bg-linear-to-b from-* to-*
                boxShadow: `inset 0 1px 0 0 ${e.bg}`, // kumo: shadow-[inset_0_1px_0_0_var(--kumo-button-emphasis-bg)]
              },
              "&:hover::before, &:active::before": {
                // kumo: group-hover:from-(--kumo-button-emphasis-bg) - only the gradient's TOP stop
                // moves on hover; the bottom stop stays on the raw token.
                backgroundImage: `linear-gradient(${e.bg} 0%, ${e.gradientEnd} 100%)`,
              },
              // kumo: the variant's own focus-visible:ring-(--kumo-button-emphasis-ring) keeps the
              // emphasis ring colour, while the base's focus-visible:ring-2 widens it to 2px.
              ...shadowStates(ringWith(e.ring), ringWith(e.ring), ringWith(e.ring, 2)),
              "&:focus-visible": {
                boxShadow: ringWith(e.ring, 2),
                outline: "none", // kumo: focus:outline-none
              },
              "&.Mui-disabled": {
                ...base["&.Mui-disabled"],
                color: "#ffffff",
                backgroundColor: e.bg,
                boxShadow: ringWith(e.ring),
              },
            }
          }

          if (ownerState.variant === "text") {
            // kumo: ghost - the only variant with no ring and no shadow at all.
            return {
              ...base,
              color: k.textDefault, // kumo: text-kumo-default
              backgroundColor: "transparent", // kumo: bg-inherit over a transparent page surface
              boxShadow: "none", // kumo: shadow-none
              ...shadowStates("none"),
              "&:hover": {
                backgroundColor: k.tint, // kumo: hover:bg-kumo-tint
                boxShadow: "none",
              },
              "&:active": { backgroundColor: k.tint, boxShadow: "none" },
              "&:focus-visible": {
                // kumo: focus-visible:ring-2 focus-visible:ring-kumo-brand. No shadow-xs underneath
                // here, unlike every other variant - ghost's own `shadow-none` clears it.
                boxShadow: `0 0 0 2px ${k.brand}`,
                outline: "none", // kumo: focus:outline-none
              },
              "&.Mui-disabled": {
                ...base["&.Mui-disabled"],
                color: k.textSubtle, // kumo: disabled:text-kumo-subtle (ghost adds no override of its own)
                backgroundColor: "transparent",
                boxShadow: "none",
              },
            }
          }

          // The three ring-on-surface variants. `outline` is distinguished from `secondary` by
          // color="inherit": both carry ring-kumo-line, but outline's fill is transparent where
          // secondary's is the kumo-base surface, and only outline moves its TEXT colour on hover.
          const isOutline = ownerState.color === "inherit"
          const text = isDestructive ? k.textDanger : k.textDefault // kumo: !text-kumo-danger / !text-kumo-default

          // kumo: focus:ring-kumo-focus/50 - PLAIN :focus, which a mouse press also matches, so
          // this is what a PRESSED button shows. Missing it painted a 230-grey ring where Kumo
          // paints a 131-grey one (Δ95). The emphasis variants are exempt: they restate
          // focus:ring-(--kumo-button-emphasis-ring).
          const focusRule = {
            "&:focus": { boxShadow: ringWith(`color-mix(in oklab, ${k.focus} 50%, transparent)`) },
          }
          // Whether that ring survives a press is Kumo's specificity, not a choice made here:
          // `not-disabled:hover:ring-*` compiles to a selector carrying :not(:disabled) as well as
          // :hover, so it OUTRANKS the base `focus:ring-*`. `outline` and `secondary-destructive`
          // have such a hover ring and keep it while pressed; plain `secondary` only changes its
          // background on hover, so there the focus ring wins.
          //
          // That precedence is expressed by ORDER rather than by a more specific selector. Writing
          // it as `&:focus:not(:hover)` also works for the press, but two pseudo-classes then
          // outrank `&:focus-visible` below and the keyboard ring disappears - measured at Δ246 on
          // both variants. Equal specificity plus deliberate ordering keeps all three states right.
          const ringMovesOnHover = isOutline || isDestructive

          return {
            ...base,
            color: text,
            backgroundColor: isOutline ? "transparent" : k.base, // kumo: bg-transparent / bg-kumo-base
            boxShadow: ringWith(k.line), // kumo: ring ring-kumo-line
            ...(ringMovesOnHover ? focusRule : {}),
            ...(isOutline
              ? (() => {
                  // kumo: not-disabled:hover:ring-kumo-focus/25
                  const hoverRing = ringWith(`color-mix(in oklab, ${k.focus} 25%, transparent)`)
                  const hover = {
                    color: k.textStrong, // kumo: not-disabled:hover:text-kumo-strong
                    backgroundColor: "transparent",
                    boxShadow: hoverRing,
                  }
                  return {
                    transition: "color 150ms, box-shadow 150ms", // kumo: transition-colors
                    ...shadowStates(ringWith(k.line), hoverRing),
                    "&:hover": hover,
                    "&:active": hover,
                  }
                })()
              : isDestructive
                ? (() => {
                    // kumo: not-disabled:hover:ring-kumo-danger/30
                    const hoverRing = ringWith(`color-mix(in oklab, ${k.danger} 30%, transparent)`)
                    const hover = {
                      color: text, // kumo: not-disabled:hover:!text-kumo-danger (restated, so unchanged)
                      backgroundColor: k.base, // kumo: secondary-destructive has no hover background
                      boxShadow: hoverRing,
                    }
                    return { ...shadowStates(ringWith(k.line), hoverRing), "&:hover": hover, "&:active": hover }
                  })()
                : (() => {
                    const hover = {
                      backgroundColor: k.tint, // kumo: not-disabled:hover:bg-kumo-tint
                      boxShadow: ringWith(k.line),
                    }
                    return { ...shadowStates(ringWith(k.line)), "&:hover": hover, "&:active": hover }
                  })()),
            ...(ringMovesOnHover ? {} : focusRule),
            "&:focus-visible": {
              // kumo: focus-visible:ring-2 focus-visible:ring-kumo-brand. The ring WIDENS and
              // recolours, but `shadow-xs` from the base classes stays underneath it - dropping it
              // is invisible against a light page and worth Δ1 over ~170px against a dark one.
              boxShadow: ringWith(k.brand, 2),
              outline: "none", // kumo: focus:outline-none
            },
            "&.Mui-disabled": {
              ...base["&.Mui-disabled"],
              // kumo: disabled:!text-kumo-default/70 and disabled:!text-kumo-danger/70 on the two
              // secondary variants; `outline` has neither, so it falls back to the base's
              // disabled:text-kumo-subtle.
              color: isOutline ? k.textSubtle : `color-mix(in oklab, ${text} 70%, transparent)`,
              // kumo: disabled:bg-kumo-base/50 (again, only the two secondary variants)
              backgroundColor: isOutline ? "transparent" : `color-mix(in oklab, ${k.base} 50%, transparent)`,
              boxShadow: ringWith(k.line),
            },
          }
        },
      },
    },

    MuiTypography: {
      defaultProps: {
        // kumo: Text renders <p> for every copy variant and <span> for the headings and mono - it
        // leaves semantics to an explicit `as` prop rather than inferring them. MUI's defaults
        // disagree (caption is a span, subtitle1 an h6, h4-h6 real headings), and since the theme's
        // job is to make unadorned MUI render as Kumo does, the mapping is restated here. A caller
        // who wants a semantic heading passes `component`, exactly as a Kumo caller passes `as`.
        variantMapping: {
          body1: "p",
          body2: "p",
          caption: "p",
          subtitle1: "p",
          subtitle2: "p",
          h4: "span",
          h5: "span",
          h6: "span",
        },
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          // kumo: Text always carries `text-kumo-default`, and <p> keeps no UA margin under
          // Tailwind's preflight.
          margin: 0,
          // kumo: the `error` variant is `text-kumo-danger`, which is --TEXT-color-kumo-danger -
          // the darker, readable-on-a-surface red - NOT --color-kumo-danger, the indicator fill
          // that Button's destructive variant uses. MUI resolves `color="error"` to
          // palette.error.main, which is correctly the indicator colour, so text has to say so.
          ...(ownerState.color === "error" && { color: theme.vars.palette.kumo.textDanger }),
        }),
      },
    },

    // ---- Input / InputArea ----
    //
    // Ground truth: dist/chunks/input-o3mtvvtqf69j5k10.js (and input-dwl9oy1f1ufah0bx.js for the
    // textarea). Kumo's Input IS the <input>: one element carrying box, ring, padding and text.
    //
    //   base     border-0 bg-kumo-control text-kumo-default ring ring-kumo-line
    //            outline-none focus:outline-none kumo-input-placeholder
    //   size     base -> h-9 rounded-lg px-3 text-base   (the same size row Button uses)
    //   default  focus:ring-kumo-focus/50 focus:ring-[1.5px]
    //   error    !ring-kumo-danger focus:ring-kumo-danger/50 focus:ring-[1.5px]
    //   InputArea adds `h-auto py-2` over exactly that.
    //
    // Two differences from Button worth stating, because copying Button's block would get both
    // wrong: an input has NO `shadow-xs` under its ring, and its focus ring is 1.5px rather than
    // the button's 2px - and it is keyed on plain `:focus`, not `:focus-visible`, so clicking into
    // a field rings it just as tabbing does.
    MuiOutlinedInput: {
      styleOverrides: {
        // Kumo draws its outline as a ring on the box itself; there is no notch or legend.
        notchedOutline: { display: "none" },
        root: ({ theme, ownerState }) => {
          const k = theme.vars.palette.kumo
          return {
            ...kumoInputBox(k, Boolean(ownerState.multiline)),
            // ...except when the control is a SELECT. kumo does not build its Select trigger from
            // its Input at all - `selectVariants` is `cn(buttonVariants({ size }), "justify-between
            // font-normal", "focus:ring-kumo-focus/50 focus-visible:ring-inset")`, so the trigger is
            // a secondary BUTTON in every respect: the kumo-base surface rather than the input's
            // kumo-control (identical in light, visibly different in dark - 19149 pixels at Δ8),
            // shadow-xs behind the ring, a tint on hover, a pointer cursor, and the button's own
            // 1px focus ring rather than the input's 1.5px one.
            "&:has(.MuiSelect-select)": {
              backgroundColor: k.base, // kumo: secondary's bg-kumo-base
              boxShadow: ringWith(k.line), // kumo: ring ring-kumo-line + shadow-xs
              cursor: "pointer",
              "&:hover": { backgroundColor: k.tint, boxShadow: ringWith(k.line) }, // kumo: not-disabled:hover:bg-kumo-tint
              "&:has(:focus)": {
                boxShadow: ringWith(`color-mix(in oklab, ${k.focus} 50%, transparent)`), // kumo: focus:ring-kumo-focus/50
              },
              // kumo: the button base's `focus-visible:ring-2 focus-visible:ring-kumo-brand`, and
              // selectVariants' own `focus-visible:ring-inset` - so a keyboard-focused trigger
              // wears a 2px BRAND ring drawn INSIDE its box, not the grey one a press shows.
              "&:has(:focus-visible)": {
                boxShadow: `inset 0 0 0 2px ${k.brand}, ${SHADOW_XS}`,
                outline: "none",
              },
            },
            ...kumoInputBoxStates(k),
          }
        },
        input: ({ theme, ownerState }) =>
          kumoInputControl(theme.vars.palette.kumo, Boolean(ownerState.multiline)),
      },
    },

    // MUI's other two input shells. Kumo has one input, so both resolve to the same box as
    // OutlinedInput above (see kumoInputBox) with their Material underline cleared. Without these
    // a `<TextField variant="standard">` or `variant="filled"` in a Kumo app still renders as
    // Material - an underlined, grey-filled control next to Kumo's ringed ones.
    MuiInput: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const k = theme.vars.palette.kumo
          return {
            ...kumoInputBox(k, Boolean(ownerState.multiline)),
            ...KUMO_NO_UNDERLINE,
            // MUI offsets a standard input to leave room for the label that floats above it; the
            // Kumo label is a static block in normal flow, so the offset has to go.
            "label + &, .MuiInputLabel-root + &": { marginTop: 0 },
            ...kumoInputBoxStates(k),
          }
        },
        input: ({ theme, ownerState }) =>
          kumoInputControl(theme.vars.palette.kumo, Boolean(ownerState.multiline)),
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const k = theme.vars.palette.kumo
          return {
            ...kumoInputBox(k, Boolean(ownerState.multiline)),
            ...KUMO_NO_UNDERLINE,
            // MUI rounds only a filled input's TOP corners, so the bottom two have to be restored
            // or the box reads as a Material text field even once the underline is gone.
            borderRadius: "8px", // kumo: rounded-lg on all four corners
            "label + &, .MuiInputLabel-root + &": { marginTop: 0 },
            "&:hover, &.Mui-focused": { backgroundColor: k.control }, // MUI darkens its fill on hover; Kumo does not
            ...kumoInputBoxStates(k),
          }
        },
        input: ({ theme, ownerState }) =>
          kumoInputControl(theme.vars.palette.kumo, Boolean(ownerState.multiline)),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        // The shells above each carry the box; InputBase itself only has to stop MUI's own
        // adornment spacing from reaching a Kumo InputGroup, whose addon owns that gap.
        root: {
          "&.MuiInputBase-adornedStart .MuiInputBase-input": { paddingLeft: "8px" },
          "&.MuiInputBase-adornedEnd .MuiInputBase-input": { paddingRight: "8px" },
        },
      },
    },

    // ---- InputLabel ----
    //
    // Same Kumo Label as MuiFormLabel below (`m-0 text-base font-medium text-kumo-default`,
    // `inline-flex items-center gap-1`). MUI's InputLabel is the FLOATING variant of that label: it
    // is absolutely positioned over the control and animates a translate+scale on focus. Kumo has
    // no floating label at all - Field stacks a static Label above its control in a `grid gap-2` -
    // so the float is switched off rather than restyled.
    MuiInputLabel: {
      defaultProps: {
        // Pinning `shrink` sidesteps InputBase's `data-shrink=false` selector, which hides a
        // placeholder until the field is focused. With a static label there is nothing to shrink
        // INTO, so an unshrunk label would sit on top of the control's own text.
        shrink: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          position: "static" as const, // kumo: Field's label is a grid row, not an overlay
          transform: "none", // kills MUI's float/shrink translate+scale
          maxWidth: "100%",
          margin: 0, // kumo: m-0 - the Field grid's gap-2 does the spacing
          display: "inline-flex", // kumo: inline-flex
          alignItems: "center", // kumo: items-center
          gap: "4px", // kumo: gap-1
          ...TEXT_BASE, // kumo: text-base
          fontWeight: 500, // kumo: font-medium
          letterSpacing: "normal",
          color: theme.vars.palette.kumo.textDefault, // kumo: text-kumo-default
          userSelect: "none" as const, // kumo: Field's label adds select-none
          // Kumo's Label has no focus, error or disabled reaction; MUI recolours on all three.
          "&.Mui-focused, &.Mui-error, &.Mui-disabled": {
            color: theme.vars.palette.kumo.textDefault,
          },
        }),
      },
    },

    // ---- Checkbox ----
    //
    // kumo: dist/chunks/checkbox-fovnhs7f1sekaxrh.js
    //   relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border-0
    //   bg-kumo-base ring ring-kumo-hairline focus:outline-none
    //   not-disabled: hover:ring-kumo-hairline focus:ring-2 focus:ring-kumo-focus
    //                 focus-visible:ring-2 focus-visible:ring-kumo-brand
    //   checked/indeterminate: bg-kumo-contrast + ring-kumo-contrast
    //   disabled: cursor-not-allowed opacity-50
    // and the mark itself is a Phosphor Check (or Minus when indeterminate) at
    // `weight="bold" size={12}`, coloured text-kumo-inverse.
    //
    // The box FILLS with the contrast colour rather than growing a tick on a white field, so the
    // icon has to keep its footprint when unchecked - hence the hidden-but-present icon below,
    // which is also what stops the control resizing between states.
    MuiCheckbox: {
      defaultProps: {
        // The global MuiButtonBase default does NOT reach Checkbox: it resolves its own
        // `disableRipple` before forwarding, so this has to be restated.
        disableRipple: true,
        icon: createElement(CheckIcon, {
          weight: "bold",
          size: 12,
          "aria-hidden": true,
          style: { visibility: "hidden" },
        }),
        checkedIcon: createElement(CheckIcon, { weight: "bold", size: 12, "aria-hidden": true }),
        indeterminateIcon: createElement(MinusIcon, { weight: "bold", size: 12, "aria-hidden": true }),
      },
      styleOverrides: {
        root: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            width: "16px", // kumo: h-4 w-4
            height: "16px",
            padding: 0, // MUI pads the control to a 42px hit target; Kumo uses an ::after instead
            flexShrink: 0, // kumo: shrink-0
            boxSizing: "border-box" as const,
            borderRadius: "4px", // kumo: rounded-sm
            backgroundColor: k.base, // kumo: bg-kumo-base
            color: k.textInverse, // kumo: the indicator is text-kumo-inverse
            boxShadow: `0 0 0 1px ${k.hairline}`, // kumo: ring ring-kumo-hairline
            "&:hover": {
              backgroundColor: k.base,
              boxShadow: `0 0 0 1px ${k.hairline}`, // kumo: hover:ring-kumo-hairline - unchanged
            },
            "&.Mui-checked, &.MuiCheckbox-indeterminate": {
              // kumo: data-[checked]:bg-kumo-contrast data-[checked]:ring-kumo-contrast
              backgroundColor: k.contrast,
              boxShadow: `0 0 0 1px ${k.contrast}`,
              color: k.textInverse,
              "&:hover": { backgroundColor: k.contrast, boxShadow: `0 0 0 1px ${k.contrast}` },
            },
            "&:focus-visible, &.Mui-focusVisible": {
              boxShadow: `0 0 0 2px ${k.brand}`, // kumo: focus-visible:ring-2 focus-visible:ring-kumo-brand
              outline: "none", // kumo: focus:outline-none
            },
            // ...but only while UNCHECKED. `data-[checked]:ring-kumo-contrast` outranks the
            // focus-visible colour, so a checked box that gains keyboard focus keeps its contrast
            // ring and merely widens it to 2px. Measured: oklch(0.12 0 0) at 2px, not brand.
            "&.Mui-checked.Mui-focusVisible, &.MuiCheckbox-indeterminate.Mui-focusVisible": {
              boxShadow: `0 0 0 2px ${k.contrast}`,
            },
            "&.Mui-disabled": {
              opacity: 0.5, // kumo: disabled:opacity-50
              cursor: "not-allowed", // kumo: disabled:cursor-not-allowed
              pointerEvents: "auto" as const,
            },
          }
        },
      },
    },

    // ---- Radio ----
    //
    // kumo: dist/chunks/radio-igpo6t2t2tpe08d5.js, `default` appearance.
    //   control    relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full
    //              border-0 bg-kumo-base ring ring-kumo-line focus:outline-none
    //              group-hover:ring-kumo-hairline focus:ring-2 focus:ring-kumo-focus
    //              focus-visible:ring-2 focus-visible:ring-kumo-brand
    //              data-[checked]:bg-kumo-contrast
    //   indicator  a `h-2 w-2 rounded-full bg-kumo-base` span
    //   row        group relative m-0 inline-flex items-start gap-2, label `text-base`
    //   group      flex flex-col gap-4
    //
    // The checked state is the INVERSE of MUI's: the circle fills with the contrast colour and the
    // 8px dot is painted in the base colour on top, where MUI tints a dot on a transparent field.
    MuiRadio: {
      defaultProps: {
        // Radio resolves its own disableRipple before forwarding, so the global default misses it.
        disableRipple: true,
        icon: createElement("span", {
          "aria-hidden": true,
          style: { width: "8px", height: "8px", borderRadius: "50%", visibility: "hidden" as const },
        }),
        checkedIcon: createElement("span", {
          "aria-hidden": true,
          style: {
            width: "8px", // kumo: h-2 w-2
            height: "8px",
            borderRadius: "50%", // kumo: rounded-full
            backgroundColor: "var(--mui-palette-kumo-base)", // kumo: bg-kumo-base
          },
        }),
      },
      styleOverrides: {
        root: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            width: "16px", // kumo: h-4 w-4
            height: "16px",
            padding: 0, // MUI pads to a 42px hit target; Kumo uses an ::after overlay instead
            flexShrink: 0, // kumo: shrink-0
            boxSizing: "border-box" as const,
            borderRadius: "50%", // kumo: rounded-full
            backgroundColor: k.base, // kumo: bg-kumo-base
            boxShadow: `0 0 0 1px ${k.line}`, // kumo: ring ring-kumo-line
            "&:hover": { backgroundColor: k.base, boxShadow: `0 0 0 1px ${k.hairline}` }, // kumo: group-hover:ring-kumo-hairline
            "&.Mui-checked": {
              backgroundColor: k.contrast, // kumo: data-[checked]:bg-kumo-contrast
              boxShadow: `0 0 0 1px ${k.line}`,
              "&:hover": { backgroundColor: k.contrast, boxShadow: `0 0 0 1px ${k.hairline}` },
            },
            "&:focus-visible, &.Mui-focusVisible": {
              boxShadow: `0 0 0 2px ${k.brand}`, // kumo: focus-visible:ring-2 focus-visible:ring-kumo-brand
              outline: "none", // kumo: focus:outline-none
            },
            "&.Mui-disabled": {
              // NO opacity here: unlike Checkbox, whose control carries `disabled:opacity-50`
              // itself, Kumo's Radio.Item puts it on the LABEL ROW so the text dims with the
              // circle. Dimming both would compound to 25%.
              cursor: "not-allowed",
              pointerEvents: "auto" as const,
            },
          }
        },
      },
    },
    // MuiRadioGroup renders a FormGroup and has no styleOverrides slot of its own, so the group's
    // spacing has to be set on FormGroup - setting it on MuiRadioGroup silently did nothing.
    MuiFormGroup: {
      styleOverrides: {
        root: {
          // kumo: Radio.Group nests a `flex flex-col gap-2` list inside its fieldset. The
          // fieldset's own `gap-4` separates the legend from that list, NOT one item from the next -
          // reading it as the item spacing put every row 8px too far apart.
          gap: "8px",
        },
      },
    },

    // ---- Switch ----
    //
    // kumo: dist/chunks/switch-cusffup6w3tan5ot.js, `base` size.
    //   track  h-4.5 w-9  -> 36x18, ring, `rounded-[5px]` upgraded by
    //          `supports-[corner-shape:squircle]:rounded-[10px] [corner-shape:squircle]`
    //   thumb  w-4.5 top-0 bottom-0 -> 18x18, same radius, sliding left-0 -> left-4.5
    //   thumb shadow: 0 0 1px 0.5px <shadow-edge>, 0 1px 2px <shadow-drop>
    //
    // Chrome DOES support corner-shape, so the rendered radius is the 10px squircle branch, not the
    // 5px fallback - confirmed by reading the computed `corner-shape` off the live control.
    //
    // Unlike everything else in Tier 1, the switch's track colours are RAW Tailwind palette entries
    // rather than kumo-* tokens, so they are transcribed here as literals with the Tailwind name
    // that produced them.
    //
    // AND THE `dark:` HALF OF THOSE CLASSES NEVER FIRES. The source pairs every one with a variant
    // (`bg-neutral-200 dark:bg-neutral-700`, `dark:bg-neutral-850`, `dark:bg-blue-300`), but Kumo
    // drives dark mode through CSS light-dark() tokens switched by `data-mode` - its own colour
    // docs say in as many words never to use Tailwind's `dark:` variant - so nothing on the page
    // ever matches it. Measured on the live control in dark mode: the track stays neutral-200 and
    // its ring stays neutral-300, exactly as in light. Only the token-driven parts move, because
    // those resolve through light-dark(): the thumb is `bg-kumo-base` and the shadow is built from
    // the shadow-edge / shadow-drop tokens.
    //
    // Transcribing the dark: variants as real overrides is therefore wrong, and was worth Δ230-243
    // across every switch pair. What ships is what paints.
    MuiSwitch: {
      defaultProps: {
        disableRipple: true, // Switch resolves its own default too - see MuiCheckbox above
      },
      styleOverrides: {
        root: {
          width: "36px", // kumo: w-9
          height: "18px", // kumo: h-4.5
          padding: 0, // MUI reserves room around the track for its ripple; Kumo has none
          overflow: "visible" as const,
          // kumo: disabled:opacity-50 sits on the whole control, where MUI dims only its own
          // internals - so the root has to carry it.
          "&:has(.Mui-disabled)": { opacity: 0.5 },
        },
        track: {
          borderRadius: "10px", // kumo: supports-[corner-shape:squircle]:rounded-[10px]
          cornerShape: "squircle", // kumo: [corner-shape:squircle]
          opacity: 1, // MUI fades its track to 38%; Kumo paints a solid colour
          backgroundColor: "oklch(0.922 0 0)", // kumo: bg-neutral-200 (both schemes - see above)
          boxShadow: "0 0 0 1px oklch(0.87 0 0)", // kumo: ring-neutral-300 (both schemes)
        },
        thumb: ({ theme }) => ({
          width: "18px", // kumo: w-4.5
          height: "18px", // kumo: top-0 bottom-0 over an 18px track
          borderRadius: "10px",
          cornerShape: "squircle",
          // kumo: bg-kumo-base - a token, so this one IS scheme-aware where the track is not
          backgroundColor: theme.vars.palette.kumo.base,
          // kumo: shadow-[0_0_1px_0.5px_var(--color-kumo-shadow-edge),0_1px_2px_var(--color-kumo-shadow-drop)]
          boxShadow: `0 0 1px 0.5px ${theme.vars.palette.kumo.shadowEdge}, 0 1px 2px ${theme.vars.palette.kumo.shadowDrop}`,
        }),
        switchBase: ({ theme }) => ({
          padding: 0, // the thumb fills the track's height, so there is no inset
          color: "transparent",
          "&.Mui-checked": {
            // kumo: the thumb slides its own width, and it does so with `left-0` -> `left-4.5`,
            // NOT a transform. MUI translates instead, which rasterizes the squircle's edge on a
            // composited layer and left a 52px Δ8 seam; moving the box itself matches.
            transform: "none",
            left: "18px",
            "& + .MuiSwitch-track": {
              backgroundColor: "oklch(0.623 0.214 259.815)", // kumo: bg-blue-500 (both schemes)
              boxShadow: "0 0 0 1px oklch(0.546 0.245 262.881)", // kumo: ring-blue-600 (both schemes)
              opacity: 1,
            },
          },
          // kumo: focus-visible:ring-2 focus-visible:ring-kumo-brand. MUI focuses the hidden input,
          // so the ring is drawn on the sibling track. It sits AFTER the checked block on purpose:
          // both selectors carry the same specificity, and the focus ring has to win over the
          // checked track's own blue ring.
          "&.Mui-focusVisible + .MuiSwitch-track": {
            boxShadow: `0 0 0 2px ${theme.vars.palette.kumo.brand}`,
          },
          "&.Mui-disabled + .MuiSwitch-track": { opacity: 1 },
          "&.Mui-disabled": { opacity: 1 },
        }),
      },
    },

    // ---- FormControlLabel ----
    //
    // The label row around a control. Kumo builds two different ones and they genuinely differ, so
    // the block discriminates on which control is inside rather than on a prop:
    //
    //   checkbox  FieldLabel `!m-0 inline-flex !min-h-0 items-start gap-2 !text-base`, and the
    //             control itself picks up `mt-0.5` once it has a label. Label text is weight 400.
    //   switch    `relative m-0 inline-flex items-center gap-2`, label BEFORE the control, and its
    //             label is `text-base font-medium text-kumo-default` - weight 500.
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          margin: 0, // kumo: !m-0 / m-0
          gap: "8px", // kumo: gap-2
          alignItems: "flex-start", // kumo: the checkbox row is items-start
          // kumo: the control gains mt-0.5 as soon as it sits beside a label
          "& .MuiCheckbox-root, & .MuiRadio-root": { marginTop: "2px" },
          "&:has(.MuiSwitch-root)": {
            alignItems: "center", // kumo: the switch row is items-center
          },
          // kumo: a disabled Radio.Item dims its whole row - `disabled:cursor-not-allowed
          // opacity-50` sits on the label, not on the control.
          "&.Mui-disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
          },
        },
        label: ({ theme }) => ({
          ...TEXT_BASE, // kumo: !text-base
          fontWeight: 400, // kumo: the checkbox row's label inherits the row's normal weight
          letterSpacing: "normal",
          color: theme.vars.palette.kumo.textDefault, // kumo: text-kumo-default
          // kumo: a Switch's label is `text-base font-medium` where a Checkbox's is not. Written as
          // a parent selector in this slot rather than a descendant rule on the root, so that it
          // beats the `fontWeight: 400` directly above it - the root's version lost to it.
          ".MuiFormControlLabel-root:has(.MuiSwitch-root) &": { fontWeight: 500 },
          // Kumo dims a disabled row with opacity ALONE and leaves the text colour alone; MUI also
          // repaints it to a 38% black, which then compounds with the opacity.
          "&.Mui-disabled": { color: theme.vars.palette.kumo.textDefault },
        }),
      },
    },

    // ---- Badge ----
    //
    // kumo: dist/chunks/badge-e16yhhe9xibra5k7.js
    //   base     inline-flex w-fit flex-none shrink-0 items-center justify-self-start rounded-full
    //            px-2 py-0.5 text-xs font-medium whitespace-nowrap
    //   blue     bg-kumo-badge-blue text-white        green   bg-kumo-badge-green text-white
    //   orange   bg-kumo-badge-orange text-black      neutral bg-kumo-badge-neutral text-white
    //   red      bg-kumo-badge-red text-white         outline border border-kumo-fill
    //                                                         bg-transparent text-kumo-default
    //
    // Note orange is the one variant with BLACK text - its badge token is a light amber that white
    // would disappear into.
    MuiChip: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const k = theme.vars.palette.kumo
          const fills: Record<string, { bg: string; fg: string }> = {
            blue: { bg: k.badgeBlue, fg: "#ffffff" },
            green: { bg: k.badgeGreen, fg: "#ffffff" },
            orange: { bg: k.badgeOrange, fg: "#000000" }, // kumo: text-black, not white
            neutral: { bg: k.badgeNeutral, fg: "#ffffff" },
            red: { bg: k.badgeRed, fg: "#ffffff" },
          }
          const fill = fills[ownerState.color as string]
          return {
            height: "auto", // kumo sizes the pill from its padding, not a fixed height
            width: "fit-content", // kumo: w-fit
            flex: "none", // kumo: flex-none
            flexShrink: 0, // kumo: shrink-0
            justifySelf: "start", // kumo: justify-self-start
            alignItems: "center", // kumo: items-center
            borderRadius: "9999px", // kumo: rounded-full
            padding: "2px 8px", // kumo: px-2 py-0.5
            ...TEXT_XS, // kumo: text-xs
            fontWeight: 500, // kumo: font-medium
            letterSpacing: "normal",
            whiteSpace: "nowrap" as const, // kumo: whitespace-nowrap
            border: 0,
            ...(fill
              ? { backgroundColor: fill.bg, color: fill.fg }
              : {
                  // kumo: the `outline` variant - a border rather than a fill
                  backgroundColor: "transparent", // kumo: bg-transparent
                  color: k.textDefault, // kumo: text-kumo-default
                  border: `1px solid ${k.fill}`, // kumo: border border-kumo-fill
                }),
          }
        },
        label: {
          // The pill's padding lives on the root, as it does in Kumo; MUI puts its own on the label.
          padding: 0,
          overflow: "visible" as const,
        },
      },
    },

    // ---- Banner ----
    //
    // kumo: dist/chunks/banner-cu2mip76zfx0gf27.js
    //   base        flex w-full
    //   size base   items-start gap-3 rounded-lg px-4 py-3 text-base
    //   default     bg-kumo-info-tint text-kumo-info
    //   alert       bg-kumo-warning-tint text-kumo-warning
    //   error       bg-kumo-danger-tint text-kumo-danger
    //
    // Each variant is a tint fill with the matching TEXT token on top - the darker readable one,
    // not the indicator colour - so the mapping reuses the same textInfo/textWarning/textDanger
    // pairs Text's own variants use.
    MuiAlert: {
      defaultProps: {
        // kumo: Banner renders an icon only when one is passed. MUI renders a severity icon by
        // default, so the default is turned off here rather than at every call site.
        icon: false,
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const k = theme.vars.palette.kumo
          const tints: Record<string, { bg: string; fg: string }> = {
            info: { bg: k.infoTint, fg: k.textInfo }, // kumo: variant `default`
            warning: { bg: k.warningTint, fg: k.textWarning }, // kumo: variant `alert`
            error: { bg: k.dangerTint, fg: k.textDanger }, // kumo: variant `error`
          }
          const t = tints[ownerState.severity ?? "info"] ?? tints.info
          return {
            display: "flex", // kumo: flex
            width: "100%", // kumo: w-full
            alignItems: "flex-start", // kumo: items-start
            gap: "12px", // kumo: gap-3
            borderRadius: "8px", // kumo: rounded-lg
            padding: "12px 16px", // kumo: px-4 py-3
            ...TEXT_BASE, // kumo: text-base
            fontWeight: 400,
            letterSpacing: "normal",
            backgroundColor: t.bg,
            color: t.fg,
          }
        },
        message: {
          // MUI pads its message block; Kumo's row is spaced by the container's gap alone.
          padding: 0,
        },
      },
    },

    // ---- Meter ----
    //
    // kumo: dist/chunks/meter-iauic8ww87xxqf74.js
    //   track      relative h-2 w-full overflow-hidden rounded-full bg-kumo-fill
    //   indicator  absolute inset-y-0 left-0 rounded-full
    //              bg-linear-to-r from-kumo-brand via-kumo-brand to-kumo-brand
    //
    // All three gradient stops are the same token, so it paints as a flat brand fill and is written
    // as one here rather than as a gradient that cannot differ from itself.
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          height: "8px", // kumo: h-2
          width: "100%", // kumo: w-full
          borderRadius: "9999px", // kumo: rounded-full
          overflow: "hidden", // kumo: overflow-hidden
          backgroundColor: theme.vars.palette.kumo.fill, // kumo: bg-kumo-fill
        }),
        bar: ({ theme }) => ({
          borderRadius: "9999px", // kumo: the indicator is rounded-full too
          backgroundColor: theme.vars.palette.kumo.brand, // kumo: from/via/to-kumo-brand, all identical
        }),
        // MUI draws a determinate bar as a FULL-WIDTH span translated left by the remainder. Kumo
        // instead SIZES its indicator to the value, and that changes the shape: at 2% its fill is
        // 4.8px wide, and CSS scales a `rounded-full` radius down to fit a box that narrow, so the
        // right cap is tighter than the full 4px a 240px-wide bar gets. 15 pixels at Δ224.
        //
        // `!important` rather than the usual `defaultProps.slotProps` escape hatch (AGENTS.md),
        // because MUI v9's LinearProgress exposes no slotProps at all - the transform is written as
        // an inline style, and an !important declaration is the only thing left that outranks one.
        determinate: ({ ownerState }: { ownerState: { value?: number } }) => ({
          "& .MuiLinearProgress-bar1": {
            transform: "none !important",
            width: `${ownerState.value ?? 0}%`,
          },
        }),
      },
    },

    // ---- LayerCard ----
    //
    // kumo: dist/chunks/layer-card-nah241sxhj6i7i03.js
    //   LAYER_CARD_SURFACE_CLASSES = "overflow-hidden rounded-lg bg-kumo-base shadow-xs
    //                                 ring ring-kumo-line"
    //
    // The same ring-over-shadow-xs recipe Button's secondary variant uses, on a surface with no
    // padding of its own. Scoped to MuiCard rather than MuiPaper on purpose: Paper is also the
    // guts of Menu, Dialog, Popover and every other overlay, and styling it here would give all of
    // them a card's ring before any of those components has a pair proving what they should look
    // like.
    MuiCard: {
      defaultProps: {
        // Kumo's surface shadow is the flat shadow-xs, not a Material elevation.
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            overflow: "hidden", // kumo: overflow-hidden
            borderRadius: "8px", // kumo: rounded-lg
            backgroundColor: k.base, // kumo: bg-kumo-base
            backgroundImage: "none", // MUI overlays a lightness gradient on an elevated dark Paper
            border: 0,
            boxShadow: ringWith(k.line), // kumo: ring ring-kumo-line + shadow-xs
            // kumo: LAYER_CARD_LAYERED_ROOT_CLASSES = "flex w-full flex-col overflow-hidden
            // rounded-lg bg-kumo-elevated text-base ring ring-kumo-hairline".
            //
            // LayerCard swaps its root classes at RUNTIME, in `hasLayerCardSections`: a card whose
            // children include a Primary or Secondary section is the layered form, a card without
            // them is the plain surface above. A theme cannot inspect children - but it does not
            // need to, because that condition is exactly what `:has()` expresses. A Card carrying
            // a CardHeader is the layered form, and switches the same two things Kumo switches:
            // the elevated fill and the hairline ring.
            "&:has(> .MuiCardHeader-root)": {
              display: "flex", // kumo: flex
              width: "100%", // kumo: w-full
              flexDirection: "column" as const, // kumo: flex-col
              backgroundColor: k.elevated, // kumo: bg-kumo-elevated
              ...TEXT_BASE, // kumo: text-base
              // kumo: `ring ring-kumo-hairline` and NOTHING else - the layered root drops the
              // plain surface's `shadow-xs`. Reading it as ringWith() (which stacks shadow-xs
              // behind the ring, correct everywhere else) left a drop shadow the reference does
              // not paint: 393 pixels at Δ4 around the card's edge.
              boxShadow: `0 0 0 1px ${k.hairline}`,
            },
          }
        },
      },
    },
    // kumo: LAYER_CARD_SECONDARY_CLASSES = "-my-2 flex items-center gap-2 bg-kumo-elevated p-4
    // text-base font-medium text-kumo-subtle" - the label band above a layered card's panel.
    MuiCardHeader: {
      styleOverrides: {
        root: ({ theme }) => ({
          margin: "-8px 0", // kumo: -my-2
          display: "flex", // kumo: flex
          alignItems: "center", // kumo: items-center
          gap: "8px", // kumo: gap-2
          backgroundColor: theme.vars.palette.kumo.elevated, // kumo: bg-kumo-elevated
          padding: "16px", // kumo: p-4
        }),
        // MUI renders the title through a Typography whose own variant would win over the root's
        // colour and weight, so the band's type is set on the title slot itself.
        title: ({ theme }) => ({
          ...TEXT_BASE, // kumo: text-base
          fontWeight: 500, // kumo: font-medium
          letterSpacing: "normal",
          color: theme.vars.palette.kumo.textSubtle, // kumo: text-kumo-subtle
        }),
      },
    },
    // kumo: LAYER_CARD_PRIMARY_CLASSES = "relative flex flex-col gap-2 overflow-hidden rounded-lg
    // bg-kumo-base p-4 pr-3 text-inherit no-underline ring ring-kumo-fill" - the inset panel.
    MuiCardContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          position: "relative" as const, // kumo: relative
          display: "flex", // kumo: flex
          flexDirection: "column" as const, // kumo: flex-col
          gap: "8px", // kumo: gap-2
          overflow: "hidden", // kumo: overflow-hidden
          borderRadius: "8px", // kumo: rounded-lg
          backgroundColor: theme.vars.palette.kumo.base, // kumo: bg-kumo-base
          padding: "16px 12px 16px 16px", // kumo: p-4 pr-3
          // MUI adds 24px of bottom padding to the LAST CardContent; Kumo's panel is evenly padded.
          "&:last-child": { paddingBottom: "16px" },
          boxShadow: `0 0 0 1px ${theme.vars.palette.kumo.fill}`, // kumo: ring ring-kumo-fill
        }),
      },
    },
    // DERIVED, not extracted. Kumo's LayerCard has no actions row - its two sections are the label
    // band and the panel, and nothing else. So this only neutralises MUI's Material spacing (8px
    // all round plus an 8px gap between buttons) down to the panel's own 16px padding and the
    // gap-2 its sections use, so a CardActions sits on the card's grid instead of its own.
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: "16px", // matches CardContent's p-4 rather than MUI's 8px
          gap: "8px", // kumo: the gap-2 both LayerCard sections use
          "& > :not(style) ~ :not(style)": { marginLeft: 0 }, // MUI spaces children with a margin as well
        },
      },
    },

    // ---- Tabs ----
    //
    // kumo: dist/chunks/tabs-dz3fsnkrznrggilz.js, `underline` variant.
    //   list  flex items-stretch gap-4 border-b border-kumo-hairline pb-2 h-7.5
    //   tab   relative z-2 flex items-center rounded bg-transparent text-base text-kumo-subtle
    //         hover:bg-kumo-tint hover:text-kumo-default aria-selected:font-medium
    //         aria-selected:text-kumo-default  px-2 py-3
    //         focus:ring-kumo-focus/50 focus:outline-none focus-visible:ring-2
    //         focus-visible:ring-kumo-brand
    //
    // Kumo's selected tab goes to the DEFAULT text colour, not the brand - only the indicator
    // carries the accent - which is the opposite of MUI's default. MUI also gives every tab a 90px
    // min-width and a 48px row; Kumo sizes from content plus a `gap-4` between tabs.
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          // kumo: the list is a FIXED h-7.5 with overflow-y-hidden, so its tabs are compressed to
          // fit rather than sizing from their own py-3. A minHeight alone lets them grow to 54px.
          height: "30px",
          minHeight: "30px",
          boxSizing: "border-box" as const,
          borderBottom: `1px solid ${theme.vars.palette.kumo.hairline}`, // kumo: border-b border-kumo-hairline
        }),
        scroller: {
          // NOT `overflow: hidden`. Kumo's list is overflow-y-hidden, but its indicator sits in the
          // list's own padding band below the tabs, so clipping the scroller cuts the indicator off
          // (measured: it lost its bottom row and cost 448 pixels). The row's height is already
          // pinned on the root, so nothing needs the clip.
          overflow: "visible !important",
        },
        // MUI v9 renamed this slot from `flexContainer` to `list`; the old key silently does
        // nothing rather than erroring.
        list: {
          height: "100%",
          boxSizing: "border-box" as const,
          gap: "16px", // kumo: gap-4
          alignItems: "stretch", // kumo: items-stretch
          paddingBottom: "8px", // kumo: pb-2
        },
        // MUI measures the selected tab and writes an INTEGER width onto its indicator inline
        // (55px for a 55.547px tab). Kumo's indicator is `w-(--active-tab-width)`, the tab's exact
        // fractional width, so MUI's is half a pixel narrow - 8 pixels at Δ246 on the trailing edge.
        // Rather than fight the rounding, the indicator is drawn from the selected tab's own box
        // (see MuiTab below), which is exact by construction.
        indicator: {
          display: "none",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            minWidth: 0, // MUI reserves 90px per tab; Kumo sizes from content
            minHeight: 0,
            padding: "12px 8px", // kumo: px-2 py-3
            ...TEXT_BASE, // kumo: text-base
            fontWeight: 500, // kumo: the root carries font-medium
            letterSpacing: "normal",
            textTransform: "none",
            borderRadius: "4px", // kumo: rounded
            color: k.textSubtle, // kumo: text-kumo-subtle
            "&:hover": {
              backgroundColor: k.tint, // kumo: hover:bg-kumo-tint
              color: k.textDefault, // kumo: hover:text-kumo-default
            },
            position: "relative",
            // MUI's Tab root is `overflow: hidden`, which clips the indicator pseudo-element below
            // - it rendered nothing at all until this was lifted.
            overflow: "visible",
            "&.Mui-selected": {
              color: k.textDefault, // kumo: aria-selected:text-kumo-default - NOT the brand
              "&:hover": { backgroundColor: k.tint }, // kumo: aria-selected:hover:bg-kumo-tint
              // The indicator, drawn from this tab's own box - see the `indicator` note above.
              "&::after": {
                content: '""',
                position: "absolute",
                left: 0,
                right: 0,
                // Kumo's indicator sits just above the list's bottom border, 3px clear of the
                // tab's own bottom edge (tab ends at 883.875, indicator spans 886.875-888.875), so
                // the offset is measured rather than assumed.
                bottom: "-5px",
                height: "2px",
                backgroundColor: k.brand,
              },
            },
            "&:focus-visible": {
              boxShadow: `0 0 0 2px ${k.brand}`, // kumo: focus-visible:ring-2 focus-visible:ring-kumo-brand
              outline: "none", // kumo: focus:outline-none
            },
          }
        },
      },
    },

    // ---- Collapsible ----
    //
    // kumo: dist/chunks/collapsible-lj0glxe1hezap65x.js
    //   DefaultTrigger  m-0 border-none bg-transparent p-0 shadow-none
    //                   flex cursor-pointer items-center gap-1 text-sm text-kumo-link select-none
    //                   + a CaretDown at h-4 w-4 that rotates 180 while the panel is open
    //   DefaultPanel    my-2 space-y-4 border-l-2 border-kumo-fill pl-4
    //
    // A text disclosure rather than a Material panel, so the whole of Accordion's Paper chrome -
    // elevation, dividers, the 48px summary bar, the collapsed margins - comes off.
    MuiAccordion: {
      defaultProps: {
        disableGutters: true, // MUI otherwise animates a margin onto the expanded root
        elevation: 0,
        square: true,
        // kumo: the panel is UNMOUNTED while closed. MUI keeps it in the DOM at height 0, and its
        // 16px padding-left plus 2px rule still occupy width - the collapsed pair measured 20px
        // wider than Kumo's. Unmounting matches the reference rather than papering over the width.
        slotProps: { transition: { unmountOnExit: true } },
      },
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          backgroundImage: "none",
          boxShadow: "none",
          margin: 0,
          "&::before": { display: "none" }, // MUI's top divider pseudo-element
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 0, // MUI reserves a 48px bar; Kumo's trigger is text-height
          // Kumo's trigger is a plain <button>, which shrinks to its content - the caret sits right
          // after the label. MUI stretches its summary to 100% and flex-grows the label, which
          // pushed the caret to the far edge (measured 111.2px wide against 201.7px).
          width: "fit-content",
          padding: 0, // kumo: p-0
          margin: 0, // kumo: m-0
          border: "none", // kumo: border-none
          backgroundColor: "transparent", // kumo: bg-transparent
          boxShadow: "none", // kumo: shadow-none
          display: "flex", // kumo: flex items-center
          alignItems: "center",
          gap: "4px", // kumo: gap-1
          ...TEXT_SM, // kumo: text-sm
          // The summary is a <button>, and a button takes the UA's own font family rather than
          // inheriting one. Tailwind's reset was quietly supplying `font: inherit`, so the label
          // measured 3px wider on the gallery page than on the Tailwind-free one - exactly the
          // dependency preflight exists to catch, and the same trap the shadcn theme hit here.
          fontFamily: "inherit",
          fontWeight: 400,
          letterSpacing: "normal",
          color: theme.vars.palette.kumo.textLink, // kumo: text-kumo-link
          userSelect: "none" as const, // kumo: select-none
          cursor: "pointer", // kumo: cursor-pointer
          "&.Mui-expanded": { minHeight: 0 },
        }),
        content: {
          margin: 0, // MUI pads the label block; Kumo's row is spaced by its own gap
          flexGrow: 0, // ...and grows it, which would reintroduce the gap the width fix removes
          "&.Mui-expanded": { margin: 0 },
        },
        expandIconWrapper: {
          // kumo: the caret is h-4 w-4 and rotates 180 when open - which is MUI's own default
          // rotation, so only the size and the inherited colour need saying.
          fontSize: "16px",
          color: "inherit",
          // `display: block` is NOT decoration. A bare Phosphor svg is an inline element, and it
          // only sat right on the gallery page because Tailwind's reset blocks every svg. The
          // preflight caught the dependency the moment the icon rendered on the Tailwind-free page
          // (Δ226 over ~950 pixels), so the theme states it itself.
          "& > svg": { fontSize: "inherit", display: "block" },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: ({ theme }) => ({
          margin: "8px 0", // kumo: my-2
          padding: 0,
          paddingLeft: "16px", // kumo: pl-4
          borderLeft: `2px solid ${theme.vars.palette.kumo.fill}`, // kumo: border-l-2 border-kumo-fill
        }),
      },
    },

    // ---- Table ----
    //
    // Kumo's Table subcomponents carry almost no classes of their own - `Table.Head` is a bare
    // <th>, `Table.Cell` a bare <td> - so the cell styling comes from Kumo's stylesheet rather than
    // from a class string, and it was read off the rendered table:
    //   th   padding 12px, border-bottom 1px --color-kumo-fill, 14px/21px weight 600, text-align left
    //   td   padding 12px, border-bottom 1px --color-kumo-fill, 14px/21px weight 400
    //
    // MUI's own cell is 16px of padding at 13px type over a translucent divider, so every one of
    // those differs.
    MuiTable: {
      styleOverrides: {
        root: ({ theme }) => ({
          isolation: "isolate" as const, // kumo: isolate - the table is its own stacking context, which is what keeps a sticky column's z-index local
          textAlign: "left" as const, // kumo: text-left
          ...TEXT_BASE, // kumo: text-base on the root; the cells inherit it
          fontFamily: FONT_SANS,
          letterSpacing: "normal",
          color: theme.vars.palette.kumo.textDefault, // kumo: text-kumo-default
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          // kumo: the `selected` variant is `bg-kumo-tint`. MUI's own .Mui-selected is an
          // alpha-blended primary, and its `hover` prop paints an action tint kumo has no
          // equivalent for at all - a kumo row reacts to neither hover nor focus.
          "&.Mui-selected, &.Mui-selected:hover": {
            backgroundColor: theme.vars.palette.kumo.tint,
          },
          "&.MuiTableRow-hover:hover": { backgroundColor: "transparent" },
        }),
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          // kumo: `[&_th]:bg-kumo-base` is written on the TABLE root, so it applies to header cells
          // wherever they sit; restated here so a head section keeps its opaque fill even when a
          // consumer builds the table out of MUI's parts without a themed cell in between.
          "& th": { backgroundColor: theme.vars.palette.kumo.base },
        }),
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          // kumo: `[&_tr:last-child_td]:border-b-0` - the table does not end on a rule.
          "& tr:last-child td": { borderBottom: 0 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: "12px", // kumo: 12px on both th and td
          ...TEXT_BASE, // kumo: 14px/21px - MUI's cell is 13px
          letterSpacing: "normal",
          textAlign: "left" as const,
          color: theme.vars.palette.kumo.textDefault,
          // kumo: the rule under every row is the FILL token, not the translucent divider MUI uses
          borderBottom: `1px solid ${theme.vars.palette.kumo.fill}`,
          // ...and Kumo drops it on the LAST body row, so the table does not end on a rule. MUI
          // keeps it, which made the table 1px taller - 960 pixels across its width.
          "tbody tr:last-of-type & , tbody tr:last-child &": { borderBottom: 0 },
        }),
        head: ({ theme }) => ({
          fontWeight: 600, // kumo: header cells are semibold
          // kumo: a header cell is filled with the base surface rather than left transparent, which
          // is what lets a sticky header cover the rows scrolling under it.
          backgroundColor: theme.vars.palette.kumo.base,
        }),
        body: {
          fontWeight: 400,
        },
      },
    },

    // ---- Breadcrumbs ----
    //
    // kumo: dist/chunks/breadcrumbs-hxibrxjtvudy0ir9.js
    //   nav        flex items-center + the size row `text-base h-12 gap-1`, plus `mr-4`
    //   link item  flex shrink-0 items-center gap-1 whitespace-nowrap text-kumo-subtle no-underline
    //   current    the same row plus font-medium, in the default text colour
    //   separator  a 24x24 chevron span in text-kumo-inactive
    MuiBreadcrumbs: {
      styleOverrides: {
        root: ({ theme }) => ({
          display: "flex", // kumo: flex
          alignItems: "center", // kumo: items-center
          height: "48px", // kumo: h-12 on the base size
          marginRight: "16px", // kumo: mr-4
          // kumo: `min-w-0 grow` - the nav fills the space it is given rather than shrinking to its
          // items, which is what lets a long trail truncate instead of overflowing.
          flexGrow: 1,
          minWidth: 0,
          ...TEXT_BASE, // kumo: text-base
          letterSpacing: "normal",
          color: theme.vars.palette.kumo.textDefault,
        }),
        ol: {
          gap: "4px", // kumo: gap-1
          alignItems: "center",
          flexWrap: "nowrap" as const, // kumo: whitespace-nowrap on the items
        },
        li: {
          display: "flex",
          alignItems: "center",
        },
        separator: ({ theme }) => ({
          margin: 0, // MUI spaces its separator with 0 8px; Kumo uses the row's own gap
          color: theme.vars.palette.kumo.textInactive, // kumo: text-kumo-inactive
        }),
      },
    },

    // ---- InputGroup ----
    //
    // kumo: dist/chunks/input-group-otq3m9lach1jyxl0.js. The group owns the box and the input
    // inside it is stripped (`rounded-none border-0 bg-transparent`); an addon is
    // `pointer-events-none flex items-center text-kumo-subtle select-none` and holds its own 8px of
    // trailing space rather than being pushed away by a margin, which is how MUI spaces its
    // adornment.
    MuiInputAdornment: {
      styleOverrides: {
        root: ({ theme }) => ({
          margin: 0, // MUI uses an 8px margin; Kumo puts the space inside the addon
          height: "auto",
          maxHeight: "none",
          color: theme.vars.palette.kumo.textSubtle, // kumo: text-kumo-subtle
          userSelect: "none" as const, // kumo: select-none
          pointerEvents: "none" as const, // kumo: pointer-events-none
        }),
        positionEnd: {
          paddingRight: "8px", // kumo: the addon's own pr-2
        },
        positionStart: {
          paddingLeft: "8px",
        },
      },
    },

    // ---- Tooltip ----
    //
    // kumo: dist/chunks/tooltip-maelyxs1y7a78vje.js
    //   positioner  max-w-[var(--available-width)]   sideOffset: 10   (side defaults to "top")
    //   popup       flex origin-[var(--transform-origin)] flex-col rounded-md bg-kumo-base px-2.5
    //               py-1.5 text-sm text-kumo-default shadow-lg shadow-kumo-tip-shadow
    //               outline outline-kumo-fill  ... kumo-tooltip-popup
    //   arrow       flex  data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180
    //               (and the three other sides, each -8px out and rotated to face the trigger)
    //
    // Kumo's arrow is a real 20x10 SVG with THREE paths, not a rotated square: a body in the popup
    // colour, plus two stroke paths of different geometry so the arrow's border lines up with the
    // popup's outline in both schemes (only one is opaque at a time - tip-shadow is transparent in
    // dark, tip-stroke is transparent in light). MUI's own arrow is a `::before` square rotated
    // 45deg, which cannot be coaxed into that shape by any amount of CSS, so the real SVG is
    // injected through `defaultProps.slotProps.arrow` - the escape hatch AGENTS.md already
    // documents - and MUI's square is switched off. Its paths carry no fill of their own; the
    // colours are applied from the token table below, so light/dark work from one definition.
    MuiTooltip: {
      defaultProps: {
        // kumo: the arrow is unconditional - kumo's Tooltip always renders TooltipArrow, where
        // MUI's is opt-in.
        arrow: true,
        slotProps: {
          // Positioning phase, not styling - and it is a real visual difference, not harness
          // plumbing. Base UI places kumo's popup by writing ONE transform in page space and
          // rounding it to the device-pixel grid. MUI's Popper defaults to popper.js's "adaptive"
          // mode, which splits the same position between a `bottom` offset and a transform and
          // rounds only the transform half - so the popup lands 0.219px closer to its trigger than
          // kumo's (measured: a 9.875px gap against kumo's 10.094). Turning adaptive off makes
          // Popper write the whole offset as one transform and round it the same way, which puts
          // both popups on exactly the same pixel. `adaptive` only exists to reduce repaint work
          // while scrolling; it has no other visible effect.
          popper: {
            popperOptions: { modifiers: [{ name: "computeStyles", options: { adaptive: false } }, ARROW_BY_LAYOUT] },
          },
          arrow: {
            // The SVG sits inside a plain span, exactly as kumo's arrow does, and that span - not
            // the SVG - is what carries the rotation (see the popper overrides below for both
            // reasons it has to be this way).
            children: createElement(
              "span",
              { "data-kumo-arrow": "rotor" },
              createElement(
                "svg",
                { width: "20", height: "10", viewBox: "0 0 20 10", fill: "none", "aria-hidden": true },
                createElement("path", { key: "fill", "data-kumo-arrow": "fill", d: ARROW_FILL_PATH }),
                createElement("path", { key: "shadow", "data-kumo-arrow": "shadow", d: ARROW_OUTER_STROKE_PATH }),
                createElement("path", { key: "stroke", "data-kumo-arrow": "stroke", d: ARROW_INNER_STROKE_PATH }),
              ),
            ),
          },
        },
      },
      styleOverrides: {
        tooltip: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            display: "flex", // kumo: flex
            flexDirection: "column" as const, // kumo: flex-col
            backgroundColor: k.base, // kumo: bg-kumo-base
            color: k.textDefault, // kumo: text-kumo-default
            fontFamily: FONT_SANS,
            ...TEXT_SM, // kumo: text-sm (13px, NOT Tailwind's 14px)
            fontWeight: 400, // MUI's own tooltip is fontWeightMedium; kumo's popup inherits 400
            padding: "6px 10px", // kumo: py-1.5 px-2.5
            borderRadius: "6px", // kumo: rounded-md
            // kumo: the popup itself sets no max-width; the POSITIONER caps it at Base UI's
            // --available-width, a collision-aware value MUI's Popper has no equivalent of. MUI
            // would otherwise wrap at its own 300px default, which is not a rule kumo has at all.
            maxWidth: "none",
            outline: `1px solid ${k.fill}`, // kumo: outline outline-kumo-fill
            // kumo: dist/styles/kumo-binding.css - `[data-mode="dark"] .kumo-tooltip-popup {
            // outline-offset: -1px }`, which the component's own class string does not mention at
            // all. In dark the arrow's visible border is the INNER stroke path, whose geometry sits
            // a pixel further in than the outer one, so the popup's outline is pulled inside to
            // meet it. Missing it left the popup painting a pixel larger than kumo's in every
            // direction (348 pixels at Δ35, and the light pair passed the whole time - the outline
            // there is a pale grey on white).
            ...theme.applyStyles("dark", { outlineOffset: "-1px" }),
            boxShadow: `0 10px 15px -3px ${k.tipShadow}, 0 4px 6px -4px ${k.tipShadow}`, // kumo: shadow-lg shadow-kumo-tip-shadow
            // MUI spaces the popup from its trigger with a margin on this element (2px all round,
            // plus 14px on the trigger's side); kumo's popup has no margin and is placed 10px out
            // by the positioner's `sideOffset`. Same visible gap, expressed the way MUI expresses
            // it, because Popper's own offset modifier is reachable only through popperOptions.
            margin: 0,
            [`.MuiTooltip-popper[data-popper-placement*="top"] &`]: { marginBottom: "10px" },
            [`.MuiTooltip-popper[data-popper-placement*="bottom"] &`]: { marginTop: "10px" },
            [`.MuiTooltip-popper[data-popper-placement*="left"] &`]: { marginInlineEnd: "10px" },
            [`.MuiTooltip-popper[data-popper-placement*="right"] &`]: { marginInlineStart: "10px" },
          }
        },
        arrow: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            display: "flex", // kumo: the arrow wrapper is `flex`
            width: "20px", // kumo: the SVG's own width; MUI sizes its arrow in em off the font
            height: "10px",
            // MUI clips its arrow to hide the far half of the rotated square. Kumo's SVG is exactly
            // the arrow, so there is nothing to clip - and clipping would eat the rotation's edge.
            overflow: "visible",
            "&::before": { display: "none" }, // MUI's rotated-square arrow, switched off
            "& > [data-kumo-arrow='rotor']": { display: "flex", width: "20px", height: "10px" },
            "& [data-kumo-arrow='fill']": { fill: k.base },
            "& [data-kumo-arrow='shadow']": { fill: k.tipShadow },
            "& [data-kumo-arrow='stroke']": { fill: k.tipStroke },
          }
        },
        // The arrow's offset and rotation are placement-conditional, and MUI writes its own version
        // of them from the POPPER (`.popper[data-popper-placement*="top"] .arrow`). Restating them
        // anywhere else loses on specificity, so they live here, mirroring that structure. Kumo's
        // own offsets are -8px on every side, and its rotation turns the SVG (which points up as
        // authored) to face the trigger.
        //
        // The rotation goes on the injected `rotor` span - not on the arrow itself, and not on the
        // SVG. Both of the other two placements are wrong, each for its own measured reason:
        //
        // NOT the arrow span, because popper.js centres the arrow by writing `transform:
        // translate3d(41.5px, 0, 0)` onto it inline, and CSS applies the individual `rotate`
        // property BEFORE the `transform` property - so a 180deg rotation flips the axes that
        // translate is then measured in and the arrow lands 41.5px LEFT of centre instead of right
        // (measured x=519 against the popup's own 560.5, far enough out to fall outside the capture
        // entirely and look as though the arrow had never rendered).
        //
        // NOT the SVG, because rotating an <svg> element makes Chrome re-render the vector under
        // the transform, while rotating a plain element flips the raster its subtree already
        // produced - and this arrow is not symmetric about its own centre (the stroke path's apex
        // is at x=10.333 of 20), so the two routes land half a pixel apart. Byte-identical shape,
        // one device pixel to the left, 1010 pixels at Δ27 on the anchored capture. Kumo rotates a
        // plain <div> wrapper, so the theme rotates a plain <span> to match.
        popper: {
          '&[data-popper-placement*="top"] .MuiTooltip-arrow': {
            bottom: 0,
            marginBottom: "-8px", // kumo: data-[side=top]:bottom-[-8px]
          },
          '&[data-popper-placement*="top"] [data-kumo-arrow="rotor"]': {
            rotate: "180deg", // kumo: data-[side=top]:rotate-180
          },
          '&[data-popper-placement*="bottom"] .MuiTooltip-arrow': {
            top: 0,
            marginTop: "-8px", // kumo: data-[side=bottom]:top-[-8px]
          },
          '&[data-popper-placement*="left"] .MuiTooltip-arrow': {
            width: "20px",
            height: "10px",
            insetInlineStart: "auto",
            insetInlineEnd: 0,
            marginInlineEnd: "-13px", // kumo: data-[side=left]:right-[-13px]
          },
          '&[data-popper-placement*="left"] [data-kumo-arrow="rotor"]': {
            rotate: "90deg", // kumo: data-[side=left]:rotate-90
          },
          '&[data-popper-placement*="right"] .MuiTooltip-arrow': {
            width: "20px",
            height: "10px",
            insetInlineStart: 0,
            marginInlineStart: "-13px", // kumo: data-[side=right]:left-[-13px]
          },
          '&[data-popper-placement*="right"] [data-kumo-arrow="rotor"]': {
            rotate: "-90deg", // kumo: data-[side=right]:-rotate-90
          },
        },
      },
    },

    // ---- Toast ----
    //
    // kumo: dist/chunks/toast-itl6qo5oy1vy6d36.js
    //   viewport   fixed top-auto right-4 bottom-4 sm:right-8 sm:bottom-8 w-[340px]
    //   root       absolute right-0 bottom-0 w-full  +  toastVariants:
    //              rounded-xl ring ring-kumo-line bg-clip-padding p-4 shadow-lg
    //   surface    a SEPARATE layer inside it - `absolute inset-0 rounded-[11px] bg-kumo-base/90` -
    //              so the fill is inset by the ring's width and sits at 90% alpha over the root
    //   title      text-[0.975rem] leading-5 font-medium text-kumo-default
    //   close      absolute top-2 right-2 size-5 rounded text-kumo-subtle, holding a 12px glyph
    MuiSnackbar: {
      defaultProps: {
        // kumo pins its viewport 32px from the bottom-right corner (`sm:right-8 sm:bottom-8`);
        // MUI's own default is bottom-centre at 24px.
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      },
      styleOverrides: {
        // `&&` doubles the selector's specificity on purpose: MUI states its own 24px offsets
        // inside an `@media (min-width: 600px)` block, and a plain root rule loses to it.
        root: {
          "&&": {
            bottom: "32px", // kumo: sm:bottom-8
            right: "32px", // kumo: sm:right-8
            left: "auto",
          },
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            position: "relative",
            width: "340px", // kumo: the viewport's own w-[340px], which the toast fills
            minWidth: 0, // MUI floors its content at 288px
            padding: "16px", // kumo: p-4
            borderRadius: "12px", // kumo: rounded-xl
            backgroundColor: k.base,
            backgroundImage: "none",
            color: k.textDefault,
            boxShadow: `0 0 0 1px ${k.line}, ${SHADOW_LG}`, // kumo: ring ring-kumo-line + shadow-lg
            // kumo paints the fill as its own layer rather than as the root's background: inset to
            // the ring, one pixel tighter in radius, and at 90% alpha. A pseudo-element is the only
            // way to reach it - SnackbarContent renders no such node - and it is the same technique
            // the Button's gradient and the Popover's arrow already use.
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              borderRadius: "11px", // kumo: rounded-[11px]
              backgroundColor: `color-mix(in oklab, ${k.base} 90%, transparent)`, // kumo: bg-kumo-base/90
            },
          }
        },
        message: {
          // kumo's title, which is the only content this pair carries - see the section for why a
          // description cannot be expressed through MUI's single `message` slot.
          position: "relative", // above the fill layer
          padding: 0, // MUI pads the message by 8px vertically
          fontFamily: FONT_SANS,
          fontSize: "0.975rem", // kumo: text-[0.975rem]
          lineHeight: "20px", // kumo: leading-5
          fontWeight: 500, // kumo: font-medium
          letterSpacing: "normal",
        },
        action: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            // kumo's close button is pinned to the corner rather than laid out beside the message.
            position: "absolute",
            top: "8px", // kumo: top-2
            right: "8px", // kumo: right-2
            margin: 0,
            padding: 0,
            // kumo: `absolute top-2 right-2 size-5 rounded text-kumo-subtle hover:bg-current/15`
            // over a ghost square Button, holding an `h-3 w-3` glyph. Scoped to this slot so the
            // theme's own IconButton block, which mirrors kumo's IconButton, is left alone.
            "& .MuiIconButton-root": {
              // kumo's close is the GHOST variant - `shadow-none bg-inherit` - where the theme's
              // own IconButton block gives every icon button kumo's default surface, ring and all.
              backgroundColor: "transparent",
              boxShadow: "none",
              width: "20px", // kumo: size-5
              height: "20px",
              padding: 0,
              borderRadius: "4px", // kumo: rounded
              color: k.textSubtle, // kumo: text-kumo-subtle
              "&:hover": { backgroundColor: "color-mix(in oklab, currentColor 15%, transparent)" }, // kumo: hover:bg-current/15
              "& svg": { width: "12px", height: "12px" }, // kumo: h-3 w-3
            },
          }
        },
      },
    },

    // ---- Dialog ----
    //
    // kumo: dist/chunks/dialog-b4r3dv8uvgl2pqem.js
    //   backdrop  fixed inset-0 bg-kumo-recessed opacity-80 transition-all duration-150
    //   panel     LayerCard rendered AS Base UI's DialogPopup, so it carries LayerCard's
    //             `overflow-hidden rounded-lg bg-kumo-base shadow-xs ring ring-kumo-line` plus
    //             dialogVariants' `ring ring-kumo-line fixed top-1/2 left-1/2 w-full
    //             max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden
    //             rounded-xl bg-kumo-base text-kumo-default` and the base size's `sm:w-96`,
    //             over an INLINE `--tw-shadow` of `0 20px 25px -5px rgb(0 0 0 / 0.03),
    //             0 8px 10px -6px rgb(0 0 0 / 0.03)` that replaces both shadow classes.
    //   title     Base UI's DialogTitle with NO classes at all, and the same for Description -
    //             kumo ships no typography here, so a themed MuiDialogTitle has to give its own
    //             back rather than keep MUI's h6-and-padding.
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            width: "384px", // kumo: sm:w-96
            maxWidth: "calc(100vw - 2rem)", // kumo: max-w-[calc(100vw-2rem)]
            margin: 0, // MUI insets its paper by 32px; kumo centres a fixed-width panel instead
            // kumo: `fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`. MUI centres its
            // paper with flexbox on the container instead, and the two land on the same pixel but
            // do not RASTERIZE the same: a translated box is drawn into its own compositing layer,
            // where the rounded corners are antialiased slightly differently (106 pixels at Δ2,
            // all of them corner curve). Same mechanism, same picture.
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "12px", // kumo: rounded-xl (which beats LayerCard's own rounded-lg)
            backgroundColor: k.base, // kumo: bg-kumo-base
            backgroundImage: "none", // MUI's Paper lays a white gradient over an elevated dark surface
            color: k.textDefault, // kumo: text-kumo-default
            overflow: "hidden", // kumo: overflow-hidden
            // kumo: ring ring-kumo-line over the INLINE --tw-shadow, which replaces the shadow-xs
            // LayerCard would otherwise contribute.
            boxShadow: `0 0 0 1px ${k.line}, 0 20px 25px -5px rgb(0 0 0 / 0.03), 0 8px 10px -6px rgb(0 0 0 / 0.03)`,
          }
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: ({ theme }) => ({
          // kumo writes this as `bg-kumo-recessed opacity-80` - two declarations - but the alpha
          // has to be folded into the COLOUR here. MUI mounts every Backdrop inside a Fade, which
          // writes `opacity: 1` as an inline style once the transition finishes, and an inline
          // declaration outranks any rule the theme can write. A flat layer at 80% opacity and one
          // whose colour carries 80% alpha composite identically.
          backgroundColor: `color-mix(in oklab, ${theme.vars.palette.kumo.recessed} 80%, transparent)`,
          "&.MuiBackdrop-invisible": { backgroundColor: "transparent" },
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          // kumo renders its Dialog.Title with no classes, so it inherits the surface's own type.
          // MUI's own default is h6 with 16px 24px of padding.
          ...TEXT_BASE,
          fontFamily: FONT_SANS,
          fontWeight: 400,
          letterSpacing: "normal",
          padding: 0,
        },
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Same story as the title: unstyled in kumo, so the theme states the inherited values
          // rather than leaving MUI's secondary-text default in place.
          ...TEXT_BASE,
          fontFamily: FONT_SANS,
          letterSpacing: "normal",
          color: theme.vars.palette.kumo.textDefault,
        }),
      },
    },

    // ---- Popover ----
    //
    // kumo: dist/chunks/popover-l0xg7b854w7txyoz.js
    //   positioner  side "bottom", align "center", sideOffset 8
    //   popup       flex origin-(--transform-origin) flex-col rounded-lg bg-kumo-base px-4 py-3
    //               text-sm text-kumo-default shadow-lg shadow-kumo-tip-shadow
    //               outline outline-kumo-fill  ... kumo-popover-popup
    //   arrow       the SAME 20x10 three-path SVG the Tooltip uses, `data-[side=bottom]:-top-2`
    //
    // MUI's Popover has no arrow slot at all - not a styling gap but a missing element - so this is
    // the one place in the theme where a shape is drawn rather than rendered. Two pseudo-elements
    // on the Paper carry the arrow's two VISIBLE paths (`clip-path: path()` takes the SVG's own `d`
    // verbatim), which is enough because only two of kumo's three paths are ever opaque at once:
    // tip-stroke is transparent in light, tip-shadow is transparent in dark. Measured against the
    // real SVG in isolation, a clipped box and a filled path differ by 27 pixels at Δ1 - the
    // rasterizers agree to within a rounding step.
    MuiPopover: {
      defaultProps: {
        // kumo: the popup's top-CENTRE sits 8px below the trigger's bottom-centre. The gap rides on
        // a negative transformOrigin, which Popover treats as a numeric offset - see the MuiMenu
        // block for why a margin cannot do this.
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
        transformOrigin: { vertical: -8, horizontal: "center" },
        marginThreshold: 5, // Base UI's own viewport padding; MUI reserves 16 and shifts to respect it
      },
      styleOverrides: {
        // Scoped away from Menu and Select, which are Popovers too and have their own recipes
        // (see MuiMenu). Without this, styling "the popover" restyles every dropdown in the theme.
        paper: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            "&:not(.MuiMenu-paper)": {
              display: "flex",
              flexDirection: "column" as const, // kumo: flex flex-col
              ...TEXT_SM, // kumo: text-sm (13px)
              fontFamily: FONT_SANS,
              letterSpacing: "normal",
              color: k.textDefault, // kumo: text-kumo-default
              backgroundColor: k.base, // kumo: bg-kumo-base
              backgroundImage: "none", // MUI's Paper lays a white gradient over an elevated dark surface
              borderRadius: "8px", // kumo: rounded-lg
              padding: "12px 16px", // kumo: py-3 px-4
              outline: `1px solid ${k.fill}`, // kumo: outline outline-kumo-fill
              // kumo: dist/styles/kumo-binding.css pulls the popover's outline inward in dark mode
              // only, exactly as it does the tooltip's - the class string mentions neither.
              ...theme.applyStyles("dark", { outlineOffset: "-1px" }),
              boxShadow: `0 10px 15px -3px ${k.tipShadow}, 0 4px 6px -4px ${k.tipShadow}`, // kumo: shadow-lg shadow-kumo-tip-shadow
              // The arrow hangs 8px above the paper's own box, so the paper must not clip it - MUI
              // gives every Popover paper `overflow-y: auto`.
              overflow: "visible",
              "&::before, &::after": {
                content: '""',
                position: "absolute",
                top: "-8px", // kumo: data-[side=bottom]:-top-2
                left: "50%",
                marginLeft: "-10px", // half the arrow's 20px width - kumo's arrow is centre-aligned
                width: "20px",
                height: "10px",
              },
              // The body of the arrow, in the popup's own colour.
              "&::before": {
                backgroundColor: k.base,
                clipPath: `path('${ARROW_FILL_PATH}')`,
              },
              // Its border. kumo draws this with two paths of different geometry and lets the
              // colour tokens decide which one is visible, because an outer stroke and an inner
              // stroke meet the popup's outline differently. Only one is ever opaque, so one
              // pseudo-element carries whichever it is.
              "&::after": {
                backgroundColor: k.tipShadow,
                clipPath: `path('${ARROW_OUTER_STROKE_PATH}')`,
                ...theme.applyStyles("dark", {
                  backgroundColor: k.tipStroke,
                  clipPath: `path('${ARROW_INNER_STROKE_PATH}')`,
                }),
              },
            },
          }
        },
      },
    },

    // ---- Select trigger ----
    //
    // kumo: dist/chunks/select-ln6ibqbbs0n4tiig.js
    //   trigger  buttonVariants({ size }) + "justify-between font-normal"
    //   icon     CaretUpDown at 16px for the base size, in `text-kumo-subtle`
    //
    // The BOX is styled on MuiOutlinedInput (scoped to `:has(.MuiSelect-select)` - see there);
    // what is left here is the display area and the icon, which are Select's own slots.
    MuiSelect: {
      styleOverrides: {
        select: {
          cursor: "pointer",
          // kumo: the trigger is `flex justify-between` with `px-3`, so the value sits 12px from
          // the left edge and the room on the right is the icon's 16px plus the same 12px.
          padding: "0 28px 0 12px",
          minHeight: 0,
        },
        icon: ({ theme }) => ({
          right: "12px", // kumo: the trigger's own px-3, not MUI's 7px
          width: "16px", // kumo: triggerIconStyles.base.iconSize
          height: "16px",
          // MUI centres its icon with `calc(50% - .5em)`, which is only correct while the icon is
          // 1em tall. kumo's is a fixed 16px against a 14px font, so the em-based offset leaves it
          // a pixel low - the last 81 pixels of this pair.
          top: "calc(50% - 8px)",
          color: theme.vars.palette.kumo.textSubtle, // kumo: text-kumo-subtle
          // kumo's caret never rotates when the popup opens; MUI's own icon flips 180deg.
          "&.MuiSelect-iconOpen": { transform: "none" },
        }),
      },
    },

    // ---- DropdownMenu ----
    //
    // kumo: dist/chunks/dropdown-k0y5j6iuad7tvqgx.js
    //   positioner  sideOffset: 8, side "bottom", align "center" (Base UI's own defaults)
    //   popup       overflow-hidden bg-kumo-control text-kumo-default
    //               max-h-[var(--available-height)] overflow-y-auto
    //               rounded-lg shadow-lg ring ring-kumo-line  min-w-36 p-1.5
    //   item        relative flex cursor-default items-center rounded-md px-2 py-1.5 text-base
    //               outline-hidden select-none focus:text-kumo-default
    //               data-disabled:opacity-50 data-highlighted:bg-kumo-overlay
    //
    // MUI builds a Menu out of Popover + Paper + MenuList, and reuses the same three for a Select's
    // popup - where kumo uses a DIFFERENT recipe (see the Select block below). The two are split
    // the way the shadcn theme already splits them, on the role MUI puts on the list inside:
    // `menu` here, `listbox` there. Everything they genuinely share sits outside both branches.
    MuiMenu: {
      defaultProps: {
        // kumo: the popup's top-CENTRE sits 8px below the trigger's bottom-centre. MUI's Menu
        // instead defaults to top-left-on-top-left, overlapping the trigger entirely. The gap
        // rides on a negative `transformOrigin.vertical`, which Popover treats as a numeric offset
        // (its own getOffsetTop), rather than on a margin - the same technique the shadcn theme
        // uses, and the only one that survives Popover writing `top`/`left` as inline styles.
        anchorOrigin: { vertical: "bottom", horizontal: "center" },
        transformOrigin: { vertical: -8, horizontal: "center" },
        // Base UI keeps 5px of viewport padding where MUI's Popover reserves 16px and nudges the
        // panel up to respect it, so near a viewport edge the two disagree about placement rather
        // than about styling.
        marginThreshold: 5,
      },
      styleOverrides: {
        paper: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            borderRadius: "8px", // kumo: rounded-lg
            color: k.textDefault, // kumo: text-kumo-default
            // MUI's Paper lays an unthemed white gradient over its own background in dark mode,
            // scaled by `elevation` (Menu's Paper defaults to 8). Kumo's popup is one flat colour.
            backgroundImage: "none",
            boxShadow: `0 0 0 1px ${k.line}, ${SHADOW_LG}`, // kumo: ring ring-kumo-line + shadow-lg, on both recipes
            "&:has([role='menu'])": {
              backgroundColor: k.control, // kumo: bg-kumo-control - NOT bg-kumo-base, which is what Select's popup uses
              minWidth: "144px", // kumo: min-w-36
              padding: "6px", // kumo: p-1.5
              overflowX: "hidden" as const, // kumo: overflow-hidden
              overflowY: "auto" as const, // kumo: overflow-y-auto
            },
            // kumo: dist/chunks/select-ln6ibqbbs0n4tiig.js - the Select popup is a DIFFERENT
            // recipe from the menu above: `flex flex-col max-h-[var(--available-height)]
            // bg-kumo-base text-kumo-default rounded-lg shadow-lg ring ring-kumo-line
            // min-w-[calc(var(--anchor-width)+3px)] py-1.5`. Vertical padding only, a different
            // surface token, and the scroll lives on the list inside rather than on the popup.
            "&:has([role='listbox'])": {
              backgroundColor: k.base, // kumo: bg-kumo-base
              display: "flex",
              flexDirection: "column" as const, // kumo: flex flex-col
              padding: "6px 0", // kumo: py-1.5
              overflow: "hidden" as const,
              "& [role='listbox']": {
                minHeight: 0,
                flex: 1,
                overflowY: "auto" as const, // kumo: the LIST scrolls, not the popup
              },
            },
          }
        },
        list: {
          padding: 0, // kumo: the popup owns the padding; the list inside adds none
        },
      },
    },

    // ---- DropdownMenu items ----
    //
    // Scoped by the role of the list they sit in, for the same reason the paper above is: MUI's
    // MenuItem is also a Select's option, and kumo styles those two differently (a select option
    // has side margins and a tint highlight; a menu item has neither).
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => {
          const k = theme.vars.palette.kumo
          return {
            "[role='menu'] &": {
              ...TEXT_BASE, // kumo: text-base (14px)
              fontFamily: FONT_SANS,
              letterSpacing: "normal",
              color: k.textDefault,
              borderRadius: "6px", // kumo: rounded-md
              padding: "6px 8px", // kumo: py-1.5 px-2
              minHeight: 0, // MUI floors a menu item at 48px (36px on a dense list); kumo sizes from content
              cursor: "default", // kumo: cursor-default
              // kumo: data-highlighted:bg-kumo-overlay. Base UI sets data-highlighted on pointer
              // move, so this is what a hovered item paints - MUI reaches the same state through
              // :hover and .Mui-focusVisible, and its own default is an alpha-blended action tint.
              "&:hover, &.Mui-focusVisible, &.Mui-selected, &.Mui-selected:hover": {
                backgroundColor: k.overlay,
              },
              "&.Mui-disabled": {
                opacity: 0.5, // kumo: data-disabled:opacity-50
                pointerEvents: "none" as const, // kumo: data-disabled:pointer-events-none
              },
            },
            // kumo: Select.Option - `group mx-1.5 flex cursor-pointer items-center
            // justify-between gap-2 rounded px-2 py-1.5 text-base outline-none
            // data-highlighted:bg-kumo-tint`. Side MARGINS rather than the popup's padding, a
            // smaller radius than a menu item, and a tint highlight instead of an overlay one.
            "[role='listbox'] &": {
              ...TEXT_BASE, // kumo: text-base (14px)
              fontFamily: FONT_SANS,
              letterSpacing: "normal",
              color: k.textDefault,
              margin: "0 6px", // kumo: mx-1.5
              padding: "6px 8px", // kumo: py-1.5 px-2
              borderRadius: "4px", // kumo: rounded (the base radius, not the menu item's rounded-md)
              minHeight: 0,
              cursor: "pointer", // kumo: cursor-pointer
              justifyContent: "space-between", // kumo: justify-between - the label and its indicator
              gap: "8px", // kumo: gap-2
              "&:hover, &.Mui-focusVisible, &.Mui-selected, &.Mui-selected:hover": {
                backgroundColor: k.tint, // kumo: data-highlighted:bg-kumo-tint
              },
              "&.Mui-disabled": {
                opacity: 0.5, // kumo: data-[disabled]:opacity-50
                pointerEvents: "none" as const,
              },
            },
          }
        },
      },
    },

    // ---- Field ----
    //
    // kumo: dist/chunks/field-dxe9ne8fqy5whws2.js wraps a control that has a label, description or
    // error in `grid gap-2`, with the message rendered as
    // `text-sm leading-snug text-kumo-danger col-span-full`. MUI builds the same composition out of
    // FormControl + FormHelperText, so those two carry it.
    MuiFormControl: {
      styleOverrides: {
        root: {
          gap: "8px", // kumo: Field's gap-2
          margin: 0,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          // MUI spaces its helper text with a 3px top margin; Kumo's grid gap does that job, so the
          // margin has to go or the message sits 3px too low.
          margin: 0,
          ...TEXT_SM, // kumo: text-sm
          lineHeight: 1.375, // kumo: leading-snug
          fontWeight: 400,
          letterSpacing: "normal",
          color: theme.vars.palette.kumo.textSubtle, // kumo: a description is text-kumo-subtle
          "&.Mui-error": {
            color: theme.vars.palette.kumo.textDanger, // kumo: an error message is text-kumo-danger
          },
        }),
      },
    },

    // ---- Label ----
    //
    // kumo: `m-0 text-base font-medium text-kumo-default` plus `inline-flex items-center gap-1`.
    // Its optional-field marker is composed content (a `font-normal text-kumo-subtle` span), not a
    // style, so the gallery composes the same thing out of themed Typography rather than the theme
    // inventing a slot for it. The `tooltip` prop is out of scope until Tooltip lands in Tier 2.
    MuiFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          margin: 0, // kumo: m-0
          display: "inline-flex", // kumo: inline-flex
          alignItems: "center", // kumo: items-center
          gap: "4px", // kumo: gap-1
          ...TEXT_BASE, // kumo: text-base
          fontWeight: 500, // kumo: font-medium
          letterSpacing: "normal",
          color: theme.vars.palette.kumo.textDefault, // kumo: text-kumo-default
          userSelect: "none" as const, // kumo: Field's label adds select-none
          // MUI recolours a label once its field is focused or errored; Kumo's Label has no such
          // rule, so the colour is pinned across both.
          "&.Mui-focused, &.Mui-error": {
            color: theme.vars.palette.kumo.textDefault,
          },
        }),
      },
    },

    // ---- Link ----
    //
    // Ground truth: dist/chunks/link-1b3jda6cdzl4lkeo.js. Every variant also picks up the base
    // `group/link inline-flex items-center gap-[0.1875em]` from the component body, which is what
    // spaces the optional external-link icon.
    //
    //   inline  (default) text-kumo-link underline underline-offset-[0.15em]
    //                     decoration-[0.0625em] transition-colors
    //   current           text-current + the same underline treatment
    //   plain             text-kumo-link hover:text-kumo-link/70 (no underline)
    //
    // The `link-current` class in those strings resolves to no CSS rule at all in the shipped
    // stylesheet - it is an inert marker, and deliberately not reproduced.
    MuiLink: {
      defaultProps: {
        // Kumo underlines by default and never uses MUI's hover-only mode.
        underline: "always",
      },
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const k = theme.vars.palette.kumo
          const isCurrent = ownerState.color === "inherit" // kumo: the `current` variant
          const isPlain = ownerState.underline === "none" // kumo: the `plain` variant
          return {
            display: "inline-flex", // kumo: inline-flex
            alignItems: "center", // kumo: items-center
            gap: "0.1875em", // kumo: gap-[0.1875em]
            color: isCurrent ? "inherit" : k.textLink, // kumo: text-current / text-kumo-link
            transition: "color 150ms", // kumo: transition-colors
            // kumo: a breadcrumb item is `text-kumo-subtle no-underline`, not the link colour and
            // underline a standalone Link carries. Scoped here so the standalone case is untouched.
            ".MuiBreadcrumbs-root &": {
              color: k.textSubtle,
              textDecoration: "none",
              gap: "4px", // kumo: the item row is gap-1
            },
            ...(isPlain
              ? {
                  textDecoration: "none",
                  // kumo: hover:text-kumo-link/70
                  "&:hover": { color: `color-mix(in oklab, ${k.textLink} 70%, transparent)` },
                }
              : {
                  textDecoration: "underline", // kumo: underline
                  textDecorationThickness: "0.0625em", // kumo: decoration-[0.0625em]
                  textUnderlineOffset: "0.15em", // kumo: underline-offset-[0.15em]
                  // Kumo tints the underline to a fraction of the link's own colour, and the
                  // fraction is SCHEME-DEPENDENT: 35% in light, 65% in dark. Measured on both
                  // variants in both modes - the inline link's decoration resolves to its blue at
                  // /0.35 then /0.65, and the `current` link's to the inherited text colour at the
                  // same two alphas. MUI's own default is a flat 40% tint of the text colour: close
                  // enough to look right, and wrong by Δ147 in light and Δ77 in dark.
                  textDecorationColor: "color-mix(in oklab, currentColor 35%, transparent)",
                  ...theme.applyStyles("dark", {
                    textDecorationColor: "color-mix(in oklab, currentColor 65%, transparent)",
                  }),
                  "&:hover": { textDecoration: "underline" },
                }),
          }
        },
      },
    },

    // ---- IconButton ----
    //
    // Kumo has no separate icon-button component: it is Button with `shape="square"` (or "circle"),
    // which swaps the horizontal padding for a fixed square from KUMO_BUTTON_VARIANTS.compactSize
    // and centres the content. MUI's idiomatic surface for that is IconButton, so the square is
    // rebuilt here rather than asking the gallery to pass layout props.
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const size = (ownerState.size ?? "medium") as KumoButtonSize
          const s = BUTTON_SIZES[size]
          const k = theme.vars.palette.kumo
          return {
            ...buttonBase(size),
            width: s.compact, // kumo: compactSize size-*
            height: s.compact,
            padding: 0, // kumo: shape square/circle set p-0
            justifyContent: "center", // kumo: justify-center
            borderRadius: s.radius, // kumo: square keeps the size's own radius (circle would be rounded-full)
            color: k.textDefault, // kumo: secondary's !text-kumo-default, the default variant
            backgroundColor: k.base, // kumo: bg-kumo-base
            boxShadow: ringWith(k.line), // kumo: ring ring-kumo-line
            // IconButton has no disableElevation prop, but it applies its own background overlays
            // on hover/active, so the shadow is restated for the same reason - see shadowStates.
            ...shadowStates(ringWith(k.line), ringWith(k.line), ringWith(k.brand, 2)),
            "&:hover": {
              backgroundColor: k.tint, // kumo: not-disabled:hover:bg-kumo-tint
              boxShadow: ringWith(k.line),
            },
            "&:active": {
              backgroundColor: k.tint,
              boxShadow: ringWith(k.line),
            },
            // kumo: focus:ring-kumo-focus/50 - see the matching note on MuiButton above; a press
            // focuses the button, so this is what a pressed icon button actually shows.
            "&:focus": {
              boxShadow: ringWith(`color-mix(in oklab, ${k.focus} 50%, transparent)`),
            },
            "&:focus-visible": {
              boxShadow: ringWith(k.brand, 2), // kumo: focus-visible:ring-2 ring-kumo-brand, over shadow-xs
              outline: "none",
            },
            "&.Mui-disabled": {
              cursor: "not-allowed",
              opacity: 0.5,
              pointerEvents: "auto" as const,
              color: `color-mix(in oklab, ${k.textDefault} 70%, transparent)`,
              backgroundColor: `color-mix(in oklab, ${k.base} 50%, transparent)`,
              boxShadow: ringWith(k.line),
            },
          }
        },
      },
    },

    // ================================================================================
    // DERIVED TIER - components MUI ships and Kumo does not
    // ================================================================================
    //
    // Everything above this line is EXTRACTED: a Kumo component was read, measured in the browser,
    // and a gallery pair holds it at zero. Nothing below is. MUI's component surface is wider than
    // Kumo's, and a `<Slider>` or `<Avatar>` in a Kumo app has no Kumo counterpart to copy.
    //
    // The alternative to deriving them is leaving them stock Material - a blue, Roboto-metric
    // control sitting beside the themed ones - which for a drop-in theme is worse than an imperfect
    // derivation. So they are built from Kumo's own TOKENS and from the geometry its real
    // components use, and every value still says where it came from.
    //
    // What that does NOT buy: a pixel guarantee. There is no reference, so these pairs render
    // MUI-only in the gallery, publish no states, and are skipped by the parity suite (see
    // `Pair.ref`). preflight still holds them - it compares the MUI cell with and without Tailwind,
    // which needs no reference. Treat a value here as a considered choice, not as ground truth, and
    // if Kumo ever ships the real component, re-extract it and move the block above the line.

    // Kumo's only separator is Dropdown's - `-mx-1 my-1 h-px bg-kumo-hairline`. The colour and the
    // 1px rule are that class verbatim; the negative side margins are NOT carried over, since those
    // exist to bleed the rule to the edges of a popup's padding and a standalone Divider has none.
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.vars.palette.kumo.hairline, // kumo: bg-kumo-hairline
          borderWidth: 0,
          borderStyle: "solid" as const,
          borderBottomWidth: "1px", // kumo: h-px
          "&.MuiDivider-vertical": {
            borderBottomWidth: 0,
            borderRightWidth: "1px",
          },
        }),
      },
    },

    // A scroll container. Kumo's Table root IS the <table> (`isolate w-full`) and the package ships
    // no wrapper - but its sticky-column classes are written against "the scroll container", which
    // the consumer is expected to supply. This is that container, and nothing more: no fill, no
    // ring, no radius, because Kumo puts none on one.
    MuiTableContainer: {
      styleOverrides: {
        root: {
          width: "100%", // kumo: the table's own w-full
          overflowX: "auto" as const,
        },
      },
    },

    // Kumo has no avatar. Derived from the shape it uses for every circular chip - `rounded-full`
    // over `bg-kumo-fill` - at the neutral badge's type (`text-xs font-medium`) and the base
    // control height (h-9/36px), so an Avatar lines up with a Button or Input beside it.
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          width: "36px", // kumo: the base size row's h-9
          height: "36px",
          backgroundColor: theme.vars.palette.kumo.fill, // kumo: bg-kumo-fill
          color: theme.vars.palette.kumo.textSubtle, // kumo: text-kumo-subtle
          ...TEXT_XS, // kumo: the badge's text-xs
          fontWeight: 500, // kumo: font-medium
          letterSpacing: "normal",
        }),
        // MUI rounds a "rounded" variant with its own shape.borderRadius; Kumo's control radius is
        // rounded-lg at this size.
        rounded: { borderRadius: "8px" }, // kumo: rounded-lg
      },
    },

    // Kumo has no skeleton - the package exports none, and the docs site's SkeletonLine is not in
    // 2.9.0. Derived from `bg-kumo-fill`, the token Kumo uses for every inert placeholder shape,
    // at the medium control radius. MUI's pulse is kept as-is: Kumo has no loading animation to
    // copy (its only animations are toast/bounce keyframes), so there is nothing to contradict it.
    MuiSkeleton: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.vars.palette.kumo.fill, // kumo: bg-kumo-fill
        }),
        rounded: { borderRadius: "6px" }, // kumo: rounded-md
      },
    },
  },
})

// Re-exported so component blocks added below (and the gallery's own sections) can name the scale
// without re-deriving it from the package.
export const KUMO_TEXT = { xs: TEXT_XS, sm: TEXT_SM, base: TEXT_BASE, lg: TEXT_LG }
