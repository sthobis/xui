# xui

Material UI v9 themes that make MUI components look pixel-for-pixel identical to another design system.

Two themes ship today, both verified in light and dark by the same pixel-parity harness:

- **`shadcnTheme`** replicates shadcn/ui's default look (new-york style, neutral base, Geist). Complete.
- **`kumoTheme`** replicates [Kumo](https://kumo-ui.com), Cloudflare's design system (Inter). Complete: Button, Text, Label, Link, Input, InputArea, Field, Checkbox, Radio, Switch, Badge, Banner, Meter, LayerCard, Tabs, Collapsible, Table, Breadcrumbs, Toolbar, InputGroup, and the whole portalled tier - Tooltip, DropdownMenu, Select, Popover, Dialog and Toast, arrows and backdrops and all.

Dark mode follows each design system's own convention, so a theme is a drop-in: shadcn uses a `.dark` class on `<html>`, kumo uses `data-mode="dark"`. Either way MUI's `useColorScheme()` drives it.

## Why

MUI gives you a mature, accessible component library with a huge surface area.
Other design systems give you a look people love.
xui lets you write ordinary MUI code and get that look, with no wrapper components and no change to how you use MUI.

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
- [x] Snackbar (shadcn Sonner)
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

- [x] Rating (no shadcn twin - whole and half values, and the hover preview)
- [x] Stepper (no shadcn twin - horizontal and vertical, first step)
- [x] Fab (no shadcn twin - composed from Button; circular and extended)
- [x] SpeedDial (no shadcn twin - closed state)
- [x] BottomNavigation (no shadcn twin - labels on and off)
- [x] Backdrop (shadcn Dialog/Sheet overlay)
- [x] Modal (the primitive under Dialog/Drawer)
- [x] Badge - the dot (shadcn AvatarBadge) and the count pill (shadcn Badge)
- [x] ImageList (no shadcn twin - all four variants, with caption bar)
- [x] TablePagination (no shadcn twin - caption and actions)
- [x] FormHelperText (shadcn FieldDescription / FieldError) + InputAdornment (via InputGroup)

### Surface coverage

Every component above has a verified pair.
Not every prop of every component does.

A component's theme block only styles what a gallery pair proves, because a value with no ground truth behind it is a guess, and guesses are what this project exists to avoid.
So the components below are themed for the surfaces listed as covered, and fall back to MUI's own look outside them.
That fallback is deliberate and, where it matters, defensive: `Fab`'s size rules are written so an untreated size keeps MUI's geometry instead of being forced to the one size that is covered.

The two tables below say different things, and running them together made the second look like a backlog.
The first is work not done yet.
The second is work that is not the theme's to do, and listing it as a gap only invites someone to try closing it.

#### Not covered yet

| Component | Covered | Still to do |
| --- | --- | --- |
| AppBar / Toolbar | The default static bar, the dense one, and `color="transparent"` | Nothing outstanding |
| Badge | The dot anchored to an avatar; the count pill in primary and error, including `showZero` | Nothing outstanding |
| BottomNavigation | The resting bar with one item selected, with labels on and off | Nothing outstanding |
| Fab | The circular ladder (56px default, `size="small"`, `size="medium"`) and `variant="extended"` | Nothing outstanding |
| ImageList | Every variant (`standard`, `masonry`, `quilted`, `woven`); per-item row and column spans; the caption bar at all three positions, with `title`, `subtitle` and `actionIcon` | Nothing outstanding |
| List | Plain items; items with an icon, a description, or both; `dense`, which maps to shadcn's `xs` size; `ItemSeparator`; and `ItemActions` | Nothing outstanding |
| Rating | Read-only display at whole and half values, and the hover preview | Nothing outstanding |
| Snackbar | A message alone, with an action, with a description, and with a cancel button | Nothing outstanding |
| SpeedDial | Closed, and open with its actions | Nothing outstanding |
| Stepper | Horizontal and vertical, on the first step | Disabled steps |
| TablePagination | Caption, actions, the rows-per-page control, and the first and last page buttons | Nothing outstanding; the rows-per-page menu when open is covered by the `select-*` pairs |

#### Not the theme's to close

| Surface | Why it stays open |
| --- | --- |
| `Dialog` and `Drawer`'s corner close button | It is a `size="icon-sm"` ghost IconButton, which `iconbutton-small` already covers. Only where an app positions it is untested, and a theme does not own layout |
| `List` Item's `outline` and `muted` variants, and its `sm` size | MUI's `ListItem` has no variant prop and only one density flag, so reaching these means `sx` or a styled component - app work |
| `List` Item's `ItemHeader` and `ItemFooter` | Pure composition slots - a `basis-full` row inside the item, which a consumer writes as a div. MUI has no counterpart slot, so there is nothing for a theme to style |
| `Rating`'s `size` ladder | shadcn ships no rating, so there is no ladder to extract. The sizing is scoped so the uncovered sizes keep MUI's own geometry rather than being pinned to the covered one |
| `Badge`'s `overlap="circular"`, and the count pill's placement | shadcn ships no anchored count anywhere, so nothing grounds a position. The theme styles the pill and leaves MUI's placement alone |
| `AppBar`'s elevation above 0 | shadcn's header has no shadow at any depth, so there is no value to extract |
| `AppBar`'s `position="fixed"` and `"sticky"` | A fixed bar escapes its gallery cell, so the harness cannot frame it without a new capture mode. A limitation of the check, not of the theme |
| `Stepper`'s completed and error step glyphs | MUI hardcodes its own check and warning vectors and no CSS reshapes them. Closing either means the theme shipping a `stepIcon` component, which is a design decision rather than an extraction |
| `SpeedDial`'s action tooltips | `SpeedDialAction` renders MUI's own Tooltip, so the surface a theme owns is already verified by the `tooltip-*` pairs. A pair here would only assert where MUI places it, and shadcn ships no speed dial to ground that |
| `Snackbar`'s close button | sonner positions it from the Toaster's own `--toast-close-button-start/end/transform` variables, so a faithful twin would depend on Toaster configuration rather than on anything the theme can reach |
| `BottomNavigation`'s selection animation, and `Badge`'s `invisible` transition | The harness disables animations so a capture is deterministic. Anything whose whole content is the transition is invisible to it by construction, not by omission |
| `Snackbar`'s placement | The open state captures the toast alone and normalizes its position, precisely so a pair measures the box rather than where the library parked it. That makes placement unmeasurable here by the same decision |

Components in neither table have no recorded gap, which means the pairs cover the surfaces we set out to cover, not that every prop MUI exposes has been exercised.

The second table is not a to-do list, and the distinction is the point.
An entry there is closed as far as this project is concerned - by a missing prop in MUI, a missing component in shadcn, or a deliberate property of the harness.
The first table is the only one worth picking work from.

Anything unchecked in either section still renders.
It just renders in MUI's default look rather than the shadcn look, which is a cosmetic gap and never a broken component.
The showcase is the source of truth for exactly what is covered today.
