# Blink reference snapshot (regression baseline)

**Read this first: this directory is a BASELINE, not an authority.**

It is a snapshot of the design system's component source as it stood when `blinkTheme` was first
written, copied in so the harness can render it beside a plain MUI component under the theme.
It had a different job then - blink was built by replicating this code, and these files were the
ground truth every value was extracted from.

That is no longer what blink is. The design system is **ours**, so `blinkTheme` is the definition of
the design rather than a copy of it, and blink now covers **all of MUI** - far more than this
snapshot contains. Most of what the theme styles today has no twin in here at all.

So this directory now does exactly one thing: **it keeps the components that were already right from
silently moving.** The pairs built against it diff at zero, and they must keep diffing at zero, so a
refactor cannot quietly change a component nobody was looking at. That is worth keeping. It is not
worth mistaking for a design authority.

Concretely, this directory:

- **does NOT bound blink's surface.** A component absent from here is not out of scope; it is the
  normal case. See "Deriving a component blink has no twin for" in the root `AGENTS.md`.
- **does NOT settle a design question.** If a value here and a considered improvement disagree, the
  improvement can win - see the table at the bottom of this file for how that is recorded.
- **is still read-only in the ordinary case.** Nothing here is authored for this repo, and a value
  is not to be edited to make a pair pass. That is the same offence as raising a threshold.

The bounded exception is the **"Local design changes pending upstream"** table at the bottom: the
complete list of places this copy no longer matches what was vendored, each one a deliberate design
change made here that the theme carries identically, so parity stays at zero and the diff is what
gets ported back upstream.

## Where it came from

Upstream is a **private repository**, so this file describes it by role rather than by name: xui is
public and a reader here cannot reach that source, and a path, branch or commit hash that resolves
for nobody is worse than no citation at all. The real repository, worktree, branch and commit are
recorded in `PROVENANCE.private.md` beside this file, which `.gitignore` keeps out of the
repository. If you have the source checked out, read that first; if you do not, nothing below
depends on it.

Copied on 2026-08-12. **The kit was uncommitted upstream at copy time** - tokens and all 26
primitives existed only in a working tree - so no commit identifies this copy, and re-vendoring
means diffing this directory against the working tree by hand rather than against a tag.

## What is here

| Path | Upstream |
| --- | --- |
| `tokens.css` | the kit's token sheet, verbatim |
| `baselineTheme.ts` | the app's own MUI theme entry, verbatim - the minimal theme the app runs, which the seven MUI-wrapping primitives render under |
| `base.css` | the app's CSS reset plus the generic head of its global stylesheet, verbatim (see below) |
| `primitives/<Name>/` | the kit's primitive of that name, verbatim - all 26 |

The app loads its base CSS as reset → tokens → globals; `blink.html` preserves that order.

### The MUI version gap - read this first

**The kit is written against MUI v5.17.1; this showcase runs MUI v9.2.0.**
(The kit's own source still pins `"@mui/material": "^5.14.20"`; the app's v5→v9 upgrade lives on a
separate branch that does not carry the kit.)

Nineteen of the 26 primitives are plain React and do not care. The seven that wrap MUI
internals - Accordion, Button, Dialog, Menu, Popover, Tabs, Tooltip - do, and they were
ported to the v9 API when vendored.

**Porting them was necessary, not a compromise.** The pair's whole job is to isolate one
variable: kit CSS module vs `blinkTheme`. If the reference side ran v5 while the MUI side
runs v9, the two sides would emit structurally different DOM and the pairs would be
comparing MUI versions as much as styling - many would be unfixable for reasons that have
nothing to do with the theme. Running both sides on v9 is what makes a zero-pixel result
mean what we want it to mean. It also matches the deliverable: `blinkTheme` is a v9 theme.

The visual ground truth is unaffected either way - every value the theme copies comes from
the kit's CSS modules and `tokens.css`, which are version-independent.

### Edits made while copying

**In `base.css`** (both subtractive):

1. **The Inter import dropped** - the app's global stylesheet opens by pulling Inter from Google
   Fonts. Inter is loaded in the app but never painted: the vendored `tokens.css` set
   `--font-family-sans: "Source Sans Pro"`, and the live kit page measures that family on
   `<body>` (the copy here now says `"Source Sans 3"` - the design change recorded in the table
   below). The kit's design spec confirms Inter is only the
   documented fallback substitute. The showcase page loads the family through
   `@fontsource/source-sans-3` imports in `blink.css` (the app fetches its faces from
   Google Fonts; bundling them keeps the harness's rasterization identical everywhere -
   `blink.css`'s own note records the deviation).
2. **Everything from `.echarts-tooltip` onward dropped** - chart tooltips, toastify,
   react-date-range, simplebar and bootstrap leftovers. App furniture, no primitive depends on it.

**In `primitives/`** - no styling was touched; every edit is an API port or a tsconfig
accommodation:

| File | Edit | Why |
| --- | --- | --- |
| `Menu/index.tsx` | `TransitionComponent` / `TransitionProps` props → `slots={{ transition }}` / `slotProps` | v9 moved transitions to the slot API |
| `Popover/index.tsx` | same | same |
| `Dialog/index.tsx` | `TransitionComponent={PopTransition}` → `slots={{ transition: PopTransition }}` | same |
| `Dialog/index.tsx` | `disableEscapeKeyDown={!dismissible}` dropped | **v9 removed the prop outright** (it is gone from `ModalProps` too). Behaviour-only and invisible to the harness, which never presses Escape. The `dismissible` guard on `backdropClick` still works. |
| `Button`, `Card`, `Dialog`, `FormField` | `import { X }` → `import { type X }` for type-only names | this repo compiles with `verbatimModuleSyntax`; the app does not. No runtime effect. |

Nothing else needed stripping: the kit imports only `react`, `classnames`, `lucide-react`,
`@mui/material`, `react-transition-group` and its own siblings - no stores, no router, no MobX.

## Facts worth knowing before you theme against this

- **`<body>` is 16px, `body1` is 15px.** Nothing sets a font-size on `body`, so the reference
  side inherits the browser's 16px, while `tokens.css --text-md` (15px) is what *components*
  use and what the app's own MUI theme maps to MUI's `body1`. Both are correct; just never pair a bare
  kit `<span>` against `<Typography variant="body1">` and expect a match.
- **`base.css`'s reset half supplies `input, button, textarea, select { font: inherit }`.** MUI controls
  do not inherit `font-family` on their own, so a themed control that looks right on
  `blink.html` can measure differently on the reset-free `blink-pure.html`. That is exactly
  what the preflight suite is for (the shadcn and kumo themes both hit it on
  AccordionSummary).
- **Seven primitives wrap MUI internals** - Accordion, Button, Dialog, Menu, Popover, Tabs,
  Tooltip. Their cells must be wrapped in `baselineTheme`, or they render under `blinkTheme`
  and the pair compares the theme against itself.

## Local design changes pending upstream

These are the only files here that differ from what was vendored, and every difference is a
deliberate change to the Pulse Kit rather than a transcription error. Each is mirrored exactly in
`packages/xui/src/themes/blink.ts`, which is why `blink-light` still reports zero differing pixels -
the pair is comparing the new kit against the new theme, and it would go red the moment one side
were changed without the other.

**Port these upstream and re-vendor.** Until that happens, this directory is one commit ahead of the
kit rather than a copy of it, and a naive re-vendor would silently revert every one of them.
(`PROVENANCE.private.md` names the paths they go back to.)

| File | Was | Is | Why |
| --- | --- | --- | --- |
| `tokens.css` | `--focus-ring` / `--focus-ring-destructive` spread `4px` | `3px` | At 4px the ring reads as a halo around a 32px control rather than an outline on it, and rings on neighbouring controls in a dense row very nearly touch. |
| `primitives/Alert/Alert.module.css` | `box-shadow: inset 3px 0 0 0 var(--alert-bar)` | `box-shadow: inset 0 0 0 1px var(--alert-border)`, the accent at 25% | An inset shadow follows the corner radius, so a one-sided bar tapered off at both ends into a curved sliver that belongs to no other primitive. A full hairline ring puts the callout in the same surface-plus-border language as Card, Menu and Popover. Still a shadow rather than a border, for the reason the bar was: it costs no box model. |
| `primitives/Menu/Menu.module.css` | `.paper { padding: var(--space-2) }` | `var(--space-1)` | The gutter only has to be visible for the item highlight to read as an inset pill. At two steps a three-item menu was mostly gutter. |
| `primitives/Menu/PopTransition.tsx` | one duration for both directions, defaulting to `150` | duration per direction, defaulting to `{ enter: 150, exit: 0 }` | Opening is new information arriving and is worth animating; closing is the user having already decided, and a fade held over their next click reads as lag. The CSS duration has to follow the direction too, or a 150ms fade-out just gets unmounted mid-way. |
| `primitives/Menu/index.tsx`, `primitives/Popover/index.tsx` | `transitionDuration = 150` | `transitionDuration = { enter: 150, exit: 0 }` | The same change, at the two call sites that set the default. `Dialog` deliberately keeps a symmetric 150ms - a modal vanishing out from under a click is not the same reassurance as a menu doing it. |
| `tokens.css` | `--font-family-sans: "Source Sans Pro"` | `"Source Sans 3"` | The design adopts the maintained successor of the same typeface - Source Sans Pro is frozen upstream, Source Sans 3 is where its fixes and hinting work land. Same designer, same metrics by design. `baselineTheme.ts` carries the identical change, and the showcase loads the family from `@fontsource/source-sans-3`. |
| `baselineTheme.ts` | `fontFamily` begins `"Source Sans Pro"` | `"Source Sans 3"` | The same change, at the stack the seven MUI-wrapping primitives render under. |
| `primitives/Button/Button.module.css` | `.root { font-weight: 600 }` | `500` | The kit's own spec always said 500; the module shipped 600 and the theme carried what painted. The design now agrees with its spec - a button label at 500 sits between the body's 400 and the headings' 600 instead of matching the headings. |
| `base.css` (the global `a` rule) | `text-decoration: none` | `underline`, `0.0625em` thick, `0.15em` offset, tinted to 35% of `currentColor`, full strength on `:hover` | A link that is only a colour is a link that is invisible to anyone who cannot see the colour. The browser's own underline sits on the baseline at full strength and clips descenders at 15px, so all three measurements are stated rather than inherited. |
