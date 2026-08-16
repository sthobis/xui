import MuiCheckbox from "@mui/material/Checkbox"
import MuiRadio from "@mui/material/Radio"
import Checkbox from "../reference/primitives/Checkbox"
import Radio from "../reference/primitives/Radio"
import type { Section } from "../../../gallery/types"

// Both kit controls are a NATIVE <input> with `appearance: none`, styled directly - 16x16, no
// wrapper, no icon, no hit padding. MUI builds each as a SwitchBase: a 34x34 ButtonBase span
// holding a hidden input and a 24x24 SVG icon. Nothing about the two constructions matches, so the
// theme has to take MUI's box down to the bare 16x16 square and draw the marks itself.
//
// The marks are pure CSS in the kit and stay pure CSS here:
//   - the checkbox tick is a 4x8 box with only its right and bottom borders, rotated 45deg
//   - the indeterminate bar is an 8x2 rounded rect
//   - the radio's dot is not an element at all: `border-width: 5px` in the brand colour leaves a
//     6px surface-coloured hole in the middle
// The app's own MUI theme reached the same values but kept them in replacement `icon`/`checkedIcon` elements;
// drawing them on a pseudo-element instead keeps the whole treatment inside the theme file, which
// is what lets this file stay copy-pasteable with no JSX in it.
//
// No RefProviders: both primitives are plain React with no MUI underneath.

export const checkboxSection: Section = {
  title: "Checkbox",
  pairs: [
    {
      id: "checkbox-unchecked",
      states: ["default", "hover", "focus"],
      ref: <Checkbox data-target />,
      mui: <MuiCheckbox data-target />,
    },
    {
      id: "checkbox-checked",
      states: ["default", "hover"],
      ref: <Checkbox data-target defaultChecked />,
      mui: <MuiCheckbox data-target defaultChecked />,
    },
    {
      id: "checkbox-indeterminate",
      ref: <Checkbox data-target indeterminate />,
      mui: <MuiCheckbox data-target indeterminate />,
    },
    {
      id: "checkbox-disabled",
      ref: <Checkbox data-target disabled />,
      mui: <MuiCheckbox data-target disabled />,
    },
    {
      id: "checkbox-disabled-checked",
      ref: <Checkbox data-target disabled defaultChecked />,
      mui: <MuiCheckbox data-target disabled defaultChecked />,
    },
  ],
}

export const radioSection: Section = {
  title: "Radio",
  pairs: [
    {
      id: "radio-unchecked",
      states: ["default", "hover", "focus"],
      ref: <Radio data-target name="blink-radio-a" />,
      mui: <MuiRadio data-target name="blink-radio-b" />,
    },
    {
      id: "radio-checked",
      states: ["default", "hover"],
      ref: <Radio data-target name="blink-radio-c" defaultChecked />,
      mui: <MuiRadio data-target name="blink-radio-d" defaultChecked />,
    },
    {
      id: "radio-disabled",
      ref: <Radio data-target name="blink-radio-e" disabled />,
      mui: <MuiRadio data-target name="blink-radio-f" disabled />,
    },
  ],
}
