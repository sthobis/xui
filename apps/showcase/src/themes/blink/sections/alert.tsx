import MuiAlert from "@mui/material/Alert"
import MuiAlertTitle from "@mui/material/AlertTitle"
import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, InfoIcon } from "lucide-react"
import Alert from "../reference/primitives/Alert"
import type { Section, Pair } from "../../../gallery/types"

// The kit's Alert is a tinted box with a 3px accent bar drawn as an INSET SHADOW rather than a
// border - its own comment explains why: a border would shift the box model, and an inset shadow
// follows the corner radius and keeps the padding symmetric.
//
// Two layouts, chosen by whether a title is present: `stacked` (title + body, icon anchored to the
// title's first line) and `inline` (prose only, icon centred). MUI has no such flag, but it does
// not need one - `:has(.MuiAlertTitle-root)` asks the same question in CSS.
//
// The icon is ALWAYS caller-supplied in the kit; there is no default mapping. MUI ships Material
// icons instead, so the theme maps each severity to the lucide icon the kit's own showcase pairs
// with it. Both sides here pass the icon explicitly, so the pairs test the box rather than that
// mapping.
//
// SCOPE: only the `md` density is covered. The kit also has `sm` (13px text, tighter padding,
// 6px radius, 15px icon), but MUI's Alert has no size prop at all and inventing one would mean
// augmenting AlertProps and forwarding an unknown attribute to the DOM. The app's own MUI theme made the same
// call.

const VARIANTS = [
  { kit: "error", mui: "error", icon: <AlertCircleIcon /> },
  { kit: "warning", mui: "warning", icon: <AlertTriangleIcon /> },
  { kit: "success", mui: "success", icon: <CheckCircleIcon /> },
  { kit: "info", mui: "info", icon: <InfoIcon /> },
] as const

const pairs: Pair[] = VARIANTS.map((v) => ({
  id: `alert-${v.kit}`,
  ref: (
    <Alert variant={v.kit} icon={v.icon} title="Cluster status changed">
      Three nodes left the cluster in the last hour.
    </Alert>
  ),
  mui: (
    <MuiAlert severity={v.mui} icon={v.icon}>
      <MuiAlertTitle>Cluster status changed</MuiAlertTitle>
      Three nodes left the cluster in the last hour.
    </MuiAlert>
  ),
}))

pairs.push({
  // The prose-only shape: no title, so the icon centres on the single line instead of anchoring to
  // the top. This is the pair that exercises the `:has` rule.
  id: "alert-inline",
  ref: (
    <Alert variant="info" icon={<InfoIcon />}>
      Cluster intelligence is enabled.
    </Alert>
  ),
  mui: (
    <MuiAlert severity="info" icon={<InfoIcon />}>
      Cluster intelligence is enabled.
    </MuiAlert>
  ),
})

export const alertSection: Section = {
  title: "Alert",
  pairs,
}
