# Working in this repo

xui is a collection of Material UI (MUI) v9 themes that make MUI components look pixel-for-pixel identical to another design system.
The first and current theme replicates shadcn/ui's default look (new-york style, neutral base, Geist, light and dark).
The bar is literal: a regular eye must not be able to tell a themed MUI component from the real shadcn component.

## Layout

- `packages/xui/src/themes/shadcn.ts` is the deliverable: one self-contained file exporting `shadcnTheme`.
  It imports only from `@mui/material/*` and `lucide-react` so it can be copied into any app as a single file.
  It is a `.ts` file, so any icon element is built with `React.createElement`, never JSX.
- `apps/showcase` is a Vite app used for development and verification.
  `src/gallery/` holds theme-agnostic sections, one per component, rendering each variant/size/state as a pair: the real shadcn component next to the themed MUI component.
  `src/components/ui/` is the real shadcn/ui source installed by the shadcn CLI.
  This installed source is the ground truth for every styling value.
- `e2e/` is the parity harness: Playwright screenshots each shadcn/MUI cell pair and pixelmatch diffs them.
- Design specs and implementation plans live under `docs/superpowers/` and are gitignored.
  Never commit them.

## The one rule that matters most

Ground truth always wins.
Every value in the theme must be extracted from the specific installed shadcn component you are theming, not guessed, and not copied by analogy from another component's block.
Copying a value from a different component ("Button had this, so Input probably does too") has caused every serious bug in this project.
Radius, padding, colors, and icon sizes differ per component.
Read the component's own source in `apps/showcase/src/components/ui/<name>.tsx` and trace each value.

Every value in the theme carries a `// shadcn: <class-or-source>` provenance comment.
If a value has no ground-truth backing, it does not ship, even if MUI exposes that API surface.
Ship only what a gallery pair actually covers.

## The loop for adding or fixing a component

1. Extract the installed twin `apps/showcase/src/components/ui/<name>.tsx`.
   Quote its real class strings into the theme's `// ---- <Component> ----` banner and resolve them to CSS against the installed Tailwind (`--radius: 0.625rem`; the radius scale is multiplicative: `--radius-sm` is `calc(var(--radius) * 0.6)`, `--radius-md` is `* 0.8`, `--radius-lg` is `var(--radius)`; `--spacing` is `0.25rem`).
2. Add a gallery section `apps/showcase/src/gallery/sections/<name>.tsx` and register it in `sections/index.ts`.
   The MUI side is idiomatic MUI (plain props, no `sx` hacks, no wrapper components, no props that compensate for the theme).
   The shadcn side imports the real component.
   Put `data-target` on the element that receives hover/focus.
   Give each pair the `states` it needs (`default`, `hover`, `focus`, and `open` for portalled overlays).
3. Append the component's overrides to `packages/xui/src/themes/shadcn.ts`.
   Colors come from `theme.vars.palette.*` so both schemes work from one definition; scheme-specific deltas use `theme.applyStyles("dark", ...)`.
   Alpha blends use `color-mix(in oklab, <color> N%, transparent)` where `N` matches the extracted Tailwind `/NN` suffix exactly (watch for the occasional one-off `in oklch` mix and transcribe it as-is).
4. Verify: run `pnpm verify:parity` and drive every new pair to 0.00% in both light and dark, with no regression on existing pairs.
   Diagnose failures with a computed-style diff in the browser before staring at diff images.
5. Commit with a conventional message, no `Co-Authored-By` trailer.

## The parity harness is strict on purpose

The pixelmatch per-pixel threshold is 0.
Because both sides render in the same browser session, a genuine match is exactly 0.00%, not "close enough".
A previous 0.1 threshold silently reported a 24%-different grey wash as a perfect match and hid two real bugs.
Never raise `e2e/thresholds.ts` or re-loosen the pixelmatch threshold to make a pair pass.
Fix the theme instead.
If a pair truly cannot reach zero for a provable antialiasing reason, prove the geometry is byte-identical and record the exact residual rather than fudging.

For a residual that is an 8-bit rounding artifact rather than an edge-antialiasing one, cap the error instead of the pixel count: add the pair to `maxDeltaOverrides` in `e2e/thresholds.ts` and it is judged on its largest per-channel difference (`Δ ≤ 1` means no channel anywhere may be off by more than one level).
Reach for this rather than a bigger percentage.
A percentage bounds how much of the cell may be wrong by any amount; a delta cap bounds how wrong any of it may be, and it does not drift when a layout change moves the pair to a different device-pixel offset.
`slider-disabled` is the worked example: the same 1/255 artifact measured 0.56% before the gallery gained a sidebar, 1.51% after, and 0.00% in dark - a percentage was never the invariant the proof supported.

## MUI traps you will hit

MUI applies state and default styles at higher specificity than source order suggests.
`.Mui-checked`, `.Mui-focused`, `.Mui-disabled`, and internal color variants often beat a plain override.
Verify your override actually wins by reading computed styles in the browser, not by assuming your rule comes last.

The global `MuiButtonBase` `disableRipple` default does not reach `Checkbox`, `Radio`, or `Switch`; they resolve their own default and forward it, so restate `disableRipple: true` on each.

Portalled components (Select, Tooltip, and the coming Menu/Dialog/Popover) render outside their cell.
The harness handles them via an `open` state: both the MUI overlay and the shadcn overlay must carry `data-portal-target="<pairId>"` on their outermost portalled element so they are captured and diffed symmetrically.

## Commands

- `pnpm dev` runs the showcase.
- `pnpm verify:parity` runs the full pixel-parity suite (light and dark, all pairs, ~90s).
- While iterating on ONE component, filter to it for a ~5s loop instead of the full suite: `PARITY_PAIR=slider pnpm exec playwright test e2e/parity.spec.ts --project=light` (comma-separated id prefixes; add `--project=dark` or drop it for both). Run the full `pnpm verify:parity` once at the end to confirm no regressions.
- `pnpm verify` runs parity plus the preflight suite (proves the theme does not depend on Tailwind's reset).
- `pnpm typecheck` typechecks every package and the e2e harness.
- `pnpm test:unit` runs the compare-utility unit tests.

## Conventions

Colors stay as shadcn's oklch strings; converting them away from oklch breaks parity against the reference.
Dark mode activates via the `.dark` class on `<html>`.
Gallery presentation components use inline styles only, so they render identically on the Tailwind-free `pure.html` page.
Do not commit anything under `docs/superpowers/` or `.superpowers/`.
