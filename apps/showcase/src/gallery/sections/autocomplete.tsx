import MuiAutocomplete from "@mui/material/Autocomplete"
import MuiTextField from "@mui/material/TextField"
import { Combobox, ComboboxInput } from "@/components/ui/combobox"
import type { Section } from "../types"

const OPTIONS = ["Apple", "Banana", "Cherry"]
const VALUE = "Apple"

// Whole, even pixels so both controls start on the same pixel column - see menu.tsx.
const wrapStyle = { width: 224 } as const

// GOTCHA - `disableClearable` matches shadcn's own default, it is not a theme workaround.
// ComboboxInput takes `showClear={false}` unless asked otherwise, so its addon holds the trigger
// alone. MUI renders a clear indicator whenever a value is present and hides it with `visibility`,
// which still reserves its width - so without this the two addons are different sizes before any
// styling is involved.
//
// `readOnly` likewise mirrors the shadcn side: the pair is comparing a combobox at rest, and a
// typeable MUI input would put a caret in one capture and not the other.
function renderMuiInput(params: Parameters<
  NonNullable<React.ComponentProps<typeof MuiAutocomplete<string, false, true, false>>["renderInput"]>
>[0]) {
  return (
    <MuiTextField
      {...params}
      slotProps={{
        ...params.slotProps,
        htmlInput: { ...params.slotProps.htmlInput, "data-target": true, readOnly: true },
      }}
    />
  )
}

export const autocompleteSection: Section = {
  title: "Autocomplete",
  pairs: [
    {
      id: "autocomplete-closed",
      states: ["default", "focus"],
      shadcn: (
        <div style={wrapStyle}>
          <Combobox items={OPTIONS} value={VALUE}>
            <ComboboxInput data-target readOnly />
          </Combobox>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiAutocomplete
            disableClearable
            options={OPTIONS}
            value={VALUE}
            renderInput={renderMuiInput}
          />
        </div>
      ),
    },
  ],
}
