import MuiChip from "@mui/material/Chip"
import type { ChipProps } from "@mui/material/Chip"
import Badge from "../reference/primitives/Badge"

// No RefProviders: the kit's Badge is plain React with no MUI underneath.
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
// SCOPE: the kit's `dot` affordance is not paired here - it has no MUI slot at all.
//
// `onDelete` IS paired, and the structural difference is exactly why it needed to be: the kit
// builds its delete control as a <button> where MUI renders a bare svg, so MUI's own 22px filled
// CancelIcon at `margin: 0 5px 0 -6px` reached back over the label once the label's padding moved
// to the root. What the two constructions have in common is the painted box, and that is what the
// pair judges.

const noop = () => {}

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

pairs.push({
  // The kit's `.delete` is a 16px round button holding a 12px `x` at 60% of the badge's own ink,
  // pulled 4px back into the root's padding so a removable badge is no wider than a plain one.
  //
  // Resting state only, and deliberately: the `.delete:hover` tint fires on the BUTTON, and
  // neither side gives the harness a hook to aim at it - the kit spreads rest props onto the badge
  // root, and MUI's delete icon is an internal svg. A `hover` here would hover the chip and prove
  // nothing about the affordance. The resting box is where the whole extraction lives anyway; the
  // tint is one `color-mix` off the same ink.
  id: "badge-delete",
  // Size stated on both sides, per the note above: the kit defaults to `sm` and MUI to `medium`,
  // which is the kit's `md`. An unsized pair here compares a 22px badge with a 28px one.
  ref: (
    <Badge variant="primary" size="sm" onDelete={noop}>
      Staging
    </Badge>
  ),
  mui: <MuiChip label="Staging" color="primary" size="small" onDelete={noop} />,
})

export const badgeSection: Section = {
  title: "Badge",
  pairs,
}
