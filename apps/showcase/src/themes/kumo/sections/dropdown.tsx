import { useEffect, useRef, useState, type HTMLAttributes } from "react"
import MuiButton from "@mui/material/Button"
import MuiMenu from "@mui/material/Menu"
import MuiMenuItem from "@mui/material/MenuItem"
import { Button } from "@cloudflare/kumo/components/button"
import { DropdownMenu } from "@cloudflare/kumo/components/dropdown"
import type { Section } from "../../../gallery/types"

const ITEMS = ["Edit", "Duplicate", "Delete"]

// The trigger is pinned to an EVEN, whole number of pixels wide. Base UI positions its popup on the
// device-pixel grid (0.5 CSS px at this harness's deviceScaleFactor of 2) while MUI's Popover rounds
// to whole CSS pixels, so a trigger at a fractional x - which is what a text-sized button gets -
// sends the two panels half a pixel apart even though both are correctly flush with it. The shadcn
// menu pair hit this first and its own banner carries the measurements; the cause is the same here.
const TRIGGER_WIDTH = 96

// MUI's slot props are typed per slot, so a bare `{ "data-portal-target": ... }` object literal
// shares no property with PaperProps and TypeScript's weak-type check rejects it. Declaring a real
// extension of HTMLAttributes is the way past that without widening to `any`.
interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetPaper: PortalTargetProps = { "data-portal-target": "dropdown-open" }

// Both sides are driven by a controlled `open` off the same click, and Escape is handled by a
// listener on `document` rather than a React synthetic handler: the harness blurs the active
// element before pressing Escape, and MUI's own handling depends on the keydown bubbling from
// whatever holds focus. Same shape the shadcn menu and select pairs use.
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

function KumoDropdownDemo() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <DropdownMenu open={open} onOpenChange={(next) => (next ? onOpen() : onClose())}>
      <DropdownMenu.Trigger>
        <Button data-target variant="secondary" style={{ width: TRIGGER_WIDTH }} onClick={onOpen}>
          Options
        </Button>
      </DropdownMenu.Trigger>
      {/* kumo's DropdownMenu.Content merges `className` into the POPUP and spreads everything else
          onto the positioner, so a class passed here is the one reliable handle on the box the MUI
          side tags with `data-portal-target` (its Paper). Declared as this pair's `openSelector`. */}
      <DropdownMenu.Content className="pair-dropdown-popup">
        {ITEMS.map((label) => (
          <DropdownMenu.Item key={label}>{label}</DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

function MuiDropdownDemo() {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <>
      {/* aria-haspopup and aria-expanded are what Base UI's own Menu.Trigger sets for itself, so a
          MUI menu trigger states them exactly as it would in any accessible app. */}
      <MuiButton
        ref={anchorRef}
        data-target
        variant="outlined"
        style={{ width: TRIGGER_WIDTH }}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onOpen}
      >
        Options
      </MuiButton>
      <MuiMenu
        anchorEl={anchorRef.current}
        open={open}
        onClose={onClose}
        // Base UI focuses the POPUP on open, never an item, so nothing is highlighted; MUI's Menu
        // focuses the selected-or-first item, which the theme paints with a highlight background.
        // A behavioral difference between the two primitives, not a theme gap - and it cannot move
        // into the theme, because MUI reuses Menu for Select's popup where Base UI DOES highlight
        // the selected option.
        disableAutoFocusItem
        slotProps={{ paper: portalTargetPaper }}
      >
        {ITEMS.map((label) => (
          <MuiMenuItem key={label}>{label}</MuiMenuItem>
        ))}
      </MuiMenu>
    </>
  )
}

export const dropdownSection: Section = {
  title: "DropdownMenu",
  pairs: [
    {
      id: "dropdown-open",
      // No "anchored" state: that capture frames the trigger too, and MUI renders Menu inside a
      // Modal whose invisible backdrop covers the trigger and suppresses its `:hover`, while Base
      // UI deliberately keeps a menu trigger live. The panels matched exactly and the pair still
      // reported 12478 differing pixels, all of them the trigger's own hover fill. Placement is
      // proved by `anchored-to-trigger` instead, which measures it without the trigger in frame.
      states: ["open"],
      behaviors: ["escape-closes", "item-hover-highlights", "overlay-matches", "anchored-to-trigger"],
      openSelector: ".pair-dropdown-popup",
      // The panel opens BELOW its trigger, and Base UI flips it above when the viewport runs out
      // of room while MUI's Popover clamps it upward instead - two different collision strategies
      // that would be compared as if they were a placement bug. Reserving the panel's own height
      // below the row means the harness scrolls to a position where neither collides.
      roomBelow: 160,
      ref: <KumoDropdownDemo />,
      mui: <MuiDropdownDemo />,
    },
  ],
}
