import { useEffect, useState, type HTMLAttributes } from "react"
import MuiButton from "@mui/material/Button"
import MuiSnackbar from "@mui/material/Snackbar"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { Section } from "../types"

const MESSAGE = "Event has been created"
const PAIR_ID = "snackbar-message"

// WHERE THE GROUND TRUTH FOR THIS PAIR COMES FROM, AND WHY IT IS WEAKER THAN EVERY OTHER PAIR'S.
//
// shadcn's `sonner.tsx` is a thin wrapper: it sets four CSS variables (--normal-bg, --normal-text,
// --normal-border, --border-radius) onto sonner's own <Toaster /> and adds a `cn-toast` class that
// is not defined anywhere in this install. Everything a toast actually looks like - its padding,
// width, font size, shadow, and font family - lives in the third-party `sonner` package's
// stylesheet, not in shadcn source. So unlike every other component here, the values in the theme's
// Snackbar block trace to node_modules, not to `components/ui/`.
//
// Those values are exact and readable rather than guessed, so parity is still provable. But four of
// them are sonner's aesthetics and NOT shadcn's design language, and they are deliberately
// transcribed as-is rather than "corrected" to shadcn tokens:
//   - font-family is sonner's own ui-sans-serif/system-ui stack, so a real shadcn toast does not
//     render in Geist even though every other shadcn component does.
//   - font-size is 13px, which is not on shadcn's 12/14/16 type scale.
//   - the shadow is 0px 4px 12px rgba(0,0,0,0.1), not shadcn's shadow-lg.
//   - the description colour is a raw #3f3f3f that ignores the theme entirely in light mode.
// If a later change makes these track shadcn tokens instead, this pair stops matching the thing a
// shadcn user actually sees. Ground truth wins, including when the ground truth is inconsistent.

// SCOPE: single-line message only.
//
// sonner's toast body is [data-content] (a flex column) holding [data-title] and [data-description]
// as separate styled nodes. MUI's SnackbarContent has ONE opaque `message` slot and no counterpart
// for either, so a title+description toast cannot be expressed in idiomatic MUI - it would need
// wrapper elements in the gallery, which this repo does not allow. With a title alone, [data-content]
// collapses to just the title box and `message` maps onto it exactly, so that is what ships.
//
// The action-button variant is left out for the same reason plus a sharper one: sonner's
// [data-button] is a 24px-tall, 4px-radius, inverted-colour button, which is a different component
// from shadcn's Button - already themed onto MuiButton. Covering it would mean overriding MuiButton
// inside MuiSnackbar and contradicting the shipped Button block.

// sonner renders the toast itself and forwards neither arbitrary props nor data attributes, so the
// harness's `data-portal-target` hook cannot be handed to it through the API the way every other
// portalled pair does. Stamp it on after the fact instead: the showcase mounts exactly one Toaster
// and only this section ever fires a toast, so any toast on the page belongs to this pair. A
// MutationObserver rather than a timeout after toast(), because sonner mounts the <li> on its own
// schedule - a raced attribute would make the harness's visibility wait flake rather than fail
// loudly, which is the one failure mode worth designing out.
function useStampPortalTarget() {
  useEffect(() => {
    const stamp = () => {
      for (const el of document.querySelectorAll("[data-sonner-toast]")) {
        el.setAttribute("data-portal-target", PAIR_ID)
      }
    }
    // Only rescan when something was actually inserted. This observer watches the whole document
    // for the app's lifetime, and the gallery mutates constantly while the harness drives hover
    // and focus states - a rescan on every attribute change would be pure overhead during
    // timing-sensitive captures.
    const observer = new MutationObserver((records) => {
      if (records.some((r) => r.addedNodes.length > 0)) stamp()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    stamp()
    return () => observer.disconnect()
  }, [])
}

// Both sides are driven the same way the other portalled pairs are (see select.tsx, menu.tsx): the
// overlay opens on click and closes on Escape, and never on a timer. resetState waits for every
// [data-portal-target] to detach before moving on, so a toast that auto-dismissed mid-capture - or
// one that never dismissed at all - would stall or flake the whole run after this pair.
function ShadcnToastDemo() {
  useStampPortalTarget()
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") toast.dismiss()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])
  return (
    <Button
      variant="outline"
      data-target
      onClick={() => toast(MESSAGE, { duration: Infinity })}
    >
      Show toast
    </Button>
  )
}

// Same shape select.tsx and autocomplete.tsx use: a data attribute is not in MUI's slot-props
// type, and a named const rather than an inline literal keeps TypeScript's excess-property check
// off it.
interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetContent: PortalTargetProps = { "data-portal-target": PAIR_ID }

function MuiSnackbarDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <MuiButton variant="outlined" data-target onClick={() => setOpen(true)}>
        Show toast
      </MuiButton>
      <MuiSnackbar
        open={open}
        onClose={() => setOpen(false)}
        message={MESSAGE}
        // sonner's default position. The pixel diff cannot see this either way - the "open" state
        // captures the toast box alone and normalizes its position - so this is here to keep the
        // live showcase honest, not to pass the harness. Toast PLACEMENT is not covered by this
        // pair; only the box is.
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        slotProps={{ content: portalTargetContent }}
      />
    </>
  )
}

export const snackbarSection: Section = {
  title: "Snackbar",
  pairs: [
    {
      id: PAIR_ID,
      states: ["open"],
      behaviors: ["escape-closes"],
      ref: <ShadcnToastDemo />,
      mui: <MuiSnackbarDemo />,
    },
  ],
}
