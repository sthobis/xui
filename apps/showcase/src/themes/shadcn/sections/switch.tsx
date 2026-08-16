import MuiSwitch from "@mui/material/Switch"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { PairState, Section } from "../../../gallery/types"

const withHoverFocus: PairState[] = ["default", "hover", "focus"]

// switch.tsx's SwitchPrimitive.Root renders a real `<button role="switch">` as its own root
// node (confirmed by reading @radix-ui/react-switch's compiled source: Switch.jsx renders a
// SwitchTrigger which is a plain Primitive.button) - unlike Checkbox/Radio's SwitchBase-family
// MUI twins, which hide their real input behind an absolutely-positioned opacity:0 native
// `<input>`. So on the shadcn side `data-target` sits directly on the Switch root (mirrors
// RadioGroupItem's own root-is-the-control situation). On the MUI side, MuiSwitch is still
// SwitchBase-family under the hood - same nested opacity:0 `<input type="checkbox">` as
// Checkbox/Radio - so `data-target` goes on that internal input via slotProps, exactly like
// MuiCheckbox/MuiRadio above.
const dataTargetInput: { "data-target"?: boolean } = { "data-target": true }

export const switchSection: Section = {
  title: "Switch",
  pairs: [
    {
      id: "switch-off",
      states: withHoverFocus,
      ref: <Switch data-target aria-label="Off" />,
      mui: <MuiSwitch aria-label="Off" slotProps={{ input: dataTargetInput }} />,
    },
    {
      id: "switch-on",
      states: withHoverFocus,
      ref: <Switch data-target defaultChecked aria-label="On" />,
      mui: <MuiSwitch defaultChecked aria-label="On" slotProps={{ input: dataTargetInput }} />,
    },
    {
      id: "switch-disabled",
      ref: <Switch data-target disabled aria-label="Disabled" />,
      mui: <MuiSwitch disabled aria-label="Disabled" slotProps={{ input: dataTargetInput }} />,
    },
    {
      id: "switch-with-label",
      ref: (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Switch data-target id="switch-with-label-shadcn" />
          <Label htmlFor="switch-with-label-shadcn">Airplane Mode</Label>
        </div>
      ),
      mui: (
        <MuiFormControlLabel
          control={<MuiSwitch slotProps={{ input: dataTargetInput }} />}
          label="Airplane Mode"
        />
      ),
    },
  ],
}
