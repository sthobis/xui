import { useState } from "react"
import MuiCheckbox from "@mui/material/Checkbox"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import { Checkbox } from "@cloudflare/kumo/components/checkbox"
import type { Section } from "../../../gallery/types"

// Kumo's Checkbox is a 16px rounded box that FILLS with the contrast colour when checked, with a
// bold 12px Phosphor check drawn in the inverse colour on top. Passing `label` wraps it in a
// FieldLabel row; without one it renders the bare control.

const s: Array<"default" | "hover" | "focus"> = ["default", "hover", "focus"]

// A checkbox that STARTS checked and can then be unchecked, on both sides.
//
// Kumo's Checkbox is controlled-only - it takes `checked` and `onCheckedChange` and ships no
// `defaultChecked` - so a bare `checked` prop renders a control that cannot move. MUI's has both,
// and takes `defaultChecked`.
//
// This is safe for the pixel harness and worth stating why, because "make the fixture interactive"
// is exactly the kind of change that quietly moves a capture: the FIRST render is identical either
// way, and no state the harness applies to this pair clicks anything (`default`/`hover`/`focus`;
// only `open`/`anchored` click, and `active` presses - see e2e/lib/states.ts applyState).
function KumoCheckedCheckbox() {
  const [checked, setChecked] = useState(true)
  return (
    <Checkbox
      data-target
      aria-label="Accept"
      checked={checked}
      onCheckedChange={(next: boolean) => setChecked(next)}
    />
  )
}

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
      ref: <KumoCheckedCheckbox />,
      mui: <MuiCheckbox data-target defaultChecked slotProps={{ input: { "aria-label": "Accept" } }} />,
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
