# xui

Material UI v9 themes that make MUI components look pixel-for-pixel identical to another design system.

The first theme, `shadcnTheme`, replicates shadcn/ui's default look so closely that a regular eye cannot tell a themed MUI component from a real shadcn component, in both light and dark mode.
The repository is structured so more themes (for other design systems) can be added later, reusing the same gallery and verification harness.

## Why

MUI gives you a mature, accessible component library with a huge surface area.
shadcn/ui gives you a look people love.
xui lets you write ordinary MUI code and get the shadcn look, with no wrapper components and no change to how you use MUI.

## Usage

Install MUI, xui, and the Geist font in your app, then wrap your tree in the theme.

```tsx
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { shadcnTheme } from "xui"

export function App() {
  return (
    <ThemeProvider theme={shadcnTheme} defaultMode="light">
      <CssBaseline />
      {/* your app - plain MUI components render in the shadcn look */}
    </ThemeProvider>
  )
}
```

The theme is one self-contained file (`packages/xui/src/themes/shadcn.ts`).
You can install the package, or copy that single file into your app the way you copy a shadcn component.

Dark mode activates via the `.dark` class on `<html>`, the same mechanism shadcn uses, so a single toggle drives both systems in lockstep.

## How it works

Every styling value in the theme is extracted from the real shadcn source, not approximated.
The showcase app installs the actual shadcn/ui components and renders each MUI component directly beside its shadcn twin.
A Playwright and pixelmatch harness screenshots each pair in both light and dark and fails if a single non-antialiased pixel differs.
This is what keeps the "a regular eye cannot tell" promise honest and prevents drift over time.

## Development

```bash
pnpm install
pnpm dev              # run the showcase (side-by-side comparison at /, MUI-only at /pure.html)
pnpm verify:parity    # pixel-compare every shadcn/MUI pair, light and dark
pnpm verify           # parity plus the preflight independence check
pnpm typecheck
pnpm test:unit          # the compare-utility tests
pnpm --filter xui build # emit dist/ for publishing (consumers get the built output; this repo uses src)
```

`xui`'s `exports` deliberately point at TypeScript source so a theme edit shows up in the showcase and the parity harness without a build step; `publishConfig` swaps in `dist/` for consumers.
The published package ships both, because copying `src/themes/shadcn.ts` into your own app is a supported way to use it.

Contributor and agent guidance lives in [AGENTS.md](AGENTS.md).

## Coverage

Coverage answers two different questions, and this section keeps them apart on purpose.

**Component coverage** asks: does this MUI component have a verified twin at all?
**Surface coverage** asks: how much of that component - which props, variants and states - is actually verified?

A single checklist conflates the two and flatters the result.
Component coverage below is complete; surface coverage is not, and the gaps are listed rather than left in source comments.

The scope is `@mui/material` core.
MUI X (DataGrid, Date Pickers, Tree View) is out of scope for now.

### Component coverage

A checked box means the component has at least one pair that reaches zero differing pixels against its shadcn twin, in both light and dark.

#### Tier 1 - primitives

- [x] Button
- [x] IconButton
- [x] TextField (Input + Textarea)
- [x] Checkbox
- [x] Radio / RadioGroup
- [x] Switch
- [x] Select
- [x] Slider
- [x] Chip (shadcn Badge)
- [x] Avatar
- [x] Divider (shadcn Separator)
- [x] Skeleton
- [x] LinearProgress / CircularProgress
- [x] Alert
- [x] Card / Paper
- [x] Typography
- [x] Link
- [x] Tooltip

#### Tier 2 - overlays and navigation

- [x] Menu
- [x] Dialog
- [x] Drawer (shadcn Sheet, all four anchors)
- [x] Popover
- [x] Snackbar (shadcn Sonner, single-line message)
- [x] Accordion
- [x] Tabs
- [x] Breadcrumbs
- [x] Pagination
- [x] Table
- [x] List
- [x] AppBar / Toolbar (no shadcn twin - see note below)
- [x] ButtonGroup
- [x] ToggleButton / ToggleButtonGroup
- [x] InputGroup (MUI InputAdornment)
- [x] Autocomplete (shadcn Combobox)

#### Tier 3 - long tail and components with no direct shadcn equivalent

Styled in shadcn's design language so they blend in.
For these there is no installed component to extract from, so the twin in the gallery is composed from shadcn's own documented utilities and the parity number proves that MUI renders that composition exactly - not that the composition is what shadcn would ship.
Each such block says so at the top.
AppBar / Toolbar above is the first of these.

- [x] Rating (no shadcn twin - read-only display)
- [x] Stepper (no shadcn twin - horizontal, first step)
- [x] Fab (no shadcn twin - composed from Button; circular and extended)
- [x] SpeedDial (no shadcn twin - closed state)
- [x] BottomNavigation (no shadcn twin)
- [x] Backdrop (shadcn Dialog/Sheet overlay)
- [x] Modal (the primitive under Dialog/Drawer)
- [x] Badge - the dot (shadcn AvatarBadge) and the count pill (shadcn Badge)
- [x] ImageList (no shadcn twin - standard variant)
- [x] TablePagination (no shadcn twin - caption and actions)
- [x] FormHelperText (shadcn FieldDescription / FieldError) + InputAdornment (via InputGroup)

### Surface coverage

Every component above has a verified pair.
Not every prop of every component does.

A component's theme block only styles what a gallery pair proves, because a value with no ground truth behind it is a guess, and guesses are what this project exists to avoid.
So the components below are themed for the surfaces listed as covered, and fall back to MUI's own look outside them.
That fallback is deliberate and, where it matters, defensive: `Fab`'s size rules are written so an untreated size keeps MUI's geometry instead of being forced to the one size that is covered.

| Component | Covered | Not covered |
| --- | --- | --- |
| AppBar / Toolbar | The default static bar | `position="fixed"` and `"sticky"`, elevation above 0, the dense variant, non-default `color` |
| Badge | The dot anchored to an avatar; the count pill in primary and error | `showZero`, the `invisible` transition, `overlap="circular"`. The pill's *placement* is MUI's own, not shadcn's, because shadcn ships no anchored count to copy |
| BottomNavigation | The resting bar with one item selected | `showLabels={false}`, the selection animation |
| Dialog | The open dialog with a header and footer | The `size="icon-sm"` close button shadcn draws in the corner |
| Drawer | All four anchors, with a header | The `size="icon-sm"` close button |
| Fab | The circular 56px default, `size="small"`, and `variant="extended"` | `size="medium"` |
| ImageList | The standard variant at a fixed column count | `variant="masonry"`, `"quilted"` and `"woven"`, `ImageListItemBar`, per-item row and column spans |
| List | Plain items, items with an icon, items with a description | An icon and a description on the same item, which shifts the icon's alignment |
| Rating | Read-only display at whole-number values | Hover preview, click to set, `precision` below 1, the `size` ladder |
| Snackbar | A single-line message, with and without an action | Title plus description, the cancel and close buttons, placement |
| SpeedDial | Closed, and open with its actions | The tooltips an action can show |
| Stepper | Horizontal, on the first step | Completed steps, the vertical orientation, error and disabled steps |
| TablePagination | Caption, actions, and the rows-per-page control | The first and last page buttons |

Components not listed here have no recorded gap, which means the pairs cover the surfaces we set out to cover, not that every prop MUI exposes has been exercised.

Anything unchecked in either section still renders.
It just renders in MUI's default look rather than the shadcn look, which is a cosmetic gap and never a broken component.
The showcase is the source of truth for exactly what is covered today.
