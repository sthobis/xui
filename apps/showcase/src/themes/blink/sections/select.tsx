import MuiSelect from "@mui/material/Select"
import Select from "../reference/primitives/Select"
import type { ReactNode } from "react"
import type { Section } from "../../../gallery/types"

// A fixed width around both sides, as the Input section does: neither control has an intrinsic
// width and the option labels must not be what decides it.
const Box = ({ children }: { children: ReactNode }) => (
  <div style={{ width: 200 }}>{children}</div>
)

// No RefProviders: the kit's Select is plain React.

// Select. The important thing about the kit's is what it ISN'T - there is no portalled listbox
// anywhere in it. It is a NATIVE <select> with `appearance: none`, a chevron absolutely positioned
// over its right edge, and a wrapper div carrying the same chrome the kit's Input has. The options
// are drawn by the operating system.
//
// So the MUI twin is `<Select native>`, which renders the same shape: a native select inside an
// OutlinedInput, with an icon on top. Almost all of the chrome therefore comes free from the
// MuiOutlinedInput block that the Input pairs already prove - this pair is what holds the parts
// that are the SELECT's own, and each is a real difference rather than a restatement:
// MUI reserves 32px on the right where the kit reserves 24, and it centres the chevron on the text
// (`top: calc(50% - .5em)`, half a 15px em) rather than on the control (a 16px box, so half of 8).
//
// `data-target` goes on the inner <select> on both sides - `inputProps` is how MUI reaches it -
// because that is the element the kit's own rest-props land on, and the focus-visible helper needs
// something focusable to Tab into.
//
// SCOPE: the kit's `placeholder` prop is unpaired. It renders a hidden disabled <option> and tints
// the control with `.placeholder`; MUI's Select has no placeholder concept for the native case at
// all, so a consumer writes that option themselves and there is nothing for a theme to style. The
// `fullWidth` flag is unpaired for the same reason it is on Input - MUI already has the prop and it
// does the same two things (`display: flex`, `width: 100%`).

const options = (
  <>
    <option value="iad">Washington</option>
    <option value="ord">Chicago</option>
    <option value="sfo">San Francisco</option>
  </>
)

export const selectSection: Section = {
  title: "Select",
  pairs: [
    {
      id: "select-md",
      states: ["default", "hover", "focus"],
      ref: (
        <Box>
          <Select data-target defaultValue="iad">
            {options}
          </Select>
        </Box>
      ),
      mui: (
        <Box>
          <MuiSelect native defaultValue="iad" inputProps={{ "data-target": true }}>
            {options}
          </MuiSelect>
        </Box>
      ),
    },
    {
      id: "select-error",
      states: ["default", "focus"],
      ref: (
        <Box>
          <Select data-target aria-invalid defaultValue="iad">
            {options}
          </Select>
        </Box>
      ),
      mui: (
        <Box>
          <MuiSelect
            native
            error
            defaultValue="iad"
            inputProps={{ "data-target": true }}
          >
            {options}
          </MuiSelect>
        </Box>
      ),
    },
    {
      // Disabled dims the chevron to the subtle token as well as the label - two different tokens,
      // which is exactly the kind of pair that catches a single blanket rule.
      id: "select-disabled",
      ref: (
        <Box>
          <Select disabled defaultValue="iad">
            {options}
          </Select>
        </Box>
      ),
      mui: (
        <Box>
          <MuiSelect native disabled defaultValue="iad">
            {options}
          </MuiSelect>
        </Box>
      ),
    },
    {
      // The size ladder is the Input's and is already proved there; this pair is here because the
      // chevron is centred as a PERCENTAGE of the control, so a height change moves it.
      id: "select-sm",
      ref: (
        <Box>
          <Select size="sm" defaultValue="iad">
            {options}
          </Select>
        </Box>
      ),
      mui: (
        <Box>
          <MuiSelect native size="small" defaultValue="iad">
            {options}
          </MuiSelect>
        </Box>
      ),
    },
  ],
}
