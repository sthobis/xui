import MuiRadio from "@mui/material/Radio"
import MuiRadioGroup from "@mui/material/RadioGroup"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import { Radio } from "@cloudflare/kumo/components/radio"
import type { Section } from "../../../gallery/types"

// Kumo's Radio is a compound component - Radio.Group wrapping Radio.Item - and its `default`
// appearance is a 16px circle beside a label. (The `card` appearance, a bordered choice card, has
// no MUI counterpart and is out of scope.)
//
// The checked circle FILLS with the contrast colour and draws an 8px dot in the BASE colour on top,
// which is the inverse of MUI's default - a coloured dot on a transparent field.

// STATES: default only. Kumo's Radio.Item destructures the props it knows and spreads nothing, so
// a `data-target` marker never reaches the DOM and the harness has no element to hover or focus.
// The ring, focus and hover recipes are shared verbatim with Checkbox, which does carry the marker
// and exercises all three states.
export const radioSection: Section = {
  title: "Radio",
  pairs: [
    {
      id: "radio-group",
      ref: (
        <Radio.Group defaultValue="one" aria-label="Select option">
          <Radio.Item value="one" label="Option 1" />
          <Radio.Item value="two" label="Option 2" />
        </Radio.Group>
      ),
      mui: (
        <MuiRadioGroup defaultValue="one" aria-label="Select option">
          <MuiFormControlLabel value="one" control={<MuiRadio />} label="Option 1" />
          <MuiFormControlLabel value="two" control={<MuiRadio />} label="Option 2" />
        </MuiRadioGroup>
      ),
    },
    {
      id: "radio-disabled",
      ref: (
        <Radio.Group defaultValue="one" aria-label="Select option">
          <Radio.Item value="one" label="Option 1" disabled />
        </Radio.Group>
      ),
      mui: (
        <MuiRadioGroup defaultValue="one" aria-label="Select option">
          <MuiFormControlLabel value="one" control={<MuiRadio />} label="Option 1" disabled />
        </MuiRadioGroup>
      ),
    },
  ],
}
