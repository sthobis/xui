# Working in this repo

xui is a collection of Material UI (MUI) v9 themes that make MUI components look pixel-for-pixel identical to another design system.
The bar is literal: a regular eye must not be able to tell a themed MUI component from the real one.

Two themes ship today:

- **shadcn** - shadcn/ui's default look (new-york style, neutral base, Geist, light and dark). Complete.
- **kumo** - Kumo, Cloudflare's design system (https://kumo-ui.com), Inter, light and dark. Tier 1 (the non-portalled primitives) complete.

Everything below applies to both. Where they differ, the theme name is called out.

## Layout

- `packages/xui/src/themes/<name>.ts` is the deliverable, one self-contained file per theme exporting `<name>Theme`.
  Each imports only from `@mui/material/*` plus that design system's icon package (`lucide-react` for shadcn, `@phosphor-icons/react` for kumo), so it can be copied into any app as a single file.
  They are `.ts` files, so any icon element is built with `React.createElement`, never JSX.
- `apps/showcase` is a Vite app used for development and verification.
  `src/gallery/` holds the theme-agnostic plumbing (`PairGrid`, `Sidebar`, `ThemePanel`, `types`).
  `src/themes/<name>/` is one theme's own page: its entry, App, Providers, CSS, Tailwind-free `pure` entry, and `sections/`.
  A section renders each variant/size/state as a pair: the real component (`ref`) next to the themed MUI one (`mui`).
- Each theme is its OWN Vite page, and that isolation is the point: the two design systems' Tailwind themes, base layers and fonts must never load together, or a 0-threshold pixel harness would be measuring whichever won the cascade.
  `index.html` + `pure.html` are shadcn's; `kumo.html` + `kumo-pure.html` are kumo's.
- Ground truth per theme:
  - shadcn - `apps/showcase/src/components/ui/<name>.tsx`, the real source installed by the shadcn CLI.
  - kumo - the installed `@cloudflare/kumo` package, pinned to an exact version. The real component source is in `node_modules/@cloudflare/kumo/dist/chunks/<name>-<hash>.js` (the files under `dist/components/` are 200-byte re-exports), and the tokens are in `dist/styles/`.
- `e2e/` is the parity harness: Playwright screenshots each ref/MUI cell pair and pixelmatch diffs them.
- Design specs and implementation plans live under `docs/superpowers/` and are gitignored.
  Never commit them.

## The one rule that matters most

Ground truth always wins.
Every value in the theme must be extracted from the specific installed component you are theming, not guessed, and not copied by analogy from another component's block.
Copying a value from a different component ("Button had this, so Input probably does too") has caused every serious bug in this project.
Radius, padding, colors, and icon sizes differ per component.

Every value carries a provenance comment naming where it came from - `// shadcn: <class-or-source>` or `// kumo: <class-or-token>`.
If a value has no ground-truth backing, it does not ship, even if MUI exposes that API surface.
Ship only what a gallery pair actually covers - and if a component cannot be paired, say so where the sections are registered rather than theming it blind.

**And a source file is only EVIDENCE about the ground truth; what paints is the ground truth.**
That distinction is not pedantic - it has cost real time twice on the kumo theme:

- Its tokens are written `light-dark(var(--color-neutral-900, <fallback>), ...)`, and the inline fallback is often NOT Tailwind's real value, which always wins. Seven token values were wrong from reading the file.
- Its Switch styles a track with Tailwind `dark:` variants that never fire, because kumo drives dark mode through `light-dark()` switched by `data-mode` and its own docs say never to use `dark:`. Transcribing them as real overrides was worth Δ230+.

So: read the source to find out WHICH declarations exist, then read the rendered values out of the browser (`getComputedStyle`, once per colour mode) to find out what they resolve to.

## The loop for adding or fixing a component

1. Extract the installed twin.
   - shadcn: `apps/showcase/src/components/ui/<name>.tsx`, resolved against the installed Tailwind (`--radius: 0.625rem`; the radius scale is multiplicative: `--radius-sm` is `calc(var(--radius) * 0.6)`, `--radius-md` is `* 0.8`, `--radius-lg` is `var(--radius)`; `--spacing` is `0.25rem`).
   - kumo: `node_modules/@cloudflare/kumo/dist/chunks/<name>-<hash>.js`. Kumo REDEFINES Tailwind's type scale (`text-xs` 12px, `text-sm` 13px, `text-base` **14px**, `text-lg` 16px), so reading Tailwind's defaults puts every label 2px out.
   Quote the real class strings into the theme's `// ---- <Component> ----` banner, then confirm what they resolve to in the browser (see the rule above).
2. Add a gallery section `apps/showcase/src/themes/<theme>/sections/<name>.tsx` and register it in that theme's `sections/index.ts`.
   The MUI side is idiomatic MUI (plain props, no `sx` hacks, no wrapper components, no props that compensate for the theme).
   The `ref` side imports the real component.
   Put `data-target` on the element that receives hover/focus - and check it actually lands in the DOM, since some components forward no unknown attributes (kumo's `Radio.Item` does not, so those pairs are default-state only).
   Give each pair the `states` it needs (`default`, `hover`, `focus`, and `open` for portalled overlays).
3. Append the component's overrides to `packages/xui/src/themes/<theme>.ts`.
   Colors come from `theme.vars.palette.*` so both schemes work from one definition; scheme-specific deltas use `theme.applyStyles("dark", ...)`.
   Alpha blends use `color-mix(in oklab, <color> N%, transparent)` where `N` matches the extracted `/NN` suffix exactly (watch for the occasional one-off `in oklch` mix and transcribe it as-is).
4. Verify: run `pnpm verify:parity` and drive every new pair to 0 in both light and dark, with no regression on existing pairs.
   Diagnose failures with a computed-style diff in the browser before staring at diff images; when the styles all match, sample the captured PNGs' pixels to find WHERE they differ.
5. Sabotage-test the new pair - perturb one themed value, confirm the pair fails, revert.
   Make it a real perturbation: a font-weight of 401 against 400 renders identically in a variable font and proves nothing.
6. Commit with a conventional message, no `Co-Authored-By` trailer.

## The parity harness is strict on purpose

The pixelmatch per-pixel threshold is 0.
Because both sides render in the same browser session, a genuine match differs by exactly zero pixels, not "close enough".
A previous 0.1 threshold silently reported a 24%-different grey wash as a perfect match and hid two real bugs.

A pair is judged on **two size-independent caps**, both of which must hold (`e2e/thresholds.ts`):

- `DEFAULT_MAX_PIXELS` - how many pixels may differ at all.
- `DEFAULT_MAX_DELTA` - how far off any channel of any of those pixels may be.

Both are needed because they answer different questions.
Moved geometry shows up in the count; a small shape in the wrong place shows up almost entirely in the channel error (a toggle-group seam border was 9 pixels at Δ235).
Neither is a percentage, and that is deliberate: a percentage divides by the capture's area, so 47 differing pixels is 0.43% of the small tooltip capture and 0.01% of a large cell - one number that is simultaneously too tight for small pairs and far too loose for big ones.
Every bug this suite ever missed was missed that way; the pagination line-height mistake measured 0.23% while being 258 wrong pixels.

Never raise either cap to make a pair pass.
Fix the theme instead.
If a pair truly cannot reach zero for a provable rounding reason, prove it and add an entry to `maxPixelOverrides` or `maxDeltaOverrides` - they override INDEPENDENTLY, so an exception never silently widens both axes.
Overrides are scoped per theme, because pair ids are only unique within a gallery (both have a `button-*` family) and an exception is always a proof about one specific pair of implementations.
Worked examples, each carrying its measurements in the file:

- `slider-disabled` (shadcn) - a 1/255 rail artifact over a thousand pixels, judged on delta alone.
- `button-primary` / `button-destructive` (kumo) - gradient dithering. Kumo paints its gradient on a child span and MUI's Button has no element to style, so the theme uses a `::before`; same picture, different paint op, and the delta histogram is literally `{1: 802}`.
- `switch-checked` (kumo) - `corner-shape: squircle` rasterizes differently at different device x positions. Only the COUNT is relaxed; the delta cap stays at the default.

`e2e/preflight.spec.ts` has its own, much tighter `maxDeltaOverrides` (default Δ2). An entry there has to show the two captures differ for a reason unrelated to Tailwind at all - not merely that the difference is small.

Two things the pixel diff structurally **cannot** see, so do not rely on it for them:

- Captures of different sizes are diluted by padding into a small percentage, so a size difference is failed on its own terms instead (`DiffResult.sizes`).
- Sub-pixel geometry. A missing `line-height` left a label box 20.016px tall against 20.000 and the diff still reported zero differing pixels, because 0.032 device pixels rounds away. The font-metrics sweep in `e2e/behavior.spec.ts` is what holds those values; it found a missing `body1` line-height (24px against shadcn's `leading-7` 28px) that had been shipping green.

## MUI traps you will hit

MUI applies state and default styles at higher specificity than source order suggests.
`.Mui-checked`, `.Mui-focused`, `.Mui-disabled`, and internal color variants often beat a plain override.
Verify your override actually wins by reading computed styles in the browser, not by assuming your rule comes last.

The global `MuiButtonBase` `disableRipple` default does not reach `Checkbox`, `Radio`, or `Switch`; they resolve their own default and forward it, so restate `disableRipple: true` on each.

Portalled components (Select, Tooltip, and the coming Menu/Dialog/Popover) render outside their cell.
The harness handles them via an `open` state: both the MUI overlay and the shadcn overlay must carry `data-portal-target="<pairId>"` on their outermost portalled element so they are captured and diffed symmetrically.

## Commands

- `pnpm dev` runs the showcase.
- `pnpm verify:parity` runs the full pixel-parity suite (every theme, light and dark, all pairs).
  Playwright projects are named `<theme>-<mode>`: `shadcn-light`, `shadcn-dark`, `kumo-light`, `kumo-dark`, and each writes its own `e2e/results/report-<project>.md`.
- While iterating on ONE component, filter to it for a ~5s loop instead of the full suite: `PARITY_PAIR=slider pnpm exec playwright test e2e/parity.spec.ts --project=shadcn-light` (comma-separated id prefixes; swap in `kumo-light` for the kumo gallery, or pass both projects). Run the full `pnpm verify:parity` once at the end to confirm no regressions.
- **Working in a git worktree? Set `PARITY_PORT`.** Playwright reuses whatever dev server is already on the port instead of starting one, so with a server running from another checkout the whole suite silently measures THAT checkout - a fresh worktree once "failed" on a pair that did not exist in it. Run `PARITY_PORT=5273 pnpm verify` (any free port), and start the dev server on the same port. The default 5173 is unchanged for the primary checkout.
- `pnpm verify` runs parity plus the preflight suite (proves the theme does not depend on Tailwind's reset).
- `pnpm typecheck` typechecks every package and the e2e harness.
- `pnpm test:unit` runs the compare-utility unit tests.

## Conventions

Colors stay as the design system's own oklch strings; converting them away from oklch breaks parity against the reference.

Dark mode is each design system's OWN convention, not a normalized one - the themes are drop-ins, so they follow the system they replicate:

- shadcn - a `.dark` class on `<html>` (`colorSchemeSelector: "class"`).
- kumo - `data-mode="dark"` on `<html>` (`colorSchemeSelector: "data-mode"`, which MUI expands to `[data-mode="%s"]`).

Either way MUI's own `useColorScheme().setMode` writes it, so one toggle moves the MUI theme and the reference system's stylesheet together.
Gallery presentation components use inline styles only, so they render identically on the Tailwind-free `pure.html` page.
Do not commit anything under `docs/superpowers/` or `.superpowers/`.
