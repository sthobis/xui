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
import {
  ChevronDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react"
// createElement rather than JSX: this is a plain .ts module, and JSX is only valid in .tsx. React
// is not a new dependency - it is already xui's peer, required by every MUI component.
import { createElement } from "react"

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

// The kit's Badge has two emphases against MUI's filled/outlined, and three sizes against two.
// `solid` is the saturated fill (MUI's `filled` already carries the soft tint); `xs` is the 18px
// pill. MUI's `outlined` is left unstyled on purpose - the kit ships no bordered pill.
declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    solid: true
  }
  interface ChipPropsSizeOverrides {
    xs: true
  }
}

// The kit's ToggleGroup has the same four-step ladder as its Button, and MUI has three. `xs` is the
// 24px strip. Declared on both halves because a ToggleButtonGroup forwards `size` to its children.
declare module "@mui/material/ToggleButtonGroup" {
  interface ToggleButtonGroupPropsSizeOverrides {
    xs: true
  }
}
declare module "@mui/material/ToggleButton" {
  interface ToggleButtonPropsSizeOverrides {
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

/**
 * The Select's chevron, as a stable component identity.
 *
 * MUI hands `IconComponent` a className and nothing else, so the kit's `size={16}` has to be bound
 * here. Declared once at module scope rather than inline in `defaultProps`: an inline arrow is a
 * new component type on every render, which remounts the icon each time.
 */
const SelectChevron = (props: { className?: string }) =>
  createElement(ChevronDownIcon, { size: 16, ...props }) // blink: Select/index.tsx

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

    // ---- Alert ----
    //
    // Ground truth: reference/primitives/Alert/Alert.module.css.
    //
    // The accent bar is an INSET BOX-SHADOW, not a border, and the kit's own comment says why: a
    // border would shift the box model, so the padding would stop being symmetric and the icon's
    // left gutter would no longer match the icon-to-text gap. Transcribed as the shadow it is.
    //
    // Each variant sets three things - a 10% background tint, `--alert-bar` (the saturated accent,
    // used only for that shadow) and `--alert-accent` (the AA text cut, used for the icon, title
    // and body). `info` is the exception: it has no separate text cut, so its accent IS the plain
    // colour. That is the kit's table, not a simplification.
    //
    // The stacked/inline distinction is the kit's `hasTitle` flag; `:has(.MuiAlertTitle-root)` asks
    // MUI the same question without needing a prop.
    //
    // SCOPE: `md` only. The kit's `sm` density has no MUI counterpart - Alert has no size prop -
    // and adding one would mean augmenting AlertProps and forwarding an unknown attribute.
    MuiAlert: {
      defaultProps: {
        // The kit always takes its icon from the caller and ships no default mapping. MUI does ship
        // one, in Material icons, which would be the wrong icon SET entirely - so each severity is
        // mapped to the lucide icon the kit's own showcase (AlertShowcase.tsx) pairs with it.
        iconMapping: {
          error: createElement(CircleAlertIcon),
          warning: createElement(TriangleAlertIcon),
          success: createElement(CircleCheckIcon),
          info: createElement(InfoIcon),
        },
      },
      styleOverrides: {
        root: {
          display: "flex", // blink: .root `display: flex`
          alignItems: "flex-start", // blink: .stacked `align-items: flex-start`
          gap: 12, // blink: .md `gap: var(--space-3)`
          padding: "12px 16px", // blink: .md `padding: var(--space-3) var(--space-4)`
          borderRadius: 8, // blink: .md `border-radius: var(--radius-3)`
          fontSize: 15, // blink: .md `font-size: var(--text-md)`
          lineHeight: 1.5, // blink: .md `line-height: 1.5`
          // blink: .inline `align-items: center` - the kit picks this layout when there is no
          // title, which is exactly what this asks.
          "&:not(:has(.MuiAlertTitle-root))": { alignItems: "center" },
          // blink: .stacked.md .icon `margin-top: 2px`. With the box top-aligned, an 18px icon sits
          // a little above the title's cap height, so the kit nudges it onto the first text line -
          // but only in the stacked layout, since the inline one centres the icon instead. Stated
          // here rather than in the `icon` slot because the condition is about the ROOT.
          "&:has(.MuiAlertTitle-root) .MuiAlert-icon": { marginTop: 2 },
        },
        icon: {
          // blink: .icon - MUI gives the icon its own padding, right margin and 0.9 opacity; the
          // kit gives it none of those. The gap on the root is what separates it from the text.
          padding: 0,
          marginRight: 0,
          opacity: 1,
          flex: "none", // blink: .icon `flex: none`
          // blink: .md .icon svg - the kit sizes the icon itself, overriding whatever size the
          // caller's lucide icon was created with.
          "& svg": { width: 18, height: 18, display: "block" },
        },
        message: {
          // blink: .content `flex: 1; min-width: 0` - and no padding, which MUI adds.
          padding: 0,
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 4, // blink: .content `gap: var(--space-1)`
        },
        action: {
          // blink: .actions
          padding: 0,
          marginRight: 0,
          marginLeft: 8,
          alignItems: "center",
          gap: 8,
        },
      },
      // Each variant sets the same three things from its own pair of tokens: the tint, the bar, and
      // the ink. Written out four times rather than generated, both because it keeps every value
      // greppable to its token and because `info` genuinely differs (see its note).
      variants: [
        {
          props: { severity: "error" },
          style: ({ theme }) => ({
            // blink: .error `background: var(--color-error-bg)` - a 10% tint in the light scheme
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.error.main} 10%, transparent)`,
            // blink: .root `box-shadow: inset 3px 0 0 0 var(--alert-bar)`, bar = --color-error
            boxShadow: `inset 3px 0 0 0 ${theme.vars.palette.error.main}`,
            color: theme.vars.palette.errorText, // blink: --alert-accent = --color-error-text
            "& .MuiAlert-icon": { color: theme.vars.palette.errorText }, // blink: .icon
          }),
        },
        {
          props: { severity: "warning" },
          style: ({ theme }) => ({
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.warning.main} 10%, transparent)`,
            boxShadow: `inset 3px 0 0 0 ${theme.vars.palette.warning.main}`,
            color: theme.vars.palette.warningText,
            "& .MuiAlert-icon": { color: theme.vars.palette.warningText },
          }),
        },
        {
          props: { severity: "success" },
          style: ({ theme }) => ({
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.success.main} 10%, transparent)`,
            boxShadow: `inset 3px 0 0 0 ${theme.vars.palette.success.main}`,
            color: theme.vars.palette.successText,
            "& .MuiAlert-icon": { color: theme.vars.palette.successText },
          }),
        },
        {
          props: { severity: "info" },
          style: ({ theme }) => ({
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.info.main} 10%, transparent)`,
            boxShadow: `inset 3px 0 0 0 ${theme.vars.palette.info.main}`,
            // blink: .info sets `--alert-accent: var(--color-info)` - the ONE variant whose accent
            // is the plain colour rather than a separate AA text cut, because tokens.css defines no
            // `--color-info-text`. Not an oversight in the transcription; it is the kit's table.
            color: theme.vars.palette.info.main,
            "& .MuiAlert-icon": { color: theme.vars.palette.info.main },
          }),
        },
      ],
    },
    MuiAlertTitle: {
      styleOverrides: {
        root: {
          // blink: .title. MUI's AlertTitle ships its own margins and a bumped font size; the kit's
          // title is the same size as the body, just heavier, and the gap comes from .content.
          margin: 0,
          fontSize: "inherit",
          fontWeight: 600, // blink: .title `font-weight: 600`
          lineHeight: 1.3, // blink: .title `line-height: 1.3`
          color: "inherit", // blink: .title `color: var(--alert-accent)`, inherited from the root
        },
      },
    },

    // ---- Avatar ----
    //
    // Ground truth: reference/primitives/Avatar/Avatar.module.css.
    //
    // SCOPE: the `default` fill only, at the kit's default 32px. The kit has seven fills and four
    // sizes; MUI's Avatar has no colour axis (its `variant` already means the shape) and no size
    // prop, so the rest have nothing for a theme to attach to and are left to `sx` at the call
    // site. Shape maps exactly: the kit's `square` is MUI's `rounded`, its `circle` MUI's
    // `circular` - only the DEFAULTS differ, and that is the caller's choice, not the theme's.
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          width: 32, // blink: Avatar/index.tsx SIZE_PX.md
          height: 32, // blink: Avatar/index.tsx SIZE_PX.md
          flex: "none", // blink: .root `flex: none`
          overflow: "hidden", // blink: .root `overflow: hidden`
          background: theme.vars.palette.surfaceMuted, // blink: .default `background: var(--color-surface-muted)`
          color: theme.vars.palette.textMuted, // blink: .default `color: var(--color-text-muted)`
          // MUI sizes an Avatar's initials off its own scale; the kit inherits the page's.
          fontSize: 15, // blink: inherited --text-md
          fontWeight: 400,
          // blink: reset.css `body { line-height: 1.5 }`, inherited - Avatar.module.css sets no
          // line-height, so the initials take the document's. MUI's Avatar pins `line-height: 1`,
          // which is not neutral: it made the initials' line box 15px against the kit's 22.5px.
          // Stated rather than left to `inherit` for the same reason as the Button's, so a consumer
          // without the kit's reset still gets the kit's metrics.
          lineHeight: 1.5,
        }),
        rounded: { borderRadius: 6 }, // blink: .square `border-radius: var(--radius-2)`
        circular: { borderRadius: "50%" }, // blink: .circle `border-radius: 50%`
        img: { objectFit: "contain" }, // blink: .image - note `.circle .image` switches to cover
      },
      variants: [
        {
          // blink: `.circle .image { object-fit: cover }` - a circle crops, a square letterboxes.
          props: { variant: "circular" },
          style: { "& .MuiAvatar-img": { objectFit: "cover" } },
        },
      ],
    },

    // ---- Badge (MUI Chip) ----
    //
    // Ground truth: reference/primitives/Badge/Badge.module.css.
    //
    // A pill on two independent axes - six colours by two emphases - plus three sizes. The emphasis
    // axis lands on MUI's `variant` (`filled` carries the kit's soft tint, a custom `solid` the
    // saturated fill) and the colour axis on `color`, which is a clean one-to-one.
    //
    // The two emphases are NOT the same shape of rule. `soft` pairs a 10% tint with the AA TEXT cut
    // of the same colour, while `solid` pairs the saturated accent with its `on-` colour. Only info
    // breaks the pattern in soft, for the same reason it does in Alert: there is no
    // `--color-info-text`, so its ink is the plain colour.
    MuiChip: {
      styleOverrides: {
        root: {
          gap: 4, // blink: .root `gap: var(--space-1)`
          borderRadius: 999, // blink: .root `border-radius: 999px`
          fontFamily: "inherit", // blink: .root `font-family: inherit`
          fontWeight: 600, // blink: .root `font-weight: 600`
          lineHeight: 1, // blink: .root `line-height: 1`
          whiteSpace: "nowrap", // blink: .root `white-space: nowrap`
          border: 0, // blink: .root `border: 0`
          fontVariantNumeric: "tabular-nums", // blink: .root `font-variant-numeric: tabular-nums`
          // blink: .interactive - only a Badge with an onClick becomes a button and takes these.
          "&.MuiChip-clickable:hover": { filter: "brightness(0.96)" },
          "&.Mui-focusVisible": {
            outline: "none",
          },
        },
        label: {
          // blink: .label - the kit's label carries no padding of its own; the ROOT owns it, per
          // size. MUI splits it the other way (12px on the label, none on the root), which would
          // double every horizontal inset once the root's padding is set below.
          paddingLeft: 0,
          paddingRight: 0,
          // blink: .label `display: inline-flex; align-items: center; min-width: 0`
          display: "inline-flex",
          alignItems: "center",
          minWidth: 0,
          // blink: .label sets no `overflow`, and MUI's ships `overflow: hidden` with
          // `text-overflow: ellipsis`.
          //
          // That clip is not cosmetic here: the root's `line-height: 1` makes the label box exactly
          // as tall as the font size, so every DESCENDER hangs outside it and MUI cuts them off.
          // It showed up as 16 pixels at Δ131 in two 8-pixel runs on a single row - the bottom row
          // of the two `g`s in "Staging" - with the reference painting ink where MUI painted
          // background. Nothing in the computed styles disagreed: both labels measured
          // 42.094x13.000 at the same offset, with identical text rects, because a clipped glyph
          // still reports its full box.
          //
          // Dropping the ellipsis with it is correct rather than a trade-off - the kit truncates
          // nothing, and a Badge that silently ellipsised where the design system does not would be
          // a behaviour difference the pixel harness could never see.
          overflow: "visible",
          textOverflow: "clip",
        },
      },
      variants: [
        // ---- sizes: height, min-width and padding all live on the root ----
        {
          props: { size: "xs" },
          style: { height: 18, minWidth: 18, padding: "0 6px", fontSize: 13 }, // blink: .xs
        },
        {
          props: { size: "small" },
          style: { height: 22, minWidth: 22, padding: "0 8px", fontSize: 13 }, // blink: .sm
        },
        {
          // blink: .md - note it sets no min-width, unlike the two smaller steps.
          props: { size: "medium" },
          style: { height: 28, padding: "0 12px", fontSize: 14 },
        },

        // ---- soft: a 10% tint of the colour, inked with its AA text cut ----
        {
          props: { variant: "filled", color: "default" },
          style: ({ theme }) => ({
            background: theme.vars.palette.surfaceMuted, // blink: .soft.default
            color: theme.vars.palette.textMuted,
          }),
        },
        {
          props: { variant: "filled", color: "primary" },
          style: ({ theme }) => ({
            // blink: .soft.primary `background: var(--color-primary-bg)`
            background: `color-mix(in srgb, ${theme.vars.palette.primary.main} 10%, transparent)`,
            color: theme.vars.palette.primary.main,
          }),
        },
        {
          props: { variant: "filled", color: "error" },
          style: ({ theme }) => ({
            background: `color-mix(in srgb, ${theme.vars.palette.error.main} 10%, transparent)`,
            color: theme.vars.palette.errorText, // blink: .soft.error
          }),
        },
        {
          props: { variant: "filled", color: "warning" },
          style: ({ theme }) => ({
            background: `color-mix(in srgb, ${theme.vars.palette.warning.main} 10%, transparent)`,
            color: theme.vars.palette.warningText, // blink: .soft.warning
          }),
        },
        {
          props: { variant: "filled", color: "success" },
          style: ({ theme }) => ({
            background: `color-mix(in srgb, ${theme.vars.palette.success.main} 10%, transparent)`,
            color: theme.vars.palette.successText, // blink: .soft.success
          }),
        },
        {
          props: { variant: "filled", color: "info" },
          style: ({ theme }) => ({
            background: `color-mix(in srgb, ${theme.vars.palette.info.main} 10%, transparent)`,
            // blink: .soft.info - the plain colour, there being no --color-info-text
            color: theme.vars.palette.info.main,
          }),
        },

        // ---- solid: the saturated accent, inked with its `on-` colour ----
        {
          props: { variant: "solid", color: "default" },
          style: ({ theme }) => ({
            // blink: .solid.default - the one solid pill whose ink is the DEFAULT text colour
            // rather than an `on-` colour, because there is no `--color-on-subtle`.
            background: theme.vars.palette.textSubtle,
            color: theme.vars.palette.text.primary,
          }),
        },
        {
          props: { variant: "solid", color: "primary" },
          style: ({ theme }) => ({
            background: theme.vars.palette.primary.main, // blink: .solid.primary
            color: theme.vars.palette.primary.contrastText,
          }),
        },
        {
          props: { variant: "solid", color: "error" },
          style: ({ theme }) => ({
            background: theme.vars.palette.error.main, // blink: .solid.error
            color: theme.vars.palette.error.contrastText,
          }),
        },
        {
          props: { variant: "solid", color: "warning" },
          style: ({ theme }) => ({
            background: theme.vars.palette.warning.main, // blink: .solid.warning
            color: theme.vars.palette.warning.contrastText,
          }),
        },
        {
          props: { variant: "solid", color: "success" },
          style: ({ theme }) => ({
            background: theme.vars.palette.success.main, // blink: .solid.success
            color: theme.vars.palette.success.contrastText,
          }),
        },
        {
          props: { variant: "solid", color: "info" },
          style: ({ theme }) => ({
            background: theme.vars.palette.info.main, // blink: .solid.info
            color: theme.vars.palette.info.contrastText,
          }),
        },
      ],
    },

    // ---- Card ----
    //
    // Ground truth: reference/primitives/Card/Card.module.css.
    //
    // A flat surface: no shadow, no border, just `--color-surface` at `--radius-3`. MUI's Paper
    // ships an elevation shadow, so `elevation: 0` is a default rather than a style override - it
    // is what a caller would otherwise have to pass on every Card.
    //
    // The three regions map onto CardHeader / CardContent / CardActions. Two of the kit's rules are
    // about the SEAM between them rather than about any one region, and both are transcribed as
    // sibling selectors so they keep firing only in the combination the kit intends.
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          display: "flex", // blink: .root `display: flex`
          flexDirection: "column", // blink: .root `flex-direction: column`
          background: theme.vars.palette.surface, // blink: .root `background: var(--color-surface)`
          borderRadius: 8, // blink: .root `border-radius: var(--radius-3)`
          backgroundImage: "none", // MUI's Paper paints an elevation overlay gradient; the kit has none
        }),
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          display: "flex", // blink: .header
          justifyContent: "space-between", // blink: .header `justify-content: space-between`
          alignItems: "flex-start", // blink: .header `align-items: flex-start`
          gap: 12, // blink: .header `gap: var(--space-3)`
          padding: "16px 16px 0", // blink: .header `padding: var(--space-4) var(--space-4) 0`
        },
        // blink: .titleGroup `gap: var(--space-1)` - MUI puts no gap between title and subheader,
        // relying on the subheader's own margin instead.
        content: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
        avatar: {
          // blink: .icon - MUI reserves a 16px right margin for the avatar slot; the kit spaces it
          // with `.main`'s 8px gap instead.
          marginRight: 8,
          // blink: .icon `height: calc(var(--text-lg) * 1.2)` - the icon is aligned to the title's
          // first LINE BOX rather than centred on the whole header.
          height: 21.6,
          alignItems: "center",
        },
        title: ({ theme }) => ({
          margin: 0, // blink: .title `margin: 0`
          fontWeight: 600, // blink: .title `font-weight: 600`
          fontSize: 18, // blink: .title `font-size: var(--text-lg)`
          lineHeight: 1.2, // blink: .title `line-height: 1.2`
          color: theme.vars.palette.text.primary, // blink: .title `color: var(--color-text-default)`
        }),
        subheader: ({ theme }) => ({
          margin: 0, // blink: .description `margin: 0`
          fontSize: 15, // blink: .description `font-size: var(--text-md)`
          lineHeight: 1.4, // blink: .description `line-height: 1.4`
          color: theme.vars.palette.textMuted, // blink: .description `color: var(--color-text-muted)`
        }),
        action: {
          // blink: .actions - MUI offsets the action slot with negative margins to pull it into the
          // header's padding; the kit just lets it sit at the end of the flex row.
          margin: 0,
          alignSelf: "auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          display: "flex", // blink: .body `display: flex`
          flexDirection: "column", // blink: .body `flex-direction: column`
          padding: 16, // blink: .body `padding: var(--space-4)`
          // blink: `.header + .body { padding-top: var(--space-3) }`. Expressed as the same sibling
          // relationship rather than as a flat value, so a Card WITHOUT a header keeps 16px all
          // round - which is the whole point of the kit having two rules here instead of one.
          ".MuiCardHeader-root + &": { paddingTop: 12 },
          // MUI adds 24px of bottom padding to the last CardContent, which would make every card
          // bottom-heavy against the kit's symmetric 16.
          "&:last-child": { paddingBottom: 16 },
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          // blink: .footer - the only region with a rule above it, and note the token is
          // `--color-border` (the light one), not `--color-border-strong`.
          borderTop: `1px solid ${theme.vars.palette.border}`,
          padding: 16, // blink: .footer `padding: var(--space-4)`
          // MUI spaces CardActions children by 8px via a `:not(:first-of-type)` margin rule; the
          // kit's footer is a plain block with no such treatment.
          "& > :not(style) ~ :not(style)": { marginLeft: 0 },
        }),
      },
    },

    // ---- Divider ----
    //
    // Ground truth: reference/primitives/Divider/Divider.module.css.
    //
    // The plain rule is a 1px background, NOT a border - which matters, because MUI draws its
    // Divider as a `border-bottom-width` on an <hr> with `border: 0` elsewhere. Either paints one
    // line; the theme keeps MUI's construction and colours it, since forcing a background on an
    // element MUI gives a border would paint two.
    //
    // SCOPE: the kit's `subtle` flag has no MUI counterpart and is left uncovered - see the note in
    // the gallery section.
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.vars.palette.borderStrong, // blink: .horizontal `background: var(--color-border-strong)`
        }),
        // blink: .withLabel - the labelled form is a flex row whose two rules are ::before/::after.
        // MUI builds it the same way, so only the type and colour need stating.
        withChildren: ({ theme }) => ({
          gap: 12, // blink: .withLabel `gap: var(--space-3)`
          color: theme.vars.palette.textMuted, // blink: .withLabel `color: var(--color-text-muted)`
          fontSize: 13, // blink: .withLabel `font-size: var(--text-xs)`
          textTransform: "uppercase", // blink: .withLabel `text-transform: uppercase`
          letterSpacing: "0.06em", // blink: .withLabel `letter-spacing: 0.06em`
          "&::before, &::after": {
            // blink: .withLabel::before/::after `height: 1px; background: var(--color-border-strong)`
            borderTop: `1px solid ${theme.vars.palette.borderStrong}`,
          },
        }),
        // MUI puts the label's horizontal padding on the text wrapper; the kit uses the flex gap,
        // so the padding is removed and the gap above does the spacing.
        wrapper: { padding: 0 },
      },
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
          // ...but a MULTILINE input is the kit's TEXTAREA, whose height is content-driven. Both
          // the fixed height above and the horizontal-only padding have to be scoped away from it,
          // and getting that wrong is what sank the first attempt at pairing the Textarea: the
          // height crops the box and the missing vertical padding puts the first line against the
          // border.
          //
          // blink: Textarea.module.css `.root` + `.md` (`padding: var(--space-2) var(--space-3)`),
          // carrying the same extra pixel the single-line padding does - here on all four sides,
          // because a textarea's box is built from its padding rather than pinned to a height.
          "&.MuiInputBase-multiline": {
            height: "auto",
            padding: "9px 13px",
            lineHeight: 1.5, // blink: Textarea .root `line-height: 1.5` - the Input's is 1.4
            // The kit's Textarea root states neither of these, so both take their initial value.
            // MUI's InputBase root centres its child and puts an 8px gap between adornments, which
            // is right for the single-line Input (whose own `.root` says exactly that) and wrong
            // here - a centred flex item keeps its intrinsic height instead of filling the box.
            alignItems: "normal",
            gap: "normal",
          },
          // blink: .root `transition: border-color 120ms var(--ease-out), box-shadow 120ms ...`
          transition: "border-color 120ms cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 120ms cubic-bezier(0.165, 0.84, 0.44, 1)",
          cursor: "text", // blink: .root `cursor: text`
          // ...except when the control is a native SELECT, where the kit's own wrapper says
          // `cursor: pointer` (Select.module.css `.root`). Scoped with `:has()` rather than left to
          // the select element itself, because the kit puts the pointer on the whole control -
          // padding and chevron included - and the select does not cover those. Invisible to the
          // pixel harness, which captures no cursor; here because it is part of the transcription.
          "&:has(select)": { cursor: "pointer" },
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
          // ...except a TEXTAREA, which sizes to its rows. The rule above is the single-line one and
          // would otherwise stretch the control to fill the root it is already defining.
          //
          // Keyed off the ROOT's `.MuiInputBase-multiline`, not off the input's own class: MUI v9
          // emits no `inputMultiline` class on the element (verified in the browser - a multiline
          // textarea carries exactly `MuiInputBase-input MuiOutlinedInput-input`), so a `&.`-style
          // rule matches nothing and fails silently.
          ".MuiInputBase-multiline &": {
            height: "auto",
            resize: "vertical", // blink: Textarea `.textarea { resize: vertical }` - MUI ships none
            // MUI puts `box-sizing: content-box` on an input, against the border-box every element
            // on the kit's page inherits from its reset. On a single-line input with no padding of
            // its own that is invisible; on a textarea whose height comes from `rows` it is not.
            boxSizing: "border-box",
          },
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
        // Each size carries its multiline padding beside its height, because the two are the same
        // fact expressed for the two constructions - blink: Textarea `.sm` / `.lg`, again +1px on
        // every side for the border the kit's root owns and MUI's fieldset does not.
        {
          props: { size: "small" },
          style: {
            height: 32, // blink: Input .sm `var(--control-h-sm)`
            "&.MuiInputBase-multiline": { height: "auto", padding: "5px 13px" }, // blink: Textarea .sm
          },
        },
        {
          props: { size: "large" },
          style: {
            height: 40, // blink: Input .lg `var(--control-h-lg)`
            "&.MuiInputBase-multiline": { height: "auto", padding: "13px 13px" }, // blink: Textarea .lg
          },
        },
      ],
    },

    // ---- Accordion ----
    //
    // Ground truth: reference/primitives/Accordion/Accordion.module.css, plus the two prop defaults
    // reference/primitives/Accordion/index.tsx hardcodes.
    //
    // Same shape as Tabs below: the kit's Accordion IS MUI's, wrapped with a CSS module on the
    // root, summary, content and details slots. It also pins `disableGutters` and `square` on every
    // instance, which is a DEFAULT rather than a style - so it belongs in defaultProps, where a
    // consumer can still opt out, rather than being frozen into styleOverrides.
    MuiAccordion: {
      defaultProps: {
        disableGutters: true, // blink: Accordion/index.tsx `disableGutters = true`
        square: true, // blink: Accordion/index.tsx `square = true`
      },
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.vars.palette.surface, // blink: .root `background: var(--color-surface)`
          // The lighter `--color-border`, NOT the `--color-border-strong` the Input and the Tabs
          // rule use. Transcribed from this module rather than carried across from theirs.
          border: `1px solid ${theme.vars.palette.border}`, // blink: .root `border: 1px solid var(--color-border)`
          borderRadius: 8, // blink: .root `border-radius: var(--radius-3)`
          boxShadow: "none", // blink: .root `box-shadow: none` - MUI ships an accordion at elevation 1
          // MUI paints a 1px divider above every panel with a ::before pseudo-element, so a lone
          // bordered panel gets a stray line inside its own top border.
          "&::before": { display: "none" }, // blink: .root::before `display: none`
          "&.Mui-disabled": {
            background: theme.vars.palette.surfaceMuted, // blink: .root.Mui-disabled
            // MUI fades a disabled panel to 0.38; the kit states the fill outright.
            opacity: 1, // blink: .root.Mui-disabled `opacity: 1`
          },
        }),
      },
    },
    MuiAccordionSummary: {
      defaultProps: {
        // blink: Accordion/index.tsx defaults `expandIcon` to `<ChevronDownIcon size={16} />`.
        // MUI renders no chevron at all unless one is passed, so this is what puts it there.
        expandIcon: createElement(ChevronDownIcon, { size: 16 }),
      },
      styleOverrides: {
        root: ({ theme }) => ({
          padding: "0 16px", // blink: .summary `padding: 0 var(--space-4)`
          minHeight: 44, // blink: .summary `min-height: 44px`
          fontFamily: "inherit", // blink: .summary `font-family: inherit`
          fontSize: 15, // blink: .summary `font-size: var(--text-md)`
          fontWeight: 600, // blink: .summary `font-weight: 600`
          lineHeight: 1.4, // blink: .summary `line-height: 1.4`
          color: theme.vars.palette.text.primary, // blink: .summary `color: var(--color-text-default)`
          borderRadius: 8, // blink: .summary `border-radius: var(--radius-3)`
          "&.Mui-expanded": {
            // MUI grows an expanded summary to 64px. The kit holds it at 44 and squares off the
            // two corners the details block now sits under.
            minHeight: 44, // blink: .summary.Mui-expanded `min-height: 44px`
            borderBottomLeftRadius: 0, // blink: .summary.Mui-expanded
            borderBottomRightRadius: 0, // blink: .summary.Mui-expanded
          },
          "&.Mui-disabled": {
            color: theme.vars.palette.textSubtle, // blink: .summary.Mui-disabled
            opacity: 1, // blink: .summary.Mui-disabled `opacity: 1`
          },
          // blink: `.summary:hover:not(.Mui-disabled) .expandIcon`. The kit puts its class on the
          // ICON element; MUI wraps the icon in `.MuiAccordionSummary-expandIconWrapper`, and
          // lucide draws with `stroke: currentColor`, so colouring the wrapper paints the same
          // pixels. The `:not` guard is transcribed as written - a disabled summary keeps the
          // muted chevron.
          "&:hover:not(.Mui-disabled) .MuiAccordionSummary-expandIconWrapper": {
            color: theme.vars.palette.text.primary,
          },
        }),
        content: {
          margin: "12px 0", // blink: .summaryContent `margin: var(--space-3) 0`
          // Restated because MUI grows the expanded content's margin to 20px; the kit's module
          // states the same 12px for both cases, so the summary's height never changes.
          "&.Mui-expanded": { margin: "12px 0" }, // blink: .summaryContent.Mui-expanded
        },
        expandIconWrapper: ({ theme }) => ({
          color: theme.vars.palette.textMuted, // blink: .expandIcon `color: var(--color-text-muted)`
          transition: "color 120ms cubic-bezier(0.165, 0.84, 0.44, 1)", // blink: .expandIcon `transition`
        }),
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: "0 16px 16px", // blink: .details `padding: 0 var(--space-4) var(--space-4)`
          color: theme.vars.palette.textMuted, // blink: .details `color: var(--color-text-muted)`
          fontSize: 15, // blink: .details `font-size: var(--text-md)`
          lineHeight: 1.5, // blink: .details `line-height: 1.5`
        }),
      },
    },

    // ---- Tabs ----
    //
    // Ground truth: reference/primitives/Tabs/Tabs.module.css.
    //
    // A special case worth naming: the kit's Tabs primitive is not a re-implementation, it IS
    // MUI's Tabs with a CSS module attached to the `root`, `indicator` and `selected` slots. So
    // this block is a transcription of that module and nothing else - every property the module
    // leaves alone (the 360px maxWidth, the centred label, the scroller's flex layout) is already
    // identical on both sides and must NOT be restated here, or the theme starts asserting values
    // it never extracted.
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 40, // blink: .tabs `min-height: 40px` (MUI's own is 48)
          borderBottom: `1px solid ${theme.vars.palette.borderStrong}`, // blink: .tabs `border-bottom`
        }),
        indicator: ({ theme }) => ({
          // The background is already primary.main by MUI's default and the height already 2px;
          // both are restated because the module states them, and a later palette change should
          // not be able to silently move the indicator off the token the kit names.
          background: theme.vars.palette.primary.main, // blink: .indicator `background: var(--color-primary)`
          height: 2, // blink: .indicator `height: 2px`
          // Held by reading, not by the pixel diff: a 1px radius on a 2px-tall bar lands entirely
          // inside pixels pixelmatch classifies as antialiasing, and `includeAA` is off by design
          // (see e2e/lib/compare.ts). Removing this line measured 0 differing pixels. Sabotage-test
          // this block with the padding or the colour instead.
          borderRadius: "1px 1px 0 0", // blink: .indicator `border-radius: 1px 1px 0 0`
        }),
      },
    },
    MuiTab: {
      defaultProps: {
        // blink: Tabs/index.tsx passes `disableRipple` to every MuiTab it renders.
        disableRipple: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 40, // blink: .tab `min-height: 40px`
          padding: "8px 16px", // blink: .tab `padding: var(--space-2) var(--space-4)`
          // A <button> does not inherit font-family, and MUI hands Tab `theme.typography.button`,
          // so this is what puts the page's face on the label - same as the Button block above.
          fontFamily: "inherit", // blink: .tab `font-family: inherit`
          fontSize: 14, // blink: .tab `font-size: var(--text-sm)`
          fontWeight: 600, // blink: .tab `font-weight: 600`
          lineHeight: 1.4, // blink: .tab `line-height: 1.4` (MUI's own is 1.25)
          color: theme.vars.palette.textMuted, // blink: .tab `color: var(--color-text-muted)`
          textTransform: "none" as const, // blink: .tab `text-transform: none`
          letterSpacing: "normal", // blink: .tab `letter-spacing: normal`
          minWidth: 0, // blink: .tab `min-width: 0` - MUI's breakpoint-guarded 90px floor has to go
          transition: "color 120ms cubic-bezier(0.165, 0.84, 0.44, 1)", // blink: .tab `transition`
          "&:hover": {
            color: theme.vars.palette.text.primary, // blink: .tab:hover
          },
          // After `&:hover` on purpose. The module writes `color: ... !important` here because a
          // CSS module cannot rely on its own source order against MUI's emotion output; inside one
          // styleOverrides object the two rules have equal specificity, so ordering does the same
          // job and a hovered selected tab stays brand-coloured on both sides.
          "&.Mui-selected": {
            color: theme.vars.palette.primary.main, // blink: .tabSelected `color: var(--color-primary)`
            fontWeight: 600, // blink: .tabSelected `font-weight: 600`
          },
          "&:focus-visible": {
            outline: "none", // blink: .tab:focus-visible `outline: none`
            // blink: tokens.css --focus-ring
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 4px`,
            borderRadius: 6, // blink: .tab:focus-visible `border-radius: var(--radius-2)`
          },
          "&.Mui-disabled": {
            color: theme.vars.palette.textSubtle, // blink: .tab.Mui-disabled `color: var(--color-text-subtle)`
            // MUI fades a disabled tab to 0.38; the kit states the colour outright, so the opacity
            // has to go or the token is diluted.
            opacity: 1, // blink: .tab.Mui-disabled `opacity: 1`
          },
        }),
      },
    },

    // ---- ButtonGroup ----
    //
    // Ground truth: reference/primitives/ButtonGroup/ButtonGroup.module.css, which is the whole of
    // the kit's group - four rules and no variants:
    //
    //     .group                   { display: inline-flex; align-items: stretch }
    //     .group > :not(:last-child)  { square the right corners }
    //     .group > :not(:first-child) { margin-left: -1px; square the left corners }
    //     .group > :hover, :focus-visible, :focus-within { z-index: 1 }
    //
    // The corner squashing MUI already does the same way. The SEAM it does not, and it builds it
    // differently for every variant: `outlined` overlaps by a pixel but paints the left button's
    // right border transparent, while `contained` and `text` inject a divider border and do not
    // overlap at all. The kit overlaps in every case and keeps both borders painted - two opaque
    // borders of the same colour on one pixel column, which composites to that colour.
    //
    // So the rules below are variant-blind where the kit is (the overlap, the z-index lift) and
    // variant-scoped only where MUI put something there that has to come back off.
    MuiButtonGroup: {
      defaultProps: {
        // The same trap as Checkbox, Radio and Switch, and it caught this block: ButtonGroup
        // resolves its OWN `disableRipple` default and forwards it to every child through
        // ButtonGroupButtonContext, so the `disableRipple` on MuiButton above never reaches a
        // GROUPED button. Found by the `no ripple` sweep - all nine grouped buttons in the gallery
        // mounted a ripple on press while every ungrouped one did not.
        disableRipple: true, // blink: Button/index.tsx `disableRipple`, via the group's own default
      },
      styleOverrides: {
        root: {
          alignItems: "stretch", // blink: .group `align-items: stretch`
          // MUI rounds the GROUP itself to `shape.borderRadius`. The kit's `.group` states no
          // radius, so it is the initial 0 and the corners belong entirely to the end buttons.
          borderRadius: 0,
          // MUI floors a GROUPED button at 40px wide, on top of whatever floor the button's own
          // size already sets - so inside a group an `xs`, `sm` or `md` button stops being 24, 32
          // or 36. The kit's group states no min-width at all and leaves the button's size class to
          // own it, so the ladder is restated here to put that back. It is a duplicate of the
          // Button size variants above by necessity: MUI's rule is a descendant selector and beats
          // the button's own class, so there is no value that means "whatever the size set".
          "& .MuiButtonGroup-grouped": {
            minWidth: 36, // blink: .md `min-width: var(--control-h-md)`
            "&.MuiButton-sizeXs": { minWidth: 24 }, // blink: .xs
            "&.MuiButton-sizeSmall": { minWidth: 32 }, // blink: .sm
            "&.MuiButton-sizeLarge": { minWidth: 40 }, // blink: .lg
          },
        },
      },
      variants: [
        {
          // blink: `.group > :hover, :focus-visible, :focus-within { z-index: 1 }`. The kit's
          // Button is `position: relative` (see the Button root above), so a z-index takes effect
          // and the active segment's border and focus ring draw over its neighbour's.
          props: { orientation: "horizontal" as const },
          style: {
            "& .MuiButtonGroup-grouped": {
              "&:hover, &:focus-visible, &:focus-within": { zIndex: 1 },
            },
            // blink: `.group > :not(:first-child) { margin-left: -1px }`, applied whatever the
            // variant. MUI only overlaps `outlined`.
            "& .MuiButtonGroup-lastButton, & .MuiButtonGroup-middleButton": { marginLeft: "-1px" },
          },
        },
        {
          props: { orientation: "horizontal" as const, variant: "outlined" as const },
          style: ({ theme }) => ({
            // MUI hides the left button's right border and brings it back on hover, so a seam is
            // one painted line that moves between the two buttons. The kit paints both, always.
            "& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton": {
              borderRightColor: theme.vars.palette.borderStrong, // blink: .secondary `border: 1px solid var(--color-border-strong)`
              "&:hover": { borderRightColor: theme.vars.palette.borderStrong },
            },
          }),
        },
        {
          props: { orientation: "horizontal" as const, variant: "contained" as const },
          style: ({ theme }) => ({
            // MUI puts an elevation-2 shadow around a CONTAINED group as a whole - separate from
            // the per-button shadow the Button block already kills - and the kit's group has none.
            // Measured before this line: 6366 differing pixels at Δ84, a halo around the strip.
            boxShadow: "none",
            // MUI draws a `grey[400]` divider down the right edge of every button but the last,
            // and then - in a SEPARATE per-colour variant - recolours that button's whole border to
            // `primary.dark`. So this is `borderColor`, not `borderRight`: fixing only the right
            // edge left the top, bottom and left ones at #4f5589 against the kit's #5a63b0, which
            // measured 1088 pixels at Δ39 - under the delta cap and caught by the count.
            //
            // The kit has no divider at all: the button keeps its own 1px brand border and the
            // overlap above does the rest.
            "& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton": {
              borderColor: theme.vars.palette.primary.main, // blink: .primary `border: 1px solid var(--color-primary)`
              // Restated, because the rule above is a descendant selector and outranks the
              // button's own hover rule - which would otherwise leave a hovered middle button
              // still wearing the resting border. 769 pixels at Δ39 before this line.
              "&:hover": { borderColor: theme.vars.palette.primary.dark }, // blink: .primary:hover `border-color: var(--color-primary-hover)`
              "&.Mui-disabled": { borderColor: theme.vars.palette.primary.main },
            },
          }),
        },
        {
          props: { orientation: "horizontal" as const, variant: "text" as const },
          style: {
            // Same story as `contained`: MUI injects a 23%-black divider, the kit's ghost button
            // carries `border: 1px solid transparent` and shows no seam at all.
            "& .MuiButtonGroup-firstButton, & .MuiButtonGroup-middleButton": {
              borderRight: "1px solid transparent", // blink: .ghost `border: 1px solid transparent`
              "&.Mui-disabled": { borderRight: "1px solid transparent" },
            },
          },
        },
      ],
    },

    // ---- ToggleGroup ----
    //
    // Ground truth: reference/primitives/ToggleGroup/ToggleGroup.module.css.
    //
    // The kit's ToggleGroup has TWO modes and they are shaped differently, which maps exactly onto
    // MUI's `exclusive` flag:
    //
    //   single (`role="radiogroup"`, MUI's `exclusive`) - every pill keeps the full radius, there
    //     are no dividers, and the white selection is a separate absolutely positioned `.slider`
    //     div sized `100/n%` and translated into place.
    //   multiple (`role="group"`, MUI's default) - the pills read as one strip: only the outer
    //     corners round, a 1px divider sits between every pair, and each active pill carries the
    //     white fill itself.
    //
    // The slider is the one construction MUI cannot reproduce, and it does not need to: the kit's
    // root is a grid of EQUAL columns, so the slider's box is exactly the active pill's box, and
    // painting the pill's own background puts the same rectangle in the same place. What is lost is
    // the slide ANIMATION between selections, which the harness disables anyway.
    //
    // The equal columns are load-bearing and are why the root is a grid rather than MUI's
    // inline-flex: `grid-auto-columns: minmax(0, 1fr)` gives every option the width of the widest
    // one for any number of options, which is what `repeat(n, minmax(0, 1fr))` does in the kit
    // without the theme having to know n.
    //
    // `--toggle-radius` is a per-size token used by BOTH the root and the pills, so the size
    // variants set it on the root and the pills take `border-radius: inherit`.
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          position: "relative", // blink: .root `position: relative`
          display: "grid", // blink: .root `display: grid`
          gridAutoFlow: "column" as const,
          gridAutoColumns: "minmax(0, 1fr)", // blink: the root's `repeat(n, minmax(0, 1fr))`
          width: "fit-content", // blink: .root `width: fit-content`
          backgroundColor: theme.vars.palette.surfaceMuted, // blink: .root `background-color`
          border: `2px solid ${theme.vars.palette.surfaceMuted}`, // blink: .root `border: 2px solid`
          fontFamily: "inherit", // blink: .root `font-family: inherit`
          // The md tier, which is the kit's default size. Here rather than in a `size: "medium"`
          // variant for the same reason the Input's height is: MUI leaves `size` undefined unless a
          // caller states it, so a medium-keyed variant would never match a plain group.
          borderRadius: 8, // blink: .md inherits `--toggle-radius: var(--radius-3)`
          height: 36, // blink: .md `height: var(--control-h-md)`
          fontSize: 15, // blink: .md `font-size: var(--text-md)`
          "& .MuiToggleButton-root": { padding: "0 12px" }, // blink: .md .option `padding: 0 var(--space-3)`
          // MUI's horizontal grouping rules, all of which the kit's SINGLE mode does without: it
          // squares the inner corners, overlaps the pills by a pixel and gives each a transparent
          // left border. The multiple-mode variant below puts the parts of that back which the kit
          // actually has.
          "& .MuiToggleButtonGroup-grouped": {
            marginLeft: 0,
            border: "none", // blink: .option `border: none`
            borderRadius: "inherit", // blink: .option `border-radius: var(--toggle-radius)`
          },
          // A SECOND, more specific rule for the disabled case, and it is needed rather than
          // tidy-able away: MUI states its transparent seam border twice, once at one class of
          // specificity and again as `.middleButton.Mui-disabled` at two - so the rule above wins
          // for an enabled group and loses for a disabled one. Left alone it made a disabled strip
          // 3px wider than the kit's, because every equal-width column grew by the widest item's
          // extra border. The multiple-mode variant restates the real divider at this specificity.
          "& .MuiToggleButtonGroup-grouped.Mui-disabled": { borderLeft: "none" },
        }),
      },
      variants: [
        // The three non-default sizes. Each sets the root's radius, height and type size, and the
        // pill padding that goes with them - `.xs` is the only one that also tightens the gap.
        {
          props: { size: "xs" as const },
          style: {
            borderRadius: 6, // blink: .xs `--toggle-radius: var(--radius-2)`
            height: 24, // blink: .xs `height: var(--control-h-xs)`
            fontSize: 13, // blink: .xs `font-size: var(--text-xs)`
            "& .MuiToggleButton-root": { padding: "0 8px", gap: 4 }, // blink: .xs .option
          },
        },
        {
          props: { size: "small" as const },
          style: {
            borderRadius: 6, // blink: .sm `--toggle-radius: var(--radius-2)`
            height: 32, // blink: .sm `height: var(--control-h-sm)`
            fontSize: 14, // blink: .sm `font-size: var(--text-sm)`
            "& .MuiToggleButton-root": { padding: "0 12px" }, // blink: .sm .option
          },
        },
        {
          props: { size: "large" as const },
          style: {
            borderRadius: 8, // blink: .lg keeps the default `--toggle-radius`
            height: 40, // blink: .lg `height: var(--control-h-lg)`
            fontSize: 15, // blink: .lg `font-size: var(--text-md)`
            "& .MuiToggleButton-root": { padding: "0 16px" }, // blink: .lg .option `padding: 0 var(--space-4)`
          },
        },
        {
          // blink: `.root.disabled { opacity: 0.6; cursor: not-allowed }`. A variant rather than a
          // state class, because ToggleButtonGroup emits no `Mui-disabled` on its ROOT - it only
          // forwards the prop to the children - so there is no class to hang this on.
          props: { disabled: true },
          style: { opacity: 0.6, cursor: "not-allowed" },
        },
        {
          // blink: every `.root[role="group"] ...` rule - the kit's MULTIPLE mode, which is MUI's
          // non-exclusive default. The pills become segments of one strip.
          //
          // A predicate rather than `props: { exclusive: false }`, and the difference is not
          // stylistic: MUI destructures `exclusive` with a default of false, so it only reaches
          // ownerState when a caller passes it BY HAND. An object matcher therefore misses exactly
          // the common case - a plain multi-select `<ToggleButtonGroup>` - which is what it did
          // here: the reference strip came out 3px wider than the MUI one because its dividers were
          // the only ones being drawn.
          props: (state: { exclusive?: boolean }) => !state.exclusive,
          style: ({ theme }) => ({
            "& .MuiToggleButtonGroup-grouped": { borderRadius: 0 }, // blink: .root[role=group] .option
            "& .MuiToggleButtonGroup-firstButton": {
              borderTopLeftRadius: "inherit", // blink: .root[role=group] .option:first-child
              borderBottomLeftRadius: "inherit",
            },
            "& .MuiToggleButtonGroup-lastButton": {
              borderTopRightRadius: "inherit", // blink: .root[role=group] .option:last-child
              borderBottomRightRadius: "inherit",
            },
            // blink: `.root[role="group"] .option:not(:first-child) { border-left: 1px solid
            // var(--color-surface-muted) }` - the divider is the same colour as the strip, so it
            // only shows where a white active pill meets an inactive one.
            "& .MuiToggleButtonGroup-middleButton, & .MuiToggleButtonGroup-lastButton": {
              borderLeft: `1px solid ${theme.vars.palette.surfaceMuted}`,
              marginLeft: 0,
            },
            // MUI drops the divider between two ADJACENT SELECTED buttons so a run of them reads as
            // one block. The kit's comment is explicit that its hairline "sits between every pair of
            // pills regardless of state", so the rule has to be put back - 187 pixels at Δ200
            // before this, all of them the missing line between two active pills.
            "& .MuiToggleButtonGroup-grouped.Mui-selected + .MuiToggleButtonGroup-grouped.Mui-selected":
              {
                borderLeft: `1px solid ${theme.vars.palette.surfaceMuted}`,
                marginLeft: 0,
              },
            // The divider survives a disabled strip - the kit's rule carries no disabled guard -
            // and has to be restated at two classes to outrank the reset on the root above.
            "& .MuiToggleButtonGroup-middleButton.Mui-disabled, & .MuiToggleButtonGroup-lastButton.Mui-disabled":
              { borderLeft: `1px solid ${theme.vars.palette.surfaceMuted}` },
          }),
        },
      ],
    },
    MuiToggleButton: {
      defaultProps: { disableRipple: true }, // blink: the kit's options are plain <button>s
      styleOverrides: {
        root: ({ theme }) => ({
          position: "relative", // blink: .option `position: relative`
          display: "flex", // blink: .option `display: flex`
          alignItems: "center", // blink: .option `align-items: center`
          justifyContent: "center", // blink: .option `justify-content: center`
          gap: 8, // blink: .option `gap: var(--space-2)`
          color: theme.vars.palette.textMuted, // blink: .option `color: var(--color-text-muted)`
          backgroundColor: "transparent", // blink: .option `background: transparent`
          border: "none", // blink: .option `border: none`
          borderRadius: "inherit", // blink: .option `border-radius: var(--toggle-radius)`
          // The kit states only `font-family: inherit` and `font-weight: 600` on an option; the
          // size comes from the ROOT and the line-height from the document. MUI spreads
          // `typography.button` here, so the rest has to be handed back.
          fontFamily: "inherit", // blink: .option `font-family: inherit`
          fontSize: "inherit", // blink: .option inherits the root's size class
          fontWeight: 600, // blink: .option `font-weight: 600`
          lineHeight: 1.5, // blink: reset.css `body { line-height: 1.5 }`, inherited
          letterSpacing: "normal",
          textTransform: "none" as const,
          cursor: "pointer", // blink: .option `cursor: pointer`
          whiteSpace: "nowrap" as const, // blink: .option `white-space: nowrap`
          // blink: .option `transition: color 150ms var(--ease-out), background-color 150ms ...`
          transition:
            "color 150ms cubic-bezier(0.165, 0.84, 0.44, 1), background-color 150ms cubic-bezier(0.165, 0.84, 0.44, 1)",
          // blink: `.option:hover:not(:disabled)`. MUI also tints the background on hover; the kit
          // changes only the ink.
          "&:hover:not(.Mui-disabled)": {
            color: theme.vars.palette.text.primary,
            backgroundColor: "transparent",
          },
          // blink: `.option:disabled { cursor: not-allowed }` and nothing else - MUI greys both the
          // label and the border out, and the kit dims the whole group from the root instead.
          "&.Mui-disabled": {
            cursor: "not-allowed",
            color: theme.vars.palette.textMuted,
            border: "none",
          },
          // After the disabled rule on purpose: `.option.active` carries no `:not(:disabled)`
          // guard, so a disabled active pill keeps the default ink.
          "&.Mui-selected": {
            color: theme.vars.palette.text.primary, // blink: .option.active
            // In SINGLE mode this fill is the kit's `.slider` - a separate div covering exactly
            // this pill's column - and in MULTIPLE mode it is the pill's own
            // `.root[role="group"] .option.active`. Same rectangle, same colour, one rule.
            backgroundColor: theme.vars.palette.surface, // blink: .slider / .option.active `background-color`
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)", // blink: tokens.css --shadow-card
            "&:hover": { backgroundColor: theme.vars.palette.surface },
          },
          "&.Mui-focusVisible": {
            outline: "2px solid transparent", // blink: .option:focus-visible
            outlineOffset: 2, // blink: .option:focus-visible `outline-offset: 2px`
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 4px`, // blink: --focus-ring
            zIndex: 1, // blink: .option:focus-visible `z-index: 1`
          },
        }),
      },
    },

    // ---- Table ----
    //
    // Ground truth: reference/primitives/Table/Table.module.css. Unlike Accordion and Tabs this
    // primitive is plain React - a <table> and a stylesheet - so nothing here is inherited from
    // MUI on the reference side and every value below is a transcription.
    //
    // The one structural thing to keep in mind: the kit puts every FONT declaration on the <table>
    // and none on the cells, so a cell's family, size, weight, line-height and tracking are all
    // inherited. MUI does the opposite - TableCell carries `theme.typography.body2` - so the cell
    // block below hands those back to inheritance rather than restating them, which is what keeps
    // the `sm` density (a font-size on the TABLE) reaching the cells at all.
    MuiTableContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.vars.palette.borderStrong}`, // blink: .container `border`
          borderRadius: 8, // blink: .container `border-radius: var(--radius-3)`
          overflow: "auto", // blink: .container `overflow: auto` - MUI ships overflow-x only
          scrollbarWidth: "thin" as const, // blink: .container `scrollbar-width: thin`
        }),
      },
    },
    MuiTable: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontFamily: "inherit", // blink: .table `font-family: inherit`
          fontSize: 15, // blink: .table `font-size: var(--text-md)`
          color: theme.vars.palette.text.primary, // blink: .table `color: var(--color-text-default)`
        }),
      },
      variants: [
        // blink: `.table.sm { font-size: var(--text-sm) }`. Only the type size lives here; the
        // matching cell padding is on MuiTableCell's own sizeSmall slot, because that is the
        // element the kit's `.table.sm .cell` selector actually paints.
        { props: { size: "small" }, style: { fontSize: 14 } },
      ],
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Hand the type back to the <table>, which is where the kit states it. `font` covers
          // family/size/weight/style/line-height in one go; letter-spacing is not part of the
          // shorthand and MUI's body2 sets it, so it needs its own line.
          font: "inherit",
          letterSpacing: "inherit",
          padding: 12, // blink: .headerCell/.cell `padding: var(--space-3)`
          borderBottom: `1px solid ${theme.vars.palette.borderStrong}`, // blink: .cell, and `.head .headerCell`
          color: theme.vars.palette.text.primary, // blink: .cell `color: var(--color-text-default)`
          verticalAlign: "middle", // blink: .cell `vertical-align: middle`
        }),
        head: {
          fontWeight: 600, // blink: .headerCell `font-weight: 600`
          whiteSpace: "nowrap" as const, // blink: .headerCell `white-space: nowrap`
        },
        footer: ({ theme }) => ({
          borderTop: `1px solid ${theme.vars.palette.borderStrong}`, // blink: .footer .cell `border-top`
          borderBottom: "none", // blink: .footer .cell `border-bottom: none`
          color: theme.vars.palette.textMuted, // blink: .footer .cell `color: var(--color-text-muted)`
          // MUI drops a footer cell to 12px and its own line-height. The kit's footer cell is just
          // `.cell`, so it keeps the table's type - restated because MUI's footer slot wins over
          // the `font: inherit` on the root above.
          fontSize: "inherit",
          lineHeight: "inherit",
        }),
        // blink: `.table.sm .headerCell, .table.sm .cell { padding: var(--space-2) var(--space-3) }`
        sizeSmall: { padding: "8px 12px" },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          // blink: `.body .row:last-child .cell { border-bottom: none }`. Scoped to tbody exactly as
          // the kit scopes it - the same rule left unscoped would also strip the rule under a head
          // whose table has no body rows, and the divider under the header is the one line a table
          // always has.
          "& .MuiTableRow-root:last-child .MuiTableCell-root": { borderBottom: "none" },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          transition: "background-color 120ms cubic-bezier(0.165, 0.84, 0.44, 1)", // blink: .row `transition`
          // blink: `.interactive { cursor: pointer }` + `.interactive:hover .cell { background }`.
          //
          // The kit infers "interactive" from the row having an `onClick`; MUI has no such
          // inference and makes a consumer opt in with the `hover` prop, so both halves of the
          // kit's rule hang off `.MuiTableRow-hover` here - it is the nearest thing MUI has to
          // "this row responds to the pointer".
          //
          // The tint goes on the CELLS, not on the row, because that is where the kit puts it: a
          // row background and a cell background paint the same picture only while the cells tile
          // the row exactly, and a collapsed border makes that not quite true. MUI's own rule
          // paints the row, so it has to be taken back off.
          "&.MuiTableRow-hover:hover": {
            backgroundColor: "transparent",
            "& .MuiTableCell-root": { backgroundColor: theme.vars.palette.surfaceMuted },
          },
          // After the hover rule, exactly as `.rowSelected` follows `.interactive:hover` in the
          // module: a selected row that is also hovered keeps the selected tint.
          "&.Mui-selected, &.Mui-selected:hover": {
            backgroundColor: "transparent",
            "& .MuiTableCell-root": {
              // blink: `.rowSelected .cell` -> --color-primary-bg, which tokens.css builds as
              // `color-mix(in srgb, var(--color-primary) var(--color-tint-opacity), transparent)`
              // at the 10% light-scheme opacity.
              backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 10%, transparent)`,
            },
          },
        }),
      },
      variants: [
        { props: { hover: true }, style: { cursor: "pointer" } }, // blink: .interactive `cursor: pointer`
      ],
    },

    // ---- The portalled tier: Tooltip, Popover, Menu ----
    //
    // Ground truth: reference/primitives/{Tooltip,Popover,Menu}/*.module.css, plus the prop defaults
    // each primitive's index.tsx hardcodes.
    //
    // All three are MUI components with a CSS module attached, so these blocks are transcriptions in
    // the same shape as Accordion and Tabs.
    //
    // ONE THING THE THEME DELIBERATELY DOES NOT CARRY. Each primitive passes
    // `slots={{ transition: PopTransition }}` with a 150ms duration - a custom entrance that fades
    // and scales from 0.95, replacing MUI's Grow. That is a COMPONENT, not a style: reproducing it
    // means shipping a react-transition-group wrapper, and this file's contract is that it imports
    // only @mui/material, lucide-react and React. The SETTLED overlay - the only thing a consumer
    // sees once it has opened, and the only thing the harness captures - is identical either way, so
    // what is lost is the entrance animation. An app that wants it passes the same `slots` prop the
    // kit does.
    MuiTooltip: {
      defaultProps: {
        // blink: Tooltip/index.tsx pins all four on every instance.
        arrow: true,
        placement: "top",
        enterDelay: 200,
        leaveDelay: 0,
      },
      styleOverrides: {
        tooltip: ({ theme }) => ({
          background: theme.vars.palette.tooltipBg, // blink: .tooltip `background: var(--color-tooltip-bg)`
          color: theme.vars.palette.tooltipText, // blink: .tooltip `color: var(--color-tooltip-text)`
          fontFamily: "inherit", // blink: .tooltip `font-family: inherit`
          fontSize: 15, // blink: .tooltip `font-size: var(--text-md)` - MUI's own is 11
          lineHeight: "20px", // blink: .tooltip `line-height: 20px`, a LENGTH rather than a ratio
          fontWeight: 400, // blink: .tooltip `font-weight: 400` - MUI's own is 500
          padding: "8px 12px 9px", // blink: .tooltip - note the asymmetric bottom pixel
          borderRadius: 6, // blink: .tooltip `border-radius: var(--radius-2)`
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", // blink: .tooltip `box-shadow`
          maxWidth: 280, // blink: .tooltip `max-width: 280px`
          // blink: `.tooltip b { font-weight: 700 }`. A descendant rule over markup the CONSUMER
          // puts in the title, so no MUI prop reaches it - carried because the surface is the
          // theme's and a consumer passing <b> should get the kit's weight.
          "& b": { fontWeight: 700 },
        }),
        arrow: ({ theme }) => ({
          color: theme.vars.palette.tooltipBg, // blink: .arrow `color: var(--color-tooltip-bg)`
        }),
      },
    },
    MuiPopover: {
      defaultProps: {
        // blink: Popover/index.tsx pins both origins. MUI's own defaults are top/left for both,
        // which opens the panel OVER its trigger rather than under it.
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        transformOrigin: { vertical: "top", horizontal: "left" },
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          background: theme.vars.palette.surface, // blink: .paper `background: var(--color-surface)`
          // The lighter `--color-border`, as on the Accordion and NOT the `--color-border-strong`
          // the Input and Tabs use.
          border: `1px solid ${theme.vars.palette.border}`, // blink: .paper `border`
          borderRadius: 8, // blink: .paper `border-radius: var(--radius-3)`
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", // blink: tokens.css --shadow-popover
          fontFamily: "inherit", // blink: .paper `font-family: inherit`
          fontSize: 15, // blink: .paper `font-size: var(--text-md)`
          lineHeight: 1.5, // blink: .paper `line-height: 1.5`
          color: theme.vars.palette.text.primary, // blink: .paper `color: var(--color-text-default)`
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          // blink: .paper `padding: var(--space-2)`. The kit's comment is worth keeping: an even
          // gutter on all sides is what lets a rounded item highlight sit INSET from the paper
          // edge, so a menu reads as a card of pills rather than a bordered list.
          padding: 8,
          background: theme.vars.palette.surface, // blink: .paper `background: var(--color-surface)`
          border: `1px solid ${theme.vars.palette.border}`, // blink: .paper `border`
          borderRadius: 8, // blink: .paper `border-radius: var(--radius-3)`
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", // blink: tokens.css --shadow-popover
          color: theme.vars.palette.text.primary, // blink: .paper `color: var(--color-text-default)`
        }),
        // blink: .list `padding: 0`. MUI's List ships 8px of block padding, which would sit on top
        // of the paper's own gutter and double it.
        list: { padding: 0 },
      },
    },
    MuiMenuItem: {
      defaultProps: {
        disableRipple: true, // blink: Menu/index.tsx passes `disableRipple` to every MuiMenuItem
      },
      styleOverrides: {
        root: ({ theme }) => ({
          display: "flex", // blink: .item `display: flex`
          alignItems: "center", // blink: .item `align-items: center`
          gap: 8, // blink: .item `gap: var(--space-2)`
          minHeight: 32, // blink: .item `min-height: var(--control-h-sm)`
          padding: 8, // blink: .item `padding: var(--space-2)`
          borderRadius: 6, // blink: .item `border-radius: var(--radius-2)`
          fontSize: 15, // blink: .item `font-size: var(--text-md)`
          lineHeight: 1.4, // blink: .item `line-height: 1.4`
          // blink: `.list .item:hover`. The kit reaches for a two-class selector deliberately - its
          // own comment says `.list .item` (0,3,0) has to outweigh MUI's `.MuiMenuItem-root:hover`
          // (0,2,0) - and the token is there because MUI's faint black tint disappears on a dark
          // surface.
          //
          // HOVER ONLY, and this is the "a source file is only EVIDENCE" rule earning its place
          // again. That same CSS rule also lists `.list .item.Mui-focusVisible`, and it does not
          // compile: the selector is written bare, so the CSS-modules pipeline treats
          // `Mui-focusVisible` as a LOCAL class and hashes it into something that matches nothing.
          // (The kit's Accordion module gets this right - `.summary:global(.Mui-expanded)` - so it
          // is an omission there, not a convention.) Measured on the open menu, whose first item
          // MUI auto-focuses: the kit's item paints rgba(0, 0, 0, 0.12), MUI's own action.focus,
          // not the surface-muted token its stylesheet asks for.
          //
          // Transcribing the INTENT would have made the theme differ from the thing it replicates
          // by 10204 pixels. If the kit ever adds the `:global()`, add the state back here.
          "&:hover": { backgroundColor: theme.vars.palette.surfaceMuted },
        }),
      },
    },

    // ---- Dialog ----
    //
    // Ground truth: reference/primitives/Dialog/Dialog.module.css, plus the props index.tsx pins.
    //
    // The kit's paper is a flex COLUMN with a 16px pad and a 12px gap, and its header, body and
    // footer carry no padding at all - the paper owns every bit of the spacing. MUI's three slots
    // each carry their own padding instead, so the whole of this block is: put the spacing on the
    // paper, take it off the slots.
    //
    // The size ladder is remapped rather than renamed. The kit's sm/md/lg are 400/560/720 and MUI's
    // are 600/900/1200, so `maxWidth="md"` means a different dialog under this theme - which is the
    // point of a drop-in. `md` is also the kit's default size, hence the defaultProps below; MUI's
    // own default is `sm`, which would come out 160px narrower than the kit's default dialog.
    MuiDialog: {
      defaultProps: {
        maxWidth: "md", // blink: Dialog/index.tsx `size = "md"`
        fullWidth: true, // blink: `.sm/.md/.lg { width: 100% }`
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          background: theme.vars.palette.surface, // blink: .paper `background: var(--color-surface)`
          borderRadius: 8, // blink: .paper `border-radius: var(--radius-3)`
          padding: 16, // blink: .paper `padding: var(--space-4)`
          display: "flex", // blink: .paper `display: flex`
          flexDirection: "column" as const, // blink: .paper `flex-direction: column`
          gap: 12, // blink: .paper `gap: var(--space-3)`
        }),
        paperWidthSm: { maxWidth: 400 }, // blink: .sm `max-width: 400px`
        paperWidthMd: { maxWidth: 560 }, // blink: .md `max-width: 560px`
        paperWidthLg: { maxWidth: 720 }, // blink: .lg `max-width: 720px`
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        // The kit splits this across two elements - a `.header` flex row holding an `h2.title` -
        // and MUI has one. Both sets of declarations land here, which works because the kit's title
        // is the only in-flow child of its header when there is no close button, and because a
        // consumer who composes an IconButton into DialogTitle gets exactly the row the kit's
        // header lays out.
        root: ({ theme }) => ({
          display: "flex", // blink: .header `display: flex`
          justifyContent: "space-between", // blink: .header `justify-content: space-between`
          alignItems: "flex-start", // blink: .header `align-items: flex-start`
          gap: 12, // blink: .header `gap: var(--space-3)`
          padding: 0, // blink: neither .header nor .title has padding - the paper owns it
          margin: 0, // blink: .title `margin: 0`
          fontWeight: 600, // blink: .title `font-weight: 600`
          fontSize: 18, // blink: .title `font-size: var(--text-lg)`
          lineHeight: 1.3, // blink: .title `line-height: 1.3`
          color: theme.vars.palette.text.primary, // blink: .title `color: var(--color-text-default)`
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          display: "flex", // blink: .body `display: flex`
          flexDirection: "column" as const, // blink: .body `flex-direction: column`
          gap: 12, // blink: .body `gap: var(--space-3)`
          color: theme.vars.palette.text.primary, // blink: .body `color: var(--color-text-default)`
          fontSize: 15, // blink: .body `font-size: var(--text-md)`
          lineHeight: 1.5, // blink: .body `line-height: 1.5`
          padding: 0, // blink: .body has none - MUI ships 20px/24px
          // MUI also drops a title's neighbouring content to `padding-top: 0`, which is dead weight
          // once the padding is gone, and it is stated at two classes - restated here so the rule
          // above is not silently outranked for the one arrangement that matters most.
          ".MuiDialogTitle-root + &": { paddingTop: 0 },
        }),
      },
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: ({ theme }) => ({
          margin: 0, // blink: .description `margin: 0`
          color: theme.vars.palette.textMuted, // blink: .description `color: var(--color-text-muted)`
          fontSize: 15, // blink: .description `font-size: var(--text-md)`
          lineHeight: 1.4, // blink: .description `line-height: 1.4` - NOT the body's 1.5
        }),
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          display: "flex", // blink: .footer `display: flex`
          justifyContent: "flex-end", // blink: .footer `justify-content: flex-end`
          gap: 8, // blink: .footer `gap: var(--space-2)`
          padding: 0, // blink: .footer has none - MUI ships 8px
          // MUI spaces its actions with a sibling margin rather than a gap. Left in place it would
          // stack with the 8px gap above and put 16px between two buttons.
          "& > :not(style) ~ :not(style)": { marginLeft: 0 },
        },
      },
    },

    // ---- Select ----
    //
    // Ground truth: reference/primitives/Select/Select.module.css.
    //
    // The kit's Select is a NATIVE <select> with `appearance: none`, wrapped in a div that carries
    // the same chrome as its Input, with a chevron absolutely positioned over the right edge. There
    // is no portalled listbox in it at all - the options are the operating system's.
    //
    // That means MUI's `<Select native>`, and it means most of this component is already themed:
    // `.root` and `.root:hover/.error/.disabled/:has(.select:focus)` are byte-for-byte the Input's
    // rules over the same tokens, and MuiOutlinedInput above carries them. Only what is genuinely
    // the SELECT's own is below.
    // Both keys, and both are needed. `<Select native>` resolves `IconComponent` against ITS own
    // name (MuiSelect) and hands the result down, so a default on MuiNativeSelect alone never
    // reaches it - measured, the chevron stayed MUI's 24px arrow. MuiNativeSelect covers a bare
    // <NativeSelect>. The non-native Select gets the same chevron: the kit ships no listbox of its
    // own, so its native control is the only ground truth there is for that icon.
    MuiSelect: {
      defaultProps: { IconComponent: SelectChevron },
    },
    MuiNativeSelect: {
      defaultProps: {
        // blink: Select/index.tsx `<ChevronDownIcon size={16} />`. MUI's own is a filled Material
        // arrow at 24px. Defined at module scope rather than inline so the component identity is
        // stable across renders.
        IconComponent: SelectChevron,
      },
      styleOverrides: {
        select: ({ theme }) => ({
          // blink: `.select:disabled`. Doubled to three classes on purpose. The OutlinedInput block
          // above already states this for `.MuiOutlinedInput-input:disabled` and it wins for a real
          // <input>, but a native select is styled by TWO stacks at once - InputBase's
          // `.MuiInputBase-input.Mui-disabled` and NativeSelect's own - and InputBase's
          // `-webkit-text-fill-color: action.disabled` came out on top, painting the label at 38%
          // black instead of the subtle token. Measured: 492 differing pixels over the label.
          "&&.Mui-disabled": {
            color: theme.vars.palette.textSubtle,
            WebkitTextFillColor: theme.vars.palette.textSubtle,
            cursor: "not-allowed", // blink: .select:disabled - MUI's own is `cursor: default`
            // The kit's `.select:disabled` states a colour and a cursor and NOTHING else, so the
            // browser's own dimming of a disabled <select> stands - Chrome renders it at 0.7. MUI
            // resets that to 1 (its comment says for iOS), which made the label a visibly denser
            // grey: 492 differing pixels across the text, and the reason the colour above looked
            // right in the computed styles while the capture disagreed.
            //
            // `revert` rather than the literal 0.7: it hands the value back to the USER-AGENT
            // origin, which is where the kit gets it from too, so the theme reproduces the kit on
            // whatever browser it runs on rather than freezing one browser's number.
            opacity: "revert",
          },
          // blink: .select carries no radius - MUI rounds an outlined select to `shape.borderRadius`
          // and resets it again on focus. Nothing paints there either way (the element is
          // transparent and borderless), but the kit's value is 0 and this is cheaper than a reader
          // wondering which of the two is deliberate.
          borderRadius: 0,
          "&:focus": { borderRadius: 0 },
          // blink: .select `padding: 0 var(--space-6) 0 0`. MUI reserves 32px for an outlined
          // select and states it at `&&&`, three classes of specificity, expressly so a custom
          // input cannot accidentally undo it - so undoing it deliberately has to match.
          "&&&": { paddingRight: 24 },
        }),
        icon: ({ theme }) => ({
          // blink: .chevron `right: var(--space-3)` (12px) PLUS the 1px the kit's own border
          // occupies, for exactly the reason the OutlinedInput's `padding: 0 13px` carries the same
          // extra pixel: `right` resolves against the PADDING box, and the kit's root has a real
          // border there while MUI's outline is an absolutely positioned fieldset that occupies no
          // space. Measured at 12: the chevron sat one pixel too far out, 37 differing pixels.
          right: 13,
          // blink: .chevron `top: 50%; transform: translateY(-50%)`. MUI centres the icon on the
          // TEXT instead (`top: calc(50% - .5em)`, half a 15px em against this icon's 16px box),
          // which puts it half a pixel high.
          top: "50%",
          transform: "translateY(-50%)",
          color: theme.vars.palette.textMuted, // blink: .chevron `color: var(--color-text-muted)`
          "&.Mui-disabled": {
            color: theme.vars.palette.textSubtle, // blink: `.root.disabled .chevron`
          },
        }),
      },
    },

    // ---- FormField ----
    //
    // Ground truth: reference/primitives/FormField/FormField.module.css.
    //
    // The kit's FormField is a flex column - label, control, message - with an 8px gap and nothing
    // else, so the mapping onto MUI's FormControl is direct. What takes the work is everything MUI
    // LAYERS on a label and a helper text, because the kit layers none of it.
    //
    // SCOPE: MUI's InputLabel is a FLOATING label that shrinks into the outline's notch, and the kit
    // ships no floating label anywhere - its label is a plain block above the control, which is
    // MUI's static FormLabel. InputLabel renders a FormLabel, so it inherits the type and colour
    // below; its POSITIONING is left as MUI's, because there is nothing to extract for it.
    MuiFormControl: {
      styleOverrides: {
        root: {
          display: "flex", // blink: .root `display: flex` - MUI's own is inline-flex
          flexDirection: "column" as const, // blink: .root `flex-direction: column`
          gap: 8, // blink: .root `gap: var(--space-2)`
          minWidth: 0, // blink: .root `min-width: 0`
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: 15, // blink: .label `font-size: var(--text-md)`
          lineHeight: 1.4, // blink: .label `line-height: 1.4`
          fontWeight: 400, // blink: .label `font-weight: 400`
          color: theme.vars.palette.textMuted, // blink: .label `color: var(--color-text-muted)`
          // The kit's label is ONE grey in every state - `.label` has no `:focus-within`, no error
          // variant and no disabled variant. MUI turns it primary on focus and red on error, so
          // each of those has to be handed back. The colour that DOES change on error is the
          // message below, which is a different element.
          "&.Mui-focused": { color: theme.vars.palette.textMuted },
          "&.Mui-error": { color: theme.vars.palette.textMuted },
          "&.Mui-disabled": { color: theme.vars.palette.textMuted },
        }),
        asterisk: ({ theme }) => ({
          color: theme.vars.palette.error.main, // blink: .required `color: var(--color-error)`
          marginLeft: 4, // blink: .required `margin-left: var(--space-1)`
          // MUI recolours the asterisk again under `.Mui-error`; the kit's is error-coloured
          // always, so the state rule would be a no-op at best and a different red at worst.
          "&.Mui-error": { color: theme.vars.palette.error.main },
          // MUI's asterisk is the two characters `\u2009*` - a THIN SPACE and a star - where the
          // kit's is a bare `*` spaced by the margin above. Left alone the two spacings stack and
          // the star lands about 3px right of the kit's, which measured 37 pixels at Δ230.
          //
          // The thin space is markup rather than style, so it cannot be removed - it is collapsed
          // instead, by zeroing the span's type and drawing the star from a pseudo-element at the
          // label's own size. Font-independent, unlike compensating the margin by a guess at how
          // wide one font renders U+2009.
          fontSize: 0,
          "&::after": {
            content: '"*"',
            fontSize: 15, // blink: .label `font-size: var(--text-md)`, which the star shares
          },
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: 13, // blink: .helperText `font-size: var(--text-xs)` - note 13, not 12
          lineHeight: 1.4, // blink: .helperText `line-height: 1.4`
          color: theme.vars.palette.textMuted, // blink: .helperText `color: var(--color-text-muted)`
          // MUI spaces its helper text with a 3px top margin, and 14px of side margin in the
          // `contained` form. The kit's message is just another child of the column, spaced by the
          // 8px gap - so any margin here is added on top of that.
          margin: 0,
          "&.Mui-error": {
            color: theme.vars.palette.error.main, // blink: .errorText `color: var(--color-error)`
          },
        }),
      },
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
