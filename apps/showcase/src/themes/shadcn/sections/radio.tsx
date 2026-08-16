import MuiRadio from "@mui/material/Radio"
import MuiRadioGroup from "@mui/material/RadioGroup"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { PairState, Section } from "../../../gallery/types"

const withHoverFocus: PairState[] = ["default", "hover", "focus"]

// MUI v9's Radio slotProps.input type rejects arbitrary data-* attributes by design (an
// opt-in augmentation point) - unlike TextField's slotProps.htmlInput, which stays on a
// looser, pre-existing prop type. `data-target` is the parity harness's own hover/focus
// marker (see e2e/lib/states.ts), not a real component prop, so it is typed as a plain
// variable (not an inline object literal) to sidestep the excess property check without
// widening to `any`. Mirrors checkbox.tsx's own `dataTargetInput` convention exactly.
const dataTargetInput: { "data-target"?: boolean } = { "data-target": true }

const rowStyle = { display: "flex", alignItems: "center", gap: 8 } as const

// radio-group.tsx's Root always carries "w-full" (not conditional) - inside the gallery's
// centered PairCell, a full-width single-item RadioGroup left-aligns its 16px item at the
// cell's own left edge (a grid item with a definite size start-aligns, it does not stretch),
// while a bare, unwrapped MUI control would instead sit centered in that same cell (no width
// class of its own) - a genuine ~90px positional mismatch, confirmed empirically, not a
// gallery artifact. Constraining BOTH sides' wrapper to the item's own width (1rem, size-4)
// makes "w-full"/MuiFormGroup's matching width:100% resolve to that same 1rem on both sides,
// so the group box and the item box coincide exactly, on both sides, at the same on-screen
// position - used for the three standalone (non-grouped) pairs below.
const singleItemWrapStyle = { width: "1rem" } as const

export const radioSection: Section = {
  title: "Radio",
  pairs: [
    {
      id: "radio-unchecked",
      states: withHoverFocus,
      // `data-target` sits on the RadioGroup ROOT here, not the Item, for both the shadcn and
      // MUI-parity reasons below - see the matching note on the MUI side.
      //
      // GOTCHA: radix RadioGroupItem implements ARIA "roving tabindex" - only the group's own
      // container div carries tabIndex 0; every Item starts at tabIndex -1 (confirmed by
      // reading the compiled @radix-ui/react-roving-focus source) until the user interacts.
      // Tab only reaches an Item by first landing on the container, whose own onFocus handler
      // then redirects real DOM focus onto the appropriate Item. The harness's focusVisible()
      // helper (e2e/lib/states.ts) inserts a helper button immediately BEFORE whatever element
      // carries `data-target`, then Tabs into it - if `data-target` were on the Item (nested
      // inside the container), the helper would end up INSIDE the container, after the
      // container's own tab stop has already been passed in document order, so Tab would skip
      // both the un-tabbable Item and the already-passed container, landing focus outside this
      // component entirely (confirmed empirically). Putting `data-target` on the container
      // itself makes the helper a preceding SIBLING of the container instead, so Tab lands
      // directly on the container - triggering its real focus-redirect onto the Item exactly
      // like a genuine user Tab keypress would.
      ref: (
        <div style={singleItemWrapStyle}>
          <RadioGroup data-target aria-label="Unchecked example">
            <RadioGroupItem value="a" aria-label="Unchecked" />
          </RadioGroup>
        </div>
      ),
      // MUI's RadioGroup is a plain (non-tabbable) wrapper div - it implements no roving
      // tabindex of its own, so the underlying native `<input type="radio">` stays directly
      // Tab-reachable regardless of the group wrapper, same as a bare unwrapped Radio.
      // `data-target` stays on that input via slotProps (mirrors MuiCheckbox exactly).
      //
      // GOTCHA - a valueless MuiRadio inside a valueless MuiRadioGroup renders CHECKED, not
      // unchecked: Radio.js derives `checked = areEqualValues(radioGroup.value, props.value)`
      // whenever it sits inside RadioGroup context. With no `value` prop here and no
      // `defaultValue` on the group, BOTH sides of that comparison are `undefined`, and
      // `areEqualValues` falls back to `String(a) === String(b)` -> `"undefined" ===
      // "undefined"` -> true - a real Mui-checked, filled dot (confirmed by reading the
      // rendered outerHTML: `Mui-checked` class + `checked=""` on the input). Giving the Radio
      // an explicit `value="a"` that the group's `undefined` value can never equal fixes this
      // and stays symmetric with the shadcn side's own value="a" item.
      mui: (
        <div style={singleItemWrapStyle}>
          <MuiRadioGroup aria-label="Unchecked example">
            <MuiRadio value="a" aria-label="Unchecked" slotProps={{ input: dataTargetInput }} />
          </MuiRadioGroup>
        </div>
      ),
    },
    {
      id: "radio-checked",
      states: withHoverFocus,
      ref: (
        <div style={singleItemWrapStyle}>
          <RadioGroup defaultValue="a" data-target aria-label="Checked example">
            <RadioGroupItem value="a" aria-label="Checked" />
          </RadioGroup>
        </div>
      ),
      mui: (
        // A bare `defaultChecked` MuiRadio would be silently forced back to unchecked once
        // wrapped in MuiRadioGroup: Radio.js only respects `checked`/`defaultChecked` when
        // there's no surrounding RadioGroup context - inside one, it derives `checked` itself
        // from `areEqualValues(radioGroup.value, props.value)`, and with no `value` prop that
        // resolves to false regardless of defaultChecked. Using matching group defaultValue +
        // item value (mirroring the shadcn side's own defaultValue/value pairing exactly)
        // sidesteps this entirely.
        <div style={singleItemWrapStyle}>
          <MuiRadioGroup defaultValue="a" aria-label="Checked example">
            <MuiRadio value="a" aria-label="Checked" slotProps={{ input: dataTargetInput }} />
          </MuiRadioGroup>
        </div>
      ),
    },
    {
      id: "radio-disabled",
      ref: (
        <div style={singleItemWrapStyle}>
          <RadioGroup data-target aria-label="Disabled example">
            <RadioGroupItem value="a" disabled aria-label="Disabled" />
          </RadioGroup>
        </div>
      ),
      mui: (
        // Same valueless-vs-valueless "undefined === undefined" checked trap as
        // radio-unchecked above - `value="a"` again keeps this genuinely unchecked.
        <div style={singleItemWrapStyle}>
          <MuiRadioGroup aria-label="Disabled example">
            <MuiRadio value="a" disabled aria-label="Disabled" slotProps={{ input: dataTargetInput }} />
          </MuiRadioGroup>
        </div>
      ),
    },
    {
      id: "radio-group",
      ref: (
        <RadioGroup defaultValue="comfortable" aria-label="Density">
          <div style={rowStyle}>
            <RadioGroupItem data-target value="default" id="radio-group-default-shadcn" />
            <Label htmlFor="radio-group-default-shadcn">Default</Label>
          </div>
          <div style={rowStyle}>
            <RadioGroupItem value="comfortable" id="radio-group-comfortable-shadcn" />
            <Label htmlFor="radio-group-comfortable-shadcn">Comfortable</Label>
          </div>
          <div style={rowStyle}>
            <RadioGroupItem value="compact" id="radio-group-compact-shadcn" />
            <Label htmlFor="radio-group-compact-shadcn">Compact</Label>
          </div>
        </RadioGroup>
      ),
      mui: (
        <MuiRadioGroup defaultValue="comfortable" aria-label="Density">
          <MuiFormControlLabel
            value="default"
            control={<MuiRadio slotProps={{ input: dataTargetInput }} />}
            label="Default"
          />
          <MuiFormControlLabel value="comfortable" control={<MuiRadio />} label="Comfortable" />
          <MuiFormControlLabel value="compact" control={<MuiRadio />} label="Compact" />
        </MuiRadioGroup>
      ),
    },
  ],
}
