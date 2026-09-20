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
// One layout with or without a title: top-aligned, the icon and the actions anchored to the first
// line of text. The kit used to centre the icon on title-less prose, which drifts to the middle of
// the paragraph once the prose wraps - `alert-inline-wrapped` is the pair that holds the new rule.
//
// The icon is ALWAYS caller-supplied in the kit; there is no default mapping. MUI ships Material
// icons instead, so the theme maps each severity to the lucide icon the kit's own showcase pairs
// with it. Both sides here pass the icon explicitly, so the pairs test the box rather than that
// mapping.
//
// Both densities are covered. MUI's Alert has no size prop, so the theme declares one
// (`size="small"` is the kit's `sm`); the `alert-sm*` pairs hold it.
//
// SCOPE: the dismiss button is ref-less. The kit draws its own ghost button around a 14px lucide X;
// MUI draws an IconButton around Material's CloseIcon, and the theme does not remap that icon. What
// those pairs claim is geometric - the button must not make the alert taller - and the behaviour
// sweeps measure that without a reference.

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

pairs.push(
  {
    // Wrapped prose with no title: the icon stays on the first line instead of centring on the block.
    id: "alert-inline-wrapped",
    ref: (
      <div style={{ width: 280 }}>
        <Alert variant="warning" icon={<AlertTriangleIcon />}>
          Three nodes left the cluster in the last hour, and two shards are still unassigned.
        </Alert>
      </div>
    ),
    mui: (
      <div style={{ width: 280 }}>
        <MuiAlert severity="warning" icon={<AlertTriangleIcon />}>
          Three nodes left the cluster in the last hour, and two shards are still unassigned.
        </MuiAlert>
      </div>
    ),
  },
  {
    // Prose mixing text with inline elements must FLOW. The message slot was once a flex column,
    // which put every <b> and <code> on a row of its own; this pair and `alert-titled-mixed` are
    // what fail if it ever becomes one again.
    id: "alert-inline-mixed",
    ref: (
      <div style={{ width: 280 }}>
        <Alert variant="info" icon={<InfoIcon />}>
          Run <code>bin/setup</code> on <b>every node</b> before you restart the cluster.
        </Alert>
      </div>
    ),
    mui: (
      <div style={{ width: 280 }}>
        <MuiAlert severity="info" icon={<InfoIcon />}>
          Run <code>bin/setup</code> on <b>every node</b> before you restart the cluster.
        </MuiAlert>
      </div>
    ),
  },
  {
    id: "alert-titled-mixed",
    ref: (
      <div style={{ width: 280 }}>
        <Alert variant="info" icon={<InfoIcon />} title="Setup required">
          Run <code>bin/setup</code> on <b>every node</b> before you restart the cluster.
        </Alert>
      </div>
    ),
    mui: (
      <div style={{ width: 280 }}>
        <MuiAlert severity="info" icon={<InfoIcon />}>
          <MuiAlertTitle>Setup required</MuiAlertTitle>
          Run <code>bin/setup</code> on <b>every node</b> before you restart the cluster.
        </MuiAlert>
      </div>
    ),
  },
  {
    id: "alert-sm",
    ref: (
      <Alert variant="error" size="sm" icon={<AlertCircleIcon />} title="Cluster status changed">
        Three nodes left the cluster in the last hour.
      </Alert>
    ),
    mui: (
      <MuiAlert severity="error" size="small" icon={<AlertCircleIcon />}>
        <MuiAlertTitle>Cluster status changed</MuiAlertTitle>
        Three nodes left the cluster in the last hour.
      </MuiAlert>
    ),
  },
  {
    id: "alert-sm-inline",
    ref: (
      <Alert variant="info" size="sm" icon={<InfoIcon />}>
        Cluster intelligence is enabled.
      </Alert>
    ),
    mui: (
      <MuiAlert severity="info" size="small" icon={<InfoIcon />}>
        Cluster intelligence is enabled.
      </MuiAlert>
    ),
  },
  {
    id: "alert-close",
    mui: (
      <MuiAlert severity="info" icon={<InfoIcon />} onClose={() => {}}>
        Cluster intelligence is enabled.
      </MuiAlert>
    ),
  },
  {
    id: "alert-sm-close",
    mui: (
      <MuiAlert severity="info" size="small" icon={<InfoIcon />} onClose={() => {}}>
        Cluster intelligence is enabled.
      </MuiAlert>
    ),
  },
)

export const alertSection: Section = {
  title: "Alert",
  pairs,
}
