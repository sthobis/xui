import MuiFilledInput from "@mui/material/FilledInput"
import MuiStandardInput from "@mui/material/Input"
import MuiOutlinedInput from "@mui/material/OutlinedInput"
import Input from "../reference/primitives/Input"
import type { Section, Pair } from "../../../gallery/types"

// The kit's Input is a bordered box: `1px solid var(--color-border-strong)` on a surface fill at
// `--radius-2`, with a borderless <input> inside it. That is MUI's OUTLINED input - and it is also
// MUI's standard and filled inputs, because the design system has ONE field and the theme COLLAPSES
// the other two shapes onto it (see collapsedFieldRoot in the theme). The input-standard and
// input-filled pairs below hold that collapse at zero against this same kit Input.
//
// The two are built differently and that is the interesting part: the kit paints its border on the
// root <div>, while MUI paints it on an absolutely positioned <fieldset> (the notched outline) that
// sits 5px above the root's top edge. Same picture, different construction - the class of
// difference the pixel diff cannot see on its own, which is why the behaviour sweeps run over this
// section too.
//
// Sizes: the kit has sm/md/lg at 32/36/40. MUI's InputBase has only `small` and `medium`, so
// `size="large"` is added through module augmentation in the theme, the same way Button's `xs` is.
//
// No RefProviders here: the kit's Input is plain React with no MUI inside it.

const SIZES = [
  { kit: "sm", mui: "small" },
  { kit: "md", mui: "medium" },
  { kit: "lg", mui: "large" },
] as const

const pairs: Pair[] = SIZES.map(({ kit, mui }) => ({
  id: `input-${kit}`,
  states: kit === "md" ? ["default", "hover", "focus"] : ["default"],
  ref: <Input data-target size={kit} defaultValue="Cluster name" />,
  mui: <MuiOutlinedInput data-target size={mui} defaultValue="Cluster name" />,
}))

pairs.push(
  {
    // The placeholder is its own colour token (`--color-text-muted`), and MUI ships a browser
    // default opacity on ::placeholder that has to be taken back to 1 or the colour is diluted.
    id: "input-placeholder",
    ref: <Input data-target placeholder="Search by name or tag" />,
    mui: <MuiOutlinedInput data-target placeholder="Search by name or tag" />,
  },
  {
    // `.root.error` swaps the border to the error accent, and the focus ring with it - the kit has
    // a second ring token (`--focus-ring-destructive`) at 35% rather than 50%.
    id: "input-error",
    states: ["default", "focus"],
    ref: <Input data-target aria-invalid defaultValue="bad value" />,
    mui: <MuiOutlinedInput data-target error defaultValue="bad value" />,
  },
  {
    // Disabled is the one state that changes the FILL: `--color-surface-muted`, with the text
    // dropping to `--color-text-subtle`.
    id: "input-disabled",
    ref: <Input data-target disabled defaultValue="Read only" />,
    mui: <MuiOutlinedInput data-target disabled defaultValue="Read only" />,
  }
)

pairs.push(
  {
    // THE COLLAPSE, held to pixels: MUI's standard (underlined) input renders the kit's one field.
    // Same ref as input-md; the construction differs (a real border on the root at 12px padding,
    // against the outlined fieldset at 13px) and the picture must not.
    id: "input-standard",
    states: ["default", "focus"],
    ref: <Input data-target defaultValue="Cluster name" />,
    mui: <MuiStandardInput data-target defaultValue="Cluster name" />,
  },
  {
    // ...and MUI's filled input, whose grey wash, top-only corners and underline all go.
    id: "input-filled",
    states: ["default", "focus"],
    ref: <Input data-target defaultValue="Cluster name" />,
    mui: <MuiFilledInput data-target defaultValue="Cluster name" />,
  }
)

export const inputSection: Section = {
  title: "Input",
  pairs,
}
