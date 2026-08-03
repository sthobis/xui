import { useEffect, useState, type HTMLAttributes } from "react"
import MuiButton from "@mui/material/Button"
import MuiDialog from "@mui/material/Dialog"
import MuiDialogContentText from "@mui/material/DialogContentText"
import MuiDialogTitle from "@mui/material/DialogTitle"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Section } from "../types"

const TITLE = "Delete project"
const BODY = "This cannot be undone."
const DETAIL = "All of its files will be removed."

// Whole, even pixels, for the reason menu.tsx spells out.
const TRIGGER_WIDTH = 96

// DialogHeader is `flex flex-col gap-2` - a shadcn composition slot with no MUI counterpart, so the
// MUI side recreates it as a plain wrapper, the same treatment tabs.tsx and accordion.tsx use. It
// matters structurally: it makes the panel's own `grid gap-4` see ONE child on both sides.
const headerStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.5rem", // shadcn: gap-2
}

interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetPaper: PortalTargetProps = { "data-portal-target": "dialog-open" }

// Same Escape story as menu.tsx/select.tsx: the harness blurs before pressing Escape, and MUI's
// own handler needs the keydown to reach a focused descendant.
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

function MuiDialogDemo() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <>
      <MuiButton
        data-target
        variant="outlined"
        style={{ width: TRIGGER_WIDTH }}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={onOpen}
      >
        Delete
      </MuiButton>
      <MuiDialog open={open} onClose={onClose} slotProps={{ paper: portalTargetPaper }}>
        <div style={headerStyle}>
          <MuiDialogTitle>{TITLE}</MuiDialogTitle>
          <MuiDialogContentText>{BODY}</MuiDialogContentText>
        </div>
        <div>{DETAIL}</div>
      </MuiDialog>
    </>
  )
}

export const dialogSection: Section = {
  title: "Dialog",
  pairs: [
    {
      // GOTCHA - no `anchored` state, unlike every other overlay pair. That capture clips the union
      // of the trigger and the overlay, which only means something when the overlay is positioned
      // RELATIVE to the trigger. A dialog is centred in the viewport, so the union's width depends
      // on how far the trigger happens to sit from the middle of the screen - and the two cells sit
      // 240px apart by construction, making one side's union 577px wide and the other's 384px.
      // The diff then pads two differently-sized captures and reports ~42% of nothing.
      //
      // The overlay is covered by the `overlay-matches` behavior instead (e2e/behavior.spec.ts),
      // which is the honest instrument for it: a full-viewport translucent, blurred layer sits over
      // whatever the page happens to show behind each cell, so diffing its pixels compares
      // different content on the two sides no matter how the capture is framed. What can be
      // compared is the layer itself - its tint, its blur, its box - and that is what the check
      // asserts.
      id: "dialog-open",
      states: ["open"],
      behaviors: ["escape-closes", "overlay-matches"],
      ref: (
        <Dialog>
          <DialogTrigger asChild>
            <Button data-target variant="outline" style={{ width: TRIGGER_WIDTH }}>
              Delete
            </Button>
          </DialogTrigger>
          {/* showCloseButton={false}: the built-in close button is a `size="icon-sm"` ghost Button,
              a size no gallery pair covers and therefore one the theme does not implement. MUI's
              Dialog ships no close button of its own either, so leaving it out keeps both sides
              honest rather than hand-building a twin for an unthemed size. */}
          <DialogContent showCloseButton={false} data-portal-target="dialog-open">
            <DialogHeader>
              <DialogTitle>{TITLE}</DialogTitle>
              <DialogDescription>{BODY}</DialogDescription>
            </DialogHeader>
            {/* A second grid child, so the panel's own `gap-4` is actually observable. With only
                the header inside, a gap has nothing to space and the value shipped untested -
                caught by sabotaging it from 1rem to 1.25rem and watching the pair stay at 0.00%. */}
            <div>{DETAIL}</div>
          </DialogContent>
        </Dialog>
      ),
      mui: <MuiDialogDemo />,
    },
  ],
}
