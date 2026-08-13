import MuiTextField from "@mui/material/TextField"
import MuiFormControl from "@mui/material/FormControl"
import MuiFormLabel from "@mui/material/FormLabel"
import MuiOutlinedInput from "@mui/material/OutlinedInput"
import MuiFormHelperText from "@mui/material/FormHelperText"
import { Input, InputArea } from "@cloudflare/kumo/components/input"
import type { Section } from "../../../gallery/types"

// Kumo's Input IS the <input> element - the box, the ring and the padding all sit on it. MUI splits
// the same thing across an OutlinedInput root <div> and the <input> inside it, so the theme puts the
// box on the root and the padding on the input slot.
//
// Passing only `aria-label` keeps Kumo's Input unwrapped: it renders a bare <input>, and only wraps
// itself in a Field once a `label`, `description` or `error` MESSAGE is supplied. Field is a Tier 2
// composition, so these pairs stay on the control itself.

const s: Array<"default" | "hover" | "focus"> = ["default", "hover", "focus"]

export const inputSection: Section = {
  title: "Input",
  pairs: [
    {
      id: "input-basic",
      states: s,
      ref: <Input data-target aria-label="Name" />,
      mui: <MuiTextField data-target slotProps={{ htmlInput: { "aria-label": "Name" } }} />,
    },
    {
      id: "input-placeholder",
      ref: <Input data-target aria-label="Name" placeholder="Enter your name..." />,
      mui: (
        <MuiTextField
          data-target
          placeholder="Enter your name..."
          slotProps={{ htmlInput: { "aria-label": "Name" } }}
        />
      ),
    },
    {
      id: "input-error",
      states: s,
      // kumo: passing an `error` MESSAGE is the only way to get the error ring - `variant="error"`
      // is deprecated in 2.9.0 and logs a warning. Any truthy `error` also wraps the control in a
      // Field, which renders a label row unconditionally, so the pair covers that whole stack.
      //
      // The MUI side is the composed FormControl stack rather than TextField, because Kumo's label
      // sits ABOVE the field while TextField's floats into the outline's notch - a different
      // component, not a different style. FormControl + FormLabel + OutlinedInput + FormHelperText
      // is MUI's own documented way to build a stacked field, and it maps onto Kumo's Field 1:1.
      ref: <Input data-target label="Email" error="Enter a valid email" />,
      mui: (
        <MuiFormControl data-target error>
          <MuiFormLabel>Email</MuiFormLabel>
          <MuiOutlinedInput slotProps={{ input: { "aria-label": "Email" } }} />
          <MuiFormHelperText>Enter a valid email</MuiFormHelperText>
        </MuiFormControl>
      ),
    },
    {
      id: "input-disabled",
      ref: <Input data-target aria-label="Name" disabled />,
      mui: <MuiTextField data-target disabled slotProps={{ htmlInput: { "aria-label": "Name" } }} />,
    },
    // MUI's other two input shells, judged against the SAME Kumo Input. Kumo ships one input, so
    // `variant="standard"` and `variant="filled"` have no look of their own to replicate - the
    // theme normalises both onto Kumo's control, and the only way to prove that worked is to
    // measure them against it. An unthemed shell fails these loudly: standard renders as a bare
    // underline, filled as a grey top-rounded box.
    {
      id: "input-standard",
      states: s,
      ref: <Input data-target aria-label="Name" />,
      mui: (
        <MuiTextField
          data-target
          variant="standard"
          slotProps={{ htmlInput: { "aria-label": "Name" } }}
        />
      ),
    },
    {
      id: "input-filled",
      states: s,
      ref: <Input data-target aria-label="Name" />,
      mui: (
        <MuiTextField
          data-target
          variant="filled"
          slotProps={{ htmlInput: { "aria-label": "Name" } }}
        />
      ),
    },
    {
      id: "inputarea-basic",
      states: s,
      ref: <InputArea data-target aria-label="Notes" />,
      mui: <MuiTextField data-target multiline rows={2} slotProps={{ htmlInput: { "aria-label": "Notes" } }} />,
    },
  ],
}
