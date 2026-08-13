import MuiLinearProgress from "@mui/material/LinearProgress"
import MuiCircularProgress from "@mui/material/CircularProgress"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import type { Section } from "../../../gallery/types"

const trackWrapStyle = { width: 200 } as const

// shadcn: Loader2Icon (spinner.tsx) is a single SVG <path> arc - center (12,12) r=9,
// stroke-width 2 - in a 24x24 viewBox rendered at size-4 (16px). Its stroke is therefore
// 2/24 = 1/12 of the viewBox extent.
//
// MUI's CircularProgress draws its ring in a fixed 44-unit viewBox whatever `size` is, and the
// theme scales that svg by lucide's 10/12 inset (see the MuiCircularProgress banner). For the
// on-screen stroke to come out at the same 1/12 of the box, thickness must satisfy
// (thickness / 44) * (10 / 12) = 1 / 12, i.e. thickness = 44/10 - independent of `size`, so this
// holds at any spinner size rather than only at 16px.
const SPINNER_SIZE = 16
const SPINNER_THICKNESS = 44 / 10

export const progressSection: Section = {
  title: "Progress",
  pairs: [
    {
      id: "progress-linear",
      ref: (
        <div style={trackWrapStyle}>
          <Progress value={60} />
        </div>
      ),
      mui: (
        <div style={trackWrapStyle}>
          <MuiLinearProgress variant="determinate" value={60} />
        </div>
      ),
    },
    {
      id: "progress-circular",
      behaviors: ["animates"],
      ref: <Spinner />,
      mui: (
        // Indeterminate (the default) so this actually SPINS like shadcn's Spinner. The theme
        // pins MUI's rotate to shadcn's 1s linear and freezes the dash to Loader2Icon's fixed
        // 288deg (80%) sweep, and scales the ring down to lucide's inset diameter.
        <MuiCircularProgress
          size={SPINNER_SIZE}
          thickness={SPINNER_THICKNESS}
          color="inherit" // shadcn: spinner carries no text-color class -> inherits ambient foreground
        />
      ),
    },
  ],
}
