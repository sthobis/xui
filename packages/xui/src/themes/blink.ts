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

// The kit's Button axes are wider than MUI's on both sides: five variants against three, and four
// sizes against three. `light` is the tinted fill (tonal, and destructive when `color="error"`);
// `xs` is the kit's 24px control height, which MUI has no step for.
declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    light: true
  }
  interface ButtonPropsSizeOverrides {
    xs: true
  }
}

// The kit's Input has three heights (32/36/40); MUI's InputBase has two. `large` is the 40px step.
declare module "@mui/material/InputBase" {
  interface InputBasePropsSizeOverrides {
    large: true
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
    // ---- Button ----
    //
    // Ground truth: reference/primitives/Button/Button.module.css, quoted per line below.
    // Ported from mui-themed/components/button.ts, with four corrections the primitive forced:
    //
    //   1. `ghost` and `tonal` carry `border: 1px solid transparent`, not `border: none`. With
    //      border-box sizing the outer height is the same either way, so this is invisible until
    //      you look at the LABEL: a 1px border eats 1px of the content box, so the text sits one
    //      pixel further in. The port's `border: none` moved it.
    //   2. No `defaultProps.size`. The port pinned `size: "large"`, which came from the older
    //      PulseButton whose default was 42px. The kit's Button defaults to `md`, and MUI's own
    //      default `medium` already maps to it - so pinning it made every default-size button 40px
    //      instead of 36px.
    //   3. The focus ring is spelled with the kit's own `color-mix(in srgb, ...)` rather than the
    //      port's `rgba(<channel> / 0.5)`. The two agree numerically, but transcribing the
    //      expression keeps it greppable back to tokens.css.
    //   4. `secondary`'s hover is a 4% tint of TEXT colour (`--color-text-default`), which the port
    //      had right, but as a channel-alpha; same treatment as 3.
    //
    // `disableElevation` is NOT set, on purpose - see the boxShadow note on the root below.
    MuiButton: {
      defaultProps: {
        // The kit's Button signature is `variant = "secondary"`, which is this. MUI's own default
        // is `text`, i.e. the kit's `ghost` - a transparent button where the design system expects
        // a bordered one.
        variant: "outlined", // blink: Button/index.tsx `variant = "secondary"`
        // The kit passes `disableRipple` to ButtonBase directly. Restated here rather than left to
        // the global MuiButtonBase default, because that default does not reach every component
        // that forwards its own.
        disableRipple: true, // blink: Button/index.tsx `disableRipple`
      },
      styleOverrides: {
        root: ({ theme }) => ({
          display: "flex", // blink: .root `display: flex`
          alignItems: "center", // blink: .root `align-items: center`
          justifyContent: "center", // blink: .root `justify-content: center`
          gap: 8, // blink: .root `gap: var(--space-2)`
          borderRadius: 8, // blink: .root `border-radius: var(--radius-3)`
          // The kit says `font-family: inherit`. MUI would otherwise apply
          // `theme.typography.button`, and a <button> does not inherit font-family on its own -
          // this is the same trap that made an AccordionSummary measure wider on the shadcn and
          // kumo themes than on their reset-free preflight page.
          fontFamily: "inherit", // blink: .root `font-family: inherit`
          fontWeight: 600, // blink: .root `font-weight: 600`
          // blink: reset.css `body { line-height: 1.5 }`, inherited. Button.module.css sets no
          // line-height at all, so the kit's label takes the document's.
          //
          // Stated explicitly rather than left as `inherit` for two reasons. A consumer of this
          // theme has MUI but not the kit's reset, and `inherit` would hand them whatever their own
          // body line-height happens to be; and MUI's `typography.button` defaults to 1.75, so
          // leaving this out is not neutral - it is 1.75.
          //
          // Found by the font-metrics sweep, not the pixel diff: every button here has a FIXED
          // height and centres its label, so a wrong line-height moves nothing and all 30 button
          // pair-states sat at exactly 0 differing pixels while the label box was 3.75px too tall.
          lineHeight: 1.5,
          whiteSpace: "nowrap", // blink: .root `white-space: nowrap`
          position: "relative", // blink: .root `position: relative`
          transition: "background-color 0.2s, border-color 0.2s, color 0.2s, opacity 0.2s", // blink: .root
          // MUI's `contained` ships an elevation shadow that the kit has nowhere. The obvious fix
          // is `disableElevation: true`, and it is a trap here: that prop injects
          // `&:hover, &:active, &.Mui-focusVisible { box-shadow: none }` at a specificity a root
          // override does not reach - and the kit's FOCUS RING IS A BOX-SHADOW, so every focused
          // button would silently lose its ring while the default state looked perfect. Killing the
          // shadow by hand instead leaves the focus-visible rule free to put one back.
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
          "&:active": { boxShadow: "none" },
          "&.Mui-disabled": {
            opacity: 0.6, // blink: .root:disabled:not(.loading) `opacity: 0.6`
            // MUI greys a disabled button out - its own `action.disabled` on the label and
            // `action.disabledBackground` on the border. The kit does not: `.root:disabled` sets
            // opacity and nothing else, so every variant keeps its own colours and is simply
            // dimmed. Handing them back cannot be done here, because there is no value that means
            // "whatever the variant set" - `inherit` takes the PARENT's colour, which made a
            // disabled ghost button's label #262626 instead of brand indigo. Each variant restates
            // its own skin under `.Mui-disabled` instead; see `skin` in each block below.
          },
          "&.Mui-focusVisible": {
            outline: "2px solid transparent", // blink: .root:focus-visible
            outlineOffset: 2, // blink: .root:focus-visible `outline-offset: 2px`
            // blink: tokens.css --focus-ring, spelled as the kit spells it. `--focus-ring-opacity`
            // is 50% in the light scheme and is inlined; it only varies in dark, which this theme
            // does not cover yet.
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 4px`,
          },
        }),
      },
      variants: [
        // Each variant's three colours are named once as `skin` and spread into both the resting
        // state and `.Mui-disabled`. The repetition is the point: it is what stops MUI's disabled
        // greying from replacing them, and writing the colour twice is cheaper than a reader
        // wondering which of them the disabled state uses. Borders are set long-hand so `skin` can
        // carry `borderColor` on its own.
        {
          props: { variant: "contained" },
          style: ({ theme }) => {
            const skin = {
              background: theme.vars.palette.primary.main, // blink: .primary `background: var(--color-primary)`
              color: theme.vars.palette.primary.contrastText, // blink: .primary `color: var(--color-primary-text)`
              borderColor: theme.vars.palette.primary.main, // blink: .primary `border: 1px solid var(--color-primary)`
            }
            return {
              ...skin,
              borderWidth: 1,
              borderStyle: "solid",
              "&:hover": {
                background: theme.vars.palette.primary.dark, // blink: .primary:hover `var(--color-primary-hover)`
                borderColor: theme.vars.palette.primary.dark, // blink: .primary:hover `border-color`
              },
              "&.Mui-disabled": skin,
            }
          },
        },
        {
          props: { variant: "outlined" },
          style: ({ theme }) => {
            const skin = {
              background: theme.vars.palette.surface, // blink: .secondary `background: var(--color-surface)`
              color: theme.vars.palette.text.primary, // blink: .secondary `color: var(--color-text-default)`
              borderColor: theme.vars.palette.borderStrong, // blink: .secondary `1px solid var(--color-border-strong)`
            }
            return {
              ...skin,
              borderWidth: 1,
              borderStyle: "solid",
              "&:hover": {
                // blink: .secondary:hover `color-mix(in srgb, var(--color-text-default) 4%, transparent)`
                background: `color-mix(in srgb, ${theme.vars.palette.text.primary} 4%, transparent)`,
                borderColor: theme.vars.palette.borderStrong,
              },
              "&.Mui-disabled": skin,
            }
          },
        },
        {
          props: { variant: "text" },
          style: ({ theme }) => {
            const skin = {
              background: "transparent", // blink: .ghost `background: transparent`
              color: theme.vars.palette.primary.main, // blink: .ghost `color: var(--color-primary)`
              // NOT `border: none` - see correction 1 in the block note.
              borderColor: "transparent", // blink: .ghost `border: 1px solid transparent`
            }
            return {
              ...skin,
              borderWidth: 1,
              borderStyle: "solid",
              "&:hover": {
                // blink: .ghost:hover `color-mix(in srgb, var(--color-primary) 15%, transparent)`
                background: `color-mix(in srgb, ${theme.vars.palette.primary.main} 15%, transparent)`,
              },
              "&.Mui-disabled": skin,
            }
          },
        },
        {
          props: { variant: "light", color: "primary" },
          style: ({ theme }) => {
            const skin = {
              // blink: .tonal `background: var(--color-primary-bg)`, which tokens.css defines as
              // `color-mix(in srgb, var(--color-primary) var(--color-tint-opacity), transparent)`
              // with the tint opacity at 10% in light.
              background: `color-mix(in srgb, ${theme.vars.palette.primary.main} 10%, transparent)`,
              color: theme.vars.palette.primary.main, // blink: .tonal `color: var(--color-primary)`
              borderColor: "transparent", // blink: .tonal `border: 1px solid transparent`
            }
            return {
              ...skin,
              borderWidth: 1,
              borderStyle: "solid",
              "&:hover": {
                // blink: .tonal:hover `color-mix(in srgb, var(--color-primary) 15%, transparent)`
                background: `color-mix(in srgb, ${theme.vars.palette.primary.main} 15%, transparent)`,
              },
              "&.Mui-disabled": skin,
            }
          },
        },
        {
          props: { variant: "light", color: "error" },
          style: ({ theme }) => {
            const skin = {
              // blink: .destructive `background: var(--color-error-bg)` (10% tint, as above)
              background: `color-mix(in srgb, ${theme.vars.palette.error.main} 10%, transparent)`,
              // The AA text cut, not the accent: tokens.css reserves the plain accent for icons,
              // borders and fills, and this is a label.
              color: theme.vars.palette.errorText, // blink: .destructive `color: var(--color-error-text)`
              // blink: .destructive `border: 1px solid color-mix(in srgb, var(--color-error) 20%, transparent)`
              borderColor: `color-mix(in srgb, ${theme.vars.palette.error.main} 20%, transparent)`,
            }
            return {
              ...skin,
              borderWidth: 1,
              borderStyle: "solid",
              "&:hover": {
                // blink: .destructive:hover
                background: `color-mix(in srgb, ${theme.vars.palette.error.main} 15%, transparent)`,
                borderColor: `color-mix(in srgb, ${theme.vars.palette.error.main} 30%, transparent)`,
              },
              "&.Mui-focusVisible": {
                // blink: .destructive:focus-visible `box-shadow: var(--focus-ring-destructive)`,
                // which tokens.css fixes at 35% (it has no themed opacity var, unlike --focus-ring).
                boxShadow: `color-mix(in srgb, ${theme.vars.palette.error.main} 35%, transparent) 0px 0px 0px 4px`,
              },
              "&.Mui-disabled": skin,
            }
          },
        },
        {
          // blink: .xs - the kit's fourth size, reached through the custom `xs` declared above.
          props: { size: "xs" },
          style: {
            height: 24, // blink: .xs `height: var(--control-h-xs)`
            minWidth: 24, // blink: .xs `min-width: var(--control-h-xs)`
            padding: "0 8px", // blink: .xs `padding: 0 var(--space-2)`
            gap: 4, // blink: .xs `gap: var(--space-1)`
            fontSize: 13, // blink: .xs `font-size: var(--text-xs)`
            borderRadius: 6, // blink: .xs `border-radius: var(--radius-2)`
          },
        },
        {
          props: { size: "small" },
          style: {
            height: 32, // blink: .sm `height: var(--control-h-sm)`
            minWidth: 32, // blink: .sm `min-width: var(--control-h-sm)`
            padding: "0 12px", // blink: .sm `padding: 0 var(--space-3)`
            gap: 4, // blink: .sm `gap: var(--space-1)`
            fontSize: 14, // blink: .sm `font-size: var(--text-sm)`
            borderRadius: 6, // blink: .sm `border-radius: var(--radius-2)`
          },
        },
        {
          props: { size: "medium" },
          style: {
            height: 36, // blink: .md `height: var(--control-h-md)`
            minWidth: 36, // blink: .md `min-width: var(--control-h-md)`
            padding: "0 12px", // blink: .md `padding: 0 var(--space-3)`
            fontSize: 15, // blink: .md `font-size: var(--text-md)`
            // gap and radius deliberately absent: .md adds neither, so both come from .root.
          },
        },
        {
          props: { size: "large" },
          style: {
            height: 40, // blink: .lg `height: var(--control-h-lg)`
            minWidth: 40, // blink: .lg `min-width: var(--control-h-lg)`
            padding: "0 16px", // blink: .lg `padding: 0 var(--space-4)`
            fontSize: 15, // blink: .lg `font-size: var(--text-md)`
          },
        },
      ],
    },

    // ---- Checkbox / Radio ----
    //
    // Ground truth: reference/primitives/Checkbox/Checkbox.module.css and Radio/Radio.module.css.
    //
    // The kit styles a NATIVE input with `appearance: none`: the control IS the 16x16 box, with no
    // wrapper and no hit padding. MUI wraps a hidden input and a 24x24 SVG in a 34x34 ButtonBase.
    // So the box itself is rebuilt on MUI's root, the SVG is switched off, and the marks are drawn
    // as pseudo-elements - the same shapes the kit's CSS draws.
    //
    // `padding: 0` is load-bearing rather than cosmetic. MUI's 9px of padding is a hit area, and
    // normally a larger hit area than the reference's is fine (the harness knows MUI's invisible
    // boxes are bigger). Not here: the padding is on the ROOT, so it changes the element's own
    // size, the cell around it, and therefore the capture - a 34x34 capture cannot be diffed
    // against a 16x16 one at all. The kit's control genuinely has no hit padding either.
    //
    // `disableRipple` is restated on both. The global `MuiButtonBase` default does not reach
    // Checkbox, Radio or Switch: each resolves its own default and forwards it.
    MuiCheckbox: {
      defaultProps: {
        disableRipple: true,
        // MUI tints the box with `primary.main` via its own colour machinery, which would fight the
        // background this block sets per state. `default` opts out of that and leaves the styling
        // here.
        color: "default",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          padding: 0, // see the note above - this one is not optional
          width: 16, // blink: .root `width: 16px`
          height: 16, // blink: .root `height: 16px`
          flex: "none", // blink: .root `flex: none`
          boxSizing: "border-box",
          background: theme.vars.palette.surface, // blink: .root `background: var(--color-surface)`
          border: `1px solid ${theme.vars.palette.borderStrong}`, // blink: .root `border: 1px solid var(--color-border-strong)`
          borderRadius: 4, // blink: .root `border-radius: var(--radius-1)`
          // blink: .root `transition: background-color 120ms var(--ease-out), border-color ..., box-shadow ...`
          transition:
            "background-color 120ms cubic-bezier(0.165, 0.84, 0.44, 1), border-color 120ms cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 120ms cubic-bezier(0.165, 0.84, 0.44, 1)",
          // The kit has no icon. MUI's SVG would otherwise paint a Material tick inside the box.
          "& svg": { display: "none" },
          "&:hover": {
            // blink: .root:hover:not(:disabled) `border-color: var(--color-border-input)`. MUI also
            // paints an action-hover background on the root; the kit changes only the border.
            background: theme.vars.palette.surface,
            borderColor: theme.vars.palette.borderInput,
          },
          "&.Mui-focusVisible": {
            // blink: .root:focus-visible - `outline: none` plus the ring as a box-shadow
            outline: "none",
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 4px`,
          },
          // blink: .root:checked, .root:indeterminate
          "&.Mui-checked, &.MuiCheckbox-indeterminate": {
            background: theme.vars.palette.primary.main,
            borderColor: theme.vars.palette.primary.main,
          },
          // blink: .root:checked:hover:not(:disabled), .root:indeterminate:hover:not(:disabled)
          "&.Mui-checked:hover, &.MuiCheckbox-indeterminate:hover": {
            background: theme.vars.palette.primary.dark,
            borderColor: theme.vars.palette.primary.dark,
          },
          // blink: .root:checked:not(:indeterminate)::after - a 4x8 box showing only its right and
          // bottom borders, rotated into a tick.
          "&.Mui-checked:not(.MuiCheckbox-indeterminate)::after": {
            content: '""',
            position: "absolute",
            boxSizing: "border-box",
            width: 4,
            height: 8,
            border: `solid ${theme.vars.palette.primary.contrastText}`,
            borderWidth: "0 2px 2px 0",
            transform: "translateY(-1px) rotate(45deg)",
          },
          // blink: .root:indeterminate::after
          "&.MuiCheckbox-indeterminate::after": {
            content: '""',
            position: "absolute",
            width: 8,
            height: 2,
            background: theme.vars.palette.primary.contrastText,
            borderRadius: 1,
          },
          "&.Mui-disabled": {
            opacity: 0.5, // blink: .root:disabled `opacity: 0.5`
          },
        }),
      },
    },
    MuiRadio: {
      defaultProps: {
        disableRipple: true,
        color: "default",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          padding: 0,
          width: 16, // blink: .root `width: 16px`
          height: 16, // blink: .root `height: 16px`
          flex: "none", // blink: .root `flex: none`
          boxSizing: "border-box",
          background: theme.vars.palette.surface, // blink: .root `background: var(--color-surface)`
          border: `1px solid ${theme.vars.palette.borderStrong}`, // blink: .root `border: 1px solid ...`
          borderRadius: "50%", // blink: .root `border-radius: 50%`
          transition:
            "background-color 120ms cubic-bezier(0.165, 0.84, 0.44, 1), border-color 120ms cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 120ms cubic-bezier(0.165, 0.84, 0.44, 1)",
          "& svg": { display: "none" },
          // `disableRipple` above is not enough for Radio, and this is the surprise: the same
          // default DOES suppress the ripple on Checkbox (whose children are just the input and an
          // svg), but Radio still mounts a `MuiTouchRipple-root`, and on focus it paints a disc
          // over the whole 14x14 interior. The ripple root itself is transparent, so a computed
          // style read on the root shows white and looks perfectly correct - it took sampling the
          // captured PNGs to see it: the kit's interior is (255,255,255) and MUI's (222,222,224),
          // 555 pixels of it, which the diff image renders as a solid disc.
          "& .MuiTouchRipple-root": { display: "none" },
          "&:hover": {
            background: theme.vars.palette.surface,
            borderColor: theme.vars.palette.borderInput, // blink: .root:hover:not(:disabled)
          },
          "&.Mui-focusVisible": {
            outline: "none",
            // MUI paints its own action-focus tint on the root; the kit changes nothing but the
            // ring, so the surface fill is restated to keep the interior white.
            background: theme.vars.palette.surface,
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 4px`, // blink: .root:focus-visible
          },
          // blink: .root:checked - there is NO dot element. The border simply thickens to 5px in the
          // brand colour, leaving a 6px hole of the surface fill in the middle. Reproducing it as a
          // border (rather than a ::after dot) is what keeps the ring's inner edge identical.
          "&.Mui-checked": {
            borderColor: theme.vars.palette.primary.main,
            borderWidth: 5,
          },
          "&.Mui-checked:hover": {
            borderColor: theme.vars.palette.primary.dark, // blink: .root:checked:hover:not(:disabled)
          },
          "&.Mui-disabled": {
            opacity: 0.5, // blink: .root:disabled `opacity: 0.5`
          },
        }),
      },
    },

    // ---- Switch ----
    //
    // Ground truth: reference/primitives/Switch/Switch.module.css.
    //
    // The kit paints two shapes on one native input: the 36x20 track is the element's own
    // background, and the 18x18 knob is a ::after that translates 16px when checked. MUI has four
    // elements for the same picture - root > switchBase > thumb, with track as a sibling - so each
    // kit declaration is aimed at whichever MUI slot paints it, and all of MUI's own padding goes.
    MuiSwitch: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: {
          width: 36, // blink: .root `width: 36px`
          height: 20, // blink: .root `height: 20px`
          padding: 0, // MUI reserves 12px around the track for the ripple; the kit has none
          flex: "none", // blink: .root `flex: none`
          overflow: "visible", // the focus ring is a box-shadow on the track and must not clip
          // blink: .root:disabled `opacity: 0.5`.
          //
          // On the ROOT, via :has, because the kit's rule dims the ENTIRE control - track and knob
          // together - while MUI puts `.Mui-disabled` on the inner switchBase and has no disabled
          // class on the root at all. Dimming the slots individually is not the same picture: the
          // knob overlaps the track, so two half-transparent shapes composite differently from one
          // half-transparent control (measured 2571 differing pixels).
          "&:has(.Mui-disabled)": { opacity: 0.5 },
        },
        switchBase: ({ theme }) => ({
          // blink: .root::after `top: 1px; left: 1px` - the knob's inset is MUI's switchBase
          // padding, since the thumb is centred inside it.
          padding: 1,
          color: "transparent", // MUI tints the thumb through `color`; the kit's knob is fixed #fff
          "&:hover": {
            // MUI paints a circular action-hover behind the thumb. The kit changes the TRACK on
            // hover and nothing else.
            backgroundColor: "transparent",
          },
          "& .MuiTouchRipple-root": { display: "none" }, // same trap as Radio, see that block
          "&.Mui-checked": {
            transform: "translateX(16px)", // blink: .root:checked::after `translateX(16px)`
            color: "transparent",
            "& + .MuiSwitch-track": {
              background: theme.vars.palette.primary.main, // blink: .root:checked `background: var(--color-primary)`
              opacity: 1,
            },
            "&:hover": {
              backgroundColor: "transparent",
              "& + .MuiSwitch-track": {
                background: theme.vars.palette.primary.dark, // blink: .root:checked:hover:not(:disabled)
              },
            },
          },
          // blink: .root:focus-visible - `outline: none` plus the ring. It goes on the TRACK
          // because that is the 36x20 rounded box the kit draws the ring around; switchBase is only
          // the 20x20 knob carrier.
          "&.Mui-focusVisible + .MuiSwitch-track": {
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 4px`,
          },
          "&.Mui-disabled": {
            // blink: .root:disabled `opacity: 0.5`, applied to the whole control. MUI would
            // otherwise grey the thumb and drop the track to its own disabled opacity.
            "& + .MuiSwitch-track": { opacity: 1 },
            "& .MuiSwitch-thumb": { opacity: 1 },
          },
        }),
        thumb: {
          width: 18, // blink: .root::after `width: 18px`
          height: 18, // blink: .root::after `height: 18px`
          background: "#fff", // blink: .root::after - a literal in the kit, not a token, on purpose
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.18)", // blink: .root::after `box-shadow`
        },
        track: ({ theme }) => ({
          borderRadius: 999, // blink: .root `border-radius: 999px`
          background: theme.vars.palette.textSubtle, // blink: .root `background: var(--color-text-subtle)`
          // MUI ships the track at 38% so its grey reads as "off"; the kit states the colour
          // outright, so the opacity has to go or the token is diluted.
          opacity: 1,
          transition:
            "background-color 150ms cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 120ms cubic-bezier(0.165, 0.84, 0.44, 1)", // blink: .root
        }),
      },
      variants: [
        {
          // blink: .root:hover:not(:disabled):not(:checked) `background: var(--color-text-muted)`.
          // A variant rather than a `&:hover` inside `track`, because the hover happens on the ROOT
          // while the colour lands on the track, and the kit's rule excludes the checked case.
          props: {},
          style: ({ theme }) => ({
            "&:hover .MuiSwitch-switchBase:not(.Mui-checked):not(.Mui-disabled) + .MuiSwitch-track":
              { background: theme.vars.palette.textMuted },
          }),
        },
      ],
    },

    // ---- Input ----
    //
    // Ground truth: reference/primitives/Input/Input.module.css.
    //
    // The kit's Input is a bordered box - `1px solid var(--color-border-strong)` on a surface fill
    // at `--radius-2` - wrapping a borderless <input>. That is MUI's OUTLINED input. `mui-themed`
    // also ships a `filled` block; it is compatibility with the app's older `common/TextField`
    // wrapper, has no twin in the kit, and is deliberately not ported.
    //
    // The two are built differently: the kit paints the border on the root <div>, MUI on an
    // absolutely positioned <fieldset> (the notched outline) inset 5px above the root. Everything
    // border-shaped therefore has to be aimed at `.MuiOutlinedInput-notchedOutline`, not the root,
    // and the root's own border stays off.
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.vars.palette.surface, // blink: .root `background: var(--color-surface)`
          color: theme.vars.palette.text.primary, // blink: .root `color: var(--color-text-default)`
          borderRadius: 6, // blink: .root `border-radius: var(--radius-2)`
          fontSize: 15, // blink: .root `font-size: var(--text-md)`
          lineHeight: 1.4, // blink: .root `line-height: 1.4`
          gap: 8, // blink: .root `gap: var(--space-2)`
          // blink: .root `padding: 0 var(--space-3)` (12px) PLUS the 1px the kit's own border
          // occupies. This is the notched-outline construction leaking into layout: the kit puts a
          // real `1px solid` border on the root, so it takes part in the box and the text starts
          // 13px from the outer edge, while MUI paints its border on an ABSOLUTELY POSITIONED
          // <fieldset> that occupies no space at all - leaving the text at 12px and the whole
          // control 2px narrower (measured 166.5px against the kit's 168.5px).
          //
          // Adding the pixel to the padding rather than giving the root a transparent border keeps
          // the fieldset where it belongs: it is inset `left: 0; right: 0` against the root's
          // PADDING box, so a real border would pull the painted outline 1px inward on each side.
          padding: "0 13px",
          // blink: .md `height: var(--control-h-md)`, the kit's default size.
          //
          // Here rather than in a `size: "medium"` variant, and the difference is not cosmetic:
          // unlike Button, MUI's InputBase does not default its `size` prop to "medium" - it leaves
          // it undefined and only emits a class for `small`. A `props: { size: "medium" }` variant
          // therefore matches only when a caller writes `size="medium"` by hand, so every plain
          // <OutlinedInput> got no height at all (measured: 19px against the kit's 36px). The
          // default belongs on the root; the other two sizes override it below.
          height: 36,
          // blink: .root `transition: border-color 120ms var(--ease-out), box-shadow 120ms ...`
          transition: "border-color 120ms cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 120ms cubic-bezier(0.165, 0.84, 0.44, 1)",
          cursor: "text", // blink: .root `cursor: text`
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.vars.palette.borderStrong, // blink: .root `border: 1px solid var(--color-border-strong)`
            borderWidth: 1,
            transition: "border-color 120ms cubic-bezier(0.165, 0.84, 0.44, 1)",
          },
          // blink: .root:hover:not(.disabled):not(.error) `border-color: var(--color-border-input)`.
          // The kit's guards are transcribed as MUI's state classes; note it hovers on the ROOT but
          // the colour lands on the outline.
          "&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.vars.palette.borderInput,
          },
          // blink: .root:has(.input:focus):not(.error). MUI raises the outline to 2px on focus and
          // the kit does not, so the width is restated.
          "&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.vars.palette.primary.main,
            borderWidth: 1,
          },
          "&.Mui-focused:not(.Mui-error)": {
            // blink: tokens.css --focus-ring
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 4px`,
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.vars.palette.error.main, // blink: .root.error `border-color: var(--color-error)`
            borderWidth: 1,
          },
          "&.Mui-error.Mui-focused": {
            // blink: .root.error:has(.input:focus) `box-shadow: var(--focus-ring-destructive)`
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.error.main} 35%, transparent) 0px 0px 0px 4px`,
          },
          "&.Mui-disabled": {
            background: theme.vars.palette.surfaceMuted, // blink: .root.disabled `background: var(--color-surface-muted)`
            cursor: "not-allowed", // blink: .root.disabled `cursor: not-allowed`
            // MUI fades a disabled outline to its own `action.disabled`; the kit leaves the border
            // exactly as it was and only changes the fill and the text.
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.vars.palette.borderStrong,
            },
          },
        }),
        input: ({ theme }) => ({
          // blink: .input - the inner control carries no box of its own; the root owns the padding.
          padding: 0,
          height: "100%",
          font: "inherit",
          color: "inherit",
          "&::placeholder": {
            color: theme.vars.palette.textMuted, // blink: .input::placeholder
            // Browsers ship ::placeholder at less than full opacity and MUI keeps that. The kit
            // states a colour outright, so the opacity has to go or the token is diluted.
            opacity: 1,
          },
          "&:disabled": {
            color: theme.vars.palette.textSubtle, // blink: .input:disabled
            WebkitTextFillColor: theme.vars.palette.textSubtle, // blink: .input:disabled
            cursor: "not-allowed",
          },
        }),
      },
      variants: [
        // Only the two NON-default sizes. `medium` is the root's own height above, because MUI
        // leaves `size` undefined rather than defaulting it to "medium" (see the note there).
        { props: { size: "small" }, style: { height: 32 } }, // blink: .sm `var(--control-h-sm)`
        { props: { size: "large" }, style: { height: 40 } }, // blink: .lg `var(--control-h-lg)`
      ],
    },

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
