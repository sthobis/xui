import { useEffect, useState, type HTMLAttributes } from "react"
import MuiTooltip from "@mui/material/Tooltip"
import MuiButton from "@mui/material/Button"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { Section } from "../../../gallery/types"

const LABEL = "Hover"
const TITLE = "Add to library"

// MUI's Popper slot props type has no room for arbitrary `data-*` attributes on a fresh object
// literal (same shape of problem already solved for Select's Menu paper - see the selectSection
// banner's own `DataTargetProps` note in this directory). Declaring it as an actual extension of
// HTMLAttributes, rather than an unrelated shape, sidesteps the excess-property check without
// widening to `any`. This is the harness's own portal-capture marker (e2e/parity.spec.ts) placed
// on the one DOM node - MUI's Popper root - that both this and the real shadcn TooltipContent
// render as their outermost portalled box (see the MuiTooltip banner in
// packages/xui/src/themes/shadcn.ts for why the Popper root, not the inner tooltip div, is that
// node).
interface DataPortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetPopper: DataPortalTargetProps = { "data-portal-target": "tooltip-open" }

// Tooltips normally open on HOVER (with a delay), but the parity harness's own "open" state
// (e2e/lib/states.ts) always CLICKS `[data-target]` - a plain click never fires Radix's hover/
// focus listeners, and MUI's own `open` prop has no uncontrolled/hover-driven default at all
// (it always renders exactly what is passed in) - so both sides need a click-driven, fully
// controlled `open` to render deterministically without depending on hover timing.
//
// GOTCHA - mirrors the exact GOTCHA already solved for Select's own "open" pair (see the
// selectSection banner in this same directory): the harness's resetState (e2e/lib/states.ts,
// not modifiable) runs `document.activeElement?.blur()` BEFORE pressing Escape, so a React
// synthetic `onKeyDown` (which only fires while the element it's bound to still has focus)
// never sees that Escape at all. A plain top-level `document` keydown listener fires
// regardless of what currently has focus - fixing it the identical way Select already does.
function useControlledOpen() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])
  return { open, onOpen: () => setOpen(true), onClose: () => setOpen(false) }
}

// shadcn's real TooltipTrigger has no click-to-open behavior of its own (Radix Tooltip only
// wires hover/focus listeners) - `onOpenChange` gives full external control, the same
// documented, idiomatic escape hatch Radix's own docs recommend for tests/storybooks, and the
// exact controlled shape already proven for MUI's own `open` below (see banner above).
function ShadcnTooltipOpenDemo() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <TooltipProvider>
      <Tooltip open={open} onOpenChange={(next) => (next ? onOpen() : onClose())}>
        <TooltipTrigger asChild>
          <Button data-target onClick={onOpen}>
            {LABEL}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" data-portal-target="tooltip-open">
          {TITLE}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function MuiTooltipOpenDemo() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <MuiTooltip
      title={TITLE}
      placement="top" // shadcn: Radix TooltipContent's own default side is "top" (tooltip.tsx passes no `side` prop) - MUI's own unthemed default placement is "bottom", the opposite side, so this is restated to match the real component and keep both sides' popper-placement-conditional arrow geometry (see the MuiTooltip banner in packages/xui/src/themes/shadcn.ts) resolving the same branch
      open={open}
      // MUI fires onOpen on hover/focus even while controlled; without it this side would only
      // respond to the harness's click, so the showcase would misrepresent real tooltip
      // behavior. The shadcn side already gets hover for free via Radix's onOpenChange.
      onOpen={onOpen}
      onClose={onClose}
      slotProps={{ popper: portalTargetPopper }}
    >
      {
        // shadcn: the shadcn side's <Button> passes no `variant`, so it renders button.tsx's
        // own CVA default ("default" - a solid, filled button). MUI's own unthemed default
        // variant is "text" (transparent), the opposite look - restated here the same way
        // button.tsx's own "button-contained" pair maps shadcn's "default" to MUI's
        // "contained" (see sections/button.tsx). Previously invisible: the "open" state only
        // ever captured the tooltip bubble in isolation, never the trigger itself, so this
        // trigger-style mismatch shipped unnoticed until the "anchored" state's union-box
        // capture (which includes the trigger) revealed it.
      }
      <MuiButton data-target variant="contained" onClick={onOpen}>
        {LABEL}
      </MuiButton>
    </MuiTooltip>
  )
}

export const tooltipSection: Section = {
  title: "Tooltip",
  pairs: [
    {
      id: "tooltip-open",
      states: ["open", "anchored"],
      behaviors: ["hover-opens", "escape-closes"],
      ref: <ShadcnTooltipOpenDemo />,
      mui: <MuiTooltipOpenDemo />,
    },
  ],
}
