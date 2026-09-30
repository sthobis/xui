import MuiAlert from "@mui/material/Alert"
import MuiAlertTitle from "@mui/material/AlertTitle"
import { AlertCircleIcon, AlertTriangleIcon, CheckCircleIcon, InfoIcon } from "lucide-react"
import Alert from "../reference/primitives/Alert"

// No RefProviders: the kit's Alert is plain React with no MUI underneath.
import type { Section, Pair } from "../../../gallery/types"

// The kit's Alert is a tinted box with a 3px accent bar drawn as an INSET SHADOW rather than a
// border - its own comment explains why: a border would shift the box model, and an inset shadow
// follows the corner radius and keeps the padding symmetric.
//
// One layout whether or not there is a title: the icon (and an action) sits on the FIRST text
// line. The kit used to centre the icon on the box for a title-less alert, which was right for one
// line and wrong for a body that wraps; that is a recorded design change in the snapshot.
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

for (const muiVariant of ["filled", "outlined"] as const) {
  pairs.push({
    // THE COLLAPSE: the kit has one alert box, so Material's filled (inverted solid) and outlined
    // (bordered, transparent) variants must render it too. The severity variants in the theme key
    // on `severity` alone, so they already reach every variant value; these pairs are what prove
    // nothing of Material's own variant styling leaks through underneath them.
    id: `alert-variant-${muiVariant}`,
    ref: (
      <Alert variant="error" icon={<AlertCircleIcon />} title="Cluster status changed">
        Three nodes left the cluster in the last hour.
      </Alert>
    ),
    mui: (
      <MuiAlert severity="error" variant={muiVariant} icon={<AlertCircleIcon />}>
        <MuiAlertTitle>Cluster status changed</MuiAlertTitle>
        Three nodes left the cluster in the last hour.
      </MuiAlert>
    ),
  })
}

pairs.push({
  // The prose-only shape: no title, and the icon still sits on the first line rather than being
  // centred on the box - one layout for both shapes, see the note at the top.
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

pairs.push({
  // The kit's `sm` density, reached through the theme's augmented `size` prop: one step down on
  // gap, padding, radius and type, a 16px icon at a 1px nudge, and a 2px title gap.
  id: "alert-small",
  ref: (
    <Alert variant="warning" size="sm" icon={<AlertTriangleIcon />} title="Key is linked">
      This key is linked to the production cluster.
    </Alert>
  ),
  mui: (
    <MuiAlert severity="warning" size="small" icon={<AlertTriangleIcon />}>
      <MuiAlertTitle>Key is linked</MuiAlertTitle>
      This key is linked to the production cluster.
    </MuiAlert>
  ),
})

export const alertSection: Section = {
  title: "Alert",
  pairs,
}
