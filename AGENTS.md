# Working in this repo

xui is a collection of Material UI (MUI) v9 themes that make MUI components look pixel-for-pixel identical to another design system.
The bar is literal: a regular eye must not be able to tell a themed MUI component from the real one.

Three themes ship today:

- **shadcn** - shadcn/ui's default look (new-york style, neutral base, Geist, light and dark). Complete.
- **kumo** - Kumo, Cloudflare's design system (https://kumo-ui.com), Inter, light and dark. Complete, including the portalled tier (Tooltip, DropdownMenu, Select, Popover, Dialog, Toast).
- **blink** - the Pulse Kit, the design system of Pulse / NeverBlink, Source Sans Pro. **Light only.** Complete across the same surface, portalled tier included. The kit ships a dark scheme and `blink.ts`'s palette is a factory over a token set precisely so adding it is a one-line change; until it is done there is deliberately no `blink-dark` project, so a future one cannot silently run in light and pass everything.

All three cover the same MUI surface - at the level of what a user sees, not the letter of the key list.
A theme may reach a surface through a different `Mui*` key (shadcn's snackbar twin is sonner, themed through `MuiSnackbarContent` where kumo themes a real `MuiSnackbar`), and twice the correct block is provably NO block (blink's `MuiBackdrop` and `MuiTableHead` - see the mistake section below).
`e2e/lib/surface-parity.test.ts` holds the claim: the three key sets must match up to an allowlist whose every entry records its reason, in both directions, so closing a gap fails until its stale entry is deleted.
Each theme also reaches part of the surface through the derived tier described below, because every one of these systems ships fewer components than MUI does; that tier is marked in the theme file and is held to a different standard.

Everything below applies to all three. Where they differ, the theme name is called out.

## Layout

- `packages/xui/src/themes/<name>.ts` is the deliverable, one self-contained file per theme exporting `<name>Theme`.
  Each imports only from `@mui/material/*` plus that design system's icon package (`lucide-react` for shadcn and blink, `@phosphor-icons/react` for kumo), so it can be copied into any app as a single file.
  They are `.ts` files, so any icon element is built with `React.createElement`, never JSX.
- `apps/showcase` is a Vite app used for development and verification.
  `src/gallery/` holds the theme-agnostic plumbing (`PairGrid`, `Sidebar`, `ThemePanel`, `types`).
  `src/themes/<name>/` is one theme's own page: its entry, App, Providers, CSS, Tailwind-free `pure` entry, and `sections/`.
  A section renders each variant/size/state as a pair: the real component (`ref`) next to the themed MUI one (`mui`).
- Each theme's PARITY page is its own Vite page, and that isolation is the point: the two design systems' Tailwind themes, base layers and fonts must never load together, or a 0-threshold pixel harness would be measuring whichever won the cascade.
  `shadcn.html` + `pure.html` are shadcn's; `kumo.html` + `kumo-pure.html` are kumo's.
  Those four are where the real components live and where every pixel claim is made.
- `index.html` is the SHOWCASE, and it is the one page that may hold every theme at once - one row per component, four columns: stock MUI, shadcn-themed, kumo-themed, blink-themed.
  It can do that precisely because it renders no reference component, so it loads neither system's Tailwind and there is no cascade to fight over.
  It reads the kumo gallery's `mui` nodes as its component list, since that theme covers everything the others do.
  That reuse has one consequence worth knowing before you file a bug against it: a cell built around one theme's layout can look wrong under the rest, and legitimately so.
  kumo's `label-optional` composes an "(optional)" marker with no separator and leans on kumo's `MuiFormLabel` being a flex row; under stock MUI it runs together, and that is stock MUI being stock MUI rather than a defect.
  Check what the design system's own label does before "fixing" the cell - shadcn deliberately carries that layout on `MuiInputLabel`, the component its own system uses for a field label.
  There is a second, different failure of that reuse, and `showcase/columnOverrides.tsx` is where it is answered: a kumo cell may ask for something another theme cannot answer AT ALL, rather than answering it differently.
  Two shapes of it, both live - a prop VALUE only kumo declares (`<Chip color="blue">`, `<Button size="xsmall">`), which leaves the other columns showing stock MUI rather than themselves; and portable props that mean a different DESIGN elsewhere (`variant="contained" color="error"` is kumo's destructive button and renders under blink as a solid red button the Pulse Kit does not have, whose real destructive is `variant="light" color="error"`).
  A column names its own node for that pair id and everything else keeps reusing kumo's; keep the map small, and do not reach for it when a cell merely looks different.
  Two things there are load-bearing and are commented at the code: each column re-declares its theme's CSS custom properties inline (both themes emit `--mui-palette-*` on `:root`, so without that you get one theme, whichever wrote `:root` last), and each column uses `ScopedCssBaseline` rather than the global one (which would otherwise hand the whole page one theme's typography).
  The showcase is light-only: the two systems' dark conventions (`.dark` against `data-mode`) cannot both be driven by one toggle, so dark mode stays on the per-theme pages.
- Ground truth per theme:
  - shadcn - `apps/showcase/src/components/ui/<name>.tsx`, the real source installed by the shadcn CLI.
  - kumo - the installed `@cloudflare/kumo` package, pinned to an exact version. The real component source is in `node_modules/@cloudflare/kumo/dist/chunks/<name>-<hash>.js` (the files under `dist/components/` are 200-byte re-exports), and the tokens are in `dist/styles/`.
  - blink - `apps/showcase/src/themes/blink/reference/`, the Pulse Kit vendored from the app's own source. Read its README first; that source is private, so committed files describe it by role and the real paths live in a gitignored `PROVENANCE.private.md` beside it.
    It is the one ground truth in this repo that is a COPY rather than an installed package, which makes it the one you can edit - and the README bounds that: a "Local design changes pending upstream" table lists every file that no longer matches what was vendored, each one a deliberate change to the KIT that the theme carries identically, so parity stays at zero and the diff is what gets ported back.
    Changing a value there to make a pair pass is the same offence as raising a threshold. Changing one because the DESIGN should change is the only reason, and it goes in that table with the theme edit in the same commit.
- `e2e/` is the parity harness: Playwright screenshots each ref/MUI cell pair and pixelmatch diffs them.
- Design specs and implementation plans live under `docs/superpowers/` and are gitignored.
  Never commit them.

## The one rule that matters most

Ground truth always wins.
Every value in the theme must be extracted from the specific installed component you are theming, not guessed, and not copied by analogy from another component's block.
Copying a value from a different component ("Button had this, so Input probably does too") has caused every serious bug in this project.
Radius, padding, colors, and icon sizes differ per component.

Every value carries a provenance comment naming where it came from - `// shadcn: <class-or-source>` or `// kumo: <class-or-token>`.
Ship only what a gallery pair actually covers - and if a component cannot be paired, say so where the sections are registered rather than theming it blind.

That rule governs everything ABOVE the derived-tier banner in a theme file, which is where every pixel claim is made.
There is exactly one sanctioned exception below it, and it is a different KIND of work rather than a relaxation of this one.

**The derived tier - components MUI ships and the design system does not.**
MUI's surface is wider than any of these systems': shadcn has no Rating, Stepper or BottomNavigation, kumo has no Avatar, Skeleton or Stepper.
(Not every gap is derived - shadcn DOES ship a Slider, vendored and pixel-paired like any other component; an earlier revision of this file claimed otherwise.)
Left unthemed those render as stock Material - a blue, Roboto-metric control beside the themed ones - which for a drop-in theme is worse than an imperfect derivation.
So they are built from the system's own TOKENS and from the geometry its real components use, below a banner in the theme file that says exactly where extraction stops, and every value still names the token it came from.

What that does NOT buy is a pixel guarantee, and the harness enforces the weaker claim rather than trusting anyone to remember it:

- A derived pair omits `ref` (see `Pair.ref`). `PairRow` then publishes `data-states=""` whatever the pair declares, so the pixel suite structurally cannot be asked to diff something with no reference.
- No `[data-side="ref"]` cell is rendered, so the gallery-wide behavior sweeps skip the missing side on their own.
- preflight still covers it in full - it compares the MUI cell with and without Tailwind, which needs no reference, and that is the check that catches a derived block leaning on Tailwind's reset. It has already caught one (BottomNavigation, twice over).

Treat a value there as a considered choice, not as ground truth.
If the system ever ships the real component, re-extract it and move the block above the line.

**A ref-less pair does not always mean "derived".** There is a second reason to omit `ref`, and it should say so where it is declared: the system HAS the component and the two implementations cannot be put on the same pixel. blink's Textarea is the case - MUI has no plain multiline input, so `rows` maps onto `minRows`/`maxRows` and renders a `TextareaAutosize`, which measures a hidden shadow element's integer `scrollHeight` and writes the result back as an INLINE pixel height: 3 x 23 against the kit's plain `<textarea rows={3}>` at 3 x 22.5 for 15px/1.5 type. An inline style is out of a theme's reach, and the 1.5px lands on the capture SIZE, which the harness refuses to absorb into a threshold and rightly. The block is still carried, because without it a multiline field is broken rather than merely unstyled.

**And a source file is only EVIDENCE about the ground truth; what paints is the ground truth.**
That distinction is not pedantic - it has cost real time twice on the kumo theme:

- Its tokens are written `light-dark(var(--color-neutral-900, <fallback>), ...)`, and the inline fallback is often NOT Tailwind's real value, which always wins. Seven token values were wrong from reading the file.
- Its Switch styles a track with Tailwind `dark:` variants that never fire, because kumo drives dark mode through `light-dark()` switched by `data-mode` and its own docs say never to use `dark:`. Transcribing them as real overrides was worth Δ230+.

And a third, from the Pulse Kit, where the rule is written correctly and simply does not compile: its Menu asks for `--color-surface-muted` on `.list .item.Mui-focusVisible`, with `Mui-focusVisible` written BARE. CSS Modules hashes that as a local class, so the selector matches nothing and an auto-focused menu item paints MUI's own `action.focus` instead. (The kit's Accordion gets it right - `.summary:global(.Mui-expanded)` - so it is an omission there, not a convention.) Transcribing the INTENT would have put the theme 10204 pixels away from the thing it replicates.
The habit that catches all three is the same: read the source to find out WHICH declarations exist, then read the rendered values out of the browser to find out what they resolve to - including "to nothing".

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
   Run `pnpm verify:behavior` too if the change touches box geometry; parity alone will not catch a transparent box or a differently-built seam.
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

`e2e/preflight.spec.ts` used to carry its own per-pair `maxDeltaOverrides` over a Δ2 default; both are gone. It now judges every pair against one flat `MAX_CHANNEL_DELTA` of 40, because what it exists to catch - a theme leaning on Tailwind - is structural and has always measured an order of magnitude above that, while the old floor needed re-tuning every time the gallery grew (the file's banner carries the measurements). On failure it writes a styled/pure/diff triptych beside parity's.

The pipeline itself is proved by a canary: `harness-canary` (shadcn gallery) is an intentionally-different pair the parity suite judges INVERTED - measuring its difference is the pipeline working, zero is the pipeline broken. Threshold override keys and `BY_DESIGN` entries are validated against live pair ids on every full run, so an exemption cannot outlive the pair it was a proof about.

Four things the pixel diff structurally **cannot** see, so do not rely on it for them:

- Captures of different sizes are diluted by padding into a small percentage, so a size difference is failed on its own terms instead (`DiffResult.sizes`).
- Sub-pixel geometry. A missing `line-height` left a label box 20.016px tall against 20.000 and the diff still reported zero differing pixels, because 0.032 device pixels rounds away. The font-metrics sweep in `e2e/behavior.spec.ts` is what holds those values; it found a missing `body1` line-height (24px against shadcn's `leading-7` 28px) that had been shipping green.
- **Two constructions that render the same picture.** shadcn's ButtonGroup removes the left border of each subsequent button, so a seam is one line; MUI keeps both borders, makes the right one transparent and overlaps them with `margin-left: -1px`, so a seam is two lines on one pixel. Same group width, same content positions, zero differing pixels on macOS - and two stacked borders composite differently from one, which a second platform then reported. The `painted geometry` sweep is the instrument for this class.
- **A transparent box.** MUI's vertical StepConnector stretches to the stepper's full width and paints only its left border: it looks like a 1px rule and measures 324px across. Parity was zero; `painted geometry` caught it.

Both of the last two were found by something other than the pixel diff, which is the point of the behaviour sweeps.
**Run `pnpm verify:behavior` before pushing any change that alters box geometry** - it takes about a minute and it is the only check that sees these.

### Cross-platform

The macOS gate and the non-blocking Linux job exist because one rasterizer hides what another shows.
Seven pairs that were an exact match on macOS differed on Linux by Δ67-121 - and the cause was neither noise nor a theme bug.
Every differing pixel sat inside a text band, no capture differed in size, and the signed difference averaged about zero against a large absolute one, which is a positional shift of glyphs.
Font **hinting** was the amplifier: it snaps an outline to the pixel grid based on where the glyph starts, so two texts a fraction of a pixel apart quantise to different grids instead of blurring together.
`--font-render-hinting=none` and `--disable-lcd-text` in `playwright.config.ts` remove it; the one real bug left underneath was the ButtonGroup seam above.

### Traps in the harness itself, not the theme

Each of these presents as a component bug and is not one:

- **Another checkout answering on port 5173.** `reuseExistingServer` is on outside CI, so a stale dev server from a different directory gets measured and reports a confident, wrong number. Check `lsof -ti:5173` before trusting a surprising result.
- **A cell wider than `MAX_PAIR_CONTENT_WIDTH`** slides under the fixed theme panel, whose left border then lands inside the screenshot - a crisp full-height line at Δ245 in a pair whose every computed style matches. Diagnosed twice before the limit was given a name in `PairGrid.tsx`.
- **Page furniture compositing into a capture.** The mode toggle sat at a z-index above shadcn's overlays and below MUI's, so a full-width top Drawer covered it on one side only. `roomBelow` exists for the same reason at the bottom of a row.
- **Anchored captures are timing- and position-sensitive.** They skip the sub-pixel snap on purpose, so they have nothing to absorb a box measured mid-animation (Radix animates with CSS *animations*; `transition: none` does not stop them, and Playwright's `animations: "disabled"` applies to the screenshot, not to `boundingBox()`). Round the capture's SIZE, never its far edges - size describes the components, an edge carries the row's position on the page. Rows are centred rather than minimally scrolled so an overlay always has the same room to open into.
- **Vite serving a STALE copy of the theme.** `xui` is a workspace dependency, so Vite can pre-bundle it - and then a theme edit does not reach the page at all. This is nastier than the stale-server trap above, because the server is yours and the file on disk is right: the browser simply keeps answering with the old module. It cost two bisection steps that each reported "not the cause" about a change that WAS the cause. If an edit seems to have no effect - especially if a computed style in the browser contradicts the source you just read - `rm -rf apps/showcase/node_modules/.vite` and restart before concluding anything.
- **A `pgrep -f "playwright test"` that matches your own watcher.** A shell loop waiting on the run contains that string in its own command line, so the check never goes false and a finished run looks like it is still going. Match on something the watcher does not contain, or read the reporter's summary line instead.
- **A loaded machine.** A full run is ~4 minutes at ~100 pairs; if it takes 15 and sits at 5% CPU it is blocking, not computing, and the parity failures you see will be the per-test budget rather than pixels. Read `e2e/results/report-*.md` directly before believing a red run.

## The mistake this project keeps making

**A rule written for the case you cover will reach the cases you do not, and style them wrongly.**

This is not a hypothetical and it is not rare.
Every instance below shipped, passed the suite, and was found only when a later pair happened to exercise the untreated case:

| Where | The rule | What it also hit |
| --- | --- | --- |
| `MuiFab` | `width/height` on the root | Every size, not just the 56px default - `size="small"` rendered as large |
| `MuiFab` | `:not(sizeSmall):not(sizeMedium)`, meant as "the default size" | `variant="extended"`, because Fab's default size is `large` - a 102x48 pill squashed to a 56px circle |
| `MuiRating` | `font-size` on the root | `size="small"` and `"large"`, pinned to the medium size |
| `MuiToolbar` | AppBar's height and padding | `TablePagination`, which renders its own Toolbar |
| `MuiDrawer` | The right anchor's width and border | All four anchors - a top sheet came out 384px wide instead of full-bleed |
| `MuiStepConnector` | The horizontal connector's margin, border and gap | The vertical one, whose rule is indented rather than filling a gap |
| `MuiImageListItemBar` | The bottom corners' radius | `position="top"`, square over a rounded tile |

Three habits avoid all of it:

1. **Key off the positive class, never a negation.** `&.MuiFab-circular` says what you mean; `:not(sizeSmall):not(sizeMedium)` says something you have to re-derive, and it was wrong.
2. **Ask what else renders this component.** MUI reuses internals aggressively - `MuiList` is inside Menu, Select and Autocomplete; `MuiToolbar` is inside AppBar and TablePagination; `MuiBackdrop` is inside Dialog, Drawer and Popover. An unscoped override reaches all of them.
3. **Leaving a surface untreated is a real choice, and it has to be written that way.** "No pair covers it" must mean the component keeps MUI's own geometry there, not that your one rule silently applies. Scope it, then say so in the `SCOPE:` note.

A sharper version of the same thing: **sometimes the obvious value is not merely redundant, it is wrong, and the right block is no block at all.** Two in blink, both measured before being left out, both with a comment where the block would have gone:

- `MuiBackdrop` - MUI's default already IS the kit's scrim, so writing `rgba(0, 0, 0, 0.5)` into `root` changes nothing a user sees and breaks something they do: Menu, Select and Popover render an INVISIBLE backdrop to stay click-away-able without dimming, and `.MuiBackdrop-invisible` is one class, so a plain `root` override ties on specificity and wins on order. 230 differing pixels open, 12337 anchored.
- `MuiTableHead` - a head reads white in the kit only because whatever is behind the table is; its container paints no background at all. `--color-surface` there does not match the kit, it overpaints the page: 57948 pixels at Δ18, exactly #fff against the #edeff0 canvas.

Both look like harmless restatements of a value you can see on screen. Neither is.

## When MUI's props do not line up with shadcn's variants

Sometimes there is no mapping, and the honest answer is that the gap is not the theme's to close.
Record which case you are in rather than leaving a blank:

- **No MUI prop exists.** shadcn's Item has `outline` and `muted` variants; MUI's `ListItem` has no `variant` at all, so a consumer reaches for `sx` or a styled component. App-level work.
- **No shadcn ground truth exists.** shadcn ships no rating, so its `size` ladder cannot be extracted. Scope the sizing to the covered size and leave the rest at MUI's geometry.
- **The mapping is many-to-few, so pick and justify.** shadcn's Item has three sizes and MUI has one `dense` flag. `dense` maps to `xs`, not `sm`, because `sm` is byte-identical to `default` at the item while `xs` tightens padding - which is what `dense` means in MUI. Write the reasoning down; the next person will otherwise re-litigate it.
- **The harness cannot see it.** Animations are disabled for determinism and overlay positions are normalized, so a selection animation or a toast's placement is invisible here by construction.

The README's surface table splits these out for exactly this reason - a gap someone can close and a gap nobody can look the same in a list, and only one is worth picking up.

## When the reference system is itself built on MUI

The Pulse Kit is: seven of its primitives (Accordion, Button, Dialog, Menu, Popover, Tabs, Tooltip) are MUI components with a CSS module bolted on. That changes two things, and getting either wrong produces a pair that passes while proving nothing.

**A reference cell must be wrapped in `RefProviders`, or the pair compares the theme against itself.**
The gallery page's provider is the theme under test, so an unwrapped kit primitive inherits it - and then anything the CSS module does NOT state moves on BOTH sides together and still measures zero. `RefProviders` re-wraps the reference cell in the app's own minimal `baselineTheme`, which is what the kit actually runs under.
This is easy to forget because the pair looks fine either way. The blink Tabs section was written without it and read 0 differing pixels; it read 0 again after the fix, which is the only reason the omission was harmless that time.

**The theme block becomes a transcription of the CSS module and nothing else.**
Every property the module leaves alone is already identical on both sides, so restating it asserts a value nobody extracted. What the module DOES state is genuinely compared, because the module wins on the reference side and the theme wins on the MUI side.

**Prop defaults the primitive hardcodes belong in `defaultProps`, not `styleOverrides`.**
The kit's Accordion pins `disableGutters` and `square`; its Tooltip pins `arrow`, `placement`, `enterDelay` and `leaveDelay`. Those are defaults, not styles - putting them in `defaultProps` reproduces the kit while leaving a consumer able to opt out.

## Components that MEASURE at mount

Some MUI components size a child from `getBoundingClientRect()` once and keep it in sync with a ResizeObserver. Tabs is the one that caught this out: it sizes its indicator from the selected tab, so a page that renders while the webfont is still swapping records the FALLBACK font's width, and the observer only corrects it if some OBSERVED box later changes size - which a fixed-width tab bar never does.

Measured on blink.html: three tabs 89/78/69 wide under an 89.5312px indicator, which is what "Overview" measures in the fallback face. preflight caught it as a 5px Δ147 difference between the styled and pure pages and reported it as "the theme is leaning on Tailwind", which it was not - the theme was identical on both.

`gallery/mountWhenFontsReady.tsx` is the fix, and the subtle part is why `document.fonts.ready` alone is not: it resolves once no load is PENDING, and nothing is pending before the page has rendered any text, because a browser only fetches a face when something needs it. Awaiting it on an empty document resolves immediately. Every declared face has to be `.load()`ed explicitly first.

Gate any new gallery entry on it. The cost is nothing on a warm load, and the class of bug it removes is invisible to the pixel diff whenever both sides happen to be stale together.

## MUI traps you will hit

MUI applies state and default styles at higher specificity than source order suggests.
`.Mui-checked`, `.Mui-focused`, `.Mui-disabled`, and internal color variants often beat a plain override.
Verify your override actually wins by reading computed styles in the browser, not by assuming your rule comes last.

The global `MuiButtonBase` `disableRipple` default does not reach `Checkbox`, `Radio`, or `Switch`; they resolve their own default and forward it, so restate `disableRipple: true` on each.

Portalled components (Select, Tooltip, Menu, Dialog, Popover) render outside their cell.
The harness handles them via an `open` state: both the MUI overlay and the reference overlay must carry `data-portal-target="<pairId>"` on their outermost portalled element so they are captured and diffed symmetrically.
When the reference component gives you nowhere to put that attribute, the pair declares `openSelector` instead - a stable, component-owned class the package ships deliberately (kumo's Tooltip spreads its rest props onto the Base UI root and puts `className` on the trigger, but its popup carries `kumo-tooltip-popup`).
The MUI side of such a pair still uses the attribute; only one side's overlay is ever open at a time, so the two never collide.

Popper places an overlay differently from Floating UI, and both differences are visible at 0 threshold:

- Popper's default "adaptive" mode splits the position between a `bottom` offset and a transform and rounds only the transform half, so the overlay lands a fraction of a pixel off Floating UI's device-grid-rounded position. `popperOptions: { modifiers: [{ name: "computeStyles", options: { adaptive: false } }] }` makes both round the same way.
- Popper centres an ARROW with an inline `translate3d`, which promotes it to its own compositing layer; a design system that places its arrow with plain `left` draws it in the parent's raster instead, and an arrow that is not symmetric about its own centre then lands a device pixel off. Popper's `gpuAcceleration: false` fixes the arrow but drags the popup off the grid; a `beforeWrite` modifier that rewrites `state.styles.arrow` to `left`/`top` fixes only the arrow (see `ARROW_BY_LAYOUT` in the kumo theme).

MUI renders Menu, Select and Popover inside a Modal whose invisible backdrop covers the trigger and suppresses its `:hover`, while Base UI deliberately leaves a trigger live so a second click closes the overlay.
The harness opens an overlay by clicking, so the pointer is still on the trigger - and the `anchored` capture frames the trigger too, which means those pairs compare hover states rather than placement (measured on kumo's dropdown: 12478 pixels, every one of them trigger fill).
No theme can reconcile that, so such a pair drops `anchored` and declares `anchored-to-trigger` instead, which measures where the overlay opens relative to its trigger without putting the trigger in the picture.
A pair that needs `anchored` anyway - kumo's popover, whose arrow hangs outside every other capture - uses an unstyled trigger so there is no hover to differ.

Popper and MUI's Popover round an overlay's position to different grids than Floating UI does (`Math.round` to whole CSS pixels against the device grid), so an overlay anchored to a trigger at a fractional position lands half a pixel out.
`applyState` snaps a cell onto whole pixels before opening for this reason, and `matchOverlayPhase` then puts the overlay itself on a whole pixel before it is captured.

That last step is the one to read before touching it (`e2e/lib/states.ts`).
An overlay has to be moved onto a whole pixel or its capture picks up a sliver of the page behind the cell, and the two cells have different content behind them.
But every obvious way to move it damages what is inside: a transform promotes the overlay to a compositing layer, where Chrome draws text with grayscale rather than subpixel antialiasing, so a nudge on one side alone re-rasterizes every glyph in it; a margin changes the element's outer size, which Base UI's and Floating UI's ResizeObservers feed straight back into positioning.
What works is rewriting the position as pure layout - fold whatever translate the positioner carries into `left`/`top`, drop the transform, and pin the opposite edges to `auto` so a height-auto box cannot stretch instead of moving.
Two details are load-bearing and each cost a real failure: the element rewritten is the outermost one carrying a transform, not the popup (making a static popup `relative` re-parents its absolutely positioned ARROW - 535 pixels at Δ241 on shadcn's tooltip; leaving the transform on an ancestor keeps the whole subtree in a layer - 1202 at Δ230 on kumo's), and an overlay already on a whole pixel is left completely alone.

Decoration painted OUTSIDE an overlay's border box - an outline band, a shadow's reach - is what the `overlay-matches` behavior exists for; the `open` capture clips at that box and the `anchored` capture's union box is only the overlay's and the trigger's.
That check compares colours in sRGB, because `getComputedStyle` preserves the space a value was authored in and Tailwind routes every shadow colour through an `oklab` `color-mix` - the same colour, spelled two ways.

## Adding another theme

This has now been done twice - kumo, then blink - so it is a walked path rather than a starting position.
What held up, and what the two additions changed:

**What is reusable as-is.** The harness (`e2e/`) knows nothing about shadcn - it diffs whatever a pair puts on each side.
`PairGrid`, the state machinery, the thresholds and every behaviour sweep carry over untouched.

**What each theme brings for itself.** Its own installed reference source, its own page pair (`<name>.html` + `<name>-pure.html`), its own `src/themes/<name>/` gallery, and its own entry in `playwright.config.ts` and `e2e/lib/themes.ts`.
The `Section`/`Pair` types have needed nothing new across all three.
Threshold and behaviour exceptions are scoped per theme for the reason `thresholds.ts` gives - a pair id is only unique within one gallery, and an exception is always a claim about one specific pair of implementations.

**Do not generalise the theme files.** Each is one self-contained file on purpose, and the constraint is a feature: a consumer can copy it the way they copy a shadcn component.
The advice used to be "wait until there are two, then look at what repeated". There are now three, and the answer is that almost nothing did: the repetition is in the SHAPE (a palette, a set of component blocks, provenance comments) and not in the values, and the values are the whole product.
What did get shared is the harness and the gallery plumbing, which never belonged in a theme file anyway.

**Budget for the reference system being inconsistent.** shadcn's Snackbar twin is the third-party `sonner`, which uses its own font stack, a 13px size off the type scale, a shadow that is not `shadow-lg`, and a raw `#3f3f3f` that ignores the theme.
All of it was transcribed as found, because the pair exists to match what a user sees.
Expect the same and resist tidying.

**Expect composed twins.** shadcn has no FAB, stepper, rating, bottom navigation, image grid, app bar or table pagination.
For those the gallery composes a twin from the system's real utilities and the parity number proves only that MUI renders *that composition* exactly.
Say so at the top of the block, and keep the composition to utilities the system genuinely ships.

**A twin has to reproduce the component, not just its appearance.** MUI's Fab creates a stacking context because a FAB floats; a plain button does not, and the difference changed how the shadow rasterized.
When a pair is mysteriously off, check what the MUI component *is* structurally before hunting for a colour.

**Expect the reference system to be built on MUI itself.** The Pulse Kit is, in part - see the section on that above. It makes the transcription easier and the pair easier to fake, in that order.

**Budget for a drop-in being a behaviour change, not only a skin.** blink's Spinner is the clearest case: the kit rotates a fixed quarter arc at 0.8s linear over a 20%-opacity track, where MUI rotates more slowly and grows and shrinks its arc over no track at all. Matching it meant `enableTrackSlot`, `disableShrink` and a pinned dash - a real change to how MUI animates. The frozen frame cannot tell a still spinner from a spinning one, so the `animates` sweep is what holds it.

## Commands

- `pnpm dev` runs the showcase at `/` (stock MUI and all three themes side by side); the parity galleries are at `/shadcn.html`, `/kumo.html` and `/blink.html`.
- `pnpm verify:parity` runs the full pixel-parity suite (every theme, light and dark, all pairs).
  Playwright projects are named `<theme>-<mode>`: `shadcn-light`, `shadcn-dark`, `kumo-light`, `kumo-dark`, `blink-light`, and each writes its own `e2e/results/report-<project>.md`.
  The per-test budget is derived from the pair count rather than fixed, so adding a pair cannot quietly eat the margin - it used to be a flat 240s, which was generous at ~90s and had become a near-miss that failed intermittently inside `resetState`, looking like a stuck overlay rather than a clock.
- While iterating on ONE component, filter to it for a ~5s loop instead of the full suite: `PARITY_PAIR=slider pnpm exec playwright test e2e/parity.spec.ts --project=shadcn-light` (comma-separated id prefixes; swap in `kumo-light` or `blink-light` for those galleries, or pass several projects). Run the full `pnpm verify:parity` once at the end to confirm no regressions.
- **Working in a git worktree? Set `PARITY_PORT`.** Playwright reuses whatever dev server is already on the port instead of starting one, so with a server running from another checkout the whole suite silently measures THAT checkout - a fresh worktree once "failed" on a pair that did not exist in it. Run `PARITY_PORT=5273 pnpm verify` (any free port), and start the dev server on the same port. The default 5173 is unchanged for the primary checkout.
- `pnpm verify` runs all three suites: parity, preflight (proves the theme does not depend on Tailwind's reset) and the behaviour sweeps.
- `pnpm verify:preflight` and `pnpm verify:behavior` run one suite alone; the behaviour sweeps honour `PARITY_PAIR` too, so iterating on one component covers its behaviours in seconds.
- `PARITY_DUMP=1` makes a parity run write the ref/mui/diff triptych for EVERY pair it touches, not just failures - the tool for diagnosing a pair that passes while still differing. Diffs land in `e2e/results/diffs/<project>/`, one directory per project.
- `pnpm typecheck` typechecks every package, the e2e harness, and the playwright/vitest configs.
- `pnpm lint` runs oxlint over the showcase (CI runs it too).
- `pnpm test:unit` runs the compare-utility tests and the cross-theme surface-parity ratchet.
- Diagnosing a pair means a throwaway Playwright script that opens the page and reads computed styles out of the browser. Name it `.<something>.mjs` at the repo root: `.gitignore` covers that shape, and `git add -A` will otherwise commit it - two got in that way before the rule existed.

## Conventions

Colors stay as the design system's own oklch strings; converting them away from oklch breaks parity against the reference.

Dark mode is each design system's OWN convention, not a normalized one - the themes are drop-ins, so they follow the system they replicate:

- shadcn - a `.dark` class on `<html>` (`colorSchemeSelector: "class"`).
- kumo - `data-mode="dark"` on `<html>` (`colorSchemeSelector: "data-mode"`, which MUI expands to `[data-mode="%s"]`).
- blink - light only so far; the kit's own convention is `[data-theme="dark"]`, which is what a dark scheme here would use.

Either way MUI's own `useColorScheme().setMode` writes it, so one toggle moves the MUI theme and the reference system's stylesheet together.
Gallery presentation components use inline styles only, so they render identically on the Tailwind-free `pure.html` page.
Links between pages must be built from `import.meta.env.BASE_URL`, never written as a bare `/kumo.html`: the built site is served from a `/xui/` subpath, and Vite rewrites asset references in the HTML entries but never an `<a href>` written in JSX - so all three of those links shipped dead.
Do not commit anything under `docs/superpowers/` or `.superpowers/`.
