import MuiFormLabel from "@mui/material/FormLabel"
import MuiTypography from "@mui/material/Typography"
import { Label } from "@cloudflare/kumo/components/label"
import type { Section } from "../../../gallery/types"

// Kumo's Label is `m-0 text-base font-medium text-kumo-default` plus `inline-flex items-center
// gap-1`. Its `showOptional` flag appends a `font-normal text-kumo-subtle` span reading
// "(optional)" - composed content rather than a style, so the MUI side composes the same span from
// the already-themed Typography scale instead of the theme inventing a slot for it.
//
// The `tooltip` prop is NOT covered: it renders a Tooltip around a ghost icon Button, and Tooltip
// is a portalled Tier 2 component.

export const labelSection: Section = {
  title: "Label",
  pairs: [
    {
      id: "label-default",
      ref: <Label>Default Label</Label>,
      mui: <MuiFormLabel>Default Label</MuiFormLabel>,
    },
    {
      id: "label-optional",
      ref: <Label showOptional>Optional Field</Label>,
      mui: (
        <MuiFormLabel>
          Optional Field
          <MuiTypography component="span" color="textSecondary">
            (optional)
          </MuiTypography>
        </MuiFormLabel>
      ),
    },
  ],
}
