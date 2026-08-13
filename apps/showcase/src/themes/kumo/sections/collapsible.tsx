import MuiAccordion from "@mui/material/Accordion"
import MuiAccordionSummary from "@mui/material/AccordionSummary"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import MuiTypography from "@mui/material/Typography"
import { Collapsible } from "@cloudflare/kumo/components/collapsible"
import { CaretDownIcon } from "@phosphor-icons/react"
import type { Section } from "../../../gallery/types"

// Kumo's Collapsible is a text disclosure, not a Material panel: its DefaultTrigger is a link-
// coloured 13px row with a caret that rotates on open, and its DefaultPanel is indented behind a
// 2px left rule. MUI's Accordion is the same three parts (root / summary / details), so the theme
// strips the Paper chrome rather than the gallery composing a lookalike.
//
// The caret is Kumo's own Phosphor CaretDown - an icon is content, so the MUI side uses the same
// glyph rather than MUI's default ExpandMore.

export const collapsibleSection: Section = {
  title: "Collapsible",
  pairs: [
    {
      id: "collapsible-closed",
      ref: (
        <Collapsible.Root>
          <Collapsible.DefaultTrigger>What is Kumo?</Collapsible.DefaultTrigger>
          <Collapsible.DefaultPanel>
            <MuiTypography>Cloudflare&apos;s design system.</MuiTypography>
          </Collapsible.DefaultPanel>
        </Collapsible.Root>
      ),
      mui: (
        <MuiAccordion>
          <MuiAccordionSummary expandIcon={<CaretDownIcon />}>What is Kumo?</MuiAccordionSummary>
          <MuiAccordionDetails>
            <MuiTypography>Cloudflare&apos;s design system.</MuiTypography>
          </MuiAccordionDetails>
        </MuiAccordion>
      ),
    },
    {
      id: "collapsible-open",
      ref: (
        <Collapsible.Root defaultOpen>
          <Collapsible.DefaultTrigger>What is Kumo?</Collapsible.DefaultTrigger>
          <Collapsible.DefaultPanel>
            <MuiTypography>Cloudflare&apos;s design system.</MuiTypography>
          </Collapsible.DefaultPanel>
        </Collapsible.Root>
      ),
      mui: (
        <MuiAccordion defaultExpanded>
          <MuiAccordionSummary expandIcon={<CaretDownIcon />}>What is Kumo?</MuiAccordionSummary>
          <MuiAccordionDetails>
            <MuiTypography>Cloudflare&apos;s design system.</MuiTypography>
          </MuiAccordionDetails>
        </MuiAccordion>
      ),
    },
  ],
}
