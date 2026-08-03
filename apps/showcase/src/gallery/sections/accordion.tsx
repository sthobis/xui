import MuiAccordion from "@mui/material/Accordion"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import MuiAccordionSummary from "@mui/material/AccordionSummary"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Section } from "../types"

// shadcn's <Accordion> root (data-slot="accordion") is `flex w-full flex-col`, so the items stack
// and each stretches to the container's width. MUI has no group wrapper at all - every
// <MuiAccordion> IS an item - so the MUI side recreates that column as a plain div, the same
// composition wrapper every other section uses for a shadcn-only layout element (see tabs.tsx).
// The explicit width replaces `w-full`, which would otherwise resolve against the cell.
const groupStyle = {
  display: "flex",
  flexDirection: "column",
  width: "16rem",
} as const

export const accordionSection: Section = {
  title: "Accordion",
  pairs: [
    {
      id: "accordion-collapsed",
      states: ["default", "hover", "focus"],
      ref: (
        <Accordion type="single" collapsible style={groupStyle}>
          <AccordionItem value="one">
            <AccordionTrigger data-target>Shipping</AccordionTrigger>
            <AccordionContent>Free over $50.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="two">
            <AccordionTrigger>Returns</AccordionTrigger>
            <AccordionContent>Within 30 days.</AccordionContent>
          </AccordionItem>
        </Accordion>
      ),
      mui: (
        <div style={groupStyle}>
          <MuiAccordion>
            <MuiAccordionSummary data-target>Shipping</MuiAccordionSummary>
            <MuiAccordionDetails>Free over $50.</MuiAccordionDetails>
          </MuiAccordion>
          <MuiAccordion>
            <MuiAccordionSummary>Returns</MuiAccordionSummary>
            <MuiAccordionDetails>Within 30 days.</MuiAccordionDetails>
          </MuiAccordion>
        </div>
      ),
    },
    {
      // Second pair rather than an extra harness state: the expanded look is a plain inline
      // render on both sides (no portal, no pointer interaction), and it is the only thing that
      // covers the open panel, the swapped chevron, and the trigger's expanded metrics.
      id: "accordion-expanded",
      states: ["default", "hover", "focus"],
      ref: (
        <Accordion type="single" collapsible defaultValue="one" style={groupStyle}>
          <AccordionItem value="one">
            <AccordionTrigger data-target>Shipping</AccordionTrigger>
            <AccordionContent>Free over $50.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="two">
            <AccordionTrigger>Returns</AccordionTrigger>
            <AccordionContent>Within 30 days.</AccordionContent>
          </AccordionItem>
        </Accordion>
      ),
      mui: (
        <div style={groupStyle}>
          <MuiAccordion defaultExpanded>
            <MuiAccordionSummary data-target>Shipping</MuiAccordionSummary>
            <MuiAccordionDetails>Free over $50.</MuiAccordionDetails>
          </MuiAccordion>
          <MuiAccordion>
            <MuiAccordionSummary>Returns</MuiAccordionSummary>
            <MuiAccordionDetails>Within 30 days.</MuiAccordionDetails>
          </MuiAccordion>
        </div>
      ),
    },
    {
      // shadcn dims the TRIGGER, not the item - `disabled` goes on AccordionTrigger and the panel
      // is untouched - so the MUI side disables the summary rather than the whole MuiAccordion
      // (whose own `disabled` prop dims the panel too and paints a disabled background).
      id: "accordion-disabled",
      states: ["default"],
      ref: (
        <Accordion type="single" collapsible style={groupStyle}>
          <AccordionItem value="one">
            <AccordionTrigger data-target disabled>
              Shipping
            </AccordionTrigger>
            <AccordionContent>Free over $50.</AccordionContent>
          </AccordionItem>
        </Accordion>
      ),
      mui: (
        <div style={groupStyle}>
          <MuiAccordion>
            <MuiAccordionSummary data-target disabled>
              Shipping
            </MuiAccordionSummary>
            <MuiAccordionDetails>Free over $50.</MuiAccordionDetails>
          </MuiAccordion>
        </div>
      ),
    },
  ],
}
