import MuiTabs from "@mui/material/Tabs"
import MuiTab from "@mui/material/Tab"
import { Tabs } from "@cloudflare/kumo/components/tabs"
import type { Section } from "../../../gallery/types"

// Kumo's Tabs takes its items as a `tabs` array rather than as children, and ships two variants:
//   underline   a row over a hairline bottom border, with a sliding indicator
//   segmented   a recessed pill track with the active tab raised inside it
//
// MUI's Tabs/Tab is the underline shape. The `segmented` variant has no MUI counterpart - it needs
// a recessed track element behind the tabs plus a raised pill on the active one - so it is out of
// scope rather than approximated.
// STATES: default only, for the same reason as Radio - Kumo's Tabs takes its items as plain data
// objects (`value`/`label`/`className`) and spreads no arbitrary attributes, so a `data-target`
// marker never reaches the DOM for the harness to hover or focus.
const ITEMS = [
  { value: "home", label: "Home" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
]

export const tabsSection: Section = {
  title: "Tabs",
  pairs: [
    {
      id: "tabs-underline",
      ref: <Tabs variant="underline" tabs={ITEMS} selectedValue="home" />,
      mui: (
        <MuiTabs value="home">
          {ITEMS.map((t) => (
            <MuiTab key={t.value} value={t.value} label={t.label} />
          ))}
        </MuiTabs>
      ),
    },
  ],
}
