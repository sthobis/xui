import MuiSpeedDial from "@mui/material/SpeedDial"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Section } from "../../../gallery/types"

// COMPOSED TWIN - shadcn ships no speed dial, and a closed one is a floating action button, so the
// twin is the same circular lifted Button that fab.tsx composes.
//
// What this pair actually holds is the BOX. Untouched, MUI reserves room above the button for the
// hidden actions, so a closed speed dial measures 96x72 around a 56px button and renders 16px above
// where it was placed - a consumer pinning one to a corner gets it in the wrong corner. The theme
// takes those hidden actions out of flow while closed (see the MuiSpeedDial banner), which is what
// this pair proves, along with the button picking up the themed Fab surface rather than Material's.
//
// SCOPE: closed. Open, the actions are themed FABs in MUI's own arrangement - checked to still lay
// out as MUI intends, since the override applies only while closed - but shadcn has no equivalent
// stack to be faithful to, so their layout, stagger and tooltips are uncovered and untreated.
const wrapStyle = { width: 96 } as const

export const speedDialSection: Section = {
  title: "SpeedDial",
  pairs: [
    {
      id: "speeddial-closed",
      ref: (
        <div style={wrapStyle}>
          <Button size="icon" className="size-14 rounded-full shadow-lg" aria-label="Actions">
            <Plus />
          </Button>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiSpeedDial ariaLabel="Actions" icon={<Plus />} />
        </div>
      ),
    },
  ],
}
