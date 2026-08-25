import MuiCircularProgress from "@mui/material/CircularProgress"
import MuiIconButton from "@mui/material/IconButton"
import Spinner from "../reference/primitives/Spinner"
import ProgressRing from "../reference/primitives/ProgressRing"
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
      // The kit's smallest step. `thickness` at the call site for the reason the SCOPE note gives -
      // 44 * (2/12), the kit's 2px stroke on a 12px ring expressed in MUI's viewBox.
      id: "spinner-xs",
      ref: <Spinner size="xs" />,
      mui: <MuiCircularProgress size={12} thickness={7.3333} />,
    },
    {
      id: "spinner-lg",
      ref: <Spinner size="lg" />,
      mui: <MuiCircularProgress size={24} />,
    },
  ],
}

// ProgressRing. A SECOND kit primitive reached through the same MUI component - `variant="determinate"`
// is the kit's ring, `variant="indeterminate"` is the Spinner above - and that is exactly why these
// pairs exist. Every Spinner value was originally written unscoped, so it also styled the ring: a
// determinate ring rendered at the Spinner's 20px in the Spinner's ink, 2943 differing pixels at Δ202,
// with nothing in the gallery looking at it.
//
// `size` and `thickness` are stated at the call site for the reason the Spinner's `sm` states its
// own: both are PROPS rather than styles, so defaultProps cannot vary them per variant. 3.52 is the
// kit's `stroke = px * 0.08` in MUI's 44-unit viewBox, which scales with `size` - one number for
// every step, unlike the Spinner's non-proportional ladder.
//
// The centred value the kit draws is passed as an EMPTY child on both sides. It is the kit's own
// documented slot (`children ?? Math.round(value)`), not a workaround, and MUI ships no element for
// it at all - so with it left in, the pair would measure a label MUI structurally cannot have
// instead of measuring the ring the theme actually claims. Emptied, the ring is 19px at Δ1; the
// label alone accounts for the other 386.
export const progressRingSection: Section = {
  title: "ProgressRing",
  pairs: [
    {
      id: "progressring-md",
      ref: <ProgressRing value={70}>{""}</ProgressRing>,
      mui: <MuiCircularProgress variant="determinate" value={70} size={64} thickness={3.52} />,
    },
    {
      id: "progressring-sm",
      ref: (
        <ProgressRing value={70} size="sm">
          {""}
        </ProgressRing>
      ),
      mui: <MuiCircularProgress variant="determinate" value={70} size={48} thickness={3.52} />,
    },
    {
      // The colour axis, which is where the `colorPrimary` scoping earns its keep: the kit's
      // success/warning/error rings ARE MUI's palette colours, so only the default may inherit.
      id: "progressring-error",
      ref: (
        <ProgressRing value={40} size="lg" variant="error">
          {""}
        </ProgressRing>
      ),
      mui: (
        <MuiCircularProgress
          variant="determinate"
          value={40}
          size={80}
          thickness={3.52}
          color="error"
        />
      ),
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
      // `hover` on purpose: a ghost button paints nothing at rest, so its CORNERS do not exist until
      // the 15% fill lands - and the kit's `.sm` uses --radius-2 where .root uses --radius-3. With
      // default alone the pair sat at 0 while carrying an 8px radius against the kit's 6px.
      id: "iconbutton-sm",
      states: ["default", "hover"],
      ref: (
        <RefProviders>
          <Button data-target variant="ghost" size="sm" iconOnly aria-label="Close">
            <XIcon size={16} />
          </Button>
        </RefProviders>
      ),
      mui: (
        <MuiIconButton data-target size="small" aria-label="Close">
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
