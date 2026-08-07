# xui

Material UI v9 themes that make MUI components look pixel-for-pixel identical to another design system.

The first theme, `shadcnTheme`, replicates shadcn/ui's default look (new-york style, neutral base, Geist) in both light and dark mode, so closely that a regular eye cannot tell a themed MUI component from a real shadcn one.

## Install

```bash
npm install xui @mui/material @emotion/react @emotion/styled
```

The theme uses the Geist typeface. Install it however you prefer - for example `npm install @fontsource-variable/geist` and import it once at your entry point.

## Usage

Wrap your tree in the theme. Your components stay plain MUI.

```tsx
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { shadcnTheme } from "xui"

export function App() {
  return (
    <ThemeProvider theme={shadcnTheme} defaultMode="light">
      <CssBaseline />
      {/* plain MUI components render in the shadcn look */}
    </ThemeProvider>
  )
}
```

Dark mode activates via the `.dark` class on `<html>`, the same mechanism shadcn uses, so one toggle drives both systems together.

## Copying instead of installing

The theme is one self-contained file, `src/themes/shadcn.ts`. It imports only from `@mui/material/styles`, `react` and `lucide-react`, so you can copy it into your own app the way you copy a shadcn component, and edit it in place. It ships in the published package for exactly that reason.

## What is covered

Every value in the theme is extracted from real shadcn source rather than approximated, and each carries a comment naming the class it came from. A Playwright and pixelmatch harness renders each MUI component beside its shadcn twin and compares them in both schemes.

A handful of components have no shadcn equivalent at all (AppBar, Fab, Rating, Stepper, BottomNavigation, ImageList, TablePagination). Those are styled in shadcn's design language so they blend in, and each says so at the top of its block - for them, the comparison shows that MUI matches a composition assembled from shadcn's own utilities, not that shadcn ships that composition.

See the repository README for the per-component list and the scope notes.
