import MuiDivider from "@mui/material/Divider"
import { Separator } from "@/components/ui/separator"
import type { Section } from "../types"

const horizontalWrapStyle = { width: 200 } as const
const verticalWrapStyle = { height: 40, display: "flex" } as const

export const dividerSection: Section = {
  title: "Divider",
  pairs: [
    {
      id: "divider-horizontal",
      shadcn: (
        <div style={horizontalWrapStyle}>
          <Separator />
        </div>
      ),
      mui: (
        <div style={horizontalWrapStyle}>
          <MuiDivider />
        </div>
      ),
    },
    {
      id: "divider-vertical",
      shadcn: (
        <div style={verticalWrapStyle}>
          <Separator orientation="vertical" />
        </div>
      ),
      mui: (
        <div style={verticalWrapStyle}>
          <MuiDivider orientation="vertical" flexItem />
        </div>
      ),
    },
  ],
}
