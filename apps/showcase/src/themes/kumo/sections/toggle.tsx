import { useState } from "react"
import MuiToggleButton from "@mui/material/ToggleButton"
import MuiToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import { Toolbar } from "@cloudflare/kumo/components/toolbar"
import type { Section } from "../../../gallery/types"

// kumo: Toolbar again - the same bar the ButtonGroup pair is judged against
// (dist/chunks/toolbar-gwd1orc8yl7lzaou.js). MUI splits into ButtonGroup and ToggleButtonGroup what
// Kumo ships as one component, so the SAME reference serves both pairs.
//
// Only the unselected bar is paired. Kumo's Toolbar.Button has no pressed or selected state
// anywhere in the chunk, so a selected segment has no reference to diff against; its look is
// derived in the theme (from `bg-kumo-tint`, Kumo's selected semantic) and shown in the derived
// gallery rather than measured here.

// MUI's ToggleButtonGroup is controlled-only - no `defaultValue` - so without a `value` and an
// `onChange` its segments cannot be pressed at all. The selection starts EMPTY, which is both the
// state the pair is judged in (the unselected bar, per the note above) and the state the group
// renders in today, so holding it here changes nothing about the first paint.
//
// `exclusive`, because Kumo's Toolbar is a single-choice bar; MUI's default is multi-select.
function MuiToggleGroupDemo() {
  const [value, setValue] = useState<string | null>(null)
  return (
    <MuiToggleButtonGroup exclusive value={value} onChange={(_, next: string | null) => setValue(next)}>
      <MuiToggleButton value="left">Left</MuiToggleButton>
      <MuiToggleButton value="center" data-target>
        Center
      </MuiToggleButton>
      <MuiToggleButton value="right">Right</MuiToggleButton>
    </MuiToggleButtonGroup>
  )
}

export const toggleSection: Section = {
  title: "ToggleButton",
  pairs: [
    {
      id: "toggle-group",
      states: ["default", "hover"],
      ref: (
        <Toolbar>
          <Toolbar.Button>Left</Toolbar.Button>
          <Toolbar.Button data-target>Center</Toolbar.Button>
          <Toolbar.Button>Right</Toolbar.Button>
        </Toolbar>
      ),
      mui: <MuiToggleGroupDemo />,
    },
  ],
}
