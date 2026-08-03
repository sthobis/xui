import { useEffect, useState, type HTMLAttributes } from "react"
import MuiButton from "@mui/material/Button"
import MuiDrawer from "@mui/material/Drawer"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Section } from "../types"

const TITLE = "Filters"
const BODY = "Narrow the results."

// Whole, even pixels - see menu.tsx for why.
const TRIGGER_WIDTH = 96

// SheetHeader is `flex flex-col gap-0.5 p-4`: a shadcn composition slot with no MUI counterpart,
// restated here as plain markup. Its padding is what insets the panel's content, since the panel
// itself has none.
const headerStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "0.125rem", // shadcn: gap-0.5
  padding: "1rem", // shadcn: p-4
}
// shadcn: text-base font-medium text-foreground. `text-base` carries its own paired line-height
// (1.5rem) - without restating it the title inherits the panel's text-sm 1.25rem and every glyph in
// the header lands a couple of pixels high, which is what the pair's residual turned out to be.
const titleStyle = { fontSize: "1rem", lineHeight: "1.5rem", fontWeight: 500 } as const
const descriptionStyle = { color: "var(--mui-palette-text-secondary)", margin: 0 } as const // shadcn: text-sm text-muted-foreground

interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetPaper: PortalTargetProps = { "data-portal-target": "drawer-open" }

// Same Escape story as the other overlays - see menu.tsx.
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

function MuiDrawerDemo() {
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
        Filters
      </MuiButton>
      <MuiDrawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ paper: portalTargetPaper }}
      >
        <div style={headerStyle}>
          <div style={titleStyle}>{TITLE}</div>
          <p style={descriptionStyle}>{BODY}</p>
        </div>
      </MuiDrawer>
    </>
  )
}

export const drawerSection: Section = {
  title: "Drawer",
  pairs: [
    {
      // No `anchored` state, for the same reason the dialog pair has none: the panel is pinned to
      // the viewport edge rather than positioned relative to its trigger, so the union of the two
      // measures where the trigger happens to sit. See dialog.tsx's own note.
      id: "drawer-open",
      states: ["open"],
      behaviors: ["escape-closes", "overlay-matches"],
      ref: (
        <Sheet>
          <SheetTrigger asChild>
            <Button data-target variant="outline" style={{ width: TRIGGER_WIDTH }}>
              Filters
            </Button>
          </SheetTrigger>
          {/* showCloseButton={false} for the same reason the dialog pair sets it: the built-in
              close button is a `size="icon-sm"` ghost Button, a size no pair covers. */}
          <SheetContent showCloseButton={false} data-portal-target="drawer-open">
            <SheetHeader>
              <SheetTitle>{TITLE}</SheetTitle>
              <SheetDescription>{BODY}</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ),
      mui: <MuiDrawerDemo />,
    },
  ],
}
