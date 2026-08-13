import MuiButton from "@mui/material/Button"
import MuiButtonGroup from "@mui/material/ButtonGroup"
import ButtonGroup from "../reference/primitives/ButtonGroup"
import Button from "../reference/primitives/Button"
import { RefProviders } from "../Providers"
import type { Section } from "../../../gallery/types"

// ButtonGroup. The kit's group is a plain flex box that squares the inner corners of its children
// and pulls each subsequent one back by a pixel, so adjacent borders land on the SAME pixel column.
//
// That last detail is the whole point of this pair, and it is the seam construction AGENTS.md
// warns about. MUI builds the seam differently for every variant: `outlined` makes the left
// button's right border TRANSPARENT and overlaps the two, `contained` and `text` inject a divider
// border of their own and do not overlap at all. The kit does neither - both borders stay painted
// and both sit on the overlapped pixel. Two stacked opaque borders of the same colour composite to
// that colour, so the picture is right, and `painted geometry` is what proves the boxes are too.
//
// RefProviders wraps every reference cell: the kit's Button is a MUI ButtonBase.
//
// SCOPE: the vertical orientation is unpaired. The kit's `.group` is horizontal-only - it has no
// vertical mode and no rule for one - so MUI's own vertical geometry is left exactly as it is.
//
// A RESIDUAL that is not a theme difference, recorded so nobody re-chases it: these pairs settle at
// 9 (contained) and 3 (outlined) differing pixels at Δ1, in an 8-device-pixel band over the LAST
// button's two right-hand corners. Every computed style on both sides is identical, both groups sit
// on whole pixels, and their offsets inside their cells match to four decimals. Rendering the KIT's
// own group in BOTH cells still reports exactly 9 pixels at Δ1 - so it is the asymmetric corner (a
// square left edge, a rounded right one) quantising differently at the two cells' device x
// positions, the same class as kumo's `switch-checked`. It needs no threshold override: 9px and Δ1
// clear the default 64px/Δ40 caps by a wide margin.

const labels = ["Day", "Week", "Month"] as const

export const buttonGroupSection: Section = {
  title: "ButtonGroup",
  pairs: [
    {
      // The kit's default Button variant, and the one whose seam MUI would otherwise make
      // transparent. `hover` also covers the z-index lift: the kit raises the hovered segment so
      // its border draws over its neighbour's.
      id: "button-group-secondary",
      states: ["default", "hover"],
      ref: (
        <RefProviders>
          <ButtonGroup>
            {labels.map((label, i) => (
              <Button key={label} variant="secondary" data-target={i === 1 || undefined}>
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </RefProviders>
      ),
      mui: (
        <MuiButtonGroup variant="outlined">
          {labels.map((label, i) => (
            <MuiButton key={label} data-target={i === 1 || undefined}>
              {label}
            </MuiButton>
          ))}
        </MuiButtonGroup>
      ),
    },
    {
      // `contained` is where MUI injects a grey divider and skips the overlap entirely.
      id: "button-group-primary",
      states: ["default", "hover"],
      ref: (
        <RefProviders>
          <ButtonGroup>
            {labels.map((label, i) => (
              <Button key={label} variant="primary" data-target={i === 1 || undefined}>
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </RefProviders>
      ),
      mui: (
        <MuiButtonGroup variant="contained">
          {labels.map((label, i) => (
            <MuiButton key={label} data-target={i === 1 || undefined}>
              {label}
            </MuiButton>
          ))}
        </MuiButtonGroup>
      ),
    },
    {
      // The compact tier, which is also what proves MUI's 40px floor on a grouped button is gone:
      // a `sm` button's own floor is 32.
      id: "button-group-small",
      ref: (
        <RefProviders>
          <ButtonGroup>
            {labels.map((label) => (
              <Button key={label} variant="secondary" size="sm">
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </RefProviders>
      ),
      mui: (
        <MuiButtonGroup variant="outlined" size="small">
          {labels.map((label) => (
            <MuiButton key={label}>{label}</MuiButton>
          ))}
        </MuiButtonGroup>
      ),
    },
  ],
}
