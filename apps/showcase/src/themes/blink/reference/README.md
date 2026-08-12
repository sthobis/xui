# Blink reference layer (vendored Pulse Kit)

This directory is the **reference side** of every blink parity pair: the real Pulse Kit
as it exists in the app repo, copied in so the harness can render it next to a plain MUI
component under `blinkTheme`.

Nothing here is authored. Treat every file as read-only ground truth.
If a value looks wrong, it is wrong *upstream* - fix it there and re-vendor, never here.

## Where it came from

Source: `~/Documents/Projects/app/.claude/worktrees/design-system-ui`

| | |
| --- | --- |
| Branch | `design-system-ui` |
| Base commit | `0f701c7ca7903faa716ac0b101eb0cdc10b06d28` ("Fix ch queries fingerprint table resetting on sort change") |
| Copied on | 2026-08-12 |

**The kit itself was uncommitted at copy time**, so the base commit does not identify it.
`git status --short` in that worktree reported, for the paths we copied:

```
UU src/styles/global.css
?? src/styles/tokens.css
?? src/ui/components/
?? src/ui/primitives/
```

`??` means untracked (the entire kit - tokens and all 26 primitives - existed only in the
working tree). `UU` on `global.css` is a recorded-but-unresolved merge state; the file has
no conflict markers and was read as-is.

Companion source, used for the MUI side rather than copied here:
`~/Documents/Projects/app/.claude/worktrees/mui-themed` at `e0a2c60b1eead08d38de08e8eccd88946442c807`.

**Re-vendor when the kit changes upstream.** Once it is committed, replace the table above
with the real SHA and diff this directory against it.

## What is here

| Path | Upstream |
| --- | --- |
| `tokens.css` | `src/styles/tokens.css`, verbatim |
| `baselineTheme.ts` | `src/themes/index.ts`, verbatim - the minimal MUI theme the app runs, which the seven MUI-wrapping primitives render under |
| `base.css` | `src/styles/reset.css` + `src/styles/global.css` lines 2-85, verbatim (see below) |
| `primitives/<Name>/` | `src/ui/primitives/<Name>/`, verbatim - all 26 |

The app loads its base CSS as `reset.css` → `tokens.css` → `global.css`; `blink.html`
preserves that order.

### The MUI version gap - read this first

**The kit is written against MUI v5.17.1; this showcase runs MUI v9.2.0.**
(`design-system-ui` still has `"@mui/material": "^5.14.20"`; the v5→v9 upgrade lives on the
separate `mui-themed` branch, which does not carry the kit.)

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

1. **`global.css` line 1 dropped** - it imports Inter from Google Fonts. Inter is loaded in
   the app but never painted: `tokens.css` sets `--font-family-sans: "Source Sans Pro"`, and
   the live kit page measures `font-family: "Source Sans Pro"` on `<body>`. `DESIGN.md`
   confirms Inter is only the documented fallback substitute. The showcase page loads
   Source Sans Pro with the same `<link>` the app's renderer uses.
2. **`global.css` from `.echarts-tooltip` (line 86) onward dropped** - chart tooltips,
   toastify, react-date-range, simplebar and bootstrap leftovers. App furniture, no
   primitive depends on it.

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
  use and what `mui-themed` maps to MUI's `body1`. Both are correct; just never pair a bare
  kit `<span>` against `<Typography variant="body1">` and expect a match.
- **`reset.css` supplies `input, button, textarea, select { font: inherit }`.** MUI controls
  do not inherit `font-family` on their own, so a themed control that looks right on
  `blink.html` can measure differently on the reset-free `blink-pure.html`. That is exactly
  what the preflight suite is for (the shadcn and kumo themes both hit it on
  AccordionSummary).
- **Seven primitives wrap MUI internals** - Accordion, Button, Dialog, Menu, Popover, Tabs,
  Tooltip. Their cells must be wrapped in `baselineTheme`, or they render under `blinkTheme`
  and the pair compares the theme against itself.
