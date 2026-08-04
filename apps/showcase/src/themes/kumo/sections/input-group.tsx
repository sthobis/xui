import MuiOutlinedInput from "@mui/material/OutlinedInput"
import MuiInputAdornment from "@mui/material/InputAdornment"
import { InputGroup } from "@cloudflare/kumo/components/input"
import type { Section } from "../../../gallery/types"

// kumo: InputGroup wraps an Input with addons that sit inside the field's own box - the addon is
// `pointer-events-none flex min-w-0 grow items-center text-kumo-subtle select-none` and the input
// inside is stripped bare (`rounded-none border-0 bg-transparent`), so the box is the group's.
// MUI expresses the same thing as an OutlinedInput with a start/end adornment.

export const inputGroupSection: Section = {
  title: "InputGroup",
  pairs: [
    {
      id: "inputgroup-suffix",
      ref: (
        <InputGroup>
          <InputGroup.Input aria-label="Subdomain" />
          <InputGroup.Addon align="end">.workers.dev</InputGroup.Addon>
        </InputGroup>
      ),
      mui: (
        <MuiOutlinedInput
          slotProps={{ input: { "aria-label": "Subdomain" } }}
          endAdornment={<MuiInputAdornment position="end">.workers.dev</MuiInputAdornment>}
        />
      ),
    },
  ],
}
