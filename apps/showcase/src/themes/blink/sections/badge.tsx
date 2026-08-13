import MuiChip from "@mui/material/Chip"
import type { ChipProps } from "@mui/material/Chip"
import Badge from "../reference/primitives/Badge"
import type { Section, Pair } from "../../../gallery/types"

// The kit's Badge is a pill on two independent axes - six colour variants times two emphases
// (`soft`, a 10% tint with the AA text cut; `solid`, the saturated fill with its on-colour) - and
// three sizes. MUI's Chip has the colour axis as `color` and one emphasis axis as `variant`
// (filled/outlined), so:
//
//   kit emphasis | MUI variant   | note
//   ------------ | ------------- | -----------------------------------------------------------
//   soft         | filled        | both are the default, so a bare Badge and a bare Chip agree
//   solid        | solid         | custom variant, declared in the theme's augmentation
//
// MUI's `outlined` is left alone: the kit has no bordered pill, so styling it would be inventing a
// look the design system does not have.
//
// Sizes are three against two, so `xs` is added as a custom size the same way Button's was. Note
// the DEFAULTS do not line up - the kit defaults to `sm` (22px), MUI to `medium` (the kit's 28px
// `md`) - and the theme deliberately does not change that; a theme that silently resized every
// unsized Chip would be surprising. Pairs state their size.
//
// SCOPE: the kit's `dot` and `onDelete` affordances are not paired here. The dot has no MUI slot at
// all, and the kit builds its delete control as a <button> where MUI renders a bare svg - a
// structural difference worth its own pass rather than a footnote in this one.

const VARIANTS = ["default", "primary", "error", "warning", "success", "info"] as const
const EMPHASES = [
  { kit: "soft", mui: "filled" },
  { kit: "solid", mui: "solid" },
] as const

const pairs: Pair[] = []

for (const e of EMPHASES) {
  for (const v of VARIANTS) {
    pairs.push({
      id: `badge-${e.kit}-${v}`,
      ref: (
        <Badge emphasis={e.kit} variant={v} size="sm">
          Staging
        </Badge>
      ),
      mui: (
        <MuiChip
          label="Staging"
          size="small"
          variant={e.mui as ChipProps["variant"]}
          color={v as ChipProps["color"]}
        />
      ),
    })
  }
}

const SIZES = [
  { kit: "xs", mui: "xs" },
  { kit: "sm", mui: "small" },
  { kit: "md", mui: "medium" },
] as const

for (const s of SIZES) {
  pairs.push({
    id: `badge-size-${s.kit}`,
    ref: (
      <Badge variant="primary" size={s.kit}>
        Staging
      </Badge>
    ),
    mui: <MuiChip label="Staging" color="primary" size={s.mui as ChipProps["size"]} />,
  })
}

export const badgeSection: Section = {
  title: "Badge",
  pairs,
}
