# showcase

The Vite app the themes are developed and verified in. It is not a product; it exists so that every
value in `packages/xui` can be extracted from a real component and then proved against it.

Read [AGENTS.md](../../AGENTS.md) first - it explains the rules this app enforces. This file only
maps the terrain.

## Seven entries, and why they stay separate

| Entry | What it is |
| --- | --- |
| `index.html` | The SHOWCASE: one row per component, four columns - stock MUI, shadcn-themed, kumo-themed, blink-themed. Deployed to GitHub Pages. |
| `shadcn.html` / `pure.html` | shadcn's parity gallery (real shadcn/ui beside themed MUI), and the same MUI cells with no Tailwind loaded. |
| `kumo.html` / `kumo-pure.html` | The same pair of pages for kumo. |
| `blink.html` / `blink-pure.html` | The same pair for blink (the Pulse Kit). |
| `export.html` | The EXPORT page: pick a theme, turn a few preset knobs (shadcn only - primary colour, font, radius), choose TypeScript or JavaScript and whether comments ship, and download the one-file theme. See `src/export/customize.ts` for the contract with the theme files. |

The separation is the point, not an accident of growth: two design systems' Tailwind themes, base
layers and fonts must never load on one page, or the 0-threshold pixel harness measures whichever
won the cascade. The showcase can hold every THEME at once precisely because it renders no
REFERENCE component - no design-system stylesheet loads there at all. Each column re-declares its
theme's CSS variables inline and carries its own `ScopedCssBaseline` and portal host;
`src/showcase/Showcase.tsx` documents why each of those is load-bearing.

Every entry mounts through `src/gallery/mountWhenFontsReady.tsx`. Gate any new entry on it too -
components that measure at mount (Tabs) otherwise record the fallback font's geometry, a bug the
pixel diff cannot see (the helper's banner carries the measurements).

## Layout

- `src/gallery/` - theme-agnostic plumbing: `PairGrid`, `Sidebar`, `ThemePanel`,
  `mountWhenFontsReady`, and the `Pair`/`Section` types every gallery shares.
- `src/themes/<name>/` - one theme's pages: entry, `App`, `Providers`, CSS, the Tailwind-free
  `pure` entry, and `sections/` (one file per component, each rendering ref/MUI pairs).
- `src/showcase/` - the four-column showcase page and its `columnOverrides`.
- `src/components/ui/` - the real shadcn/ui source, installed by the shadcn CLI. **This is
  shadcn's ground truth** (see AGENTS.md), so files here are never edited to make a pair pass.
- `src/themes/blink/reference/` - the vendored Pulse Kit. Read its own README before touching
  anything in it.

### Vendored shadcn components without a pair

`src/components/ui/` holds more components than the gallery pairs (calendar, carousel, chart,
command, sidebar, and friends), along with the handful of dependencies that exist only to serve
them. That is a recorded choice, not an oversight: they are the un-paired remainder of the shadcn
surface, kept so that adding a pair starts from the already-installed ground truth rather than
from a fresh CLI run against a possibly newer registry. They cost install weight, not correctness -
nothing imports them outside this directory.

## Commands

Run everything from the repo root - `pnpm dev`, `pnpm verify`, and the per-suite scripts are
documented in the root README and AGENTS.md. The one command that is this app's own:

```bash
pnpm --filter showcase lint   # oxlint (also wired into `pnpm lint` at the root and into CI)
```
