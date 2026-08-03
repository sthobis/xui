import MuiTypography from "@mui/material/Typography"
import type { Section } from "../../../gallery/types"

// shadcn/ui ships no installed Typography component - the ground truth for this section is
// shadcn's own documented type scale (new-york-v4 registry examples, fetched from GitHub since
// the rendered docs page no longer inlines the raw classNames):
//   apps/v4/registry/new-york-v4/examples/typography-{h1,h2,h3,h4,p,muted,small}.tsx
// Every shadcn-side element below keeps ONLY the font-metric classes (size/weight/line-height/
// tracking); layout-only decorations the real docs examples also carry (h1's text-center/
// text-balance, h2's border-b/pb-2/first:mt-0, every heading's scroll-m-20, p's
// [&:not(:first-child)]:mt-6) are page-chrome, not typographic identity, and are dropped from
// every pair so the comparison isolates font metrics - see the theme's typography config
// banner in packages/xui/src/themes/shadcn.ts for the full mapping-decision writeup and the
// exact Tailwind size/weight/tracking values these classes resolve to.
//
// The wrapper is 320px rather than the 400px it started at, and the h2 sample is shorter to suit:
// with two cells per row the gallery column has to hold 2 x (320 + 48 padding), and the theme panel
// on the right leaves 776px for it. Cells are pinned against shrinking (PairGrid), so a row wider
// than the column would push the page into horizontal scroll instead of quietly resizing.
//
// Both sides are wrapped in a fixed INTEGER-pixel-width div (same pattern as progress.tsx's
// trackWrapStyle / slider.tsx's sliderWrapStyle). Without it, each cell auto-hugs its own text's
// intrinsic (fractional-pixel) width - PairRow lays shadcn/mui cells out side by side in one flex
// row, so the mui cell's left edge inherits the shadcn cell's fractional width as a sub-pixel
// horizontal offset. Even with byte-identical computed styles (verified with getComputedStyle:
// every rendering-affecting property matched across every pair), that sub-pixel phase shift
// changes glyph antialiasing enough to fail parity on the longer strings (type-h2 measured 0.83%,
// type-body 2.02%, both > the harness's 0.5% default threshold, before this fix) - a gallery
// layout artifact, not a theme bug. Forcing an integer `width` here (wide enough that none of
// these single-line samples wrap) pins both cells to the same integer-pixel start, eliminating
// the drift; every pair below reaches 0.00% in both light and dark with this wrapper in place.
const typeWrapStyle = { width: 320 } as const

export const typographySection: Section = {
  title: "Typography",
  pairs: [
    {
      id: "type-h1",
      ref: (
        <div style={typeWrapStyle}>
          <h1 className="text-4xl font-extrabold tracking-tight">Taxing Laughter</h1>
        </div>
      ),
      mui: (
        <div style={typeWrapStyle}>
          <MuiTypography variant="h1">Taxing Laughter</MuiTypography>
        </div>
      ),
    },
    {
      id: "type-h2",
      ref: (
        <div style={typeWrapStyle}>
          <h2 className="text-3xl font-semibold tracking-tight">The Kingdom</h2>
        </div>
      ),
      mui: (
        <div style={typeWrapStyle}>
          <MuiTypography variant="h2">The Kingdom</MuiTypography>
        </div>
      ),
    },
    {
      id: "type-h3",
      ref: (
        <div style={typeWrapStyle}>
          <h3 className="text-2xl font-semibold tracking-tight">The Joke Tax</h3>
        </div>
      ),
      mui: (
        <div style={typeWrapStyle}>
          <MuiTypography variant="h3">The Joke Tax</MuiTypography>
        </div>
      ),
    },
    {
      id: "type-h4",
      ref: (
        <div style={typeWrapStyle}>
          <h4 className="text-xl font-semibold tracking-tight">People stopped telling jokes</h4>
        </div>
      ),
      mui: (
        <div style={typeWrapStyle}>
          <MuiTypography variant="h4">People stopped telling jokes</MuiTypography>
        </div>
      ),
    },
    {
      id: "type-body",
      ref: (
        <div style={typeWrapStyle}>
          <p className="leading-7">The king repealed the joke tax.</p>
        </div>
      ),
      mui: (
        <div style={typeWrapStyle}>
          <MuiTypography variant="body1">The king repealed the joke tax.</MuiTypography>
        </div>
      ),
    },
    {
      id: "type-muted",
      ref: (
        <div style={typeWrapStyle}>
          <p className="text-sm text-muted-foreground">Enter your email address.</p>
        </div>
      ),
      mui: (
        <div style={typeWrapStyle}>
          <MuiTypography variant="body2">Enter your email address.</MuiTypography>
        </div>
      ),
    },
    {
      id: "type-small",
      ref: (
        <div style={typeWrapStyle}>
          <small className="text-sm leading-none font-medium">Email address</small>
        </div>
      ),
      mui: (
        <div style={typeWrapStyle}>
          <MuiTypography variant="subtitle2">Email address</MuiTypography>
        </div>
      ),
    },
  ],
}
