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
    MuiButtonGroup: {
      defaultProps: {
        // A group publishes its resolved disableRipple through ButtonGroupContext, and Button reads
        // context at higher priority than theme defaults - so without this it hands the ripple back
        // to every child.
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
            ...(ownerState.multiline
              ? { height: "auto" } // kumo: InputArea's h-auto
              : { height: "36px" }), // kumo: h-9
            // kumo: focus:ring-[1.5px] focus:ring-kumo-focus/50. Plain :focus on the control, so
            // `:has(:focus)` rather than MUI's `.Mui-focused` (which also fires for programmatic
            // focus) and rather than :focus-visible (which a click would not match).
            "&:has(:focus)": {
              boxShadow: `0 0 0 1.5px color-mix(in oklab, ${k.focus} 50%, transparent)`,
            },
            "&.Mui-error": {
              boxShadow: `0 0 0 1px ${k.danger}`, // kumo: !ring-kumo-danger
              "&:has(:focus)": {
                // kumo: `focus:ring-kumo-danger/50 focus:ring-[1.5px]` - but the `!` on the resting
                // `!ring-kumo-danger` makes that colour !important, so it BEATS the /50 tint while
                // the width still widens. A focused error ring is therefore solid danger at 1.5px,
                // not a 50% wash of it. Taking the class list at face value renders a visibly paler
                // outline (Δ103).
                boxShadow: `0 0 0 1.5px ${k.danger}`,
              },
            },
            "&.Mui-disabled": {
              // Kumo's own `disabled:text-kumo-disabled` names a token the package does not define,
              // so it resolves to nothing and a disabled field keeps its normal colours. Restated
              // here because MUI otherwise greys both the text and the outline.
              color: k.textDefault,
              backgroundColor: k.control,
              boxShadow: `0 0 0 1px ${k.line}`,
            },
          }
        },
        input: ({ theme, ownerState }) => ({
          padding: ownerState.multiline ? "8px 12px" : "0 12px", // kumo: px-3, plus py-2 on InputArea
          height: ownerState.multiline ? "auto" : "100%",
          boxSizing: "border-box" as const,
          // Kumo's InputArea is a plain <textarea>, so it keeps the UA's vertical resize grip. MUI
          // sets `resize: none` on its own, which erased the grip - Δ153 over the ~40 corner pixels
          // it occupies.
          ...(ownerState.multiline && { resize: "vertical" as const }),
          "&::placeholder": {
            // kumo: the `kumo-input-placeholder` class
            color: theme.vars.palette.kumo.textPlaceholder,
            opacity: 1, // MUI dims its placeholder with opacity; Kumo sets a colour outright
          },
          "&.Mui-disabled": {
            WebkitTextFillColor: theme.vars.palette.kumo.textDefault, // MUI greys disabled text via this
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
        root: ({ theme }) => ({
          overflow: "hidden", // kumo: overflow-hidden
          borderRadius: "8px", // kumo: rounded-lg
          backgroundColor: theme.vars.palette.kumo.base, // kumo: bg-kumo-base
          backgroundImage: "none", // MUI overlays a lightness gradient on an elevated dark Paper
          border: 0,
          boxShadow: ringWith(theme.vars.palette.kumo.line), // kumo: ring ring-kumo-line + shadow-xs
        }),
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
          "& > svg": { fontSize: "inherit" },
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
  },
})

// Re-exported so component blocks added below (and the gallery's own sections) can name the scale
// without re-deriving it from the package.
export const KUMO_TEXT = { xs: TEXT_XS, sm: TEXT_SM, base: TEXT_BASE, lg: TEXT_LG }
