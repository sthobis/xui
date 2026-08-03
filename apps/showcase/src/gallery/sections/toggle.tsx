import MuiToggleButton from "@mui/material/ToggleButton"
import MuiToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Section } from "../types"

const withHoverFocus: Array<"default" | "hover" | "focus"> = ["default", "hover", "focus"]

export const toggleSection: Section = {
  title: "Toggle",
  pairs: [
    {
      id: "toggle-off",
      states: withHoverFocus,
      ref: (
        <Toggle data-target aria-label="Toggle">
          Toggle
        </Toggle>
      ),
      mui: (
        <MuiToggleButton data-target value="toggle" aria-label="Toggle">
          Toggle
        </MuiToggleButton>
      ),
    },
    {
      id: "toggle-on",
      states: withHoverFocus,
      ref: (
        // shadcn's Toggle (radix-ui Toggle.Root) is uncontrolled by default - `defaultPressed`
        // renders it already in the "on" (data-state="on") shape without needing a click, which
        // the harness's default/hover/focus states never trigger anyway (only "open"/"anchored"
        // states click - see e2e/lib/states.ts applyState).
        <Toggle data-target aria-label="Toggle" defaultPressed>
          Toggle
        </Toggle>
      ),
      mui: (
        <MuiToggleButton data-target value="toggle" aria-label="Toggle" selected>
          Toggle
        </MuiToggleButton>
      ),
    },
    {
      id: "togglegroup-basic",
      ref: (
        <ToggleGroup type="single" defaultValue="b">
          <ToggleGroupItem value="a" aria-label="A">
            A
          </ToggleGroupItem>
          <ToggleGroupItem value="b" aria-label="B">
            B
          </ToggleGroupItem>
          <ToggleGroupItem value="c" aria-label="C">
            C
          </ToggleGroupItem>
        </ToggleGroup>
      ),
      mui: (
        <MuiToggleButtonGroup value="b" exclusive>
          <MuiToggleButton value="a" aria-label="A">
            A
          </MuiToggleButton>
          <MuiToggleButton value="b" aria-label="B">
            B
          </MuiToggleButton>
          <MuiToggleButton value="c" aria-label="C">
            C
          </MuiToggleButton>
        </MuiToggleButtonGroup>
      ),
    },
  ],
}
