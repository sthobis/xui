import { useEffect, useState, type HTMLAttributes } from "react"
import MuiButton from "@mui/material/Button"
import MuiSnackbar from "@mui/material/Snackbar"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { Section } from "../types"

const MESSAGE = "Event has been created"
const PAIR_ID = "snackbar-message"
const ACTION_PAIR_ID = "snackbar-action"
const ACTION_LABEL = "Undo"

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
// The ACTION button is now covered too, by its own pair. sonner's [data-button] is a 24px-tall,
// 4px-radius, inverted-colour pill - not shadcn's Button, which MuiButton is already themed onto -
// so the theme styles it contextually, scoped to the action slot. That is not a contradiction of the
// Button block: in a real shadcn app a toast's action IS sonner's pill, and a themed Snackbar should
// look like the thing a user actually sees. `[data-cancel]` and `[data-close-button]` have no pair
// and get no treatment.

// sonner renders the toast itself and forwards neither arbitrary props nor data attributes, so the
// harness's `data-portal-target` hook cannot be handed to it through the API the way every other
// portalled pair does. Stamp it on after the fact instead: the showcase mounts exactly one Toaster
// and only this section ever fires a toast, so any toast on the page belongs to this pair. A
// MutationObserver rather than a timeout after toast(), because sonner mounts the <li> on its own
// schedule - a raced attribute would make the harness's visibility wait flake rather than fail
// loudly, which is the one failure mode worth designing out.
// Which pair most recently fired a toast. sonner renders every toast into ONE shared Toaster, so
// there is nothing in the DOM to derive the owner from - it has to be recorded at the moment the
// toast is fired. An earlier version gave each pair its own observer stamping its own id, and they
// fought: whichever ran last relabelled the other pair's toast, and the harness then waited forever
// for an overlay that existed under the wrong name.
let activePairId = PAIR_ID

// One observer for the whole page, started lazily. See the note above about why the attribute is
// stamped on rather than passed in: sonner forwards neither arbitrary props nor data attributes.
// A MutationObserver rather than a timeout after toast(), because sonner mounts the <li> on its own
// schedule - a raced attribute would make the harness's visibility wait flake rather than fail
// loudly, which is the one failure mode worth designing out.
let stampingStarted = false
function startStamping() {
  if (stampingStarted) return
  stampingStarted = true
  const stamp = () => {
    for (const el of document.querySelectorAll("[data-sonner-toast]")) {
      el.setAttribute("data-portal-target", activePairId)
    }
  }
  // Only rescan when something was actually inserted. This watches the whole document for the app's
  // lifetime, and the gallery mutates constantly while the harness drives hover and focus states.
  const observer = new MutationObserver((records) => {
    if (records.some((r) => r.addedNodes.length > 0)) stamp()
  })
  observer.observe(document.body, { childList: true, subtree: true })
  stamp()
}

// Both sides are driven the same way the other portalled pairs are (see select.tsx, menu.tsx): the
// overlay opens on click and closes on Escape, and never on a timer. resetState waits for every
// [data-portal-target] to detach before moving on, so a toast that auto-dismissed mid-capture - or
// one that never dismissed at all - would stall or flake the whole run after this pair.
function ShadcnToastDemo({ pairId, action }: { pairId: string; action?: boolean }) {
  useEffect(() => {
    startStamping()
  }, [])
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
      onClick={() => {
        activePairId = pairId
        toast(MESSAGE, {
          duration: Infinity,
          ...(action ? { action: { label: ACTION_LABEL, onClick: () => {} } } : {}),
        })
      }}
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
const portalTargetActionContent: PortalTargetProps = { "data-portal-target": ACTION_PAIR_ID }

function MuiSnackbarDemo({ action }: { action?: boolean }) {
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
        // A plain MUI Button in the action slot - no size or variant props compensating for the
        // theme. Everything that makes it sonner's pill comes from the theme's action-slot rules.
        action={action ? <MuiButton>{ACTION_LABEL}</MuiButton> : undefined}
        // sonner's default position. The pixel diff cannot see this either way - the "open" state
        // captures the toast box alone and normalizes its position - so this is here to keep the
        // live showcase honest, not to pass the harness. Toast PLACEMENT is not covered by this
        // pair; only the box is.
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        slotProps={{ content: action ? portalTargetActionContent : portalTargetContent }}
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
      shadcn: <ShadcnToastDemo pairId={PAIR_ID} />,
      mui: <MuiSnackbarDemo />,
    },
    {
      id: ACTION_PAIR_ID,
      states: ["open"],
      shadcn: <ShadcnToastDemo pairId={ACTION_PAIR_ID} action />,
      mui: <MuiSnackbarDemo action />,
    },
  ],
}
