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
```

Contributor and agent guidance lives in [AGENTS.md](AGENTS.md).

## Status

Foundations, the parity harness, and the first components are complete at verified pixel parity in light and dark.
More components are being added tier by tier.
The showcase is the source of truth for what is covered today.
