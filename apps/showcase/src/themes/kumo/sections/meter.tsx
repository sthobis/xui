import MuiLinearProgress from "@mui/material/LinearProgress"
import MuiTypography from "@mui/material/Typography"
import { Meter } from "@cloudflare/kumo/components/meter"
import type { Section } from "../../../gallery/types"

// kumo: Meter is `flex w-full flex-col gap-2` around a label row and a track:
//   label      text-xs text-kumo-subtle
//   track      relative h-2 w-full overflow-hidden rounded-full bg-kumo-fill
//   indicator  absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-kumo-brand via-kumo-brand
//              to-kumo-brand  (three identical stops, so a flat brand fill)
//
// `label` is required and the row always renders, so the pair covers label + track together. It
// runs with `showValue={false}`: the value readout is `text-sm font-medium tabular-nums`, a 13px
// medium that none of Text's own variants produce, so there is no themed MUI variant to pair it
// against and nothing in the theme should invent one.
//
// The wrappers below are plain inline-styled layout, the same composition the shadcn gallery uses
// for its composed twins - a `w-full` bar has no intrinsic width, so both sides are pinned to one.
const WRAP = { width: 240 } as const
const STACK = { display: "flex", flexDirection: "column", gap: 8 } as const

export const meterSection: Section = {
  title: "Meter",
  pairs: [
    {
      id: "meter-basic",
      ref: (
        <div style={WRAP}>
          <Meter label="My meter" value={100} max={5000} showValue={false} />
        </div>
      ),
      mui: (
        <div style={WRAP}>
          <div style={STACK}>
            <MuiTypography variant="caption" color="textSecondary">
              My meter
            </MuiTypography>
            <MuiLinearProgress variant="determinate" value={2} aria-label="My meter" />
          </div>
        </div>
      ),
    },
  ],
}
