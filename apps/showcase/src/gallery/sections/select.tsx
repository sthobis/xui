import { useEffect, useState, type HTMLAttributes } from "react"
import { Check } from "lucide-react"
import MuiSelect from "@mui/material/Select"
import MuiMenuItem from "@mui/material/MenuItem"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Section } from "../types"

// Same option list + same selected value on both sides for every pair, so select-open's
// dropdown renders identical text (letting the browser's own layout engine size both content
// boxes identically - see the MuiSelect banner in packages/xui/src/themes/shadcn.ts for why no
// pair forces an explicit trigger/content width) and the same one item paints the selected
// check icon.
const FRUITS = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "grapes", label: "Grapes" },
  { value: "pineapple", label: "Pineapple" },
]
const SELECTED = "blueberry"

// MUI's Select sets its own Menu paper `style.minWidth` to the trigger's measured
// `clientWidth` by default (SelectInput.js), an inline style that would otherwise always beat
// the theme's own `min-width: 9rem` (shadcn: min-w-36) rule regardless of specificity - so
// every pair explicitly restates the ground-truth intrinsic value here to defeat that
// auto-tie and let the menu size to its own content instead, exactly like the real
// (position="item-aligned") shadcn twin's own intrinsic min-w-36.
const menuPaperStyle = { minWidth: "9rem" }

// Select's `SelectDisplayProps` type is a plain `React.HTMLAttributes<HTMLDivElement>` (unlike
// Checkbox/Radio/Switch's own `slotProps.input`, which opts into an augmentable data-*-friendly
// type - see checkbox.tsx's own `dataTargetInput` banner) - a bare `{ "data-target"?: boolean }`
// variable shares NO property with it, so TypeScript's "weak type" check rejects the assignment
// even though it isn't a fresh object literal. Declaring it as an actual (structural) extension
// of HTMLAttributes, rather than an unrelated shape, sidesteps that without widening to `any`.
// `data-target` is the parity harness's own click marker (e2e/lib/states.ts); `data-portal-target`
// (below) is the harness's portal-capture marker (see e2e/parity.spec.ts + the Select task brief)
// placed on the one DOM node - the Menu's Paper - that both this and the real shadcn
// SelectContent render as their outermost portalled box.
interface DataTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-target"?: boolean
}
const dataTarget: DataTargetProps = { "data-target": true }
const portalTargetPaper = { style: menuPaperStyle, "data-portal-target": "select-open" }

// MUI's own Select has no built-in "selected item gets a check glyph" behavior (unlike
// Radix's SelectItem, whose ItemIndicator only mounts a Check child when the item's own value
// matches - see select.tsx ground truth). shadcn's real DOM reserves the pr-8 gap on every
// item unconditionally (styled once in the theme's MuiMenuItem.root) but only the matching
// item actually renders a Check glyph - reproduced here the same idiomatic way any MUI
// consumer would (hand-rendering a child per item), with the theme owning the icon's
// size/position/color via a `data-slot="select-item-check"` selector (see MuiMenuItem banner).
function muiOptions(selected: string) {
  return FRUITS.map(({ value, label }) => (
    <MuiMenuItem key={value} value={value}>
      {value === selected && <Check aria-hidden data-slot="select-item-check" />}
      {label}
    </MuiMenuItem>
  ))
}

// GOTCHA - MUI's Select, by default, reuses the SELECTED MenuItem's own `children` verbatim as
// the closed trigger's displayed content (confirmed live: with no `renderValue`, the trigger
// showed the Check glyph ABOVE the "Blueberry" text, since that glyph is a child of the
// matching MenuItem above). shadcn's SelectValue never does this - the check only ever lives
// inside the dropdown's ItemIndicator, never the trigger - so `renderValue` pins the trigger to
// plain text regardless of what a matching MenuItem's own children look like.
function renderSelectValue(value: string) {
  return FRUITS.find((fruit) => fruit.value === value)?.label ?? ""
}

function shadcnOptions() {
  return FRUITS.map(({ value, label }) => (
    <SelectItem key={value} value={value}>
      {label}
    </SelectItem>
  ))
}

// GOTCHA - MUI's own Escape-to-close (Modal/MenuList's onKeyDown) relies on the native
// keydown event bubbling up through the React tree from whatever element currently has focus.
// The parity harness's own resetState (e2e/lib/states.ts, not modifiable) runs
// `document.activeElement?.blur()` BEFORE pressing Escape - since Menu autofocuses an item on
// open, that blur moves focus to <body>, and a keydown targeting <body> never reaches any
// React-attached listener (body is not a descendant of React's root container, so nothing
// bubbles into it) - confirmed live: real Radix (shadcn's side) closes fine regardless, because
// its Escape handling is a plain top-level `document` listener, not focus-dependent, but the
// unthemed MUI twin was observed left open (a stray `[role="listbox"]` at the page root)
// after the exact same resetState sequence. Fixed the same way Radix already does it: a
// controlled `open` + a plain native `document` keydown listener (not a React synthetic one),
// which fires regardless of what currently has focus.
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

// GOTCHA - a REAL anchoring difference, only visible once the parity harness's own "anchored"
// state (e2e/lib/states.ts) captures the trigger and the open content TOGETHER: shadcn's real
// Select (Radix, position="item-aligned" - select.tsx's own default, unset by either gallery
// pair) overlaps the dropdown on the trigger so the SELECTED item's vertical center lands
// exactly on the trigger's own vertical center (confirmed live: both measured centerY 341 for
// this exact pair, trigger and selected item, with the trigger literally hidden underneath), AND
// horizontally aligns the selected item's own TEXT (not its box edge) with the trigger's own
// TEXT (also confirmed live: both measured textLeft 161.1328125 - identical). MUI's Select has no
// equivalent feature - `getContentAnchorEl`/item-alignment was removed after MUI v4 - its Menu
// unconditionally anchors `top-left of paper -> bottom-left of trigger`
// (SelectInput.js's own anchorOrigin: {vertical:'bottom'}/transformOrigin: {vertical:'top'}),
// rendering the whole menu flush-left and BELOW the trigger instead of overlapping it.
//
// Restoring the overlap needs the same classic anchorOrigin/transformOrigin technique MUI's own
// (now-removed) getContentAnchorEl used - both accept a raw pixel number (not just the
// left/center/right keywords), measured from the anchor/paper's own left or top edge
// (Popover.js's own getOffsetLeft/getOffsetTop):
//  - vertical: "center" on both sides anchors the Paper's vertical center to the trigger's
//    vertical center. This reproduces Radix's real alignment here specifically because SELECTED
//    ("blueberry") is FRUITS' exact middle item (index 2 of 5) - with the Menu's own symmetric
//    top/bottom list padding, the Paper's vertical center therefore coincides with the selected
//    item's vertical center. This is the narrow, demo-specific case of the general fix (which
//    would need to measure the selected item's actual offset within the list); a general fix is
//    out of scope here since MUI ships no built-in per-item alignment to hook into.
//  - horizontal: a pixel offset on each side reproduces Radix's TEXT alignment. The trigger's own
//    box-edge-to-text distance is border(1px, border-input's default width) + pl-2.5(10px) = 11px
//    (select.tsx's SelectTrigger ground truth); the item's own box-edge-to-text distance is
//    pl-1.5 (6px) (select.tsx's SelectItem ground truth, restated in the theme's own MuiMenuItem
//    padding - see the MuiMenuItem banner). Anchoring at the trigger's 11px point and
//    transform-origin-ing at the Paper's 6px point (the MenuList itself carries no horizontal
//    padding of its own, so the Paper's own left edge coincides with each MenuItem's) places the
//    selected item's text exactly under the trigger's text, the same +5px (11-6) box-edge offset
//    measured live on the real component.
const TRIGGER_TEXT_INSET = 11 // shadcn: border(1px) + pl-2.5(10px) on SelectTrigger
const ITEM_TEXT_INSET = 6 // shadcn: pl-1.5(6px) on SelectItem
const anchorOrigin = { vertical: "center", horizontal: TRIGGER_TEXT_INSET } as const
const transformOrigin = { vertical: "center", horizontal: ITEM_TEXT_INSET } as const

function MuiSelectOpenDemo() {
  const controlledOpen = useControlledOpen()
  return (
    <MuiSelect
      defaultValue={SELECTED}
      SelectDisplayProps={dataTarget}
      renderValue={renderSelectValue}
      MenuProps={{ slotProps: { paper: portalTargetPaper }, anchorOrigin, transformOrigin }}
      {...controlledOpen}
    >
      {muiOptions(SELECTED)}
    </MuiSelect>
  )
}

export const selectSection: Section = {
  title: "Select",
  pairs: [
    {
      id: "select-closed",
      states: ["default", "hover", "focus"],
      shadcn: (
        <Select defaultValue={SELECTED}>
          <SelectTrigger data-target>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{shadcnOptions()}</SelectContent>
        </Select>
      ),
      mui: (
        <MuiSelect
          defaultValue={SELECTED}
          SelectDisplayProps={dataTarget}
          renderValue={renderSelectValue}
          MenuProps={{ slotProps: { paper: { style: menuPaperStyle } } }}
        >
          {muiOptions(SELECTED)}
        </MuiSelect>
      ),
    },
    {
      id: "select-disabled",
      shadcn: (
        <Select defaultValue={SELECTED} disabled>
          <SelectTrigger data-target>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>{shadcnOptions()}</SelectContent>
        </Select>
      ),
      mui: (
        <MuiSelect
          defaultValue={SELECTED}
          disabled
          SelectDisplayProps={dataTarget}
          renderValue={renderSelectValue}
          MenuProps={{ slotProps: { paper: { style: menuPaperStyle } } }}
        >
          {muiOptions(SELECTED)}
        </MuiSelect>
      ),
    },
    {
      id: "select-open",
      states: ["open", "anchored"],
      behaviors: ["escape-closes"],
      shadcn: (
        <Select defaultValue={SELECTED}>
          <SelectTrigger data-target>
            <SelectValue />
          </SelectTrigger>
          <SelectContent data-portal-target="select-open">{shadcnOptions()}</SelectContent>
        </Select>
      ),
      mui: <MuiSelectOpenDemo />,
    },
  ],
}
