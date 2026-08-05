import MuiButtonGroup from "@mui/material/ButtonGroup"
import MuiButton from "@mui/material/Button"
import { Toolbar } from "@cloudflare/kumo/components/toolbar"
import type { Section } from "../../../gallery/types"

// kumo: Toolbar is a joined bar of buttons -
//   root    inline-flex w-fit items-stretch rounded-lg bg-kumo-control shadow-xs ring ring-kumo-line
//   button  relative min-w-0 border-0 bg-transparent shadow-none ring-0 (the ring lives on the bar)
// which is exactly what MUI's ButtonGroup is: one outlined container over borderless children.

export const toolbarSection: Section = {
  title: "Toolbar",
  pairs: [
    {
      id: "toolbar-basic",
      ref: (
        <Toolbar>
          <Toolbar.Button>Copy</Toolbar.Button>
          <Toolbar.Button>Paste</Toolbar.Button>
          <Toolbar.Button>Delete</Toolbar.Button>
        </Toolbar>
      ),
      mui: (
        <MuiButtonGroup>
          <MuiButton>Copy</MuiButton>
          <MuiButton>Paste</MuiButton>
          <MuiButton>Delete</MuiButton>
        </MuiButtonGroup>
      ),
    },
  ],
}
