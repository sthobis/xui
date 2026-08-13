import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react"
import MuiTooltip from "@mui/material/Tooltip"
import MuiPopover from "@mui/material/Popover"
import MuiMenu from "@mui/material/Menu"
import MuiMenuItem from "@mui/material/MenuItem"
import Tooltip from "../reference/primitives/Tooltip"
import Popover from "../reference/primitives/Popover"
import { Menu, MenuItem } from "../reference/primitives/Menu"
import { RefProviders } from "../Providers"
import type { Section } from "../../../gallery/types"

// The portalled tier. All three of these primitives ARE MUI components with a CSS module bolted
// on - Tooltip/index.tsx, Popover/index.tsx, Menu/index.tsx - so every reference cell goes through
// RefProviders, or the pair would compare the theme against itself.
//
// Because both sides are the same MUI component here, two of the harness's usual portal problems do
// not arise. There is no cross-engine rounding to reconcile (AGENTS.md's Popper-vs-Floating-UI
// note), and the `anchored` state is safe rather than needing `anchored-to-trigger`: MUI's Modal
// backdrop suppresses the trigger's hover on BOTH sides, so the two capture the same thing.
//
// The triggers are bare <span>s with inline styles on purpose. `anchored` frames the trigger along
// with the overlay, and a themed trigger would be styled by blinkTheme on the MUI side and by
// baselineTheme inside RefProviders on the reference side - so the pair would be judging the
// trigger rather than the overlay.

const triggerStyle = {
  display: "inline-block",
  padding: "6px 10px",
  border: "1px solid #cccccc",
  borderRadius: 4,
  font: "14px/20px system-ui, sans-serif",
  color: "#333333",
  background: "#ffffff",
  cursor: "pointer",
} as const

// MUI's slot props are typed per slot and reject an unknown `data-*` on a fresh object literal.
// Declaring a real extension of HTMLAttributes sidesteps the excess-property check without widening
// to `any` - the same shape the shadcn and kumo galleries use.
interface PortalTarget extends HTMLAttributes<HTMLDivElement> {
  "data-portal-target"?: string
}
const portalTarget = (id: string): PortalTarget => ({ "data-portal-target": id })

/**
 * Opens on click and closes on Escape, for both sides of every pair here.
 *
 * The harness's `open` state always CLICKS `[data-target]`, and a Tooltip opens on hover - so it
 * has to be driven rather than left to its own trigger. The Escape listener is on `document` and
 * not on the component: resetState blurs the active element BEFORE pressing Escape, so a React
 * synthetic handler would never see the key.
 */
function useClickOpen() {
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLSpanElement | null>(null)
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])
  return {
    open,
    anchor,
    close: () => setOpen(false),
    trigger: (label: string): ReactNode => (
      <span ref={anchor} data-target style={triggerStyle} onClick={() => setOpen(true)}>
        {label}
      </span>
    ),
  }
}

// ---- Tooltip ----
//
// The kit's Tooltip pins four props on every instance - `arrow`, `placement="top"`,
// `enterDelay={200}`, `leaveDelay={0}` - which the theme carries as defaultProps, so the MUI cell
// is a plain <Tooltip title=...> and still comes out with an arrow above its trigger.
//
// SCOPE: the `.tooltip b { font-weight: 700 }` rule is unpaired. It styles markup the CONSUMER puts
// inside the title, which no prop of MUI's reaches; it is carried in the theme anyway because it is
// a descendant rule on the tooltip surface itself, and a consumer passing <b> gets it either way.

function TooltipDemo({ side }: { side: "ref" | "mui" }) {
  const { open, close, trigger } = useClickOpen()
  const slotProps = { tooltip: portalTarget("tooltip-open") }
  const title = "Rolled up nightly"
  return side === "ref" ? (
    <RefProviders>
      <Tooltip open={open} onClose={close} title={title} slotProps={slotProps}>
        {trigger("Retention") as never}
      </Tooltip>
    </RefProviders>
  ) : (
    <MuiTooltip open={open} onClose={close} title={title} slotProps={slotProps}>
      {trigger("Retention") as never}
    </MuiTooltip>
  )
}

export const tooltipSection: Section = {
  title: "Tooltip",
  pairs: [
    {
      id: "tooltip-open",
      states: ["open", "anchored"],
      behaviors: ["overlay-matches", "escape-closes"],
      roomBelow: 40,
      ref: <TooltipDemo side="ref" />,
      mui: <TooltipDemo side="mui" />,
    },
  ],
}

// ---- Popover ----
//
// The kit's Popover pins its two origins to bottom-left/top-left and a 150ms transition. The
// origins are DEFAULTS rather than styling and go in defaultProps; the transition is discussed in
// the theme block - it is a component, not a style, and the theme does not carry it.

function PopoverDemo({ side }: { side: "ref" | "mui" }) {
  const { open, anchor, close, trigger } = useClickOpen()
  const slotProps = { paper: portalTarget("popover-open") }
  const body = <div style={{ padding: 12, width: 180 }}>Nine clusters are reporting.</div>
  return side === "ref" ? (
    <RefProviders>
      {trigger("Details")}
      <Popover open={open} anchorEl={anchor.current} onClose={close} slotProps={slotProps}>
        {body}
      </Popover>
    </RefProviders>
  ) : (
    <>
      {trigger("Details")}
      <MuiPopover open={open} anchorEl={anchor.current} onClose={close} slotProps={slotProps}>
        {body}
      </MuiPopover>
    </>
  )
}

export const popoverSection: Section = {
  title: "Popover",
  pairs: [
    {
      id: "popover-open",
      states: ["open", "anchored"],
      behaviors: ["overlay-matches", "escape-closes"],
      roomBelow: 80,
      ref: <PopoverDemo side="ref" />,
      mui: <PopoverDemo side="mui" />,
    },
  ],
}

// ---- Menu ----
//
// The kit's Menu paper carries an even 8px gutter so the item highlight sits inset from the paper
// edge, and its list drops MUI's own 8px block padding - the two together are what make a menu read
// as a card of pills rather than a list with a border. The item highlight is `--color-surface-muted`
// rather than MUI's faint black tint, and the kit's own comment explains why: a black tint is
// invisible on a dark surface.
//
// The kit's MenuItem hardcodes `disableRipple`, which the theme carries as a default.

const items = ["Rename", "Duplicate", "Archive"]

function MenuDemo({ side }: { side: "ref" | "mui" }) {
  const { open, anchor, close, trigger } = useClickOpen()
  const slotProps = { paper: portalTarget("menu-open") }
  return side === "ref" ? (
    <RefProviders>
      {trigger("Actions")}
      <Menu open={open} anchorEl={anchor.current} onClose={close} slotProps={slotProps}>
        {items.map((label, i) => (
          <MenuItem key={label} data-hover-target={i === 0 || undefined}>
            {label}
          </MenuItem>
        ))}
      </Menu>
    </RefProviders>
  ) : (
    <>
      {trigger("Actions")}
      <MuiMenu open={open} anchorEl={anchor.current} onClose={close} slotProps={slotProps}>
        {items.map((label, i) => (
          <MuiMenuItem key={label} data-hover-target={i === 0 || undefined}>
            {label}
          </MuiMenuItem>
        ))}
      </MuiMenu>
    </>
  )
}

export const menuSection: Section = {
  title: "Menu",
  pairs: [
    {
      id: "menu-open",
      states: ["open", "anchored"],
      behaviors: ["overlay-matches", "escape-closes", "item-hover-highlights"],
      roomBelow: 140,
      ref: <MenuDemo side="ref" />,
      mui: <MenuDemo side="mui" />,
    },
  ],
}
