import MuiCheckbox from "@mui/material/Checkbox"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { Section } from "../types"

const withHoverFocus: Array<"default" | "hover" | "focus"> = ["default", "hover", "focus"]

// MUI v9's Checkbox slotProps.input type rejects arbitrary data-* attributes by design (an
// opt-in augmentation point, see @mui/utils/types/DataAttributes.d.ts) - unlike TextField's
// slotProps.htmlInput, which stays on a looser, pre-existing prop type. `data-target` is the
// parity harness's own hover/focus marker (see e2e/lib/states.ts), not a real component prop,
// so it is typed as a plain variable (not an inline object literal) to sidestep the excess
// property check without widening to `any`.
const dataTargetInput: { "data-target"?: boolean } = { "data-target": true }

export const checkboxSection: Section = {
  title: "Checkbox",
  pairs: [
    {
      id: "checkbox-unchecked",
      states: withHoverFocus,
      shadcn: <Checkbox data-target aria-label="Unchecked" />,
      mui: <MuiCheckbox aria-label="Unchecked" slotProps={{ input: dataTargetInput }} />,
    },
    {
      id: "checkbox-checked",
      states: withHoverFocus,
      shadcn: <Checkbox data-target defaultChecked aria-label="Checked" />,
      mui: (
        <MuiCheckbox
          defaultChecked
          aria-label="Checked"
          slotProps={{ input: dataTargetInput }}
        />
      ),
    },
    {
      id: "checkbox-indeterminate",
      shadcn: <Checkbox data-target defaultChecked="indeterminate" aria-label="Indeterminate" />,
      mui: (
        <MuiCheckbox
          indeterminate
          aria-label="Indeterminate"
          slotProps={{ input: dataTargetInput }}
        />
      ),
    },
    {
      id: "checkbox-disabled",
      shadcn: <Checkbox data-target disabled aria-label="Disabled" />,
      mui: <MuiCheckbox disabled aria-label="Disabled" slotProps={{ input: dataTargetInput }} />,
    },
    {
      id: "checkbox-with-label",
      shadcn: (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Checkbox data-target id="checkbox-with-label-shadcn" />
          <Label htmlFor="checkbox-with-label-shadcn">Accept terms and conditions</Label>
        </div>
      ),
      mui: (
        <MuiFormControlLabel
          control={<MuiCheckbox slotProps={{ input: dataTargetInput }} />}
          label="Accept terms and conditions"
        />
      ),
    },
  ],
}
