import MuiAppBar from "@mui/material/AppBar"
import MuiIconButton from "@mui/material/IconButton"
import MuiToolbar from "@mui/material/Toolbar"
import MuiTypography from "@mui/material/Typography"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MAX_PAIR_CONTENT_WIDTH } from "../PairGrid"
import type { Section } from "../types"

// THE TWIN ON THE LEFT IS COMPOSED, NOT INSTALLED - the only pair in this gallery where that is
// true, and the reason deserves stating plainly.
//
// shadcn/ui ships no AppBar or Toolbar. The nearest installed thing, SidebarHeader, is
// `flex flex-col gap-2 p-2` - a stacked block inside a vertical sidebar, not a top bar - so there
// is nothing here to extract a top-bar recipe from. What shadcn does have is a header PATTERN,
// used by its own dashboard blocks and docs site:
//     <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
// Every utility in that line is a real shadcn/Tailwind token, and the theme's AppBar block cites
// them individually. The choice to assemble them into this particular header is a design decision
// taken here, not a value read out of a component.
//
// So the parity number below proves something narrower than elsewhere in this gallery: that MUI's
// AppBar and Toolbar render this composition exactly, not that this composition is what shadcn
// would ship. Read it that way. It exists because the alternative is worse - untouched, MUI's
// AppBar is a saturated blue elevated bar with a Material shadow, which is the single most
// obviously off-brand surface a themed app can contain, and README's tier 3 rule ("styled in
// shadcn's design language so they blend in") is the sanction for fixing that.
//
// Deliberately NOT covered, because nothing grounds them: `position="fixed"`/`sticky` and their
// scroll behaviour, `elevation` above 0, the dense variant, and the colour props other than the
// default surface. The bar also holds only a trigger and a title - a trailing action would need
// `ml-auto` on one side and an `sx` margin on the other, and this repo does not allow `sx` on the
// MUI side of a pair.

const TITLE = "Dashboard"

// Whole, even pixels so both sides start on the same pixel column - see menu.tsx.
//
// Full width, which for a pair means MAX_PAIR_CONTENT_WIDTH. This is where that limit was first
// diagnosed: at 360 the MUI cell ran 8px under the theme panel's left edge and the panel's own
// border landed inside the screenshot, 452 differing pixels that had nothing to do with the AppBar.
const wrapStyle = { width: MAX_PAIR_CONTENT_WIDTH } as const

export const appBarSection: Section = {
  title: "AppBar",
  pairs: [
    {
      id: "appbar-basic",
      shadcn: (
        <div style={wrapStyle}>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <Button variant="ghost" size="icon" aria-label="Toggle sidebar">
              <PanelLeft />
            </Button>
            <span className="text-base font-medium">{TITLE}</span>
          </header>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiAppBar position="static">
            <MuiToolbar>
              <MuiIconButton aria-label="Toggle sidebar">
                <PanelLeft />
              </MuiIconButton>
              {/* subtitle1, not body1: the title is 1rem/font-medium with no extra leading, where
                  body1 is the paragraph face and carries leading-7. */}
              <MuiTypography variant="subtitle1">{TITLE}</MuiTypography>
            </MuiToolbar>
          </MuiAppBar>
        </div>
      ),
    },
    {
      // The dense toolbar - MUI's compact bar, 48px against the default 64. Everything else about
      // the bar is unchanged, so this pair is only about the height.
      id: "appbar-dense",
      shadcn: (
        <div style={wrapStyle}>
          {/* h-12, less the border-b the bar draws itself - the same arithmetic the default uses. */}
          <header className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
            <Button variant="ghost" size="icon" aria-label="Toggle sidebar">
              <PanelLeft />
            </Button>
            <span className="text-base font-medium">{TITLE}</span>
          </header>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiAppBar position="static">
            <MuiToolbar variant="dense">
              <MuiIconButton aria-label="Toggle sidebar">
                <PanelLeft />
              </MuiIconButton>
              <MuiTypography variant="subtitle1">{TITLE}</MuiTypography>
            </MuiToolbar>
          </MuiAppBar>
        </div>
      ),
    },
  ],
}
