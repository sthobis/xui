import { useEffect, useMemo, useState, type HTMLAttributes } from "react"
import MuiButton from "@mui/material/Button"
import MuiIconButton from "@mui/material/IconButton"
import MuiSnackbar from "@mui/material/Snackbar"
import { XIcon } from "@phosphor-icons/react"
import { Button } from "@cloudflare/kumo/components/button"
import { Toasty, createKumoToastManager } from "@cloudflare/kumo/components/toast"
import type { Section } from "../../../gallery/types"

const TITLE = "Event has been created"
const PAIR_ID = "toast-message"

interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetContent: PortalTargetProps = { "data-portal-target": PAIR_ID }

// SCOPE: a title-only toast, no description and no actions.
//
// Kumo's toast body is a flex column of a `[data-toast-title]` node and a description node, with an
// always-present close button beside them. MUI's SnackbarContent has ONE opaque `message` slot and
// one `action` slot, so the title maps onto `message` and the close button onto `action`, but a
// description has nowhere to go that would not mean wrapper elements in the gallery. The shadcn
// snackbar pair scopes itself the same way and for the same reason - its own banner records it.
function KumoToastDemo() {
  const manager = useMemo(() => createKumoToastManager(), [])
  const [id, setId] = useState<string | null>(null)
  // A toast is dismissed by its own close button or by swiping, neither of which the harness does -
  // and it does not close on a document-level Escape the way every other overlay here does, since
  // Base UI routes that through the focused viewport and the harness blurs first. Both sides
  // therefore close from the same plain document listener.
  useEffect(() => {
    if (!id) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        manager.close(id!)
        setId(null)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [id, manager])
  return (
    <Toasty toastManager={manager}>
      <Button
        data-target
        variant="secondary"
        onClick={() => {
          // `timeout: 0` keeps the toast up: the harness opens an overlay, screenshots it and
          // closes it on its own schedule, and one that auto-dismissed mid-run would fail as a
          // missing overlay rather than as a difference.
          setId(manager.add({ title: TITLE, timeout: 0 }))
        }}
      >
        Notify
      </Button>
    </Toasty>
  )
}

function MuiToastDemo() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open])
  return (
    <>
      <MuiButton data-target variant="outlined" onClick={() => setOpen(true)}>
        Notify
      </MuiButton>
      <MuiSnackbar
        open={open}
        onClose={() => setOpen(false)}
        // kumo pins its toast viewport to the bottom-right corner; MUI's own default is
        // bottom-centre.
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        message={TITLE}
        action={
          <MuiIconButton aria-label="Close" onClick={() => setOpen(false)}>
            <XIcon />
          </MuiIconButton>
        }
        slotProps={{ content: portalTargetContent }}
      />
    </>
  )
}

export const toastSection: Section = {
  title: "Toast",
  pairs: [
    {
      id: PAIR_ID,
      states: ["open"],
      behaviors: ["overlay-matches"],
      // Base UI's toast root carries no marker of its own, so the pair identifies it by the title
      // node kumo does tag (`data-toast-title`) and walks out to the box that contains it.
      openSelector: '[role="dialog"]:has([data-toast-title])',
      ref: <KumoToastDemo />,
      mui: <MuiToastDemo />,
    },
  ],
}
