import { useEffect, useRef, useState, type HTMLAttributes } from "react"
import MuiPopover from "@mui/material/Popover"
import { Popover } from "@cloudflare/kumo/components/popover"
import type { Section } from "../../../gallery/types"

const LABEL = "Details"
const BODY = "You are all caught up."

// The trigger is a plain unstyled span, and that is what lets this pair keep its "anchored" state -
// the only capture that contains the ARROW, since the arrow hangs 8px outside the popup's border
// box and an element capture clips there.
//
// A styled trigger would make that capture unusable. MUI renders Popover inside a Modal whose
// invisible backdrop covers the trigger and suppresses its `:hover`, while Base UI leaves the
// trigger live, and the harness opens an overlay by clicking - so any trigger with a hover style
// paints differently on the two sides while the popup is open (measured on the dropdown pair: 12478
// pixels, all of them trigger fill). A span has no hover style on either side, so the capture is
// about the popup and its arrow, which is what this pair is for. The button that would normally sit
// here is judged by its own pairs.
//
// Pinned to an EVEN, whole number of pixels wide, for the same reason every other anchored pair
// pins its trigger: Base UI positions on the device-pixel grid while MUI's Popover rounds to whole
// CSS pixels, so a fractionally positioned trigger sends the two popups half a pixel apart.
// Both dimensions are EVEN whole numbers, and the popup's width is stated rather than left to the
// text, so every offset in this pair is an integer. The harness snaps the cell onto whole pixels
// before opening (e2e/lib/states.ts), and from there an even trigger and an even popup put the
// popup's centre and its 8px gap on whole pixels too - which is the only way MUI's Popover, which
// rounds every position with Math.round, can land where Floating UI's device-grid rounding does.
const TRIGGER_WIDTH = 96
const TRIGGER_HEIGHT = 22
const POPUP_WIDTH = 192
const triggerStyle = {
  width: TRIGGER_WIDTH,
  height: TRIGGER_HEIGHT,
  display: "inline-block",
  textAlign: "center" as const,
  font: "14px/22px system-ui",
  cursor: "pointer",
}

interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetPaper: PortalTargetProps = {
  "data-portal-target": "popover-open",
  style: { width: POPUP_WIDTH },
}

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

function KumoPopoverDemo() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <Popover open={open} onOpenChange={(next: boolean) => (next ? onOpen() : onClose())}>
      <Popover.Trigger render={<span data-target style={triggerStyle} onClick={onOpen} />}>
        {LABEL}
      </Popover.Trigger>
      <Popover.Content className="w-48">{BODY}</Popover.Content>
    </Popover>
  )
}

function MuiPopoverDemo() {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <>
      <span ref={anchorRef} data-target style={triggerStyle} onClick={onOpen}>
        {LABEL}
      </span>
      <MuiPopover
        anchorEl={anchorRef.current}
        open={open}
        onClose={onClose}
        slotProps={{ paper: portalTargetPaper }}
      >
        {BODY}
      </MuiPopover>
    </>
  )
}

export const popoverSection: Section = {
  title: "Popover",
  pairs: [
    {
      id: "popover-open",
      // "anchored" is what covers the ARROW - see the trigger note above for why this pair can
      // afford that state where the dropdown and select pairs cannot.
      states: ["open", "anchored"],
      behaviors: ["escape-closes", "overlay-matches", "anchored-to-trigger"],
      // kumo's Popover.Content takes a `className` and merges it into the popup, but it also ships
      // its own marker there - so the pair uses the one the package owns.
      openSelector: ".kumo-popover-popup",
      roomBelow: 120,
      ref: <KumoPopoverDemo />,
      mui: <MuiPopoverDemo />,
    },
  ],
}
