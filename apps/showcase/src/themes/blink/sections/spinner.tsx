import MuiCircularProgress from "@mui/material/CircularProgress"
import MuiIconButton from "@mui/material/IconButton"
import Spinner from "../reference/primitives/Spinner"
import Button from "../reference/primitives/Button"
import { RefProviders } from "../Providers"
import { XIcon } from "lucide-react"
import type { Section } from "../../../gallery/types"

// Spinner. The kit's is an SVG with two circles - a 20%-opacity track and a fixed quarter-turn arc
// with a round cap - rotating at 0.8s linear. MUI v9 can render exactly that shape: `enableTrackSlot`
// mounts a real track circle at the same radius and stroke width, and `disableShrink` turns off the
// second animation that would otherwise grow and shrink the arc. Both are theme defaults, so a
// plain `<CircularProgress />` under blink IS the kit's spinner rather than a Material one wearing
// its colours.
//
// The pairs are captured with animations frozen, which is the point of the `animates` behavior
// below: it is the only check that proves the two are still MOVING, and moving is most of what a
// spinner is. The frozen frame proves the geometry.
//
// SCOPE - and the shape of it is worth stating precisely, because it is easy to get wrong: the
// kit's stroke ladder is NOT proportional. It is `px <= 14 ? 2 : px <= 20 ? 2.5 : 3`, which works
// out as 16.7% of the diameter at xs (12px), 15.6% at sm (16px), and 12.5% at both md (20px) and
// lg (24px). MUI's `thickness` is one number against a fixed viewBox, so a theme can only carry
// ONE of those ratios - it carries 12.5%, the one the default size uses and the one two of the four
// sizes share. The other two need it stated at the call site, which is what the `sm` pair below
// does; measured without it, a 16px spinner was 10 pixels out at Δ138.

export const spinnerSection: Section = {
  title: "Spinner",
  pairs: [
    {
      id: "spinner-md",
      behaviors: ["animates"],
      ref: <Spinner size="md" />,
      mui: <MuiCircularProgress />,
    },
    {
      id: "spinner-sm",
      ref: <Spinner size="sm" />,
      // `thickness` alongside `size`, for the reason in the SCOPE note above: the kit's `sm`
      // stroke is 15.6% of the diameter where the theme's default carries 12.5%.
      mui: <MuiCircularProgress size={16} thickness={6.875} />,
    },
    {
      id: "spinner-lg",
      ref: <Spinner size="lg" />,
      mui: <MuiCircularProgress size={24} />,
    },
  ],
}

// IconButton. The kit has no such primitive - it composes one out of Button, and this is the exact
// composition its own call sites use (the Dialog's close button is `variant="ghost" size="sm"
// iconOnly`). So the reference side is that composition and the theme block restates the Button
// rules for a component that does not share its class.
//
// RefProviders wraps each reference cell: the kit's Button is a MUI ButtonBase.
export const iconButtonSection: Section = {
  title: "IconButton",
  pairs: [
    {
      id: "iconbutton-md",
      states: ["default", "hover", "focus"],
      ref: (
        <RefProviders>
          <Button data-target variant="ghost" iconOnly aria-label="Close">
            <XIcon size={16} />
          </Button>
        </RefProviders>
      ),
      mui: (
        <MuiIconButton data-target aria-label="Close">
          <XIcon size={16} />
        </MuiIconButton>
      ),
    },
    {
      id: "iconbutton-sm",
      ref: (
        <RefProviders>
          <Button variant="ghost" size="sm" iconOnly aria-label="Close">
            <XIcon size={16} />
          </Button>
        </RefProviders>
      ),
      mui: (
        <MuiIconButton size="small" aria-label="Close">
          <XIcon size={16} />
        </MuiIconButton>
      ),
    },
    {
      id: "iconbutton-disabled",
      ref: (
        <RefProviders>
          <Button variant="ghost" iconOnly disabled aria-label="Close">
            <XIcon size={16} />
          </Button>
        </RefProviders>
      ),
      mui: (
        <MuiIconButton disabled aria-label="Close">
          <XIcon size={16} />
        </MuiIconButton>
      ),
    },
  ],
}
