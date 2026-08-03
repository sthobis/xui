import MuiSwitch from "@mui/material/Switch"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import MuiTypography from "@mui/material/Typography"
import { Switch } from "@cloudflare/kumo/components/switch"
import type { Section } from "../../../gallery/types"

// Kumo's Switch is a 36x18 track with an 18px square-ish thumb that slides the full thumb width.
// Both track and thumb use a "squircle" radius - `rounded-[5px]` with a
// `supports-[corner-shape:squircle]` upgrade to a 10px squircle - and the thumb carries a two-layer
// shadow built from the shadow-edge and shadow-drop tokens.
//
// Notably the track and thumb colours are RAW Tailwind palette entries (blue-500, neutral-200...),
// not kumo-* semantic tokens - the one component in Tier 1 that reaches past the token layer.

const s: Array<"default" | "hover" | "focus"> = ["default", "hover", "focus"]

export const switchSection: Section = {
  title: "Switch",
  pairs: [
    {
      id: "switch-unchecked",
      states: s,
      ref: <Switch data-target aria-label="Enable" />,
      mui: <MuiSwitch data-target slotProps={{ input: { "aria-label": "Enable" } }} />,
    },
    {
      id: "switch-checked",
      states: s,
      ref: <Switch data-target aria-label="Enable" checked />,
      mui: <MuiSwitch data-target checked slotProps={{ input: { "aria-label": "Enable" } }} />,
    },
    {
      id: "switch-disabled",
      ref: <Switch data-target aria-label="Enable" disabled />,
      mui: <MuiSwitch data-target disabled slotProps={{ input: { "aria-label": "Enable" } }} />,
    },
    {
      id: "switch-with-label",
      ref: <Switch data-target label="Max bandwidth" />,
      mui: <MuiFormControlLabel data-target control={<MuiSwitch />} label={<MuiTypography variant="subtitle2">Max bandwidth</MuiTypography>} />,
    },
  ],
}
