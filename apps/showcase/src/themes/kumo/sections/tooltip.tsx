import { useEffect, useState, type HTMLAttributes } from "react"
import MuiTooltip from "@mui/material/Tooltip"
import MuiButton from "@mui/material/Button"
import { Button } from "@cloudflare/kumo/components/button"
import { Tooltip } from "@cloudflare/kumo/components/tooltip"
import type { Section } from "../../../gallery/types"

const LABEL = "Hover"
const TITLE = "Add to library"

// The trigger is the SECONDARY button, not the primary one kumo's own docs example uses. The
// "anchored" state captures the trigger together with the tooltip, so whatever the trigger is
// becomes part of this pair's picture - and kumo's primary button paints a gradient that MUI has no
// element to paint on, which is why button-primary carries a documented dithering override
// (e2e/thresholds.ts). Borrowing that trigger here imported 712 dithered pixels into a capture that
// is supposed to be judging a tooltip. The secondary button is a flat fill and reaches zero, so the
// only thing this pair can fail on is the tooltip itself.

// kumo's Tooltip gives the harness NOWHERE to put `data-portal-target`: it spreads its rest props
// onto Base UI's TooltipRoot and hands `className` to the TRIGGER, so nothing an author passes
// reaches the popup. Its `container` prop portals into a supplied node, but that wrapper is
// `position: static` and 0x0, so it is not a screenshottable box either. The popup does carry a
// stable, deliberately-shipped class of its own - `kumo-tooltip-popup` - which is exactly what
// Pair.openSelector exists for. The MUI side is still tagged by attribute, on the element that
// corresponds to that popup (the tooltip slot, not the Popper root).
const KUMO_POPUP = ".kumo-tooltip-popup"

// MUI's slot props are typed per slot and have no room for arbitrary `data-*` on a fresh object
// literal. Declaring an actual extension of HTMLAttributes sidesteps the excess-property check
// without widening to `any` - the same shape the shadcn gallery's own tooltip pair uses.
interface DataPortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetTooltip: DataPortalTargetProps = { "data-portal-target": "tooltip-open" }

// Tooltips normally open on HOVER (after a delay - kumo's own is 600ms), but the harness's "open"
// state always CLICKS `[data-target]`, and neither Base UI's trigger nor MUI's opens on click. Both
// sides therefore run fully controlled off the same click, which is also what makes the capture
// deterministic instead of dependent on hover timing.
//
// The Escape listener is on `document`, not the component: resetState blurs the active element
// BEFORE pressing Escape, so a React synthetic onKeyDown (which only fires while the element it is
// bound to still holds focus) would never see it. Same fix the shadcn tooltip and select pairs use.
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

// `open`/`onOpenChange` reach Base UI's TooltipRoot through kumo's own rest-prop spread - its
// public props type is `ComponentPropsWithoutRef<typeof Tooltip.Root> & ...`, so this is the
// documented controlled shape rather than an escape hatch.
function KumoTooltipOpenDemo() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <Tooltip
      content={TITLE}
      open={open}
      onOpenChange={(next) => (next ? onOpen() : onClose())}
      render={<Button data-target variant="secondary" onClick={onOpen} />}
    >
      {LABEL}
    </Tooltip>
  )
}

function MuiTooltipOpenDemo() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <MuiTooltip
      title={TITLE}
      // kumo: Base UI's Positioner defaults to side "top" and kumo passes no `side`, so the real
      // component renders above its trigger. MUI's own unthemed default is "bottom" - the opposite
      // side - so it is restated here to make both sides resolve the same placement branch (the
      // arrow's geometry is placement-conditional on both).
      placement="top"
      open={open}
      // MUI fires onOpen on hover/focus even while controlled; without it this side would respond
      // only to the harness's click and the showcase would misrepresent real tooltip behavior. The
      // kumo side gets hover for free through onOpenChange.
      onOpen={onOpen}
      onClose={onClose}
      slotProps={{ tooltip: portalTargetTooltip }}
    >
      <MuiButton data-target variant="outlined" onClick={onOpen}>
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
      // `overlay-matches` pins the decoration painted OUTSIDE the popup's border box - its outline
      // band and the reach of its shadow - which no capture of this pair contains, since the open
      // state clips at that box and the anchored state's union box is just the popup's and the
      // trigger's.
      //
      // Both pixel states turn out to reach more of it than that framing suggests (measured, not
      // assumed): deleting the outline costs 337 pixels at Δ22 and recolouring it 381 at Δ193,
      // because a 1px outline bleeds into the rounded corners inside the box, and moving the shadow
      // is caught by the anchored capture, which includes the gap the shadow falls into. So this is
      // a second, independent net rather than the only one - and it is the net that still holds if
      // a future radius or placement stops exposing those two by luck of geometry.
      behaviors: ["hover-opens", "escape-closes", "overlay-matches"],
      openSelector: KUMO_POPUP,
      ref: <KumoTooltipOpenDemo />,
      mui: <MuiTooltipOpenDemo />,
    },
  ],
}
