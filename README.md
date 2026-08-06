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

## Migration progress

Components are migrated tier by tier.
A checked box means the MUI component reaches verified 0.00% pixel parity with its shadcn twin in both light and dark.
The scope is `@mui/material` core; MUI X (DataGrid, Date Pickers, Tree View) is out of scope for now.

### Tier 1 - primitives

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

### Tier 2 - overlays and navigation

- [x] Menu
- [x] Dialog
- [x] Drawer (shadcn Sheet)
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

### Tier 3 - long tail and components with no direct shadcn equivalent

Styled in shadcn's design language so they blend in.
For these there is no installed component to extract from, so the twin in the gallery is composed from shadcn's own documented utilities and the parity number proves that MUI renders that composition exactly - not that the composition is what shadcn would ship.
Each such block says so at the top.
AppBar / Toolbar above is the first of these.

- [x] Rating (no shadcn twin - read-only display)
- [x] Stepper (no shadcn twin - horizontal, first step)
- [x] Fab (no shadcn twin - composed from Button)
- [x] SpeedDial (no shadcn twin - closed state)
- [x] BottomNavigation (no shadcn twin)
- [x] Backdrop (shadcn Dialog/Sheet overlay)
- [x] Modal (the primitive under Dialog/Drawer)
- [x] Badge - dot only (shadcn AvatarBadge); the count pill has no shadcn twin
- [x] ImageList (no shadcn twin - standard variant)
- [x] TablePagination (no shadcn twin - caption and actions)
- [x] FormHelperText (shadcn FieldDescription / FieldError) + InputAdornment (via InputGroup)

Anything not yet checked still renders, just with MUI's default look rather than the shadcn look.
The showcase is the source of truth for exactly what is covered today.
