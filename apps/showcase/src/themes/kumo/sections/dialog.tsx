import { useEffect, useState, type HTMLAttributes } from "react"
import MuiButton from "@mui/material/Button"
import MuiDialog from "@mui/material/Dialog"
import MuiDialogTitle from "@mui/material/DialogTitle"
import MuiDialogContentText from "@mui/material/DialogContentText"
import { Button } from "@cloudflare/kumo/components/button"
import { Dialog } from "@cloudflare/kumo/components/dialog"
import type { Section } from "../../../gallery/types"

const TITLE = "Delete project"
const BODY = "This cannot be undone."

// Whole, even pixels, for the reason the dropdown pair spells out.
const TRIGGER_WIDTH = 96

interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetPaper: PortalTargetProps = { "data-portal-target": "dialog-open" }

// The harness blurs the active element before pressing Escape and MUI's own handler needs the
// keydown to reach a focused descendant, so both sides close from a listener on `document`.
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

// kumo's Dialog composes its panel out of LayerCard rendered AS Base UI's DialogPopup, and it
// carries no padding of its own - kumo's own docs example passes `className="p-8"` at the call
// site, so the pair states the padding on both sides rather than pretending either owns it.
const PANEL_PADDING = 32

function KumoDialogDemo() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <Dialog.Root open={open} onOpenChange={(next: boolean) => (next ? onOpen() : onClose())}>
      <Dialog.Trigger
        render={
          <Button data-target variant="secondary" style={{ width: TRIGGER_WIDTH }} onClick={onOpen}>
            Delete
          </Button>
        }
      />
      <Dialog className="p-8 pair-dialog-panel">
        <Dialog.Title>{TITLE}</Dialog.Title>
        <Dialog.Description>{BODY}</Dialog.Description>
      </Dialog>
    </Dialog.Root>
  )
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
        <div style={{ padding: PANEL_PADDING }}>
          <MuiDialogTitle>{TITLE}</MuiDialogTitle>
          <MuiDialogContentText>{BODY}</MuiDialogContentText>
        </div>
      </MuiDialog>
    </>
  )
}

export const dialogSection: Section = {
  title: "Dialog",
  pairs: [
    {
      id: "dialog-open",
      // A dialog is centred in the VIEWPORT, not anchored to its trigger, so there is no anchored
      // capture to take and nothing for `anchored-to-trigger` to measure. `overlay-matches` is
      // what covers the scrim, which no capture of either cell can contain: it is a full-viewport
      // layer over whatever the page shows behind that cell, and the two cells are 240px apart.
      states: ["open"],
      behaviors: ["escape-closes", "overlay-matches"],
      // kumo's Dialog merges `className` into its panel and ships no marker class there, so the
      // pair supplies one through the component's own public prop.
      openSelector: ".pair-dialog-panel",
      ref: <KumoDialogDemo />,
      mui: <MuiDialogDemo />,
    },
  ],
}
