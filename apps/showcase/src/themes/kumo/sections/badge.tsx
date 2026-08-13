import MuiChip from "@mui/material/Chip"
import { Badge } from "@cloudflare/kumo/components/badge"
import type { Section } from "../../../gallery/types"

// kumo: Badge is a pill - `rounded-full px-2 py-0.5 text-xs font-medium` - whose variant picks a
// background/text token pair. The colour variants below are the ones its docs demonstrate; the
// semantic ones (error/warning/success/info) reuse the same tint-plus-text pairs the Banner uses.

export const badgeSection: Section = {
  title: "Badge",
  pairs: [
    { id: "badge-blue", ref: <Badge variant="blue">Blue</Badge>, mui: <MuiChip color="blue" label="Blue" /> },
    { id: "badge-green", ref: <Badge variant="green">Green</Badge>, mui: <MuiChip color="green" label="Green" /> },
    { id: "badge-orange", ref: <Badge variant="orange">Orange</Badge>, mui: <MuiChip color="orange" label="Orange" /> },
    { id: "badge-neutral", ref: <Badge variant="neutral">Neutral</Badge>, mui: <MuiChip color="neutral" label="Neutral" /> },
    { id: "badge-red", ref: <Badge variant="red">Red</Badge>, mui: <MuiChip color="red" label="Red" /> },
    {
      id: "badge-outline",
      // kumo: the `outline` variant is the only one with a border rather than a fill
      ref: <Badge variant="outline">Outline</Badge>,
      mui: <MuiChip variant="outlined" label="Outline" />,
    },
  ],
}
