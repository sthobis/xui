import { useEffect, useState } from "react"
import type React from "react"
import MuiSpeedDial from "@mui/material/SpeedDial"
import MuiSpeedDialAction from "@mui/material/SpeedDialAction"
import { Copy, Plus, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Section } from "../../../gallery/types"

// COMPOSED TWIN - shadcn ships no speed dial, so both states below are assembled here from its own
// tokens. Read the parity numbers as "MUI renders this composition exactly".
//
// CLOSED, the box is the point. Untouched, MUI reserves room above the button for the hidden
// actions, so a closed speed dial measures 96x72 around a 56px button and renders 16px above where
// it was placed - pin one to a corner and it lands in the wrong corner. The theme takes those hidden
// actions out of flow while closed (see the MuiSpeedDial banner).
//
// OPEN, the stack is the point: a column of smaller circular buttons above the trigger. In shadcn's
// language those are outline Buttons made circular - `size-10 rounded-full` with a shadow - against
// the trigger's filled `size-14`. The LAYOUT is MUI's own and deliberately kept, the same call
// stepper.tsx makes: actions stacked column-reverse above the trigger with a 16px gap between the
// group and the trigger, and 8px between actions.
//
// NOT covered, and only one of these is a gap: the staggered enter transition and `direction` other
// than up have no pair.
//
// The action TOOLTIPS are deliberately not paired. SpeedDialAction renders MUI's own Tooltip - it
// imports the component and its props extend TooltipProps - so the surface a theme owns there is
// already verified at zero by the tooltip-* pairs. What a pair here would add is the tooltip's
// PLACEMENT beside an action, and shadcn ships no speed dial, so nothing grounds where that sits.
// Adding a pair would assert MUI's placement is correct rather than test anything.
const wrapStyle = { width: 96 } as const

// The OPEN pair needs its own wrapper height. An open speed dial is 184px tall but a gallery cell is
// only 88, so the stack overflowed upward into the row above - and since the root's own background is
// transparent between its buttons, the capture picked up whatever page content sat behind, which is
// different content on each side because the two cells are 240px apart. That showed up as near-black
// text pixels at the capture's left edge on the MUI side only. Sizing the wrapper to the stack keeps
// it inside its own row, over that row's uniform background. Same failure mode as autocomplete.tsx's
// popup corner, and the same fix: give the thing room.
const openWrapStyle = { width: 96, height: 184 } as const

const ACTIONS = [
  { label: "Copy", Icon: Copy },
  { label: "Share", Icon: Share2 },
] as const

// data-target has to sit on the trigger BUTTON, not the SpeedDial root: the harness clicks the
// target's centre, and the root's centre is up in the action stack once open. FabProps is MUI's own
// hook for reaching that button; the named const keeps TypeScript's excess-property check off a
// data attribute, the same shape select.tsx and snackbar.tsx use.
type FabPropsWithData = NonNullable<React.ComponentProps<typeof MuiSpeedDial>["FabProps"]> & {
  "data-target"?: boolean
}
const triggerProps: FabPropsWithData = { "data-target": true }

// Both sides are CONTROLLED open, the same shape select.tsx and menu.tsx use, and for the same
// reason: resetState waits for every open overlay to detach before the next pair, so one that never
// closes stalls the run. MUI's SpeedDial also opens on hover by default, which would fire during the
// harness's own mouse movements - controlling it removes that entirely.
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

function ShadcnSpeedDialOpen() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <div className="flex w-14 flex-col-reverse items-center" {...(open ? { "data-open-target": "" } : {})}>
      <Button
        data-target
        size="icon"
        className="size-14 rounded-full shadow-lg"
        aria-label="Actions"
        onClick={() => (open ? onClose() : onOpen())}
      >
        <Plus />
      </Button>
      {open && (
        // Spacing mirrors MUI's own, expressed in shadcn steps: 8px above the stack, 16px between
        // actions, 24px between the stack and the trigger. MUI reaches those through an 8px margin
        // on every action plus a 48px padding and a -32px margin on the container; the totals are
        // what matter, and matching totals rather than mechanism is the same call stepper.tsx makes.
        <div className="flex flex-col-reverse items-center gap-4 pt-2 pb-6">
          {ACTIONS.map(({ label, Icon }) => (
            <Button
              key={label}
              variant="outline"
              size="icon"
              className="size-10 rounded-full shadow-md"
              aria-label={label}
            >
              <Icon />
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

function MuiSpeedDialOpen() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <MuiSpeedDial
      ariaLabel="Actions"
      icon={<Plus />}
      open={open}
      onClick={() => (open ? onClose() : onOpen())}
      FabProps={triggerProps}
      // Marked only WHILE open. SpeedDial has no slot for its action stack, so the whole root is the
      // capture target - which is the better framing anyway, since it puts the trigger, the actions
      // and the space between them in one picture. Leaving the attribute on permanently would stall
      // the run: resetState waits for every open overlay to detach before the next pair.
      {...(open ? { "data-open-target": "" } : {})}
    >
      {ACTIONS.map(({ label, Icon }) => (
        // NO `title`. In v9 SpeedDialAction extends TooltipProps, and a title makes MUI pop that
        // action's tooltip the moment the speed dial opens - opening moves focus to the first action
        // and SpeedDial drives the tooltip from its own state, so `disableFocusListener` does not
        // reach it (tried; the black "Share" label with its arrow still landed inside the capture).
        // Tooltips are outside this pair's scope - their surface is covered by tooltip-open - so the
        // accessible name goes on the button instead, exactly as the twin does it.
        <MuiSpeedDialAction key={label} icon={<Icon />} slotProps={{ fab: { "aria-label": label } }} />
      ))}
    </MuiSpeedDial>
  )
}

export const speedDialSection: Section = {
  title: "SpeedDial",
  pairs: [
    {
      id: "speeddial-closed",
      ref: (
        <div style={wrapStyle}>
          <Button size="icon" className="size-14 rounded-full shadow-lg" aria-label="Actions">
            <Plus />
          </Button>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiSpeedDial ariaLabel="Actions" icon={<Plus />} />
        </div>
      ),
    },
    {
      id: "speeddial-open",
      states: ["open"],
      behaviors: ["escape-closes"],
      ref: (
        <div style={openWrapStyle}>
          <ShadcnSpeedDialOpen />
        </div>
      ),
      mui: (
        <div style={openWrapStyle}>
          <MuiSpeedDialOpen />
        </div>
      ),
    },
  ],
}
