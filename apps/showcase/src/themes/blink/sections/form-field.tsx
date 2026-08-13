import MuiFormControl from "@mui/material/FormControl"
import MuiFormLabel from "@mui/material/FormLabel"
import MuiFormHelperText from "@mui/material/FormHelperText"
import MuiOutlinedInput from "@mui/material/OutlinedInput"
import FormField from "../reference/primitives/FormField"
import Input from "../reference/primitives/Input"
import type { ReactNode } from "react"
import type { Section } from "../../../gallery/types"

// No RefProviders: FormField, Input and Textarea are all plain React.

const Box = ({ children }: { children: ReactNode }) => (
  <div style={{ width: 240 }}>{children}</div>
)

// FormField. The kit's is a flex column - label, control, message - with an 8px gap and nothing
// else. MUI's FormControl is the same idea, so the mapping is direct; what has to be undone is
// everything MUI layers ON a label and a helper text, because the kit layers none of it:
//
//   - MUI turns a FormLabel primary on focus and red on error. The kit's label is one muted grey in
//     every state; only the MESSAGE below changes colour.
//   - MUI gives FormHelperText a 3px top margin (and 14px of side margin in its contained form),
//     which would stack with the column's own gap.
//
// The static FormLabel is the right twin, not InputLabel: MUI's InputLabel is a FLOATING label that
// shrinks into the outline's notch, and the kit ships no such thing anywhere.
//
// SCOPE: the kit's `error` and `helperText` are separate props that render the same slot, and MUI
// has one FormHelperText whose colour follows the control's `error` state - so the pair drives it
// that way, which is the same picture from a different prop shape.

export const formFieldSection: Section = {
  title: "FormField",
  pairs: [
    {
      id: "formfield-helper",
      ref: (
        <Box>
          <FormField label="Cluster name" htmlFor="ff-a" helperText="Lowercase, no spaces.">
            <Input id="ff-a" defaultValue="iad-1" />
          </FormField>
        </Box>
      ),
      mui: (
        <Box>
          <MuiFormControl fullWidth>
            <MuiFormLabel htmlFor="ff-b">Cluster name</MuiFormLabel>
            <MuiOutlinedInput id="ff-b" defaultValue="iad-1" />
            <MuiFormHelperText>Lowercase, no spaces.</MuiFormHelperText>
          </MuiFormControl>
        </Box>
      ),
    },
    {
      // The required asterisk and the error message: two different tokens in one field, and the
      // label deliberately does NOT join in.
      id: "formfield-error",
      ref: (
        <Box>
          <FormField label="Cluster name" htmlFor="ff-c" required error="Already in use.">
            <Input id="ff-c" defaultValue="iad-1" aria-invalid />
          </FormField>
        </Box>
      ),
      mui: (
        <Box>
          <MuiFormControl fullWidth required error>
            <MuiFormLabel htmlFor="ff-d">Cluster name</MuiFormLabel>
            <MuiOutlinedInput id="ff-d" defaultValue="iad-1" />
            <MuiFormHelperText>Already in use.</MuiFormHelperText>
          </MuiFormControl>
        </Box>
      ),
    },
  ],
}

// Textarea. The kit's is the Input's chrome with two changes that matter: the height is content-
// driven rather than fixed, so the padding is VERTICAL as well as horizontal, and the control
// resizes vertically. The theme carries all of that - without it a multiline field under blink is
// broken rather than merely unstyled, because the single-line rules pin a 36px height and give it
// no vertical padding at all.
//
// THESE PAIRS CARRY NO `ref`, and the reason is not the derived tier's. The kit HAS a Textarea; the
// two implementations simply cannot be put on the same pixel, and no theme value changes that:
//
//   MUI has no plain multiline input. `<OutlinedInput multiline rows={3}>` maps `rows` onto
//   `minRows`/`maxRows` and renders a TextareaAutosize, which measures a hidden shadow textarea and
//   writes the result back as an INLINE pixel height. `scrollHeight` is an integer, so one row of
//   the kit's 15px/1.5 type measures 23px and the control comes out at 3 x 23 = 69px. The kit's
//   plain `<textarea rows={3}>` is laid out by the browser at 3 x 22.5 = 67.5px.
//
// An inline style beats every stylesheet, so the theme cannot reach it; the 1.5px lands on the
// control's total height, which makes the two captures different SIZES - the one failure mode the
// harness refuses to absorb into a threshold, and rightly. Verified by forcing `height: auto` on
// MUI's textarea in the browser, which drops it to exactly 67.5.
//
// So these pairs are typed and preflight-covered (they prove the block does not lean on Tailwind's
// reset) and are NOT claimed to match. Everything except that 1.5px does match, and the pairs stay
// here so the block is exercised and visible in the gallery.
export const textareaSection: Section = {
  title: "Textarea",
  pairs: [
    {
      id: "textarea-md",
      mui: (
        <Box>
          <MuiOutlinedInput multiline rows={3} defaultValue="Rolled up nightly." fullWidth />
        </Box>
      ),
    },
    {
      id: "textarea-sm",
      mui: (
        <Box>
          <MuiOutlinedInput
            multiline
            size="small"
            rows={2}
            defaultValue="Rolled up nightly."
            fullWidth
          />
        </Box>
      ),
    },
    {
      id: "textarea-error",
      mui: (
        <Box>
          <MuiOutlinedInput multiline error rows={2} defaultValue="Rolled up nightly." fullWidth />
        </Box>
      ),
    },
  ],
}
