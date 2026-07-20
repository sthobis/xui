import MuiLinearProgress from "@mui/material/LinearProgress"
import MuiCircularProgress from "@mui/material/CircularProgress"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import type { Section } from "../types"

const trackWrapStyle = { width: 200 } as const

// shadcn: Loader2Icon (spinner.tsx) is a single SVG <path> arc - center (12,12) r=9,
// stroke-width 2 - in a 24x24 viewBox rendered at size-4 (16px). Its effective on-screen
// stroke width is (2 / 24) * 16px = 4/3 px. MUI's CircularProgress draws its ring in a
// fixed 44-unit viewBox regardless of the `size` prop, so matching that same 2/24 ratio
// at size=16 means `thickness` (MUI's own unit for both radius-inset and strokeWidth,
// see the theme's MuiCircularProgress banner) = (4/3) * 44 / 16 = 11/3.
const SPINNER_SIZE = 16
const SPINNER_THICKNESS = 11 / 3

export const progressSection: Section = {
  title: "Progress",
  pairs: [
    {
      id: "progress-linear",
      shadcn: (
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
      shadcn: <Spinner />,
      mui: (
        // variant="determinate" value={80} freezes as a static 288deg ring (80% of
        // 360deg), matching the sweep of Loader2Icon's fixed arc - see the theme's
        // MuiCircularProgress banner for the full geometric reasoning and the known,
        // unavoidable residual (ring diameter can't be inset to match the icon's margin).
        <MuiCircularProgress
          variant="determinate"
          value={80}
          size={SPINNER_SIZE}
          thickness={SPINNER_THICKNESS}
          color="inherit" // shadcn: spinner carries no text-color class -> inherits ambient foreground
        />
      ),
    },
  ],
}
