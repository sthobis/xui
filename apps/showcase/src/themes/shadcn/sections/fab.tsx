import MuiFab from "@mui/material/Fab"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Section } from "../../../gallery/types"

// COMPOSED TWIN, like AppBar - shadcn ships no floating action button, so there is no component to
// extract from. What it does ship is Button, and a FAB in shadcn's language is that button made
// circular and lifted: `rounded-full`, a size, and a shadow. Every utility below is real, but the
// decision to assemble them into a FAB is taken here, so read the parity number as "MUI's Fab
// renders this composition exactly".
//
// Sizes: MUI's Fab ladder is 40/48/56px. Only the 56px default is covered - `size="small"` and
// `size="medium"` get no treatment because no pair exercises them, and neither does `variant="extended"`.
const wrapStyle = { width: 96 } as const

export const fabSection: Section = {
  title: "Fab",
  pairs: [
    {
      id: "fab-primary",
      states: ["default", "hover"],
      ref: (
        <div style={wrapStyle}>
          {/* size-14 is 3.5rem = 56px, MUI's default Fab. shadow-lg is Tailwind's own scale. */}
          <Button data-target size="icon" className="size-14 rounded-full shadow-lg" aria-label="Add">
            <Plus />
          </Button>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiFab data-target color="primary" aria-label="Add">
            <Plus />
          </MuiFab>
        </div>
      ),
    },
  ],
}
