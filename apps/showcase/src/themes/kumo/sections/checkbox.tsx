import MuiCheckbox from "@mui/material/Checkbox"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import { Checkbox } from "@cloudflare/kumo/components/checkbox"
import type { Section } from "../../../gallery/types"

// Kumo's Checkbox is a 16px rounded box that FILLS with the contrast colour when checked, with a
// bold 12px Phosphor check drawn in the inverse colour on top. Passing `label` wraps it in a
// FieldLabel row; without one it renders the bare control.

const s: Array<"default" | "hover" | "focus"> = ["default", "hover", "focus"]

export const checkboxSection: Section = {
  title: "Checkbox",
  pairs: [
    {
      id: "checkbox-unchecked",
      states: s,
      ref: <Checkbox data-target aria-label="Accept" />,
      mui: <MuiCheckbox data-target slotProps={{ input: { "aria-label": "Accept" } }} />,
    },
    {
      id: "checkbox-checked",
      states: s,
      ref: <Checkbox data-target aria-label="Accept" checked />,
      mui: <MuiCheckbox data-target checked slotProps={{ input: { "aria-label": "Accept" } }} />,
    },
    {
      id: "checkbox-indeterminate",
      ref: <Checkbox data-target aria-label="Accept" indeterminate />,
      mui: <MuiCheckbox data-target indeterminate slotProps={{ input: { "aria-label": "Accept" } }} />,
    },
    {
      id: "checkbox-disabled",
      ref: <Checkbox data-target aria-label="Accept" disabled />,
      mui: <MuiCheckbox data-target disabled slotProps={{ input: { "aria-label": "Accept" } }} />,
    },
    {
      id: "checkbox-with-label",
      ref: <Checkbox data-target label="Max bandwidth" />,
      mui: <MuiFormControlLabel data-target control={<MuiCheckbox />} label="Max bandwidth" />,
    },
  ],
}
