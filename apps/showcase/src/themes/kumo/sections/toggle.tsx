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
      mui: (
        <MuiToggleButtonGroup>
          <MuiToggleButton value="left">Left</MuiToggleButton>
          <MuiToggleButton value="center" data-target>
            Center
          </MuiToggleButton>
          <MuiToggleButton value="right">Right</MuiToggleButton>
        </MuiToggleButtonGroup>
      ),
    },
  ],
}
