/**
 * xui blink theme - Pulse / NeverBlink's design system as a MUI v9 theme (an operational data-tool
 * UI: dense, warm light-gray canvas, one indigo accent).
 *
 * Self-contained: imports only from @mui/material/styles, lucide-react (the design system's own
 * icon set) and React's createElement, so the file can be copied into any app as a single unit.
 *
 * THIS FILE IS THE DESIGN SYSTEM, not a copy of one. That is what separates blink from xui's other
 * two themes, and it decides how to work on it:
 *
 *   - It covers ALL of MUI, not one design system's slice. Where there is no existing equivalent,
 *     the style is DERIVED here - authored from the tokens and from decisions the blocks above
 *     already make - so a consumer never meets a stock Material control. `blink-coverage.test.ts`
 *     holds that claim.
 *   - A considered improvement is a legitimate change to the DESIGN, made here and ported back.
 *     For a theme that replicates somebody else's system, any difference is a bug; here it is not.
 *
 * Two standards live in this file, and each block says which applies:
 *
 *   ABOVE the derived-tier banner - extracted from a real component, every value carrying a
 *   `// blink:` comment naming the token or class it came from. A vendored snapshot of those
 *   components is kept as a REGRESSION BASELINE (the pairs built on it diff at zero and must keep
 *   doing so) at apps/showcase/src/themes/blink/reference/. It is not an authority: it does not
 *   bound this file's surface and it does not settle a design question. Read its README first.
 *
 *   BELOW the banner - derived, every value carrying a `// derived:` comment naming the token or
 *   the neighbouring block's decision it came from. No pixel claim; those pairs are ref-less.
 *
 * Where extraction sources disagree - and they do - the order is:
 *   the component's CSS module (what actually paints)  >  tokens.css  >  the written spec
 * The spec says button labels are weight 500; Button.module.css says 600 and the live page
 * measures 600. What paints wins.
 *
 * The design-system source is private, so committed files cite it by role; a gitignored
 * PROVENANCE.private.md beside the reference README holds the real paths.
 *
 * Light scheme only for now. The `palette()` factory below is kept in the shape that makes adding
 * `colorSchemes.dark` a one-line change; until that is written there is deliberately no dark
 * project in the harness, so a future one cannot silently run in light and pass everything.
 */
import { createTheme } from "@mui/material/styles"
import {
  ArrowDownIcon,
  ChevronDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
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

// A TextField hands its `size` to the LABEL as well as the control, and the label's resting
// A TextField hands its `size` to the LABEL as well as the control, so the third step has to exist
// on both or the label rejects a value its own field accepts.
declare module "@mui/material/InputLabel" {
  interface InputLabelPropsSizeOverrides {
    large: true
  }
}

// And TextField, which is how most consumers meet both at once: it owns its own size union and
// hands the value down to the control AND the label, so augmenting only those two leaves the
// composed component - the one an app actually writes - rejecting the kit's third step.
declare module "@mui/material/TextField" {
  interface TextFieldPropsSizeOverrides {
    large: true
  }
}

// ...and the two components that COMPOSE a field, which is how most apps actually write one. Both
// resolve their size through the same rules `large` already works under - InputBase reads
// `size: fcs.size` off FormControl's context, and Autocomplete hands its own size straight to the
// TextField it renders - so the third step worked at RUNTIME in both while the compiler rejected
// it. Augmenting only the leaf components left `<FormControl size="large">` and
// `<Autocomplete size="large">` as type errors on a size the theme fully implements.
declare module "@mui/material/FormControl" {
  interface FormControlPropsSizeOverrides {
    large: true
  }
}
declare module "@mui/material/Autocomplete" {
  interface AutocompletePropsSizeOverrides {
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
 * once. The kit ships a dark scheme (a dark token sheet) and the app's MUI theme a `colorDark`;
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

/**
 * The sort indicator, bound to the kit's 14px. Same reason as SelectChevron above: MUI hands
 * `IconComponent` only a className, and an inline arrow would remount the icon every render.
 *
 * ArrowDown rather than ArrowUp because MUI rotates this element 180 degrees for the ascending
 * direction - so one glyph covers both of the kit's sorted states.
 */
/**
 * A quarter of the circle's path length, as MUI's `strokeDasharray` wants it.
 *
 * MUI draws its ring in a fixed 44-unit viewBox and derives the radius from `thickness`
 * (`r = (44 - thickness) / 2`), so the path is `PI * (44 - thickness)` long and a quarter of it
 * moves with the stroke. The kit's arc is always a quarter turn, so this has to be computed rather
 * than written down - see the note in the MuiCircularProgress block.
 */
const dashForThickness = (thickness: number | undefined) => {
  const length = Math.PI * (44 - (thickness ?? 3.6))
  const quarter = length / 4
  return `${quarter.toFixed(2)} ${(length - quarter).toFixed(2)}`
}

const SortArrow = (props: { className?: string }) =>
  createElement(ArrowDownIcon, { size: 14, ...props }) // blink: Table/index.tsx SortIndicator

export const blinkTheme = createTheme({
  cssVariables: true,
  colorSchemes: { light: { palette: palette(color) } },
  typography: {
    // The kit's own `--font-family-sans` is the bare string "Source Sans Pro" with no fallbacks.
    // This is the longer stack because it is what the APP's MUI theme uses (reference/
    // baselineTheme.ts, and the app's own MUI theme after it), and MUI is what this theme
    // configures. Where
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
    // blink: baselineTheme.ts + the app's own MUI theme. The kit's Button.module.css never uppercases,
    // so MUI's default `uppercase` would be wrong on every button.
    button: { textTransform: "none" },

    // SCOPE: no pair covers the bare Typography variants, and cannot - the kit ships NO text
    // primitive (there is no Text/Typography entry among its 26, and none in its showcase). The
    // scale below is therefore the one surface in this file with no component to diff against.
    //
    // Sources, in the order the file's precedence rule applies them:
    //   - WHICH MUI slot maps to which kit step is the app's own MUI theme's decision, kept as-is. It is the
    //     app author's own record and nothing in the kit overrules it. That is why body2 is the
    //     13px step: MUI's "smaller body" is the role the app gave text-xs.
    //   - The VALUES come from the kit's design spec, whose typography frontmatter it calls normative.
    //     Where the port drifted from it, the frontmatter wins and the drift is noted per line.
    //
    // The heading ladder is six slots over a kit that has three heading steps (text-lg 18,
    // text-xl 24, text-2xl 30), so the bottom half has to be filled in somehow, and HOW is the one
    // real decision here.
    //
    // It used to run 30/24/18/15/14/13: the kit's three steps, then its three BODY steps at weight
    // 600. Each token used exactly once, which is tidy and was wrong in the way that matters -
    // h4/h5/h6 are the slots a MUI app actually reaches for (MUI's own docs title a page with h4;
    // AppBar titles are h6), and all three of them landed at or below body1's 15px. A "Page Title"
    // came out the same size as the paragraph under it, and h4/h5/h6 were a 2px spread that read as
    // one size rendered three times.
    //
    // So the ladder is filled DOWNWARD from the kit's steps instead of restarting at the body
    // scale: 30 and 24 are text-2xl and text-xl, 18 is text-lg, and 20 and 16 are the two steps
    // between them that the kit has no token for. h6 sits at body1's 15px, which is deliberate
    // rather than a leftover - the smallest heading being body-sized in the kit's semibold is the
    // same convention shadcn uses, and it is the floor the old ladder went through.
    //
    // What this costs: `variant="h3"` is no longer the kit's `heading3`. That step is still on the
    // page, one slot down at h4, and this is the trade the ladder was worth - a monotonic scale
    // where every heading outranks body text beats an exact slot-for-slot mapping of three of the
    // six. The app's own MUI theme's h4/h5/h6 are superseded, not ported.
    h1: { fontSize: 30, fontWeight: 600, lineHeight: 1.2 }, // blink: spec text-2xl
    h2: { fontSize: 24, fontWeight: 600, lineHeight: 1.2 }, // blink: spec text-xl (the app's theme had 1.25)
    h3: { fontSize: 20, fontWeight: 600, lineHeight: 1.2 }, // blink: interpolated between text-xl and text-lg
    h4: { fontSize: 18, fontWeight: 600, lineHeight: 1.3 }, // blink: spec text-lg, at Dialog .title's 1.3
    h5: { fontSize: 16, fontWeight: 600, lineHeight: 1.3 }, // blink: interpolated between text-lg and text-md
    h6: { fontSize: 15, fontWeight: 600, lineHeight: 1.3 }, // blink: text-md, the floor of the ladder
    // 1.5, not the spec's text-md 1.4, and this one is deliberate: the app's reset sets
    // `body { line-height: 1.5 }`, so 1.5 is what a paragraph of body text actually PAINTS in the
    // app. The file's precedence rule puts what paints above the written token, and the app's own
    // MUI theme reached the same 1.5.
    body1: { fontSize: 15, fontWeight: 400, lineHeight: 1.5 }, // blink: the app's reset body + spec text-md size
    body2: { fontSize: 13, fontWeight: 400, lineHeight: 1.4 }, // blink: spec text-xs, mapped by the app's theme
    // The last three variants, and they were left at MUI's own defaults - which is the same gap
    // h4/h5/h6 had, one shelf down. `caption` in particular resolved to 12px, a size the kit's scale
    // does not contain at all, so a themed page had one text size in it from Material's era.
    //
    // Each takes the kit token that plays its role, at the weight the kit uses for that role: 600 is
    // the kit's ONE emphasis weight (Button, Badge, Alert title, Card title and Dialog title all
    // use it, and nothing in the 26 primitives uses 500), so an emphasised body line is 600 here
    // where MUI would say 500.
    subtitle1: { fontSize: 18, fontWeight: 400, lineHeight: 1.4 }, // blink: text-lg - the step above body1
    subtitle2: { fontSize: 15, fontWeight: 600, lineHeight: 1.5 }, // blink: text-md at the kit's emphasis weight
    caption: { fontSize: 13, fontWeight: 400, lineHeight: 1.4 }, // blink: text-xs, the floor of the scale
  },
  // SCOPE: `shape.borderRadius` is deliberately left at MUI's own default. The kit has three radii
  // (4/6/8) chosen per component - a Button at 24px tall takes 6 and at 36px takes 8 - so a single
  // global value would be wrong somewhere no matter which of the three it picked, and it would
  // reach every untreated component besides. Each override below sets its own radius from the
  // primitive that proves it. The app's own MUI theme made the same call.

  components: {
    // ---- Button ----
    //
    // Ground truth: reference/primitives/Button/Button.module.css, quoted per line below.
    // Ported from the app's own MUI theme, with four corrections the primitive forced:
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
    //
    // ONE deliberate departure from the module, and it applies to MuiIconButton and MuiToggleButton
    // below as well: the kit writes `display: flex` and this takes it as `inline-flex`.
    //
    // The two differ only in the box's OUTER type - both establish the same flex formatting context
    // inside, which is all `.root` uses it for (centring an icon beside a label). And a flex item is
    // blockified by CSS, so wherever the kit actually puts a button - inside its own flex rows - the
    // two values are indistinguishable, which is why every pair here measures the same under either.
    //
    // What the outer type DOES decide is what happens in the places the kit has no opinion about,
    // because MUI reuses these components where the design system has no twin: Autocomplete's clear
    // and popup indicators sit in an absolutely positioned block, TablePagination's arrows in a
    // plain div, and Alert, Dialog and Snackbar all mount a close button the same way. Block-level
    // there means each button claims a whole line, so two of them STACK - measured in a consuming
    // app as a clear/open pair overflowing its field and prev/next arrows one above the other.
    // `inline-flex` is MUI's own value for exactly this reason.
    //
    // This is the "ask what else renders this component" rule in AGENTS.md: the module is ground
    // truth for the component the kit ships, and it says nothing about the ones it does not.
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
          display: "inline-flex", // blink: .root `display: flex` - as inline-flex, see above
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
            //
            // The 3px spread is the token's, and it is the ONE number in this file repeated by
            // hand in eleven places - the kit reaches it through `var(--focus-ring)`, and a palette
            // entry cannot carry it because tokens.css builds the ring with `color-mix`, which
            // MUI's colorManipulator cannot parse (see the `color` block at the top). Change it in
            // tokens.css and here together, or the focus pairs go red on both counts at once.
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`,
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
          props: { variant: "contained", color: "primary" as const },
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
        // DERIVED, and flagged here rather than below the banner because it belongs beside the
        // variant it corrects. The kit has no SOLID semantic button - its `.destructive` is a
        // tinted fill, which is the `light` + error pairing below - so `color="error"` on a
        // contained Button has no twin to extract. Left unhandled it fell through to the rule above
        // and painted a destructive button INDIGO, which is worse than either honest answer.
        //
        // The tokens are the kit's own and are strong evidence of the intent: tokens.css ships
        // `--color-on-error`, `--color-on-warning`, `--color-on-success` and `--color-on-info`, a
        // set of foregrounds that only makes sense over solid semantic fills.
        {
          props: { variant: "contained" as const, color: "error" as const },
          style: ({ theme }) => ({
            background: theme.vars.palette.error.main,
            color: theme.vars.palette.error.contrastText,
            border: `1px solid ${theme.vars.palette.error.main}`,
            "&.Mui-disabled": {
              background: theme.vars.palette.error.main,
              color: theme.vars.palette.error.contrastText,
              borderColor: theme.vars.palette.error.main,
            },
          }),
        },
        {
          props: { variant: "contained" as const, color: "warning" as const },
          style: ({ theme }) => ({
            background: theme.vars.palette.warning.main,
            color: theme.vars.palette.warning.contrastText,
            border: `1px solid ${theme.vars.palette.warning.main}`,
            "&.Mui-disabled": {
              background: theme.vars.palette.warning.main,
              color: theme.vars.palette.warning.contrastText,
              borderColor: theme.vars.palette.warning.main,
            },
          }),
        },
        {
          props: { variant: "contained" as const, color: "success" as const },
          style: ({ theme }) => ({
            background: theme.vars.palette.success.main,
            color: theme.vars.palette.success.contrastText,
            border: `1px solid ${theme.vars.palette.success.main}`,
            "&.Mui-disabled": {
              background: theme.vars.palette.success.main,
              color: theme.vars.palette.success.contrastText,
              borderColor: theme.vars.palette.success.main,
            },
          }),
        },
        {
          props: { variant: "contained" as const, color: "info" as const },
          style: ({ theme }) => ({
            background: theme.vars.palette.info.main,
            color: theme.vars.palette.info.contrastText,
            border: `1px solid ${theme.vars.palette.info.main}`,
            "&.Mui-disabled": {
              background: theme.vars.palette.info.main,
              color: theme.vars.palette.info.contrastText,
              borderColor: theme.vars.palette.info.main,
            },
          }),
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
                boxShadow: `color-mix(in srgb, ${theme.vars.palette.error.main} 35%, transparent) 0px 0px 0px 3px`,
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
    // The hairline ring is an INSET BOX-SHADOW, not a border, and the kit's own comment says why: a
    // border would shift the box model, so the padding would stop being symmetric and the icon's
    // left gutter would no longer match the icon-to-text gap. Transcribed as the shadow it is.
    //
    // Each variant sets three things - a 10% background tint, a 25% cut of the accent for that ring
    // and `--alert-accent` (the AA text cut, used for the icon, title and body). `info` is the
    // exception: it has no separate text cut, so its accent IS the plain colour. That is the kit's
    // table, not a simplification.
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
        // mapped to the lucide icon the kit's own showcase pairs with it.
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
            // blink: .root `box-shadow: inset 0 0 0 1px var(--alert-border)`, border = the accent
            // at 25%. A full ring rather than the 3px left bar this used to be: an inset shadow
            // follows the 8px radius, so a one-sided one tapered off at both ends into a curved
            // sliver that no other primitive in the kit has.
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${theme.vars.palette.error.main} 25%, transparent)`,
            color: theme.vars.palette.errorText, // blink: --alert-accent = --color-error-text
            "& .MuiAlert-icon": { color: theme.vars.palette.errorText }, // blink: .icon
          }),
        },
        {
          props: { severity: "warning" },
          style: ({ theme }) => ({
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.warning.main} 10%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${theme.vars.palette.warning.main} 25%, transparent)`,
            color: theme.vars.palette.warningText,
            "& .MuiAlert-icon": { color: theme.vars.palette.warningText },
          }),
        },
        {
          props: { severity: "success" },
          style: ({ theme }) => ({
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.success.main} 10%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${theme.vars.palette.success.main} 25%, transparent)`,
            color: theme.vars.palette.successText,
            "& .MuiAlert-icon": { color: theme.vars.palette.successText },
          }),
        },
        {
          props: { severity: "info" },
          style: ({ theme }) => ({
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.info.main} 10%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${theme.vars.palette.info.main} 25%, transparent)`,
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
      // blink: Badge/index.tsx renders `<XIcon size={12} />` inside its delete button. MUI's own
      // glyph is a filled circle-X from the Material set, which is not in the kit's icon language
      // at all - the same swap the Select and Combobox blocks make for their chevron and clear.
      defaultProps: {
        deleteIcon: createElement(XIcon, { size: 12 }),
      },
      styleOverrides: {
        root: ({ theme }) => ({
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
          // blink: `.delete` - a 16px round button holding a 12px `x` at 60% of the badge's own
          // ink, whose hover is a 16% tint of that same ink. The kit spaces it from the label with
          // the root's `gap: var(--space-1)` (set above) and then pulls it 4px back into the root's
          // padding, so a removable badge is not wider on the right than a plain one.
          //
          // MUI's default is a 22px filled `CancelIcon` at `margin: 0 5px 0 -6px`. That negative
          // LEFT margin is sized for Material's chip, where the LABEL carries 12px of padding for
          // it to eat into - and the label slot below deliberately moves that padding to the root,
          // exactly as the kit does. With nothing left to eat the icon reaches back OVER the text:
          // measured, its left edge landed 2px inside the label's right edge and the 22px glyph
          // overflowed a 28px chip's box.
          //
          // Aimed from the ROOT rather than written in the `deleteIcon` slot, and that is the part
          // easy to get wrong: MUI compiles that slot as `.root .MuiChip-deleteIcon`, so an `&&`
          // inside it yields `.root .deleteIcon.root .deleteIcon` - an element that is both the
          // icon and its own chip, which matches nothing. `&&` on the root gives (0,3,0) and clears
          // both MUI's base rule and its per-colour ones (`deleteIconColorPrimary` and friends),
          // which sit at (0,2,0).
          "&& .MuiChip-deleteIcon": {
            width: 16, // blink: .delete `width: 16px`
            height: 16, // blink: .delete `height: 16px`
            // The kit's `.delete` is a 16px BUTTON wrapping a 12px `<XIcon size={12} />`; MUI
            // renders no wrapper, so its deleteIcon element is both. The two sizes are reconciled
            // with a 2px pad on a border-box element: the box stays 16 (which is what the hover
            // tint and the -4px pull are measured against) while the svg's viewport - and so the
            // glyph - is the kit's 12. Without it the `size: 12` below is overridden by the width
            // above and the X is drawn at 16: measured, 43 pixels at Δ79 on a matching box.
            boxSizing: "border-box",
            flex: "none", // blink: .delete `flex: none`
            margin: "0 -4px 0 0", // blink: .delete `margin-right: -4px`
            padding: 2, // see above - the kit's 16px button around a 12px glyph, in one element
            border: 0, // blink: .delete `border: 0`
            borderRadius: 999, // blink: .delete `border-radius: 999px`
            background: "transparent", // blink: .delete `background: transparent`
            color: "currentColor", // blink: .delete `color: currentColor`
            opacity: 0.6, // blink: .delete `opacity: 0.6`
            "&:hover": {
              color: "currentColor",
              opacity: 1, // blink: .delete:hover `opacity: 1`
              background: "color-mix(in srgb, currentColor 16%, transparent)", // blink: .delete:hover
            },
            // blink: .delete:focus-visible - the kit's ring, and the opacity goes to full with it.
            // MUI puts no focus style on this element at all, so without this a keyboard user gets
            // nothing; the kit's own button is `tabIndex={-1}`, but MUI's is focusable.
            "&:focus-visible": {
              outline: "none",
              opacity: 1,
              boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`,
            },
          },
        }),
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

    // ---- Paper ----
    //
    // Ground truth: the same Card.module.css the Card block below extracts, because a bare
    // <Paper> is the kit's plain surface and the kit has exactly one of those: `--color-surface`
    // at `--radius-3`, flat. The kit has no elevation ladder at all - its ONLY shadows are
    // `--shadow-popover` on overlays and `--shadow-card` on the ToggleGroup strip - so a Paper
    // left at Material's elevation-1 was the one surface in a themed app still wearing another
    // design system's chrome (measured: a chart panel with a 4px radius and the stock
    // 0 2px 1px -1px shadow beside flat 8px-radius Cards).
    //
    // Deliberately NOT here, in each case because of what else Paper is:
    //   - `boxShadow: "none"` on the root. Menu, Popover, Drawer, Snackbar and Autocomplete all
    //     render Paper and each RESTATES `--shadow-popover` in its own block; an unscoped kill
    //     here would tie with every one of them at equal specificity and win or lose by sheet
    //     order. `elevation: 0` as a DEFAULT gets the bare case without touching any component
    //     that passes its own elevation - which is every overlay, via its own defaultProps.
    //   - a background restatement. MUI's Paper already paints `background.paper`, which IS the
    //     kit's surface token; writing it again asserts nothing and is the MuiBackdrop mistake.
    //
    // `rounded` at 8 reaches every Paper that has not opted out via `square`, including the
    // overlay papers - and every themed paper slot states the same 8, so the tie is value-equal
    // and cascade order cannot matter.
    MuiPaper: {
      defaultProps: { elevation: 0 }, // blink: Card .root - the kit's surface is flat
      styleOverrides: {
        root: {
          backgroundImage: "none", // MUI tints elevated papers in dark schemes; the kit never does
        },
        rounded: { borderRadius: 8 }, // blink: Card .root `border-radius: var(--radius-3)`
      },
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
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`,
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
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`, // blink: .root:focus-visible
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
          // The kit ships ONE switch - Switch.module.css carries no size axis - so the dimensions
          // above are the whole story and MUI's second size has to come out as the same control.
          // It did not: MUI's `sizeSmall` variant re-sizes the THUMB and the switchBase padding
          // through DESCENDANT selectors, which outrank the `thumb`/`switchBase` slot overrides
          // below (two classes against one), while leaving root and track to the rules here. The
          // halves then disagree - measured, a 16px knob at a 4px inset inside this 20px track,
          // sitting flush to the track's bottom edge and, once checked, its right edge too.
          // 956 differing pixels at Δ176.
          //
          // Scoped through `.MuiSwitch-sizeSmall` rather than declared as a `props: { size }`
          // variant, and the difference matters: the extra class puts this at (0,3,0), so it beats
          // MUI's own variant on SPECIFICITY rather than on which rule Emotion inserts last.
          "&.MuiSwitch-sizeSmall": {
            "& .MuiSwitch-thumb": { width: 18, height: 18 }, // blink: .root::after `width/height: 18px`
            "& .MuiSwitch-switchBase": {
              padding: 1, // blink: .root::after `top: 1px; left: 1px`
              // Restated rather than inherited: MUI's small variant happens to say the same 16px,
              // so without this the travel would be right by coincidence, not by the kit's value.
              "&.Mui-checked": { transform: "translateX(16px)" }, // blink: .root:checked::after
            },
          },
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
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`,
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
    // at `--radius-2` - wrapping a borderless <input>. That is MUI's OUTLINED input. The app's theme
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
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`,
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.vars.palette.error.main, // blink: .root.error `border-color: var(--color-error)`
            borderWidth: 1,
          },
          "&.Mui-error.Mui-focused": {
            // blink: .root.error:has(.input:focus) `box-shadow: var(--focus-ring-destructive)`
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.error.main} 35%, transparent) 0px 0px 0px 3px`,
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
        // With the label no longer floating (see MuiInputLabel), the notch it used to cut has to
        // close, or every field keeps a gap in its top border with nothing sitting in it.
        //
        // Pinned to the width MUI itself uses for the un-notched state rather than removed: a
        // <fieldset> draws its top border through the MIDDLE of its legend, so a legend with no
        // height moves the whole border up 5px (MUI insets this outline `top: -5px` and gives the
        // legend an 11px line box precisely so the line lands back on the control's edge). Keep the
        // height, take the width.
        notchedOutline: {
          "& legend": { maxWidth: "0.01px" },
        },
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
          // DERIVED - the scroll arrows. The kit's tabs never scroll, so these are new, and they are
          // styled from HERE rather than through `MuiTabScrollButton` because MUI v9 ships that
          // component with a `name: "MuiTabScrollButton"` at runtime but omits the key from its
          // `Components` type - a theme block would not typecheck. They are a child of this root, so
          // a descendant selector reaches them without a cast.
          //
          // An in-rail affordance rather than a standalone control, which is the call
          // MuiInputAdornment documents: quiet ink, no box of its own, sized to the rail.
          "& .MuiTabScrollButton-root": {
            width: 32, // derived: --control-h-sm, narrower than the 40px rail so it reads as inset
            color: theme.vars.palette.textMuted, // derived: the in-field affordance ink
            opacity: 1, // MUI fades the whole button to 0.8; the kit states its ink outright
            "&.Mui-disabled": { opacity: 0.4 }, // derived: the disabled treatment is opacity, as on Button
            "&:hover": { color: theme.vars.palette.text.primary },
          },
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
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`,
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
          display: "inline-flex", // blink: .option `display: flex` - as inline-flex, see MuiButton

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
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`, // blink: --focus-ring
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
    // `slots={{ transition: PopTransition }}` - a custom entrance that fades and scales from 0.95,
    // replacing MUI's Grow. That is a COMPONENT, not a style: reproducing it means shipping a
    // react-transition-group wrapper, and this file's contract is that it imports only
    // @mui/material, lucide-react and React. The SETTLED overlay - the only thing a consumer sees
    // once it has opened, and the only thing the harness captures - is identical either way, so what
    // is lost is the SHAPE of the entrance. An app that wants it passes the same `slots` prop the
    // kit does.
    //
    // Its TIMING is carried, because timing is a prop. `transitionDuration` below is the kit's
    // `{ enter: 150, exit: 0 }`: an overlay opening is new information arriving and is worth 150ms
    // of it, and an overlay closing is the user having already decided - a fade held over their next
    // click reads as lag. MUI's own default here is `"auto"`, which computes a duration from the
    // overlay's height and animates the close as slowly as the open.
    //
    // Set on MuiPopover and MuiMenu rather than once: a Popover does NOT inherit Menu's defaults,
    // and Select renders a Menu, so the two entries between them cover Popover, Menu, Select and
    // Autocomplete's popup. Dialog is deliberately not among them - it keeps a symmetric 150ms,
    // as the kit's own Dialog does, because a modal vanishing out from under a click is not the
    // same reassurance as a menu doing it.
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
        // blink: Popover/index.tsx `transitionDuration = { enter: 150, exit: 0 }`
        transitionDuration: { enter: 150, exit: 0 },
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
      defaultProps: {
        // blink: Menu/index.tsx `transitionDuration = { enter: 150, exit: 0 }`
        transitionDuration: { enter: 150, exit: 0 },
      },
      styleOverrides: {
        paper: ({ theme }) => ({
          // blink: .paper `padding: var(--space-1)`. The kit's comment is worth keeping: an even
          // gutter on all sides is what lets a rounded item highlight sit INSET from the paper
          // edge, so a menu reads as a card of pills rather than a bordered list. One step is
          // enough for that; two made a short menu mostly gutter.
          padding: 4,
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
    // below. Where it SITS is decided at the MuiInputLabel block below rather than left to MUI,
    // whose offsets are measured against a 56px control this design system does not have.
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
          // blink: FormField.module.css renders `{label}{required && <span class="required">*</span>}`
          // and spaces that span with `margin-left: var(--space-1)`. So 4px IS the kit's step for
          // content appended to a label - it just reaches it with a per-child margin rather than a
          // gap, because a plain <label> is not a flex row.
          //
          // Stated as a GAP here so it covers every appended child rather than only the asterisk.
          // A consumer writing an "(optional)" marker beside the text gets the kit's own 4px; with
          // the margin alone they got nothing, which is what the showcase's Label row shows under a
          // theme that does not do this. The asterisk's own margin is dropped below so the two
          // mechanisms cannot stack - verified by the formfield-error pair, which stays at zero.
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
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
        asterisk: {
          // MUI's asterisk is the two characters `\u2009*` - a THIN SPACE and a star - where the
          // kit's is a bare `*` spaced by 4px. The thin space is MARKUP, so it cannot be styled
          // away; the span is taken out of flow entirely and the star redrawn from the label's own
          // `::after`, which the `gap` above then spaces exactly like any other appended child.
          //
          // An earlier attempt collapsed the span with `font-size: 0` and drew the star from the
          // SPAN's `::after`. It measured zero on the pixel diff and the font-metrics sweep caught
          // it: a real element reporting a 0px font-size and a 0px line-height against the kit's
          // 15px/21px. A pseudo-element carries no such claim, because it is not an element.
          display: "none",
        },
      },
      variants: [
        {
          // blink: `.required { color: var(--color-error); margin-left: var(--space-1) }`, drawn
          // here rather than on the asterisk span - see the note above. `Mui-required` is MUI's own
          // class for a required label, so this keys off a positive class rather than a negation.
          props: {},
          style: ({ theme }) => ({
            "&.Mui-required::after": {
              content: '"*"',
              color: theme.vars.palette.error.main,
            },
          }),
        },
      ],
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

    // ---- IconButton ----
    //
    // Ground truth: reference/primitives/Button/Button.module.css - `.root`, `.ghost`, `.iconOnly`
    // and the size ladder, which is the composition the kit itself uses for an icon-only action
    // (`<Button variant="ghost" iconOnly>`). MUI's IconButton is that same button, so the rules are
    // the Button block's, restated for a component that does not share its class.
    MuiIconButton: {
      defaultProps: { disableRipple: true }, // blink: Button/index.tsx `disableRipple`
      styleOverrides: {
        root: ({ theme }) => ({
          // blink: .root `display: flex`, taken as INLINE-flex - see the note above MuiButton.
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8, // blink: .root `border-radius: var(--radius-3)`
          padding: 0, // blink: .iconOnly `padding: 0`
          aspectRatio: "1", // blink: .iconOnly `aspect-ratio: 1`
          color: theme.vars.palette.primary.main, // blink: .ghost `color: var(--color-primary)`
          background: "transparent", // blink: .ghost `background: transparent`
          border: "1px solid transparent", // blink: .ghost `border: 1px solid transparent`
          transition: "background-color 0.2s, border-color 0.2s, color 0.2s, opacity 0.2s", // blink: .root
          // blink: .md `height`/`min-width: var(--control-h-md)`, the kit's default size. On the
          // root rather than a `size: "medium"` variant, because MUI leaves an unstated `size`
          // undefined - the same trap the Input's height documents.
          height: 36,
          width: 36,
          "&:hover": {
            // blink: .ghost:hover `background: color-mix(in srgb, var(--color-primary) 15%, transparent)`
            background: `color-mix(in srgb, ${theme.vars.palette.primary.main} 15%, transparent)`,
          },
          "&.Mui-disabled": {
            opacity: 0.6, // blink: .root:disabled `opacity: 0.6`
            color: theme.vars.palette.primary.main, // the kit dims rather than greys - see the Button block
          },
          "&.Mui-focusVisible": {
            outline: "2px solid transparent", // blink: .root:focus-visible
            outlineOffset: 2,
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`, // blink: --focus-ring
          },
        }),
      },
      variants: [
        {
          // blink: .sm `height`/`min-width: var(--control-h-sm)` AND `border-radius: var(--radius-2)`.
          // The radius is easy to miss and was: the kit's Button ladder changes CORNER as well as
          // size - xs and sm at --radius-2 (6px), md and lg inheriting .root's --radius-3 (8px) -
          // so a small icon button carried the root's 8px against the kit's 6px.
          //
          // It survived because a ghost button paints nothing at rest: the corners only exist once
          // the 15% hover fill lands, and the iconbutton-sm pair had no hover state. Even hovered it
          // measured 20px at Δ23, inside both caps - so this is a ground-truth fix, not a failing
          // pair. The pair now carries `hover` so the value is actually watched.
          props: { size: "small" },
          style: { height: 32, width: 32, borderRadius: 6 },
        },
        // .lg states no radius, so it keeps .root's --radius-3 - which is what the root above sets.
        { props: { size: "large" }, style: { height: 40, width: 40 } }, // blink: .lg `var(--control-h-lg)`
      ],
    },

    // ---- InputAdornment ----
    //
    // The kit has no adornment element: its Input `.root` is a flex row with `gap: var(--space-2)`
    // and anything beside the control is a plain child of it. So the whole of this block is taking
    // MUI's own spacing back off and letting that gap do the work, and colouring the adornment with
    // the same muted token the kit gives its placeholder and its chevron.
    MuiInputAdornment: {
      styleOverrides: {
        root: ({ theme }) => ({
          margin: 0, // MUI ships 8px of side margin, which stacks with the root's own gap
          height: "auto",
          color: theme.vars.palette.textMuted, // blink: Select .chevron / Input ::placeholder
          "& .MuiTypography-root": { color: "inherit", fontSize: "inherit" },
          // An IconButton inside an adornment is an in-field affordance (a clear button, a
          // visibility toggle), and without this rule it takes the IconButton block's 36px ghost
          // button - the full height of the field it sits in, the same defect the Autocomplete
          // indicators had. Same values as that fix, for the same reason: the kit's xs step at
          // --radius-2 with the chevron's muted ink, and the icon at the chevron's own 16px. No
          // `&&` needed here, unlike the Autocomplete slots: this is a descendant selector, so it
          // is two classes deep and outranks the IconButton root's single class on its own.
          "& .MuiIconButton-root": {
            width: 24,
            height: 24, // blink: --control-h-xs
            borderRadius: 6, // blink: --radius-2
            color: theme.vars.palette.textMuted, // blink: Select .chevron ink
            "& .MuiSvgIcon-root": { fontSize: 14 }, // blink: Combobox clear `XIcon size={14}`
            "&:hover": {
              color: theme.vars.palette.primary.main,
              background: `color-mix(in srgb, ${theme.vars.palette.primary.main} 15%, transparent)`,
            },
          },
        }),
      },
    },

    // ---- CircularProgress ----
    //
    // Ground truth: reference/primitives/Spinner/Spinner.module.css and index.tsx.
    //
    // The kit's Spinner is not MUI's, and the difference is the ANIMATION rather than the paint:
    // it rotates a FIXED 25% arc at 0.8s linear over a 20%-opacity track ring, while MUI grows and
    // shrinks its arc through a second keyframe animation and paints no track at all. Making a
    // themed MUI spinner behave like the kit's is therefore a real change to how it animates, and
    // it is what a drop-in has to do - a consumer who writes `<CircularProgress />` should get the
    // kit's spinner, not a Material one wearing the kit's colours.
    //
    //   - `thickness: 5.5` is the kit's stroke as MUI expresses it: 12.5% of the diameter (2.5px at
    //     20px, 3px at 24px), against a 44-unit viewBox.
    //   - the arc is pinned to a quarter turn with a round cap and rotated to start at twelve
    //     o'clock, which is `strokeDasharray` + `rotate(-90)` in the kit's SVG.
    //   - the track is a ring drawn with a radial-gradient on a pseudo-element, because MUI's
    //     CircularProgress renders ONE circle and gives a theme no second element to paint.
    //
    // SCOPE: the kit's stroke ladder is not proportional - `px <= 14 ? 2 : px <= 20 ? 2.5 : 3`, so
    // 16.7% of the diameter at xs, 15.6% at sm and 12.5% at md and lg. MUI's `thickness` is one
    // number against a fixed viewBox, so only one of those can live in a theme; it carries the
    // 12.5% the default size uses. A 12px or 16px spinner states its own `thickness` at the call
    // site (7.33 and 6.875).
    MuiCircularProgress: {
      defaultProps: {
        thickness: 5.5, // blink: 44 * 12.5%, the kit's stroke ratio for sm/md/lg
        size: 20, // blink: Spinner `SIZE_PX.md`, the kit's default - MUI's is 40
        // blink: .track - the kit draws a second circle behind its arc. MUI v9 has a real slot for
        // exactly that, off by default, so this is the whole of the track rather than a derived
        // stand-in: same centre, same radius, same stroke width, `stroke: currentColor`.
        enableTrackSlot: true,
        // blink: the kit's arc never changes LENGTH - the motion is all rotation. MUI's default
        // indeterminate spinner animates its dash as well, and this is the prop that turns that
        // second animation off. Without it the arc grows and shrinks under a fixed-length dash.
        disableShrink: true,
      },
      styleOverrides: {
        root: {
          // blink: .root `color: inherit` - the kit's spinner takes its parent's ink. NOT stated on
          // the root: unconditional there it also beat every explicit `color` prop, so a
          // `<CircularProgress color="error">` - a determinate health ring, a destructive loading
          // state - silently painted text-colour. Measured in a consuming app: score rings carrying
          // colorError/colorSuccess classes all rendered #262626.
          //
          // Keyed on the colorPrimary CLASS instead, because MUI resolves an UNSTATED color prop to
          // "primary" - the default and the explicit value share one class, so "the caller chose
          // nothing" is not distinguishable from "the caller chose primary". The trade, stated
          // rather than hidden: an explicit color="primary" inherits too, while the semantic
          // colours - the ones that carry information - keep their palette value.
          // ...and scoped to the INDETERMINATE variant, because the determinate one is a different
          // kit component with a colour of its own - see the ProgressRing variant below.
          "&.MuiCircularProgress-indeterminate": {
            "&.MuiCircularProgress-colorPrimary, &.MuiCircularProgress-colorInherit": {
              color: "inherit",
            },
          },
          // blink: .ring `animation: spin 0.8s linear infinite`. MUI's own rotation is 1.4s with an
          // eased curve.
          animationDuration: "0.8s",
          animationTimingFunction: "linear",
        },
        track: {
          // blink: Spinner .track `opacity: 0.2` - MUI's is `action.activatedOpacity`. Scoped to
          // the indeterminate variant: the ProgressRing's track is a TOKEN, not a cut of the ink.
          ".MuiCircularProgress-indeterminate &": { opacity: 0.2 },
        },
        circle: ({ ownerState }) => ({
          strokeLinecap: "round" as const, // blink: .head `stroke-linecap: round`
          // Scoped to the INDETERMINATE root, and it has to be: MUI rotates the root by -90deg for
          // the determinate variant already, so an unscoped rotation here would take a determinate
          // ring a quarter turn past where its value says.
          ".MuiCircularProgress-indeterminate &": {
            // blink: Spinner draws `strokeDasharray={dash} {circumference - dash}` with
            // `dash = circumference * 0.25`. In MUI's 44-unit viewBox at the 5.5 thickness above,
            // r is 19.25 and the circumference 120.95 - so a quarter is 30.24. MUI's own value is
            // `80px, 200px`, which is most of the ring.
            // blink: Spinner draws `strokeDasharray={dash} {circumference - dash}` with
            // `dash = circumference * 0.25` - a quarter TURN, at every size.
            //
            // COMPUTED from thickness rather than written as a literal, because MUI derives the
            // circle's radius from it (`r = (44 - thickness) / 2`), so the path length is
            // `PI * (44 - thickness)` and a fixed pair of numbers is only a quarter for the one
            // thickness it was measured at. It used to be `30.24 90.71`, the 5.5 case - under which
            // the two sizes that state their own thickness drew 26.3% and 25.9% of the ring instead
            // of 25%. Measured on a 12px spinner as 2 pixels at Δ111, small only because a 12px arc
            // has few pixels left to be wrong in.
            //
            // Read off ownerState so it is right for ANY thickness a caller passes, rather than for
            // the two the kit happens to use - keying variants on an exact float would have missed
            // a caller who wrote 7.33 instead of 7.3333.
            strokeDasharray: dashForThickness(ownerState?.thickness),
            strokeDashoffset: 0,
            // blink: the kit's arc carries `transform="rotate(-90 cx cy)"`, so it starts at twelve
            // o'clock; MUI's dash starts at three.
            transform: "rotate(-90deg)",
            // `transform-box: fill-box` is what makes `center` mean the circle's own centre. MUI's
            // viewBox is `22 22 44 44` with the circle at (44, 44), so the default reference box
            // put the origin at (22, 22) and swung the arc a quarter turn around the wrong point -
            // 202 pixels at Δ162, all of them in the quadrant the arc had moved out of.
            transformBox: "fill-box",
            transformOrigin: "center",
          },
        }),
      },
      variants: [
        {
          // ---- ProgressRing - the kit's DETERMINATE ring, not the Spinner ----
          //
          // Ground truth: reference/primitives/ProgressRing/{index.tsx,ProgressRing.module.css}.
          //
          // A DIFFERENT kit component reached through the same MUI one, which is exactly the trap
          // AGENTS.md names: every Spinner value above was written unscoped and therefore also
          // styled this. Left that way a determinate ring came out at the Spinner's 20px in the
          // Spinner's ink - 2943 differing pixels at Δ202 against the kit's 64px primary ring, and
          // still 2862 at Δ202 once the caller stated the size, because the stroke was wrong too.
          //
          // SCOPE: `size` and `thickness`, both of which a determinate ring states at the call
          // site - `size={64} thickness={3.52}` for the kit's md, 48 and 80 for sm and lg. Neither
          // can live here. Both are PROPS rather than styles, so defaultProps cannot vary them per
          // variant and the ones there are the Spinner's; and `thickness` in particular must not be
          // reached through CSS even though `stroke-width` looks like the obvious lever, because
          // MUI derives the circle's `r` AND its dash array from the PROP - overriding only the
          // paint leaves a correctly-thick ring on a circle 1.44px too small, which measured 1355
          // differing pixels at Δ202 where the untouched 5.5 measured 2943. 3.52 is the kit's
          // `stroke = px * 0.08` expressed in the 44-unit viewBox, which scales with `size`, so one
          // number serves every step; its 3px floor only bites below 37.5px, under the 48px sm.
          //
          // The centred value label has no MUI slot at all and stays a call-site concern too.
          props: { variant: "determinate" },
          style: ({ theme }) => ({
            // blink: .track `stroke: var(--color-border)` - a token of its OWN, not the 20% cut of
            // the ink that the Spinner's track is. That rule is scoped away from here for this.
            "& .MuiCircularProgress-track": { stroke: theme.vars.palette.border, opacity: 1 },
            // blink: `.default .progress { stroke: var(--color-primary) }`. Keyed on colorPrimary
            // for the same reason the root's `color: inherit` is: MUI resolves an unstated `color`
            // to "primary", and the kit's success/warning/error rings ARE MUI's palette colours,
            // so those have to keep theirs.
            "&.MuiCircularProgress-colorPrimary": { color: theme.vars.palette.primary.main },
          }),
        },
      ],
    },

    // =====================================================================================
    // THE DERIVED TIER - everything below this banner
    // =====================================================================================
    //
    // EXTRACTION STOPS HERE. Every block above is transcribed from a Pulse Kit primitive that
    // exists; every block below is a component MUI ships and the kit does NOT, built from the kit's
    // own TOKENS and from the geometry its real components use.
    //
    // Why build them at all: left unthemed they render as stock Material - a blue, Roboto-metric
    // control sitting beside the themed ones - which for a drop-in theme is worse than an imperfect
    // derivation. The showcase makes that visible, one row per component across four columns.
    //
    // What this tier does NOT buy is a pixel guarantee, and the harness enforces the weaker claim
    // rather than trusting anyone to remember it: every pair below omits `ref`, so `PairRow`
    // publishes `data-states=""` and the pixel suite structurally cannot be asked to diff something
    // with no reference. preflight still covers them in full - it compares the MUI cell with and
    // without the kit's stylesheet, which needs no reference, and that is the check that catches a
    // derived block leaning on someone else's reset.
    //
    // Treat a value here as a CONSIDERED CHOICE, not as ground truth. If the kit ever ships the
    // real component, re-extract it and move the block above the line.

    // Surfaces that are simply "a kit panel": the app bar, the drawer sheet, the snackbar.
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.vars.palette.surface, // --color-surface
          color: theme.vars.palette.text.primary, // --color-text-default
          // The kit's only horizontal rule between a header and its content is `--color-border-
          // strong`, which is what the Table container and the Tabs bar both use.
          borderBottom: `1px solid ${theme.vars.palette.borderStrong}`,
          boxShadow: "none", // the kit has no elevated chrome anywhere
        }),
      },
    },
    MuiToolbar: {
      styleOverrides: {
        // Scoped per density on purpose. An unscoped height here would also reach TablePagination,
        // which renders its own Toolbar - the exact mistake AGENTS.md records against MuiToolbar.
        regular: { minHeight: 56, paddingLeft: 16, paddingRight: 16 }, // --space-4
        dense: { minHeight: 40, paddingLeft: 12, paddingRight: 12 }, // --space-3
      },
    },
    MuiDrawer: {
      styleOverrides: {
        // Keyed off the positive anchor classes rather than one blanket rule on the paper: MUI's
        // Drawer has four anchors and a width set for the right-hand one turns a top sheet into a
        // 384px box. AGENTS.md has that exact bug on record.
        paper: ({ theme }) => ({
          background: theme.vars.palette.surface, // --color-surface
          color: theme.vars.palette.text.primary,
          backgroundImage: "none", // MUI tints an elevated paper; the kit's surfaces are flat
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", // --shadow-popover
        }),
        // The four anchors, keyed by the class MUI puts on the ROOT rather than one blanket rule
        // on the paper - a border set for the right-hand anchor alone turns a top sheet into a
        // wrong-edged box, and AGENTS.md records exactly that bug (a 384px-wide top sheet).
        anchorLeft: ({ theme }) => ({
          "& .MuiDrawer-paper": { borderRight: `1px solid ${theme.vars.palette.borderStrong}` },
        }),
        anchorRight: ({ theme }) => ({
          "& .MuiDrawer-paper": { borderLeft: `1px solid ${theme.vars.palette.borderStrong}` },
        }),
        anchorTop: ({ theme }) => ({
          "& .MuiDrawer-paper": { borderBottom: `1px solid ${theme.vars.palette.borderStrong}` },
        }),
        anchorBottom: ({ theme }) => ({
          "& .MuiDrawer-paper": { borderTop: `1px solid ${theme.vars.palette.borderStrong}` },
        }),
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          // The kit's one always-dark surface is its tooltip, and a snackbar is the same idea - a
          // transient overlay that has to read against any page - so it takes the same two tokens.
          background: theme.vars.palette.tooltipBg, // --color-tooltip-bg
          color: theme.vars.palette.tooltipText, // --color-tooltip-text
          borderRadius: 6, // --radius-2, as the tooltip uses
          fontSize: 15, // --text-md
          lineHeight: 1.4,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", // --shadow-popover
          padding: "8px 12px", // the tooltip's own padding
        }),
      },
    },
    // NO MuiBackdrop BLOCK, and that is the finding rather than an omission.
    //
    // The kit's Dialog styles no scrim, so there is nothing to extract - and MUI's own default is
    // already `rgba(0, 0, 0, 0.5)`, which is what the Dialog pair above measures at zero. Writing
    // that same value into `MuiBackdrop.root` therefore changes nothing a user sees and breaks
    // something they do: Menu, Select and Popover render an INVISIBLE backdrop so a click outside
    // closes them without dimming the page, and `.MuiBackdrop-invisible` is only one class - a
    // plain `root` override lands at the same specificity and wins by source order.
    //
    // Measured: the menu pair went from 0 to 230 differing pixels at Δ119 open, and 12337 at Δ128
    // anchored, with the whole top row of the capture reading 116,117,118 - a half-black scrim
    // composited behind the overlay's own corners. AGENTS.md lists MuiBackdrop by name as a
    // component whose overrides reach further than they look; this is that, measured.

    // Lists. MUI reuses MuiList inside Menu, Select and Autocomplete, so the padding below is
    // deliberately NOT on MuiList - the Menu block above already sets its own, and a blanket rule
    // here would reach all three.
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6, // --radius-2, as the kit's menu items use
          minHeight: 32, // --control-h-sm
          padding: 8, // --space-2
          gap: 8,
          fontSize: 15, // --text-md
          "&:hover": { backgroundColor: theme.vars.palette.surfaceMuted },
          "&.Mui-selected, &.Mui-selected:hover": {
            // The 10% brand tint the kit uses for a selected table row.
            backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 10%, transparent)`,
          },
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.textMuted, // the kit's icon ink everywhere else
          minWidth: 0,
          marginRight: 8, // --space-2, the gap the kit puts between an icon and its label
        }),
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: { fontSize: 15, lineHeight: 1.4 }, // --text-md
        secondary: ({ theme }) => ({
          fontSize: 13, // --text-xs, as the kit's helper text
          lineHeight: 1.4,
          color: theme.vars.palette.textMuted,
        }),
      },
    },
    MuiListItemSecondaryAction: {
      styleOverrides: { root: { right: 8 } }, // --space-2
    },

    // Progress and placeholders: flat token fills, no Material gradients or pulses beyond MUI's.
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          height: 8,
          borderRadius: 999, // the kit's pill radius, as on its Switch track
          backgroundColor: theme.vars.palette.surfaceMuted,
        }),
        bar: ({ theme }) => ({
          borderRadius: 999,
          backgroundColor: theme.vars.palette.primary.main,
        }),
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: ({ theme }) => ({ backgroundColor: theme.vars.palette.surfaceMuted }),
        rounded: { borderRadius: 6 }, // --radius-2, matching baselineTheme's own choice
      },
    },

    // Controls MUI has and the kit does not, built from the kit's fill/line/brand triple.
    MuiSlider: {
      styleOverrides: {
        rail: ({ theme }) => ({
          height: 8,
          borderRadius: 999,
          backgroundColor: theme.vars.palette.surfaceMuted,
          opacity: 1, // MUI dims its rail to 0.38; the kit states its greys outright
        }),
        track: ({ theme }) => ({
          height: 8,
          border: 0,
          borderRadius: 999,
          backgroundColor: theme.vars.palette.primary.main,
        }),
        thumb: ({ theme }) => ({
          width: 16,
          height: 16,
          backgroundColor: theme.vars.palette.surface,
          border: `1px solid ${theme.vars.palette.borderStrong}`,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)", // --shadow-card
          "&:hover, &.Mui-focusVisible": {
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`,
          },
        }),
      },
    },
    MuiRating: {
      styleOverrides: {
        // NOT a font-size on the root: that pins every size to the covered one, which AGENTS.md
        // records as a real bug on this very component.
        iconFilled: ({ theme }) => ({ color: theme.vars.palette.warning.main }),
        iconEmpty: ({ theme }) => ({ color: theme.vars.palette.borderStrong }),
        iconHover: ({ theme }) => ({ color: theme.vars.palette.warning.main }),
      },
    },
    MuiFab: {
      styleOverrides: {
        // Keyed off the POSITIVE shape class. AGENTS.md records two separate bugs from doing this
        // by negation - `variant="extended"` squashed to a circle, and every size pinned to 56px.
        circular: ({ theme }) => ({
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", // --shadow-popover
          backgroundColor: theme.vars.palette.primary.main,
          color: theme.vars.palette.primary.contrastText,
          "&:hover": { backgroundColor: theme.vars.palette.primary.dark },
        }),
        extended: ({ theme }) => ({
          borderRadius: 999,
          fontWeight: 600, // the kit's button weight
          textTransform: "none" as const,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          backgroundColor: theme.vars.palette.primary.main,
          color: theme.vars.palette.primary.contrastText,
          "&:hover": { backgroundColor: theme.vars.palette.primary.dark },
        }),
      },
    },
    MuiSpeedDialAction: {
      styleOverrides: {
        fab: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surface,
          color: theme.vars.palette.text.primary,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)", // --shadow-card
          "&:hover": { backgroundColor: theme.vars.palette.surfaceMuted },
        }),
        staticTooltipLabel: ({ theme }) => ({
          background: theme.vars.palette.tooltipBg,
          color: theme.vars.palette.tooltipText,
          borderRadius: 6,
          fontSize: 15,
          padding: "8px 12px",
          whiteSpace: "nowrap" as const,
        }),
      },
    },

    // Navigation and pagination: the kit's brand-on-muted selection, at its own radius.
    MuiBottomNavigation: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: theme.vars.palette.surface,
          borderTop: `1px solid ${theme.vars.palette.borderStrong}`,
        }),
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.textMuted,
          fontSize: 13, // --text-xs
          // A <button> does not inherit font-family, and MUI states none on this root - so without
          // these two the control renders in the UA's own 13px Arial at `line-height: normal` the
          // moment the kit's reset is not on the page. preflight caught exactly that: 184 pixels at
          // Δ165, `13px Arial` against `13px/19.5px "Source Sans Pro"`. AGENTS.md notes this same
          // component has now been caught by this same check on three separate themes.
          fontFamily: "inherit",
          lineHeight: 1.5, // reset.css `body { line-height: 1.5 }`, which the kit's page inherits
          "&.Mui-selected": { color: theme.vars.palette.primary.main },
        }),
        // MUI grows a selected label; the kit's type scale has no step between these, so it stays.
        label: { fontSize: 13, lineHeight: 1.5, "&.Mui-selected": { fontSize: 13 } },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: ({ theme }) => ({ fontSize: 15, color: theme.vars.palette.textMuted }),
        separator: ({ theme }) => ({ color: theme.vars.palette.textSubtle, marginLeft: 8, marginRight: 8 }),
        li: ({ theme }) => ({ "& a": { color: theme.vars.palette.primary.main } }),
      },
    },
    // The size ladder is the kit's control ladder, and it is stated per size rather than pinned to
    // the covered one - the mistake AGENTS.md tabulates for MuiFab and MuiRating, which this block
    // had made too: `minWidth`/`height`/`fontSize` sat unscoped on the root, so `size="small"` and
    // `size="large"` rendered pixel-identical 32px items and MUI's own 26/32/40 ladder was dead.
    // Medium keeps --control-h-sm because that is what the covered pair was built against; small
    // and large take the steps either side of it, with the radius following the kit's own Button
    // (xs and sm at --radius-2, md and lg at --radius-3).
    MuiPaginationItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6, // --radius-2
          minWidth: 32, // --control-h-sm
          height: 32,
          fontSize: 14, // --text-sm
          fontWeight: 600, // the kit's control weight
          color: theme.vars.palette.textMuted,
          // MUI spaces pagination items with a per-item `margin: 0 3px` of its own, and the list
          // below already spaces them with `gap: 4` (--space-1). Both applied, so the real
          // separation was 10px, not the 4 the gap states - which pushed a 5-page control 37px
          // wider than it should be and wrapped its last arrow onto a second line inside a column
          // narrow enough to matter. The gap is the kit's spacing; the margin is Material's.
          margin: 0,
          // Every chevron the kit draws is 16px - Select, Accordion and Combobox all say
          // `ChevronDownIcon size={16}` - and MUI's ladder here is Material's instead: 18/20/22 by
          // size. Stated once on the root rather than per size, because the kit's number does not
          // vary with the control.
          //
          // It is also what keeps the sizes below env-independent. MUI pairs its own boxes with
          // those icons so tightly that two of the three OVERFLOW their content box - 18px of icon
          // in the 16px a 24px item leaves, 22px in the 20px a 40px one leaves - and an overflowing
          // flex item is then shrunk by whatever reset happens to be on the page. preflight caught
          // exactly that: the small item's chevron measured 16px with Tailwind and 18px without,
          // Δ76, reported as "the theme is leaning on Tailwind" because it was.
          "& .MuiPaginationItem-icon": { fontSize: 16 },
          "&:hover": { backgroundColor: theme.vars.palette.surfaceMuted },
          "&.Mui-selected": {
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            "&:hover": { backgroundColor: theme.vars.palette.primary.dark },
          },
        }),
      },
      variants: [
        {
          props: { size: "small" },
          style: {
            minWidth: 24, // --control-h-xs
            height: 24,
            fontSize: 13, // --text-xs
            borderRadius: 6, // --radius-2, the kit's Button .xs
          },
        },
        {
          props: { size: "large" },
          style: {
            minWidth: 40, // --control-h-lg
            height: 40,
            fontSize: 15, // --text-md
            borderRadius: 8, // --radius-3, the kit's Button .lg
          },
        },
      ],
    },
    MuiTablePagination: {
      styleOverrides: {
        // The TOOLBAR here is TablePagination's own, and the reason MuiToolbar above is scoped per
        // density rather than given a blanket height.
        toolbar: { minHeight: 48, paddingLeft: 12, paddingRight: 12 },
        selectLabel: ({ theme }) => ({ fontSize: 14, color: theme.vars.palette.textMuted }),
        displayedRows: ({ theme }) => ({ fontSize: 14, color: theme.vars.palette.textMuted }),
      },
    },

    // The stepper family. Each slot is keyed by orientation where MUI's own geometry differs, for
    // the reason AGENTS.md records: the horizontal connector's rule reached the vertical one and
    // turned a 1px indent into a 324px transparent box.
    MuiStepper: {
      styleOverrides: { root: { padding: 0 } },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.surfaceMuted,
          "& .MuiStepIcon-text": { fill: theme.vars.palette.textMuted, fontSize: 13, fontWeight: 600 },
          "&.Mui-active": {
            color: theme.vars.palette.primary.main,
            "& .MuiStepIcon-text": { fill: theme.vars.palette.primary.contrastText },
          },
          "&.Mui-completed": { color: theme.vars.palette.success.main },
        }),
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: ({ theme }) => ({
          fontSize: 15, // --text-md
          color: theme.vars.palette.textMuted,
          "&.Mui-active": { color: theme.vars.palette.text.primary, fontWeight: 600 },
          "&.Mui-completed": { color: theme.vars.palette.text.primary },
        }),
      },
    },
    MuiStepConnector: {
      styleOverrides: {
        line: ({ theme }) => ({ borderColor: theme.vars.palette.borderStrong }),
      },
    },

    // Image lists: a kit tile is a flat surface at the panel radius.
    MuiImageListItem: {
      styleOverrides: {
        root: { borderRadius: 8, overflow: "hidden" }, // --radius-3
      },
    },
    MuiImageListItemBar: {
      styleOverrides: {
        // Keyed per position rather than rounding "the bottom corners", which AGENTS.md records as
        // having squared off a `position="top"` bar over a rounded tile.
        positionBottom: { background: "rgba(0, 0, 0, 0.5)" },
        positionTop: { background: "rgba(0, 0, 0, 0.5)" },
        title: { fontSize: 14, fontWeight: 600 },
        subtitle: { fontSize: 13 },
      },
    },

    // Form plumbing MUI has and the kit does not put in its FormField.
    MuiFormControlLabel: {
      styleOverrides: {
        root: { marginLeft: 0, marginRight: 0, gap: 8 }, // --space-2, the kit's control/label gap
        label: ({ theme }) => ({
          fontSize: 15, // --text-md
          lineHeight: 1.4,
          color: theme.vars.palette.text.primary,
          "&.Mui-disabled": { color: theme.vars.palette.textSubtle },
        }),
      },
    },
    MuiFormGroup: {
      styleOverrides: { root: { gap: 8 } }, // --space-2
    },
    MuiAutocomplete: {
      // The kit's own icon-in-a-field is the Select chevron: lucide, 16px, muted ink. MUI's
      // defaults here are Material glyphs (a filled ArrowDropDown triangle and a 20px Clear) that
      // sit visibly outside the kit's icon language, so both are swapped for their lucide
      // equivalents at the chevron's own size.
      defaultProps: {
        popupIcon: createElement(ChevronDownIcon, { size: 16 }), // blink: Combobox .chevron `ChevronDownIcon size={16}`
        clearIcon: createElement(XIcon, { size: 14 }), // blink: Combobox clear `XIcon size={14}`
      },
      styleOverrides: {
        // blink: Input .root `padding: 0 var(--space-3)` plus the 1px the kit's border occupies,
        // restated here because MUI's Autocomplete REPLACES OutlinedInput's own padding with its
        // 9px tag layout and adds a 5px left pad on `.MuiAutocomplete-input`. That put a combobox's
        // text at 14px while every other field in the kit sits at 13 - a one-pixel step that shows
        // up whenever an Autocomplete and an Input share a row or a card.
        //
        // The SECOND half is a real bug rather than a pixel, and it is the one that made this
        // urgent: the MuiOutlinedInput block pins `height` on the root because the kit's Input is a
        // fixed-height flex row, while MUI's Autocomplete uses that SAME root as a WRAPPING
        // container for its tag chips. Both cannot be true. Measured on this theme with `multiple`:
        // a 28px chip plus its margins needs 34px inside a box whose content height is 36 - 18 = 18,
        // so the second tag rendered 54px down and hung 46px BELOW the field's own border, and a
        // third hung 88px out. The tags were floating outside the control entirely, not merely
        // clipped.
        //
        // The fix is the shape the root block already uses for `multiline`, which is the kit's
        // Textarea: swap the fixed height for a MIN height and let the content drive the rest.
        //   - 4px vertical padding, so a 28px tag lands exactly inside a 36px field (and a 22px tag
        //     inside a 32px one)
        //   - the tag's own margin goes horizontal-only at the design's 6px badge-row gap, with
        //     `rowGap` taking over when tags wrap, so rows do not collapse onto each other
        //   - `.MuiAutocomplete-input`'s padding zeroed on BOTH axes: MUI's 7.5px top/bottom is what
        //     would otherwise make an EMPTY combobox 44px tall once the height stops clamping it.
        //     With it gone the input is its own 21px line box, centred by the root's flex.
        //
        // Written from the ROOT slot rather than `inputRoot`, and this is the part that is easy to
        // get wrong: MUI compiles `inputRoot` as `.root .MuiAutocomplete-inputRoot`, so an `&&`
        // inside that slot doubles the whole descendant chain into `.root .inputRoot.root
        // .inputRoot` - a selector that matches nothing. Both of MUI's rules live on the root as
        // descendants, the widest at (0,4,0)
        // (`.root .MuiOutlinedInput-root.MuiInputBase-sizeSmall .MuiAutocomplete-input`), so the
        // tripled root class here lands at (0,5,0) and wins on specificity rather than on which
        // Emotion sheet happens to be inserted last.
        //
        // SCOPE: derived, and unusually so - the kit's Combobox is NOT among the vendored
        // primitives, so unlike every block above this one the `blink: Combobox` citations here
        // cannot be checked against anything in this repo. The horizontal inset is real extraction
        // (it is the Input's, which IS vendored); the vertical rules are a correction to MUI's own
        // layout so the kit's fixed-height field can host a wrapping tag list at all.
        root: {
          "&&& .MuiAutocomplete-inputRoot.MuiOutlinedInput-root": {
            paddingLeft: 13, // blink: Input .root `padding: 0 var(--space-3)` + the kit's 1px border
            paddingTop: 4,
            paddingBottom: 4,
            height: "auto",
            minHeight: 36, // blink: --control-h-md, the height the root would otherwise pin
            rowGap: 4,
          },
          "&&& .MuiAutocomplete-inputRoot.MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
            minHeight: 32, // blink: --control-h-sm
          },
          "&&& .MuiAutocomplete-inputRoot .MuiAutocomplete-input": { padding: 0 },
          // blink: the design's badge row is `display: flex; flex-wrap: wrap; gap: 6px`.
          "&&& .MuiAutocomplete-tag": { margin: "0 6px 0 0" },
        },
        // The two indicators are IconButtons, so without a rule here they take the IconButton
        // block's 36px ghost button - the kit's standalone icon-only control - and two of those
        // inside a 36px field fill its entire height and hover as full-height squares flush with
        // the border. Inside a field the kit's affordances are QUIET: the ink is the Select
        // chevron's textMuted, and the box is the kit's xs step - 24px at --radius-2 - the size it
        // uses where a control has to live inside another control.
        //
        // `&&` because the IconButton root states its 36px at the same single-class specificity,
        // and which Emotion sheet lands later is an implementation detail; doubling makes the
        // override deterministic. Same trick the Select's paddingRight documents above.
        // The kit's Combobox draws these two DIFFERENTLY, and the difference is the design:
        // the clear is a real ghost xs button (hover tint and all), while the chevron is a
        // passive span - `color: text-muted`, NO hover state, its only motion the 180deg open
        // rotation (which MUI's popupIndicatorOpen already provides). A hover tint on the
        // chevron made it read as a second button crowding the field.
        popupIndicator: ({ theme }) => ({
          "&&": {
            width: 24,
            height: 24, // a click target for what the kit draws as a bare 16px icon
            borderRadius: 6,
            color: theme.vars.palette.textMuted, // blink: Combobox .chevron `color: var(--color-text-muted)`
            "&:hover": { background: "transparent" }, // blink: .chevron has no hover state
          },
        }),
        clearIndicator: ({ theme }) => ({
          "&&": {
            width: 24,
            height: 24, // blink: Combobox clear `Button size="xs"` - --control-h-xs
            borderRadius: 6, // blink: --radius-2, the xs button's radius
            color: theme.vars.palette.textMuted,
            // blink: the clear IS a ghost button in the kit, so the ghost hover is correct here
            // (and only here - see the chevron above).
            "&:hover": {
              color: theme.vars.palette.primary.main,
              background: `color-mix(in srgb, ${theme.vars.palette.primary.main} 15%, transparent)`,
            },
            // blink: the kit shows its clear whenever the field HAS a value (`clearable &&
            // hasValue`); MUI gates it behind hover/focus with `visibility: hidden`.
            visibility: "visible",
          },
        }),
        // The popup is a kit menu - the Menu block above owns that surface, so only what
        // Autocomplete adds is here.
        paper: ({ theme }) => ({
          background: theme.vars.palette.surface,
          border: `1px solid ${theme.vars.palette.border}`,
          borderRadius: 8,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          fontSize: 15,
        }),
        listbox: { padding: 8 }, // the kit's menu gutter
        option: ({ theme }) => ({
          borderRadius: 6,
          minHeight: 32,
          padding: 8,
          fontSize: 15,
          '&[aria-selected="true"], &.Mui-focused': {
            backgroundColor: theme.vars.palette.surfaceMuted,
          },
        }),
        noOptions: ({ theme }) => ({ fontSize: 15, color: theme.vars.palette.textMuted }),
      },
    },

    // The rest of the derived surface: the slots that go with the blocks above, plus the two input
    // shapes the kit does not have.
    MuiTypography: {
      styleOverrides: {
        // The type SCALE lives in `typography` above, where it belongs - these are the two spacing
        // props MUI puts on the component, at the kit's own steps.
        gutterBottom: { marginBottom: 8 }, // --space-2
      },
    },
    MuiBadge: {
      styleOverrides: {
        // NOT the kit's Badge - that is a standalone pill and is already themed as MuiChip. This is
        // MUI's corner dot/count, which the kit has no equivalent of at all.
        badge: ({ theme }) => ({
          fontSize: 13, // --text-xs
          fontWeight: 600, // the kit's control weight
          fontFamily: "inherit",
          backgroundColor: theme.vars.palette.error.main,
          color: theme.vars.palette.error.contrastText,
        }),
        dot: ({ theme }) => ({
          width: 8,
          height: 8,
          minWidth: 8,
          borderRadius: 999,
          backgroundColor: theme.vars.palette.error.main,
        }),
      },
    },
    MuiList: {
      styleOverrides: {
        // Deliberately EMPTY of padding. MuiList is inside Menu, Select and Autocomplete as well as
        // a standalone list, and each of those blocks sets its own gutter - AGENTS.md lists this
        // component by name for exactly that reason. Only the type is stated here, which every one
        // of them shares.
        root: { fontSize: 15 }, // --text-md
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: { paddingLeft: 0, paddingRight: 0 }, // the kit's rows are flush; the BUTTON owns the inset
      },
    },
    MuiPagination: {
      styleOverrides: {
        ul: { gap: 4 }, // --space-1, between the numbered items
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: { "& .MuiSnackbarContent-root": { minWidth: 0 } }, // the kit sizes to content
      },
    },
    // =====================================================================================
    // DERIVED - the components blink has no twin for
    // =====================================================================================
    //
    // blink covers ALL of MUI, and the design system has no equivalent for any of the blocks below.
    // Nothing here is extracted; every value is AUTHORED from one of two places, and the comment
    // says which: a token from the sheet, or a decision a block ABOVE already makes. The recurring
    // ones, so they are not re-derived each time:
    //
    //   controls      24 / 32 / 36 / 40           --control-h-xs..lg
    //   radius        6 below 32px, 8 at or above (the Button's own ladder)
    //   type          13 / 14 / 15 / 18           --text-xs / sm / md / lg
    //   quiet ink     textMuted, textSubtle when further back
    //   rules         1px borderStrong between rows, 1px border for a panel seam (see MuiCardActions)
    //   hover         surfaceMuted for a neutral row, the accent at 15% for a tinted one
    //   focus ring    3px of the accent at 50%
    //
    // See AGENTS.md, "Deriving a component blink has no twin for". These are considered choices,
    // not ground truth: they carry no pixel claim, and their gallery entries are ref-less.

    // DERIVED - AccordionActions. No blink twin; built from the Accordion's own details padding.
    // The kit's Accordion ends at `.details`, so an action row continues that box rather than
    // opening a new one: same 16px gutters, no top border (the details are already inside the
    // panel), and the 8px button gap the Dialog's footer uses.
    MuiAccordionActions: {
      styleOverrides: {
        root: {
          padding: "0 16px 16px", // derived: MuiAccordionDetails' own padding, continued
          gap: 8, // derived: --space-2, the button gap MuiDialogActions uses
        },
      },
    },

    // DERIVED - CardActionArea. No blink twin; built from the Card and the kit's hover language.
    // A whole card that is clickable is still a card, so it takes the Card's radius and the neutral
    // row hover the Menu and List rows use. MUI's own focus highlight is a translucent black
    // overlay element, which is Material's language rather than blink's - it is taken off and
    // replaced with the ring every other focusable surface here uses.
    MuiCardActionArea: {
      defaultProps: { disableRipple: true }, // derived: the global ButtonBase default, restated
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8, // derived: MuiCard's --radius-3
          "&:hover": { backgroundColor: theme.vars.palette.surfaceMuted }, // derived: the neutral row hover
          "&.Mui-focusVisible": {
            // derived: --focus-ring, the same 3px/50% every focusable surface here uses
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`,
          },
          // MUI paints hover and focus through a full-bleed overlay span. Left in, it would sit on
          // top of the background above AND square off the card's corners.
          "& .MuiCardActionArea-focusHighlight": { display: "none" },
        }),
      },
    },

    // DERIVED - CardMedia. No blink twin; built from the Card's surface.
    // Media is the one child that reaches the card's edge, so the only decision is what happens at
    // the corners: it inherits nothing from the Card (a child cannot), so the radius is restated
    // and the media clipped to it. The muted surface stands in while an image loads, which is what
    // the Skeleton and the Avatar both use for the same job.
    MuiCardMedia: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.vars.palette.surfaceMuted, // derived: MuiAvatar's placeholder fill
          display: "block",
          // derived: MuiCard's --radius-3, on the top corners only - media sits at the head of the
          // card, above the content's own padding box.
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }),
      },
    },

    // DERIVED - ListItemAvatar. No blink twin; built from MuiAvatar's 32px default.
    // MUI reserves 56px for a 40px Material avatar. blink's avatar is 32px, so the gutter is the
    // avatar plus the kit's own 12px row gap - otherwise every list row with an avatar carries 16px
    // of empty space its text should be using.
    MuiListItemAvatar: {
      styleOverrides: {
        root: {
          minWidth: 44, // derived: MuiAvatar's 32px + --space-3
          // MUI nudges the avatar down 8px to sit against a two-line row's first line. blink's rows
          // are single-line by default, so it centres instead.
          marginTop: 0,
        },
      },
    },

    // DERIVED - ListSubheader. No blink twin; built from the List family's own inset.
    // A subheader is the quietest thing in a list: the kit's smallest step and muted ink. The
    // horizontal inset is the interesting value and it is 8px, NOT the 12px a first pass took from
    // the Menu's item - this is the List family, where the only inset blink states anywhere is
    // MuiListItemButton's 8px (MuiListItem is deliberately flush, with a comment saying the BUTTON
    // owns the inset). Measured with 12px: the heading's text sat 12px right of the avatar column
    // below it, which reads as a mistake rather than an indent.
    // It also has to opt out of MUI's 48px min-height, which is Material's touch target rather than
    // a type decision.
    MuiListSubheader: {
      styleOverrides: {
        root: ({ theme }) => ({
          background: "transparent", // MUI paints `background: paper` so it can stick; blink's lists do not
          color: theme.vars.palette.textMuted, // derived: the quiet ink
          fontSize: 13, // derived: --text-xs
          fontWeight: 600, // derived: the weight every label in this file carries
          lineHeight: 1.5, // derived: the reset's body line-height, as MuiPaginationItem restates it
          padding: 8, // derived: --space-2, MuiListItemButton's own inset - see above
          minHeight: 0,
        }),
      },
    },

    // DERIVED - MobileStepper. No blink twin; built from the Stepper family plus the Switch's track.
    // The dots are the interesting part: there is no dot anywhere in the design system, so they are
    // sized off the Switch's knob relationship (a small round mark on a muted rail) and coloured
    // with the same active/inactive pair the StepIcon uses - primary when current, borderStrong when
    // not. The bar variant reuses the LinearProgress block's rail rather than inventing a second.
    MuiMobileStepper: {
      styleOverrides: {
        root: {
          background: "transparent", // MUI paints `background: paper`; blink's steppers sit on the page
          padding: 8, // derived: --space-2
          gap: 8,
        },
        dots: { gap: 8 }, // derived: --space-2
        dot: ({ theme }) => ({
          width: 8,
          height: 8,
          backgroundColor: theme.vars.palette.borderStrong, // derived: MuiStepConnector's line colour
          margin: 0, // MUI spaces dots with a 2px margin; the gap above owns the spacing
        }),
        dotActive: ({ theme }) => ({ backgroundColor: theme.vars.palette.primary.main }), // derived: MuiStepIcon's active
        progress: { width: "100%" },
      },
    },

    // DERIVED - ScopedCssBaseline. No blink twin, and it needs one for a real reason: it is how a
    // consumer applies blink to PART of a page, and without a block it hands that subtree Material's
    // Roboto stack and background instead of the kit's. The values are the ones MuiCssBaseline
    // already states globally - this is the same baseline, scoped.
    MuiScopedCssBaseline: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.default, // derived: MuiCssBaseline's own
          color: theme.vars.palette.text.primary,
          fontFamily: theme.typography.fontFamily,
          fontSize: 15, // derived: --text-md, the body step
          lineHeight: 1.5, // derived: the kit's reset `body { line-height: 1.5 }`
        }),
      },
    },

    // DERIVED - SpeedDialIcon. No blink twin; built from the Fab it sits inside.
    // Only the CROSSFADE is styled, because that is all this component is: MUI rotates the icon 45°
    // and scales the open icon in. The rotation is Material's plus-becomes-x idiom and the kit draws
    // an explicit XIcon instead, so the transform goes and a plain opacity swap stays.
    MuiSpeedDialIcon: {
      styleOverrides: {
        icon: { transition: "opacity 0.2s" }, // derived: the 0.2s every control in this file transitions at
        iconOpen: { transform: "none" }, // no 45° rotation - blink swaps the glyph rather than spinning it
        openIcon: { transition: "opacity 0.2s" },
      },
    },

    // DERIVED - StepButton. No blink twin; built from the StepLabel it wraps.
    // The label already carries every colour decision, so this only has to stop being a Material
    // button: no ripple, the kit's radius, and enough padding that the focus ring clears the text.
    MuiStepButton: {
      defaultProps: { disableRipple: true },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6, // derived: --radius-2, the ladder's step below 32px
          padding: "4px 8px", // derived: --space-1 / --space-2
          margin: "-4px -8px", // ...taken back out, so adding the hit area does not move the label
          "&:hover": { backgroundColor: theme.vars.palette.surfaceMuted }, // derived: the neutral row hover
          "&.Mui-focusVisible": {
            backgroundColor: "transparent",
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`, // derived: --focus-ring
          },
        }),
      },
    },

    // DERIVED - StepContent. No blink twin; built from the vertical StepConnector.
    // A vertical stepper's content hangs off the same rule the connector draws, so it takes that
    // border and lines up with it. The 12px inset is the connector's own indent - see the note on
    // MuiStepConnector about the vertical rule being an indent rather than a gap.
    MuiStepContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderLeft: `1px solid ${theme.vars.palette.borderStrong}`, // derived: MuiStepConnector's line
          marginLeft: 12, // derived: --space-3, the connector's own indent
          paddingLeft: 20, // derived: --space-5, clearing the 12px icon column
          paddingRight: 8,
          color: theme.vars.palette.textMuted, // derived: MuiAccordionDetails' body ink
          fontSize: 15, // derived: --text-md
        }),
      },
    },

    // DERIVED - SvgIcon. No blink twin, and the block is deliberately SMALL for that reason.
    // blink's icon language is lucide, whose icons carry their own `size` prop and render at an
    // explicit width - so every icon this theme places is already sized and none of them reads this.
    // What DOES read it is a consumer's own `<SvgIcon>` and MUI's internal Material glyphs, and for
    // those the only blink decision available is the ladder its controls use: 16px is the size every
    // chevron, clear and adornment in this file is drawn at.
    //
    // SCOPE: the `fontSize` ladder only. Colour is left to `currentColor` on purpose - an icon takes
    // the ink of whatever control holds it, which is what every block above already relies on.
    MuiSvgIcon: {
      styleOverrides: {
        fontSizeSmall: { fontSize: 14 }, // derived: the Combobox clear's own 14px
        fontSizeMedium: { fontSize: 16 }, // derived: the 16px every control icon here is drawn at
        fontSizeLarge: { fontSize: 20 }, // derived: the Fab's icon step
      },
    },

    // DERIVED - TablePaginationActions. No blink twin; built from the pagination arrows next door.
    // MUI renders these as plain IconButtons, which would take the IconButton block's 36px ghost
    // control - a standalone affordance inside a 48px toolbar. The same call the Autocomplete's
    // indicators document applies: inside another control, the kit's affordances are the xs step.
    MuiTablePaginationActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiIconButton-root": {
            width: 24, // derived: --control-h-xs, the in-control step
            height: 24,
            borderRadius: 6, // derived: --radius-2, the ladder's step below 32px
            color: theme.vars.palette.textMuted, // derived: the quiet affordance ink
            "&:hover": { background: theme.vars.palette.surfaceMuted, color: theme.vars.palette.text.primary },
            "&.Mui-disabled": { color: theme.vars.palette.textSubtle },
          },
          // derived: --space-1, matching the gap MuiPagination puts between its own items
          "& .MuiIconButton-root + .MuiIconButton-root": { marginLeft: 4 },
        }),
      },
    },

    // ---- TableSortLabel ----
    //
    // Ground truth: reference/primitives/Table/Table.module.css `.sortButton`/`.sortIcon`/
    // `.sortIconIdle`, plus the `SortIndicator` in Table/index.tsx. NOT derived - a first pass
    // authored this from the header cell's type and got four values wrong (radius 6 against the
    // kit's 4, an invented hover colour, an invented active colour, and MUI's own icon size).
    //
    // The kit's sort control is a bare <button> inside the header cell: it takes the cell's ink and
    // type outright (`color: inherit`, `font: inherit`) and adds only a weight, a gap and a radius.
    //
    // SCOPE: the IDLE indicator. This is a many-to-few mapping of the kind AGENTS.md describes. The
    // kit draws three different glyphs - ArrowUp when ascending, ArrowDown when descending, and
    // ChevronsUpDown at 40% when a column is sortable but unsorted - while MUI ships ONE icon and
    // rotates it, hiding it entirely until hover. The two sorted states map exactly (MUI's
    // `directionAsc` is a 180 degree rotation, which turns the kit's own ArrowDown into its
    // ArrowUp), so those are reproduced. The unsorted state cannot be: no theme can make MUI swap
    // in a different GLYPH. It is left at MUI's hidden-until-hover behaviour rather than faked with
    // a 40% arrow, which would be a third thing that is neither system.
    MuiTableSortLabel: {
      defaultProps: {
        // blink: SortIndicator `<ArrowDownIcon size={14} />` - MUI rotates this for ascending.
        IconComponent: SortArrow,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          gap: 8, // blink: .sortButton `gap: var(--space-2)`
          fontWeight: 600, // blink: .sortButton `font-weight: 600`
          color: "inherit", // blink: .sortButton `color: inherit` - the header cell owns the ink
          borderRadius: 4, // blink: .sortButton `border-radius: var(--radius-1)`
          // MUI sets `vertical-align: middle` on this root; the kit's `.sortButton` states no
          // vertical-align at all, so a <button> keeps the initial `baseline`. On an inline-flex box
          // the difference is not cosmetic - `middle` aligns the box's centre to the baseline plus
          // half an x-height, which grew the header cell from 47.0px to 48.1px and moved every
          // pixel in it. 5033 differing pixels at Δ8, which is what a whole-cell shift looks like.
          verticalAlign: "baseline",
          // MUI darkens the label on hover and again when active. The kit states `color: inherit`
          // and nothing else, so both have to be taken back or a sorted column reads darker than
          // its neighbours.
          "&:hover": { color: "inherit" },
          "&.Mui-active": {
            color: "inherit",
            "& .MuiTableSortLabel-icon": { color: "currentColor" }, // blink: .sortIcon inherits
          },
          "&.Mui-focusVisible": {
            outline: "none", // blink: .sortButton:focus-visible `outline: none`
            boxShadow: `color-mix(in srgb, ${theme.vars.palette.primary.main} 50%, transparent) 0px 0px 0px 3px`, // blink: --focus-ring
          },
        }),
        icon: {
          flex: "none", // blink: .sortIcon `flex: none`
          // MUI spaces its icon with an 4px margin either side; the kit's gap above owns that.
          margin: 0,
        },
      },
    },

    MuiSpeedDial: {
      styleOverrides: {
        // The trigger is a Fab and is themed there; this is only the stack's own spacing.
        actions: { gap: 8 }, // --space-2
      },
    },
    MuiStep: {
      styleOverrides: {
        root: { padding: 0 }, // the Stepper's own gap does the spacing, as in the kit's layouts
      },
    },
    // NO MuiTableHead BLOCK, for the same reason there is no MuiBackdrop one: the obvious value is
    // wrong. A head looks white in the kit only because whatever is behind the table is - its
    // `.container` paints no background at all, and neither does `.head`. Giving the head
    // `--color-surface` therefore does not match the kit, it OVERPAINTS the page: measured at
    // 57948 differing pixels, Δ18, which is exactly #fff against the #edeff0 canvas.
    //
    // Everything a head cell actually states - its border, weight, padding and nowrap - is on
    // MuiTableCell's `head` slot above, extracted from the kit's own Table.
    MuiImageList: {
      styleOverrides: {
        root: { margin: 0, gap: 8 }, // --space-2; MUI ships a 16px block margin the kit never has
      },
    },
    // The two input SHAPES the kit does not have. Its only field is the bordered box themed as
    // MuiOutlinedInput above, so a standard (underlined) or filled input has no twin to extract -
    // these are the kit's tokens arranged into MUI's two other shapes so that a `<TextField
    // variant="standard">` is recognisably the same design system rather than Material.
    MuiInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: 15, // --text-md
          color: theme.vars.palette.text.primary,
          "&::before": { borderBottom: `1px solid ${theme.vars.palette.borderStrong}` },
          "&:hover:not(.Mui-disabled, .Mui-error)::before": {
            borderBottom: `1px solid ${theme.vars.palette.borderInput}`,
          },
          "&::after": { borderBottom: `1px solid ${theme.vars.palette.primary.main}` },
        }),
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: 15,
          borderRadius: 6, // --radius-2
          backgroundColor: theme.vars.palette.surfaceMuted,
          "&:hover": { backgroundColor: theme.vars.palette.surfaceMuted },
          "&.Mui-focused": { backgroundColor: theme.vars.palette.surfaceMuted },
          // The kit has no underlined field anywhere, so the filled shape loses MUI's.
          "&::before, &::after": { display: "none" },
        }),
      },
    },
    // ---- InputLabel: the kit has no floating label, so this one does not float ----
    //
    // MUI's InputLabel is absolutely positioned over the control and animates into a notch in the
    // outline. The kit has no such thing anywhere: its FormField renders a plain <label> ABOVE the
    // control, which is what MuiFormLabel above is styled for.
    //
    // That difference is not cosmetic, and the reason this block exists is that a floating label is
    // actively BROKEN under this design system rather than merely foreign to it:
    //
    //   - The kit's focus ring is `box-shadow: 0 0 0 3px` of 50%-alpha primary, painted OUTSIDE the
    //     border box - so it occupies exactly the band a shrunk label sits in. A focused field drew
    //     its label inside its own halo, at low contrast and hard to read. Nothing about the label's
    //     position fixes that; the ring is where the label is, by construction.
    //   - A native `<input type="date">` always paints `dd/mm/yyyy`, so a resting label has nothing
    //     to rest on and the two overlap.
    //   - The resting offsets are MUI's, measured against MUI's 56px control; the kit's are 32/36/40.
    //
    // So the label is made STATIC. `MuiFormControl` above is already `display: flex; flex-direction:
    // column; gap: 8px` - the kit's FormField layout, transcribed from its own module - which means a
    // static label simply becomes that column's first child and the control its second, at the kit's
    // own 8px gap. No geometry is invented here; it is the layout the kit already describes.
    //
    // The consequence worth stating: a `<TextField label="X">` is TALLER than under stock MUI, by
    // the label plus the gap, because the label no longer overlaps the control. That is the kit's
    // field, and an app that wants MUI's overlay instead should not be using this theme.
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.textMuted,
          // Out of the overlay and into the FormControl's flex column. `position` and `transform`
          // are what MUI uses to float it; both have to go, and `maxWidth` with them - MUI caps a
          // floating label at `calc(133% - 32px)` to keep it inside the notch it is shrinking into,
          // which is meaningless once it is a block above the field and would truncate long labels.
          position: "static",
          transform: "none",
          maxWidth: "100%",
          // MUI makes a resting label click-through so the click reaches the input underneath. A
          // static label is not over the input, and a <label> that takes its own clicks focuses the
          // control - which is the behaviour a plain label should have.
          pointerEvents: "auto",
        }),
      },
    },
    // ---- Ripples ----
    //
    // The kit has no ripple anywhere: every one of its interactive primitives passes
    // `disableRipple` to the ButtonBase underneath. This is the global default, and it is NOT
    // enough on its own - Checkbox, Radio, Switch, ButtonGroup and MenuItem each resolve their own
    // `disableRipple` and forward it, so each restates it at its own block above. The `no ripple`
    // sweep is what keeps that list honest as components are added; it caught the derived tier's
    // ListItemButton, Fab, BottomNavigationAction and PaginationItem the moment they landed.
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },

    // ---- Global anchor styling ----
    //
    // Ground truth: the kit's global.css, which base.css vendors verbatim:
    //
    //     a {
    //         color: #5a63b0;
    //         text-decoration: underline;
    //         text-decoration-thickness: 0.0625em;
    //         text-underline-offset: 0.15em;
    //         text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
    //     }
    //     a:hover { text-decoration-color: currentColor; }
    //     a:hover, button, [role="button"] { cursor: pointer; }
    //
    // The MuiLink block below covers a `<Link>`, but the kit's rule covers EVERY anchor - including
    // the ones MUI renders inside other components and the ones an app writes by hand. Carrying it
    // in CssBaseline is what makes the theme a drop-in for that rule rather than only for the
    // component: preflight caught the gap on Breadcrumbs, whose links are plain `<a>` elements and
    // came out underlined and browser-blue the moment the kit's stylesheet was not on the page
    // (234 pixels at Δ147). That rule now underlines deliberately rather than not at all, which
    // makes carrying it here matter MORE, not less - the browser's own underline is exactly what
    // the three measurements below exist to replace.
    //
    // The hex is transcribed as the kit writes it - global.css hardcodes it rather than using
    // var(--color-primary), and it is the same brand colour either way.
    MuiCssBaseline: {
      styleOverrides: {
        a: {
          color: "#5a63b0",
          textDecoration: "underline",
          textDecorationThickness: "0.0625em",
          textUnderlineOffset: "0.15em",
          textDecorationColor: "color-mix(in srgb, currentColor 35%, transparent)",
        },
        "a:hover": { textDecorationColor: "currentColor" },
        "a:hover, button, [role=\"button\"]": { cursor: "pointer" },
      },
    },

    // ---- Link ----
    //
    // The kit has no Link primitive. Links are styled globally, by one rule in global.css - quoted
    // in full in the CssBaseline block above.
    //
    // The colour needs no override: MUI's Link already defaults to `primary.main`, which the
    // palette above sets to the same brand hex the rule hardcodes. The underline does, and all
    // three of its measurements do, because MUI's own `underline="always"` draws the browser's
    // default line at `alpha(primary.main, 0.4)` - a flat 40% of the colour, on the baseline, at
    // whatever thickness the face suggests. The kit replaces all three:
    //
    //   thickness  0.0625em, so the line stays hairline as the text scales
    //   offset     0.15em, which is what lifts it clear of the descenders
    //   colour     a 35% tint of the link's OWN colour, via currentColor
    //
    // `currentColor` rather than a palette entry so an inherit-coloured link (a link inside a
    // heading, say) tints its underline from the ink it actually paints in, which is what MUI's own
    // `--Link-underlineColor` cannot do - it resolves per palette colour and falls back to a flat
    // 40% of currentColor only for `color="inherit"`.
    //
    // The `&:hover` entry is not decoration: MUI's `underline="always"` variant ships
    // `&:hover { text-decoration-color: inherit }`, and `inherit` on an anchor takes the PARENT's
    // decoration colour - the surrounding body ink, not the link's. Left alone, hovering a blink
    // link turns its underline dark grey. This states the kit's hover instead, and it has to be
    // here rather than in defaultProps because it is overriding a rule, not a prop.
    MuiLink: {
      defaultProps: {
        // A default rather than a hard style, so `underline="none"` still works for a consumer who
        // wants a bare link. This matches MUI's own default; it is stated anyway because it is the
        // kit's choice now, not a coincidence.
        underline: "always", // blink: global.css `a { text-decoration: underline }`
      },
      styleOverrides: {
        root: {
          textDecorationThickness: "0.0625em", // blink: global.css `a`
          textUnderlineOffset: "0.15em", // blink: global.css `a`
          textDecorationColor: "color-mix(in srgb, currentColor 35%, transparent)", // blink: global.css `a`
          "&:hover": { textDecorationColor: "currentColor" }, // blink: global.css `a:hover`
        },
      },
    },
  },
})
