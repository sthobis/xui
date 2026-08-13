import MuiToggleButton from "@mui/material/ToggleButton"
import MuiToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import ToggleGroup from "../reference/primitives/ToggleGroup"
import type { ReactNode } from "react"
import type { Section } from "../../../gallery/types"

// No RefProviders: the kit's ToggleGroup is plain React, with no MUI underneath.

// Typed as plain `string` rather than left to `as const` inference: the kit's ToggleGroup is
// generic over its value type, and a literal-narrowed options array would force every pair's
// `value` to be the first option.
const options: { value: string; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
]

const noop = () => {}

// The kit's ToggleGroup takes its options as DATA and spreads nothing onto its root, so there is
// nowhere to put `data-target` - the same situation as kumo's Radio.Item. The hover pair therefore
// marks a tight wrapper instead: the harness hovers the marked element's centre, and with an ODD
// number of equal-width options that centre is the middle pill on both sides. Playwright's hover
// accepts a descendant as the hit target, so the pointer really does land on that pill.
const Target = ({ children }: { children: ReactNode }) => (
  <div data-target style={{ display: "inline-block" }}>
    {children}
  </div>
)

// ToggleGroup. The kit's two modes map onto MUI's `exclusive` flag, and they are genuinely
// different shapes rather than two skins - see the theme block for what each one does.
//
// SCOPE, and both of these are structural rather than oversights:
//
//   - FOCUS is unpaired. The kit runs a roving tabindex (only the active pill is in the tab order)
//     and MUI leaves every ToggleButton tabbable, so the two respond differently to the harness's
//     Tab-based focus helper. That is an accessibility-behaviour difference in the kit's favour and
//     not something a theme can express - MUI's ToggleButtonGroup has no roving-tabindex mode.
//   - the SLIDE between selections in single mode is invisible here. The kit animates a `.slider`
//     div's transform; MUI repaints the selected pill. Animations are disabled for determinism, so
//     the harness sees the settled frame either way - which is the frame that matches.
export const toggleGroupSection: Section = {
  title: "ToggleGroup",
  pairs: [
    {
      // Single select: full radius on every pill, no dividers, one white pill.
      id: "toggle-group-single",
      states: ["default", "hover"],
      ref: (
        <Target>
          <ToggleGroup options={options} value="day" onChange={noop} />
        </Target>
      ),
      mui: (
        <Target>
          <MuiToggleButtonGroup exclusive value="day">
            {options.map((o) => (
              <MuiToggleButton key={o.value} value={o.value}>
                {o.label}
              </MuiToggleButton>
            ))}
          </MuiToggleButtonGroup>
        </Target>
      ),
    },
    {
      // Multi select: one continuous strip - outer corners only, a divider between every pair, and
      // the fill on the pill itself.
      id: "toggle-group-multiple",
      ref: (
        <ToggleGroup type="multiple" options={options} value={["week"]} onChange={noop} />
      ),
      mui: (
        <MuiToggleButtonGroup value={["week"]}>
          {options.map((o) => (
            <MuiToggleButton key={o.value} value={o.value}>
              {o.label}
            </MuiToggleButton>
          ))}
        </MuiToggleButtonGroup>
      ),
    },
    {
      // Two adjacent active pills, which is the only way to see the divider: it is the strip's own
      // colour, so it shows only where a white pill meets something that is not white.
      id: "toggle-group-multiple-adjacent",
      ref: (
        <ToggleGroup
          type="multiple"
          options={options}
          value={["day", "week"]}
          onChange={noop}
        />
      ),
      mui: (
        <MuiToggleButtonGroup value={["day", "week"]}>
          {options.map((o) => (
            <MuiToggleButton key={o.value} value={o.value}>
              {o.label}
            </MuiToggleButton>
          ))}
        </MuiToggleButtonGroup>
      ),
    },
    {
      // The two ends of the size ladder. `xs` also tightens the pill gap, and both drop to the
      // smaller corner token.
      id: "toggle-group-xs",
      ref: <ToggleGroup options={options} value="day" size="xs" onChange={noop} />,
      mui: (
        <MuiToggleButtonGroup exclusive value="day" size="xs">
          {options.map((o) => (
            <MuiToggleButton key={o.value} value={o.value}>
              {o.label}
            </MuiToggleButton>
          ))}
        </MuiToggleButtonGroup>
      ),
    },
    {
      id: "toggle-group-large",
      ref: <ToggleGroup options={options} value="day" size="lg" onChange={noop} />,
      mui: (
        <MuiToggleButtonGroup exclusive value="day" size="large">
          {options.map((o) => (
            <MuiToggleButton key={o.value} value={o.value}>
              {o.label}
            </MuiToggleButton>
          ))}
        </MuiToggleButtonGroup>
      ),
    },
    {
      // Disabled dims the whole strip from the root; the active pill keeps its own ink.
      id: "toggle-group-disabled",
      ref: <ToggleGroup options={options} value="day" disabled onChange={noop} />,
      mui: (
        <MuiToggleButtonGroup exclusive value="day" disabled>
          {options.map((o) => (
            <MuiToggleButton key={o.value} value={o.value}>
              {o.label}
            </MuiToggleButton>
          ))}
        </MuiToggleButtonGroup>
      ),
    },
  ],
}
