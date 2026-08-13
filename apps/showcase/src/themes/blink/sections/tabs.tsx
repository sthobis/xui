import MuiTabs from "@mui/material/Tabs"
import MuiTab from "@mui/material/Tab"
import { Tabs, Tab } from "../reference/primitives/Tabs"
import { RefProviders } from "../Providers"
import type { ReactNode } from "react"
import type { Section } from "../../../gallery/types"

// A fixed-width box around both sides. A Tabs bar is a block-level flex container, so it would
// otherwise take whatever width its cell happens to have - and its border-bottom would run the
// whole way, which makes the capture width a property of the grid rather than of the component.
const Box = ({ children }: { children: ReactNode }) => (
  <div style={{ width: 320 }}>{children}</div>
)

// Tabs. The kit's primitive IS MUI's Tabs - it wraps MuiTabs/MuiTab and bolts a CSS module onto
// the `root`, `indicator`, and `selected` slots (Tabs/index.tsx). So the two sides of this pair
// render the same DOM, and what is being measured is whether the theme reproduces the module's
// declarations exactly. Everything the module does NOT state - maxWidth 360, the centred text,
// the flex layout - stays MUI's own on both sides.
//
// Two pairs rather than one, because the two interesting states cannot share a `data-target`:
//
//   - hover only shows up on an UNSELECTED tab. `.tabSelected` carries `color: ... !important`, so
//     hovering the selected tab paints nothing new.
//   - focus only reaches the SELECTED tab. MUI's Tabs is a roving-tabindex widget (unselected tabs
//     are `tabIndex={-1}`), and the harness's focus-visible helper arrives by pressing Tab - which
//     skips right past a tab that is not in the tab order.
//
// SCOPE: the kit's `scrollable` flag is not paired. It forwards to MUI's own `variant="scrollable"`
// + `scrollButtons="auto"` and adds no styling of its own, so there is nothing for the theme to
// carry - a consumer passes the same two MUI props directly.
//
// Every reference cell is wrapped in RefProviders, and here it is the whole point of the pair: the
// kit's Tabs IS a MuiTabs, so under the page's own provider it would inherit blinkTheme and be
// judged against the theme that is supposed to be judging it. Anything the CSS module does not
// state would then move on BOTH sides together and still measure zero.

const labels = ["Overview", "Metrics", "Alerts"] as const

export const tabsSection: Section = {
  title: "Tabs",
  pairs: [
    {
      // `Alerts` is disabled here so the default capture covers the disabled colour too.
      id: "tabs-underline",
      states: ["default", "hover"],
      ref: (
        <RefProviders>
          <Box>
            <Tabs value={0}>
              <Tab label={labels[0]} />
              <Tab data-target label={labels[1]} />
              <Tab label={labels[2]} disabled />
            </Tabs>
          </Box>
        </RefProviders>
      ),
      mui: (
        <Box>
          <MuiTabs value={0}>
            <MuiTab label={labels[0]} />
            <MuiTab data-target label={labels[1]} />
            <MuiTab label={labels[2]} disabled />
          </MuiTabs>
        </Box>
      ),
    },
    {
      // The selected tab is the only one in the tab order, so it is the only one the focus-visible
      // helper can reach - see the note above.
      id: "tabs-focus",
      states: ["focus"],
      ref: (
        <RefProviders>
          <Box>
            <Tabs value={0}>
              <Tab data-target label={labels[0]} />
              <Tab label={labels[1]} />
            </Tabs>
          </Box>
        </RefProviders>
      ),
      mui: (
        <Box>
          <MuiTabs value={0}>
            <MuiTab data-target label={labels[0]} />
            <MuiTab label={labels[1]} />
          </MuiTabs>
        </Box>
      ),
    },
  ],
}
