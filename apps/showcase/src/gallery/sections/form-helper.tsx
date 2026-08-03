import MuiTextField from "@mui/material/TextField"
import { FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Section } from "../types"

const LABEL = "Email"
const HELP = "We will never share it."
const PROBLEM = "Enter a valid email address."

// Whole, even pixels so both sides start on the same pixel column - see menu.tsx.
const wrapStyle = { width: 240 } as const

// Ground truth is apps/showcase/src/components/ui/field.tsx, which is installed shadcn source - so
// unlike AppBar this is a normal extraction, not a composition.
//   FieldDescription: "text-left text-sm leading-normal font-normal text-muted-foreground"
//   FieldError:       "text-sm font-normal text-destructive"
// Note `leading-normal` (1.5), NOT text-sm's own paired 1.25rem - field.tsx overrides it explicitly,
// so the helper text is looser than a plain text-sm run. Transcribed as written.
//
// The 8px gap between the control and its helper text comes from Field's own `gap-2`. MUI has no gap
// there - it puts a 3px top margin on the helper text instead - and the theme moves that to 8px
// rather than adding a gap to FormControl, which is the same approach the label already uses (see
// MuiInputLabel's marginBottom).
//
// The label side of this is already covered by the textfield pairs; what is new here is
// FormHelperText, in both its normal and error colours.
export const formHelperSection: Section = {
  title: "FormHelperText",
  pairs: [
    {
      id: "formhelper-default",
      ref: (
        <div style={wrapStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Label htmlFor="fh-default">{LABEL}</Label>
            <Input id="fh-default" />
            <FieldDescription>{HELP}</FieldDescription>
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiTextField fullWidth label={LABEL} helperText={HELP} />
        </div>
      ),
    },
    {
      id: "formhelper-error",
      ref: (
        <div style={wrapStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <Label htmlFor="fh-error">{LABEL}</Label>
            <Input id="fh-error" aria-invalid />
            <FieldError>{PROBLEM}</FieldError>
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiTextField fullWidth error label={LABEL} helperText={PROBLEM} />
        </div>
      ),
    },
  ],
}
