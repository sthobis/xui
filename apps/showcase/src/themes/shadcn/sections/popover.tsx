import { useEffect, useRef, useState, type HTMLAttributes } from "react"
import MuiButton from "@mui/material/Button"
import MuiPopover from "@mui/material/Popover"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Section } from "../../../gallery/types"

const TITLE = "Dimensions"
const BODY = "Set the layout dimensions."

// Pinned to an EVEN, whole number of pixels wide, for the reason menu.tsx spells out: Radix
// positions its content on the device-pixel grid while MUI's Popover rounds to whole CSS pixels,
// so a fractionally positioned trigger puts the two panels half a pixel apart.
const TRIGGER_WIDTH = 96

// PopoverTitle (`font-medium`) and PopoverDescription (`text-muted-foreground`) are shadcn
// composition slots with no MUI counterpart, so the MUI side restates them as plain markup - the
// same treatment tabs.tsx gives its content panel. Everything that IS a themed box (the panel
// itself) comes from the theme.
const titleStyle = { fontWeight: 500 } as const // shadcn: font-medium
const bodyStyle = { color: "var(--mui-palette-text-secondary)", margin: 0 } as const // shadcn: text-muted-foreground (and no <p> margin, per Tailwind's reset)

interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetPaper: PortalTargetProps = { "data-portal-target": "popover-open" }

// Same Escape-handling story as menu.tsx and select.tsx: the harness blurs before pressing Escape,
// and MUI's own handler needs the keydown to bubble from a focused descendant.
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

function MuiPopoverDemo() {
  const anchorRef = useRef<HTMLButtonElement>(null)
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <>
      {/* aria-haspopup/aria-expanded are what Radix's PopoverTrigger sets for itself, and shadcn's
          Button reads both - see menu.tsx's own note. */}
      <MuiButton
        ref={anchorRef}
        data-target
        variant="outlined"
        style={{ width: TRIGGER_WIDTH }}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={onOpen}
      >
        Details
      </MuiButton>
      <MuiPopover
        anchorEl={anchorRef.current}
        open={open}
        onClose={onClose}
        slotProps={{ paper: portalTargetPaper }}
      >
        <div style={titleStyle}>{TITLE}</div>
        <p style={bodyStyle}>{BODY}</p>
      </MuiPopover>
    </>
  )
}

export const popoverSection: Section = {
  title: "Popover",
  pairs: [
    {
      id: "popover-open",
      states: ["open", "anchored"],
      behaviors: ["escape-closes"],
      ref: (
        // GOTCHA - `modal` matters, and it is a choice of comparable configuration rather than a
        // tweak to make the pair pass. Radix's Popover is NON-modal by default: it leaves the page
        // interactive, so the trigger keeps its hover fill while the panel is open. MUI's Popover
        // is built on Modal and always renders a backdrop over the page for click-away dismissal,
        // which takes the pointer off the trigger - so with the harness leaving the mouse on the
        // trigger after opening, the un-matched pair showed a uniform 7/255 tint across the trigger
        // in dark (`dark:hover:bg-input/50` against `dark:bg-input/30`, 8.18% of the anchored
        // capture; invisible in light, where the two fills happen to coincide). MUI's Popover has
        // no non-modal mode, and giving it one would mean changing how it dismisses, which is not
        // a theme's business - so the shadcn side is configured to the modality MUI actually has.
        // The panel's own styling is identical either way; only the trigger's hover differs.
        <Popover modal>
          <PopoverTrigger asChild>
            <Button data-target variant="outline" style={{ width: TRIGGER_WIDTH }}>
              Details
            </Button>
          </PopoverTrigger>
          <PopoverContent data-portal-target="popover-open">
            <PopoverTitle>{TITLE}</PopoverTitle>
            <PopoverDescription>{BODY}</PopoverDescription>
          </PopoverContent>
        </Popover>
      ),
      mui: <MuiPopoverDemo />,
    },
  ],
}
