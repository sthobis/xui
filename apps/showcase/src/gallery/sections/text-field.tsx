import type { CSSProperties } from "react"
import MuiTextField from "@mui/material/TextField"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FieldError } from "@/components/ui/field"
import type { Section } from "../types"

// Label-to-control and control-to-helper spacing: neither input.tsx, textarea.tsx, nor
// label.tsx fixes a container gap (that's caller-owned in every real shadcn composition -
// this stack mirrors the common shadcn `flex flex-col gap-2` field idiom). Fixed width so
// both sides' `w-full` control (Input/Textarea) and MUI's `fullWidth` TextField resolve to
// the identical box width.
const stackStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 8, width: 240 }

const withFocus: Array<"default" | "focus"> = ["default", "focus"]

export const textFieldSection: Section = {
  title: "TextField",
  pairs: [
    {
      id: "textfield-basic",
      states: withFocus,
      shadcn: (
        <div style={stackStyle}>
          <Label htmlFor="tf-basic-shadcn">Email</Label>
          <Input data-target id="tf-basic-shadcn" />
        </div>
      ),
      mui: (
        <div style={stackStyle}>
          <MuiTextField fullWidth label="Email" slotProps={{ htmlInput: { "data-target": true } }} />
        </div>
      ),
    },
    {
      id: "textfield-placeholder",
      shadcn: (
        <div style={stackStyle}>
          <Label htmlFor="tf-placeholder-shadcn">Email</Label>
          <Input data-target id="tf-placeholder-shadcn" placeholder="you@example.com" />
        </div>
      ),
      mui: (
        <div style={stackStyle}>
          <MuiTextField
            fullWidth
            label="Email"
            placeholder="you@example.com"
            slotProps={{ htmlInput: { "data-target": true } }}
          />
        </div>
      ),
    },
    {
      id: "textfield-disabled",
      shadcn: (
        <div style={stackStyle}>
          <Label htmlFor="tf-disabled-shadcn">Email</Label>
          <Input data-target id="tf-disabled-shadcn" disabled />
        </div>
      ),
      mui: (
        <div style={stackStyle}>
          <MuiTextField
            fullWidth
            label="Email"
            disabled
            slotProps={{ htmlInput: { "data-target": true } }}
          />
        </div>
      ),
    },
    {
      id: "textfield-error",
      states: withFocus,
      shadcn: (
        <div style={stackStyle}>
          <Label htmlFor="tf-error-shadcn">Email</Label>
          <Input data-target id="tf-error-shadcn" aria-invalid />
          <FieldError>Enter a valid email address.</FieldError>
        </div>
      ),
      mui: (
        <div style={stackStyle}>
          <MuiTextField
            fullWidth
            label="Email"
            error
            helperText="Enter a valid email address."
            slotProps={{ htmlInput: { "data-target": true } }}
          />
        </div>
      ),
    },
    {
      id: "textfield-multiline",
      shadcn: (
        <div style={stackStyle}>
          <Label htmlFor="tf-multiline-shadcn">Bio</Label>
          <Textarea data-target id="tf-multiline-shadcn" placeholder="Tell us about yourself" />
        </div>
      ),
      mui: (
        <div style={stackStyle}>
          <MuiTextField
            fullWidth
            multiline
            label="Bio"
            placeholder="Tell us about yourself"
            slotProps={{ htmlInput: { "data-target": true } }}
          />
        </div>
      ),
    },
    {
      id: "textfield-filled",
      // shadcn flattens all three MUI TextField variants to the same Input box (see
      // packages/xui/src/themes/shadcn.ts MuiFilledInput banner) - the shadcn side is the
      // identical Label+Input twin used by textfield-basic; the mui side is a plain
      // variant="filled" field with no compensating props, so the theme does all the work.
      states: withFocus,
      shadcn: (
        <div style={stackStyle}>
          <Label htmlFor="tf-filled-shadcn">Email</Label>
          <Input data-target id="tf-filled-shadcn" />
        </div>
      ),
      mui: (
        <div style={stackStyle}>
          <MuiTextField
            fullWidth
            variant="filled"
            label="Email"
            slotProps={{ htmlInput: { "data-target": true } }}
          />
        </div>
      ),
    },
    {
      id: "textfield-standard",
      // Same flattening as textfield-filled above, for variant="standard".
      states: withFocus,
      shadcn: (
        <div style={stackStyle}>
          <Label htmlFor="tf-standard-shadcn">Email</Label>
          <Input data-target id="tf-standard-shadcn" />
        </div>
      ),
      mui: (
        <div style={stackStyle}>
          <MuiTextField
            fullWidth
            variant="standard"
            label="Email"
            slotProps={{ htmlInput: { "data-target": true } }}
          />
        </div>
      ),
    },
    {
      id: "textfield-small",
      // shadcn ships one Input size (h-8, no small/default/large ladder like Button) - the
      // shadcn side is identical to textfield-basic; this pair proves MUI's size="small"
      // collapses to the same box rather than MUI's own native smaller-small look.
      shadcn: (
        <div style={stackStyle}>
          <Label htmlFor="tf-small-shadcn">Email</Label>
          <Input data-target id="tf-small-shadcn" />
        </div>
      ),
      mui: (
        <div style={stackStyle}>
          <MuiTextField
            fullWidth
            size="small"
            label="Email"
            slotProps={{ htmlInput: { "data-target": true } }}
          />
        </div>
      ),
    },
  ],
}
