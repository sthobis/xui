# @sthobis/xui

Material UI v9 themes that make MUI components look pixel-for-pixel identical to another design system, verified by a zero-threshold screenshot harness. Your components stay plain MUI - no wrapper components, no prop changes.

Three themes ship today:

| Theme | Replicates | Font | Icons used by the theme | Dark mode |
| --- | --- | --- | --- | --- |
| `shadcnTheme` | [shadcn/ui](https://ui.shadcn.com) (new-york style, neutral base) | Geist | `lucide-react` | `.dark` class on `<html>` |
| `kumoTheme` | [Kumo](https://kumo-ui.com), Cloudflare's design system | Inter | `@phosphor-icons/react` | `data-mode="dark"` on `<html>` |
| `blinkTheme` | the Pulse Kit (Pulse / NeverBlink) | Source Sans Pro | `lucide-react` | light only so far |

## Install

Install the package next to MUI, plus the icon package and font for the theme you use:

```bash
# shadcn
npm install @sthobis/xui @mui/material @emotion/react @emotion/styled lucide-react @fontsource-variable/geist

# kumo
npm install @sthobis/xui @mui/material @emotion/react @emotion/styled @phosphor-icons/react @fontsource-variable/inter

# blink
npm install @sthobis/xui @mui/material @emotion/react @emotion/styled lucide-react @fontsource/source-sans-pro
```

The icon packages are optional peer dependencies: each theme needs only its own, so install the one(s) for the theme(s) you actually use.

## Usage

Import the theme from its own subpath and wrap your tree in it:

```tsx
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { shadcnTheme } from "@sthobis/xui/shadcn"
import "@fontsource-variable/geist"

export function App() {
  return (
    <ThemeProvider theme={shadcnTheme} defaultMode="light">
      <CssBaseline />
      {/* plain MUI components render in the shadcn look */}
    </ThemeProvider>
  )
}
```

`@sthobis/xui/kumo` and `@sthobis/xui/blink` work the same way (blink imports the four Source Sans Pro weights: `@fontsource/source-sans-pro/300.css`, `400.css`, `600.css`, `700.css`).

**Prefer the subpath import over `import { shadcnTheme } from "@sthobis/xui"`.** Each theme extends MUI's prop types for the variants its design system adds (kumo declares `<Button size="xsmall">` and extra `Chip` colors, blink declares `<Button variant="light">`, and so on). Importing from the package root loads all three themes' declaration files, so the compiler would accept another theme's props with no styling behind them. The subpath import scopes those type extensions to the theme you actually run.

### Dark mode

Each theme follows its own design system's convention, so it drops into an app already using that system:

- **shadcn** - a `.dark` class on `<html>` (`colorSchemeSelector: "class"`).
- **kumo** - `data-mode="dark"` on `<html>`.
- **blink** - light only for now; the Pulse Kit's own convention is `[data-theme="dark"]`, which is what a dark scheme here will use when it lands.

Either way, MUI's own `useColorScheme().setMode` writes the selector, so one toggle drives the MUI theme and the design system's stylesheet together.

## Copying instead of installing

Every theme is one self-contained file - `src/themes/shadcn.ts`, `src/themes/kumo.ts`, `src/themes/blink.ts` - importing only from `@mui/material/*`, `react`, and its icon package. You can copy the file into your app the way you copy a shadcn component and edit it in place. `src` ships in the published package for exactly that reason, with every provenance comment intact.

## What is covered

Every value in a theme is extracted from the real design-system source rather than approximated, and each carries a comment naming the class or token it came from. A Playwright + pixelmatch harness renders each MUI component beside its real counterpart and compares them at a per-pixel threshold of zero.

MUI's surface is wider than any of these systems'. Components the design system does not ship (each theme file marks them - Slider and Rating land here for some themes, Avatar, Skeleton and Stepper for others) are styled from the system's own tokens so they blend in rather than rendering as stock Material; for those, the pixel guarantee does not apply and the block says so.

See the [repository README](https://github.com/sthobis/xui#readme) for the per-component list and the scope notes.
