import { useCallback, useEffect, useState, type HTMLAttributes } from "react"
import MuiSelect from "@mui/material/Select"
import MuiMenuItem from "@mui/material/MenuItem"
import { CheckIcon, CaretUpDownIcon } from "@phosphor-icons/react"
import { Select } from "@cloudflare/kumo/components/select"
import type { Section } from "../../../gallery/types"

// Values ARE the labels. kumo's Select renders the raw value in its closed trigger unless it is
// given an `items` map to look the label up in, and the pair is about how the control looks, not
// about which of the two ways of supplying options is used.
const FRUITS = ["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]
// The exact MIDDLE item, which is what lets both sides align the popup the same way - see the
// anchorOrigin note below.
const SELECTED = "Blueberry"

// Pinned to an EVEN, whole number of pixels wide, for the same reason the dropdown pair pins its
// trigger: Base UI positions on the device-pixel grid while MUI's Popover rounds to whole CSS
// pixels, so a fractionally positioned trigger sends the two overlays half a pixel apart.
const TRIGGER_WIDTH = 144
// kumo: the popup is `min-w-[calc(var(--anchor-width)+3px)]` - three pixels wider than its trigger.
// MUI's Select writes the trigger's own measured width onto the paper as an inline style, which no
// theme rule can outrank, so the pair restates the ground-truth value the same way the shadcn
// select pair restates its own.
const menuPaperStyle = { minWidth: TRIGGER_WIDTH + 3 }

interface PortalTargetProps extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTargetPaper: PortalTargetProps & { style: typeof menuPaperStyle } = {
  style: menuPaperStyle,
  "data-portal-target": "select-open",
}
interface DataTargetRootProps {
  id?: string
  "data-target"?: boolean
}
const dataTargetRoot: DataTargetRootProps = { "data-target": true }

// kumo's Select forwards its rest props to Base UI's Select.Root - a component that renders no DOM -
// and puts `className` on the trigger, so there is no way to pass the harness's `data-target`
// marker down to the element that has to be clicked. Rather than wrap the control in a box of a
// different shape, the marker is attached after mount to the trigger kumo labels itself
// (`data-kumo-part="trigger"`), so the harness clicks and measures the real control.
function useMarkKumoTrigger() {
  return useCallback((node: HTMLElement | null) => {
    node?.querySelector('[data-kumo-part="trigger"]')?.setAttribute("data-target", "")
  }, [])
}

// Escape is handled by a listener on `document`, because the harness blurs the active element
// before pressing Escape and MUI's own handling depends on the keydown bubbling from whatever
// holds focus. Same shape every other portalled pair here uses.
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

// Base UI's Select aligns the SELECTED item with the trigger and overlaps the two, the way a native
// select does (`alignItemWithTrigger`, on by default and left alone by kumo). MUI dropped that
// feature after v4, so its Menu anchors top-left-of-paper to bottom-left-of-trigger instead. The
// classic anchorOrigin/transformOrigin technique MUI's own removed getContentAnchorEl used puts it
// back: "center" on both sides anchors the paper's vertical centre to the trigger's, which lands
// the selected item on the trigger precisely because SELECTED is the list's exact middle item and
// the popup's top and bottom padding are equal. The shadcn select pair solves the same problem the
// same narrow way, and its banner records why a general fix is out of scope: MUI ships no per-item
// alignment to hook into.
// Horizontally, Base UI aligns the option's TEXT with the trigger's text rather than the two
// boxes: the trigger's own text sits 12px in (kumo's button `px-3`), an option's sits 14px in
// (its `mx-1.5` margin plus its `px-2` padding), so the popup lands 2px left of its trigger.
// anchorOrigin/transformOrigin both take a raw pixel offset measured from the anchor's and the
// paper's own left edge, which reproduces that exactly.
const TRIGGER_TEXT_INSET = 12 // kumo: px-3 on the Select trigger (buttonVariants' base size)
const ITEM_TEXT_INSET = 14 // kumo: mx-1.5 (6px) + px-2 (8px) on Select.Option
const anchorOrigin = { vertical: "center", horizontal: TRIGGER_TEXT_INSET } as const
const transformOrigin = { vertical: "center", horizontal: ITEM_TEXT_INSET } as const

function KumoSelectDemo({ open }: { open?: boolean }) {
  const markTrigger = useMarkKumoTrigger()
  const controlled = useControlledOpen()
  return (
    <span ref={markTrigger} style={{ display: "inline-flex" }}>
      <Select
        aria-label="Fruit"
        defaultValue={SELECTED}
        className="!w-36"
        {...(open === undefined
          ? {}
          : { open: controlled.open, onOpenChange: (next: boolean) => (next ? controlled.onOpen() : controlled.onClose()) })}
      >
        {FRUITS.map((fruit) => (
          <Select.Option key={fruit} value={fruit}>
            {fruit}
          </Select.Option>
        ))}
      </Select>
    </span>
  )
}

function MuiSelectDemo({ controlled }: { controlled?: ReturnType<typeof useControlledOpen> }) {
  return (
    <MuiSelect
      defaultValue={SELECTED}
      {...dataTargetRoot}
      style={{ width: TRIGGER_WIDTH }}
      // kumo renders a CaretUpDown, not MUI's own single chevron - an icon is content, not styling,
      // and no theme override can turn one vector into another.
      IconComponent={CaretUpDownIcon}
      // MUI reuses the SELECTED MenuItem's own children verbatim as the closed trigger's content,
      // so without this the trigger renders the option's check glyph under its label. kumo's
      // trigger only ever shows the value.
      renderValue={(value) => value as string}
      MenuProps={{ slotProps: { paper: portalTargetPaper }, anchorOrigin, transformOrigin }}
      {...(controlled ?? {})}
    >
      {FRUITS.map((fruit) => (
        <MuiMenuItem key={fruit} value={fruit}>
          {fruit}
          {/* kumo's Select.Option renders a check indicator for the selected option, which MUI has
              no built-in equivalent for - hand-rendered per item the way any MUI consumer would,
              with the theme owning its size and colour through the data-slot selector. */}
          {fruit === SELECTED && <CheckIcon aria-hidden data-slot="select-item-check" />}
        </MuiMenuItem>
      ))}
    </MuiSelect>
  )
}

function MuiSelectOpenDemo() {
  const controlled = useControlledOpen()
  return <MuiSelectDemo controlled={controlled} />
}

function MuiSelectClosedDemo() {
  return <MuiSelectDemo />
}

export const selectSection: Section = {
  title: "Select",
  pairs: [
    {
      id: "select-closed",
      states: ["default", "hover", "focus"],
      ref: <KumoSelectDemo />,
      mui: <MuiSelectClosedDemo />,
    },
    {
      id: "select-open",
      // NO pixel state at all, and that is a limit of the harness rather than of the theme.
      //
      // Base UI aligns the selected option with the trigger by writing an unrounded position
      // (measured: y=626.375), while MUI's Popover rounds every overlay position with Math.round
      // and lands at 626.000. The two popups are then 0.375px apart vertically - far too small to
      // see, far too big to ignore, because the harness's `open` state corrects a sub-pixel offset
      // with a transform, and a transform re-rasterizes text in a composited layer. Only the
      // reference side needed correcting, so every label in the list ghosted: 1858 pixels at Δ232
      // on a popup whose every computed style matches exactly.
      //
      // Neither cap can express that honestly and no theme value is wrong, so the pair proves what
      // it can prove: the popup's surface through `overlay-matches`, its placement through
      // `anchored-to-trigger`, and the closed trigger through its own pixel pair above.
      // e2e/lib/states.ts's normalizeOverlayPosition carries the three implementations that were
      // measured and what each cost.
      states: [],
      behaviors: ["escape-closes", "overlay-matches", "anchored-to-trigger"],
      // kumo's Select popup carries no marker class of its own and the component forwards nothing
      // to it, so the pair identifies it structurally: the one presentation box whose DIRECT child
      // is the listbox. Base UI owns both roles deliberately, so this is stable in a way a hashed
      // class would not be.
      //
      // `[data-open]` is load-bearing, not decoration. Base UI leaves the popup MOUNTED once it has
      // been opened, flipped to `data-closed` and zero-sized, so a selector without it reports an
      // overlay that is no longer on screen and the harness's "everything closed" assertion never
      // clears.
      openSelector: '[role="presentation"][data-open]:has(> [role="listbox"])',
      roomBelow: 160,
      ref: <KumoSelectDemo open />,
      mui: <MuiSelectOpenDemo />,
    },
  ],
}
