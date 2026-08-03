import MuiChip from "@mui/material/Chip"
import { Badge } from "@/components/ui/badge"
import type { Section } from "../../../gallery/types"

// badge.tsx's own hover treatment ("[a]:hover:bg-primary/80" etc.) is scoped to the `[a]`
// selector - it only fires when Badge is rendered `asChild` wrapping an anchor (an
// interactive, link-styled badge). Every pair here renders the plain non-interactive
// `<span>` form (no `asChild`, no `onClick`), so that hover rule never matches and no
// "hover" state is exercised - default only, per the component's own ground truth.
export const chipSection: Section = {
  title: "Chip",
  pairs: [
    {
      id: "chip-default",
      ref: <Badge>Badge</Badge>,
      mui: <MuiChip label="Badge" color="primary" />,
    },
    {
      id: "chip-secondary",
      ref: <Badge variant="secondary">Secondary</Badge>,
      mui: <MuiChip label="Secondary" color="secondary" />,
    },
    {
      id: "chip-destructive",
      ref: <Badge variant="destructive">Destructive</Badge>,
      mui: <MuiChip label="Destructive" color="error" />,
    },
    {
      id: "chip-outline",
      ref: <Badge variant="outline">Outline</Badge>,
      mui: <MuiChip label="Outline" variant="outlined" />,
    },
  ],
}
