import MuiAccordion from "@mui/material/Accordion"
import MuiAccordionSummary from "@mui/material/AccordionSummary"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "../reference/primitives/Accordion"
import { RefProviders } from "../Providers"
import type { ReactNode } from "react"
import type { Section } from "../../../gallery/types"

// A fixed-width box around both sides. An Accordion is a block-level panel with no intrinsic width.
const Box = ({ children }: { children: ReactNode }) => (
  <div style={{ width: 320 }}>{children}</div>
)

// Accordion. Like Tabs, the kit's primitive IS MUI's - Accordion/AccordionSummary/AccordionDetails
// with a CSS module on the `root`, `summary`, `content` and `details` slots. Two things it does
// beyond styling, and both belong in the theme rather than in a pair's props:
//
//   - it defaults `disableGutters` and `square` to true, so an accordion never grows MUI's 16px
//     expanded gutter and never picks up MUI's first-of-type/last-of-type corner rounding
//   - it defaults `expandIcon` to a 16px lucide ChevronDown, which MUI leaves empty
//
// The reference cells go through RefProviders for the reason Tabs does: without it the kit's
// Accordion inherits blinkTheme and the pair compares the theme against itself.
//
// SCOPE: a GROUP of accordions is not paired. MUI collapses the margin between adjacent panels and
// hides the divider `::before` through `& + &` rules on the root, and the kit's module states
// neither - it styles one panel and leaves stacking to whatever lays the panels out. Pairing a
// group would therefore be measuring MUI's own group behaviour on both sides, and any rule this
// theme added for it would have no ground truth behind it.

const heading = "Retention policy"
const body = "Rows older than ninety days are rolled up nightly and then dropped."

export const accordionSection: Section = {
  title: "Accordion",
  pairs: [
    {
      // Collapsed. `hover` is the state that matters here - the module's only hover rule darkens
      // the chevron, and it is scoped away from the disabled case.
      id: "accordion-collapsed",
      states: ["default", "hover", "focus"],
      ref: (
        <RefProviders>
          <Box>
            <Accordion>
              <AccordionSummary data-target>{heading}</AccordionSummary>
              <AccordionDetails>{body}</AccordionDetails>
            </Accordion>
          </Box>
        </RefProviders>
      ),
      mui: (
        <Box>
          <MuiAccordion>
            <MuiAccordionSummary data-target>{heading}</MuiAccordionSummary>
            <MuiAccordionDetails>{body}</MuiAccordionDetails>
          </MuiAccordion>
        </Box>
      ),
    },
    {
      // Expanded. Covers the summary's squared bottom corners, the content margin that MUI would
      // otherwise grow from 12px to 20px, and the details block.
      id: "accordion-expanded",
      ref: (
        <RefProviders>
          <Box>
            <Accordion defaultExpanded>
              <AccordionSummary data-target>{heading}</AccordionSummary>
              <AccordionDetails>{body}</AccordionDetails>
            </Accordion>
          </Box>
        </RefProviders>
      ),
      mui: (
        <Box>
          <MuiAccordion defaultExpanded>
            <MuiAccordionSummary data-target>{heading}</MuiAccordionSummary>
            <MuiAccordionDetails>{body}</MuiAccordionDetails>
          </MuiAccordion>
        </Box>
      ),
    },
    {
      id: "accordion-disabled",
      ref: (
        <RefProviders>
          <Box>
            <Accordion disabled>
              <AccordionSummary data-target>{heading}</AccordionSummary>
              <AccordionDetails>{body}</AccordionDetails>
            </Accordion>
          </Box>
        </RefProviders>
      ),
      mui: (
        <Box>
          <MuiAccordion disabled>
            <MuiAccordionSummary data-target>{heading}</MuiAccordionSummary>
            <MuiAccordionDetails>{body}</MuiAccordionDetails>
          </MuiAccordion>
        </Box>
      ),
    },
  ],
}
