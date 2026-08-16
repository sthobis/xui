import MuiSwitch from "@mui/material/Switch"
import Switch from "../reference/primitives/Switch"

// No RefProviders: the kit's Switch is plain React with no MUI underneath.
import type { Section } from "../../../gallery/types"

// Like the kit's Checkbox and Radio, its Switch is one native input: 36x20, `appearance: none`,
// with the knob drawn as a ::after that translates 16px when checked. MUI builds a Switch out of
// four nested elements (root > switchBase > thumb, plus a sibling track), so the theme maps the
// kit's two painted shapes onto MUI's `track` and `thumb` slots and takes all of MUI's padding out.
//
// One value in the kit is deliberately NOT a token: the knob is `#fff` with a comment saying it
// must stay a light circle in both schemes, because it sits on both the grey off-track and the
// brand on-track. Transcribed as the literal it is.

export const switchSection: Section = {
  title: "Switch",
  pairs: [
    {
      id: "switch-off",
      states: ["default", "hover", "focus"],
      ref: <Switch data-target />,
      mui: <MuiSwitch data-target />,
    },
    {
      id: "switch-on",
      states: ["default", "hover"],
      ref: <Switch data-target defaultChecked />,
      mui: <MuiSwitch data-target defaultChecked />,
    },
    {
      id: "switch-disabled",
      ref: <Switch data-target disabled />,
      mui: <MuiSwitch data-target disabled />,
    },
    {
      id: "switch-disabled-on",
      ref: <Switch data-target disabled defaultChecked />,
      mui: <MuiSwitch data-target disabled defaultChecked />,
    },
  ],
}
