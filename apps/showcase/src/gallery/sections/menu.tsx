import { useEffect, useRef, useState, type HTMLAttributes } from "react"
import MuiButton from "@mui/material/Button"
import MuiMenu from "@mui/material/Menu"
import MuiMenuItem from "@mui/material/MenuItem"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Section } from "../types"

const ITEMS = ["Edit", "Duplicate", "Delete"]

// The trigger is pinned to an EVEN, whole number of pixels wide, which is what lets the two
// panels land on the same pixel. Radix positions its content on the device-pixel grid (0.5 CSS px
// at this harness's deviceScaleFactor of 2) while MUI's Popover rounds to whole CSS pixels
// (`Math.round(left)`), so a trigger at a fractional x - which is what a text-sized button gets
// here - sends the two 0.5px apart even though both are correctly flush with it. That half pixel
// is invisible but it re-rasterizes every glyph and the panel's rounded outline, which the
// anchored capture (deliberately un-normalized, so it can still see real placement errors) reports
// as ~1.4% in both schemes. An integral trigger removes the divergence at the source instead of
// writing it off as a threshold: a genuine misplacement still moves whole pixels.
const TRIGGER_WIDTH = 96

// shadcn's DropdownMenuContent is `w-(--radix-dropdown-menu-trigger-width) min-w-32`, so its width
// is max(trigger width, 8rem). MUI's Menu has no trigger-width tie at all, and giving it one would
// mean a prop on the gallery's MUI side whose only job is to compensate for the theme. Keeping the
// trigger narrower than 8rem sidesteps that entirely: both sides land on exactly 8rem, from
// min-w-32 on one side and the theme's own minWidth on the other, with no prop involved.
// "Options" in a default Button measures well under 128px, and the items are shorter still.

// GOTCHA - MUI's own Escape handling depends on the keydown bubbling from whatever holds focus,
// and both the harness's resetState and the escape-closes behavior check blur before pressing
// Escape (see e2e/lib/states.ts). Menu autofocuses an item on open, so that blur moves focus to
// <body> and MUI's React-attached listener never sees the key. Radix closes fine either way
// because it listens on `document`. Same fix as select.tsx: a controlled `open` plus a plain
// native document listener.
// `data-portal-target` is the harness's portal-capture marker (e2e/parity.spec.ts), placed on the
// one node both sides render as their outermost portalled box - the Menu's Paper here, matching
// DropdownMenuContent on the shadcn side. Declared as a real extension of HTMLAttributes for the
// same reason select.tsx's own dataTarget is: a bare `{ "data-portal-target": ... }` object shares
// no property with PaperProps, so TypeScript's weak-type check rejects it.
interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetPaper: PortalTargetProps = { "data-portal-target": "menu-open" }

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

function MuiMenuDemo() {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <>
      {/* aria-haspopup + aria-expanded are what Radix's DropdownMenuTrigger sets for itself, and
          both are load-bearing for the LOOK, not just for screen readers: shadcn's Button fills
          with bg-muted while aria-expanded is true, and suppresses its press nudge when
          aria-haspopup is present (button.tsx's `active:not-aria-[haspopup]:translate-y-px`). A
          MUI menu trigger has to state them, exactly as it would in any accessible app. */}
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
        // Radix focuses the CONTENT on open, never an item, so nothing is highlighted; MUI's Menu
        // focuses the selected-or-first item, which our theme paints with the accent background
        // (measured: 27% of the panel differed, entirely the first item's fill). This is a
        // behavioral difference between the two primitives rather than a theme gap, and it cannot
        // move into the theme: MUI reuses Menu for Select's popup, where Radix DOES focus the
        // selected option, and a theme default reaches both (verified - it took select-open from
        // 0.38% to 19.08%).
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

export const menuSection: Section = {
  title: "Menu",
  pairs: [
    {
      id: "menu-open",
      states: ["open", "anchored"],
      behaviors: ["escape-closes"],
      shadcn: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-target variant="outline" style={{ width: TRIGGER_WIDTH }}>
              Options
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent data-portal-target="menu-open">
            {ITEMS.map((label) => (
              <DropdownMenuItem key={label}>{label}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      mui: <MuiMenuDemo />,
    },
  ],
}
