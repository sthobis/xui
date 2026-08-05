import MuiFab from "@mui/material/Fab"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Section } from "../types"

// COMPOSED TWIN, like AppBar - shadcn ships no floating action button, so there is no component to
// extract from. What it does ship is Button, and a FAB in shadcn's language is that button made
// circular and lifted: `rounded-full`, a size, and a shadow. Every utility below is real, but the
// decision to assemble them into a FAB is taken here, so read the parity number as "MUI's Fab
// renders this composition exactly".
//
// Sizes: MUI's Fab ladder is 40/48/56px. Only the 56px default is covered - `size="small"` and
// `size="medium"` get no treatment because no pair exercises them, and neither does `variant="extended"`.
//
// `relative z-[1050]` is NOT styling and not a theme workaround. MUI's Fab is `position: relative`
// with `z-index: 1050` because a floating action button is meant to float, so it puts itself in its
// own stacking context. A plain Button does not. The twin has to reproduce that or the two sides are
// not the same thing, and the pixel diff had no way to say so: an element in its own stacking
// context can be rasterized on its own compositing layer, whose origin snaps independently of the
// page's, so the soft `shadow-lg` gradient rounds a level differently - uniformly, across the whole
// shadow, at Δ2.
//
// What makes this worth spelling out is that it hid for months. The rounding only disagrees at some
// scroll offsets, so the pair sat at a clean zero until two unrelated rows were added further down
// the gallery, which moved the Fab and turned it red - 7929 pixels in dark - with nothing about the
// Fab or the theme having changed. That reads exactly like a threshold problem and is not one. The
// fix is here, in the twin, and it returns the pair to a true zero rather than widening a cap.
const wrapStyle = { width: 96 } as const
// The extended FAB is a pill with a label, so it needs a wider cell than the circular one.
const extendedWrapStyle = { width: 160 } as const

export const fabSection: Section = {
  title: "Fab",
  pairs: [
    {
      id: "fab-primary",
      states: ["default", "hover"],
      shadcn: (
        <div style={wrapStyle}>
          {/* size-14 is 3.5rem = 56px, MUI's default Fab. shadow-lg is Tailwind's own scale. */}
          <Button data-target size="icon" className="relative z-[1050] size-14 rounded-full shadow-lg" aria-label="Add">
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
    {
      // variant="extended": a pill with the icon and a label side by side. Same composition rule as
      // the circular pair - MUI's geometry, dressed in real shadcn utilities - because there is no
      // shadcn extended FAB to extract from either.
      id: "fab-extended",
      states: ["default", "hover"],
      shadcn: (
        <div style={extendedWrapStyle}>
          <Button
            data-target
            className="relative z-[1050] h-12 gap-2 rounded-full px-4 shadow-lg"
            aria-label="Create"
          >
            <Plus />
            Create
          </Button>
        </div>
      ),
      mui: (
        <div style={extendedWrapStyle}>
          <MuiFab data-target variant="extended" color="primary" aria-label="Create">
            <Plus />
            Create
          </MuiFab>
        </div>
      ),
    },
  ],
}
