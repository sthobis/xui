import { useEffect, useState, type HTMLAttributes } from "react"
import MuiAutocomplete from "@mui/material/Autocomplete"
import MuiTextField from "@mui/material/TextField"
import { Check } from "lucide-react"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import type { Section } from "../../../gallery/types"

const OPTIONS = ["Apple", "Banana", "Cherry"]
const VALUE = "Apple"

// Whole, even pixels so both controls start on the same pixel column - see menu.tsx.
const WRAP_WIDTH = 224
const wrapStyle = { width: WRAP_WIDTH } as const

// GOTCHA - `disableClearable` matches shadcn's own default, it is not a theme workaround.
// ComboboxInput takes `showClear={false}` unless asked otherwise, so its addon holds the trigger
// alone. MUI renders a clear indicator whenever a value is present and hides it with `visibility`,
// which still reserves its width - so without this the two addons are different sizes before any
// styling is involved.
//
// Both sides are fully typeable, and both hold their own value. An earlier version pinned `value`
// and set `readOnly` on each side to keep the captures still; that made the showcase's comboboxes
// dead to the keyboard, and it was never needed - Playwright hides the text caret in screenshots by
// default (`caret: "hide"`), so a focused, editable input captures exactly like a read-only one.
function renderMuiInput(params: Parameters<
  NonNullable<React.ComponentProps<typeof MuiAutocomplete<string, false, true, false>>["renderInput"]>
>[0]) {
  return (
    <MuiTextField
      {...params}
      slotProps={{
        ...params.slotProps,
        htmlInput: { ...params.slotProps.htmlInput, "data-target": true },
      }}
    />
  )
}

interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetPaper: PortalTargetProps = { "data-portal-target": "autocomplete-open" }

// ComboboxContent reads as `w-(--anchor-width)` with a min-width of anchor + --spacing(7), which
// looks like it should make the panel 28px wider than the control. Measured, it does not: the panel
// comes out exactly anchor-width, so that min-width never takes effect. MUI already sizes its
// popper to the anchor, so nothing is set here beyond the gap - which does need stating, since
// Popper writes its own transform and no margin can reach it.
const popperSlotProps = {
  // The two libraries measure the anchor differently, and neither number is reachable from CSS.
  // Base UI's `--anchor-width` reports 223 for this 224px control - one less than its border box -
  // while MUI sizes its popper to `clientWidth`, which excludes both borders and gives 222. Stated
  // explicitly so the panels are the same width; everything else about them already matches.
  style: { width: WRAP_WIDTH - 1 },
  // shadcn: side="bottom" align="start". MUI's Autocomplete leaves its popper CENTRED, which put a
  // 223px panel on a 224px anchor half a pixel off the grid - enough to re-rasterize every glyph
  // and the panel's rounded corners in the anchored capture, which deliberately skips the
  // sub-pixel snap so it can still see real placement errors. The 1px skid is the inset Base UI
  // gives the panel: measured, its left edge sits one pixel inside the control's.
  placement: "bottom-start" as const,
  modifiers: [{ name: "offset", options: { offset: [1, 6] } }], // shadcn: sideOffset={6}, plus the 1px inset
}

// Both sides are CONTROLLED open. A permanently-open combobox is not just unrealistic, it breaks
// the harness for every pair after it: resetState waits for each `[data-portal-target]` to detach,
// and one that never closes stalls the run. Same shape as select.tsx and menu.tsx.
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

function ShadcnComboboxOpenDemo() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <Combobox
      items={OPTIONS}
      defaultValue={VALUE}
      open={open}
      onOpenChange={(next) => (next ? onOpen() : onClose())}
    >
      <ComboboxInput data-target onClick={onOpen} />
      <ComboboxContent data-portal-target="autocomplete-open">
        <ComboboxList>
          {OPTIONS.map((option) => (
            <ComboboxItem key={option} value={option}>
              {option}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function MuiAutocompleteOpenDemo() {
  const { open, onOpen, onClose } = useControlledOpen()
  return (
    <MuiAutocomplete
      disableClearable
      // MUI selects the input's text when the field takes focus; Base UI's combobox does not, so
      // opening one left a blue selection band across the value and the other did not. Same class
      // of configuration match as disableClearable above, not a styling workaround.
      selectOnFocus={false}
      options={OPTIONS}
      defaultValue={VALUE}
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      slotProps={{ paper: portalTargetPaper, popper: popperSlotProps }}
      renderInput={renderMuiInput}
      // MUI's Autocomplete marks the selected option with a background, never a glyph; shadcn's
      // ItemIndicator draws a check. Hand-rendered as a plain child the same way select.tsx does,
      // with the theme owning its position through the data-slot below.
      renderOption={(props, option, { selected }) => {
        const { key, ...rest } = props
        return (
          <li key={key} {...rest}>
            {option}
            {selected && <Check aria-hidden data-slot="combobox-item-check" />}
          </li>
        )
      }}
    />
  )
}

export const autocompleteSection: Section = {
  title: "Autocomplete",
  pairs: [
    {
      id: "autocomplete-closed",
      states: ["default", "focus"],
      ref: (
        <div style={wrapStyle}>
          <Combobox items={OPTIONS} defaultValue={VALUE}>
            <ComboboxInput data-target />
          </Combobox>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiAutocomplete
            disableClearable
            selectOnFocus={false}
            options={OPTIONS}
            defaultValue={VALUE}
            renderInput={renderMuiInput}
          />
        </div>
      ),
    },
    {
      id: "autocomplete-open",
      states: ["open", "anchored"],
      behaviors: ["escape-closes"],
      // The panel is 92px tall and drops below this row. Without room reserved, its bottom-left
      // corner - transparent, because of the border radius - landed on the next section's heading
      // text on the shadcn side and on blank background on the MUI side. See Pair.roomBelow.
      roomBelow: 112,
      ref: (
        <div style={wrapStyle}>
          <ShadcnComboboxOpenDemo />
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiAutocompleteOpenDemo />
        </div>
      ),
    },
  ],
}
