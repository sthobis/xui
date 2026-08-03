import MuiIconButton from "@mui/material/IconButton"
import { Button } from "@/components/ui/button"
import { Ellipsis } from "lucide-react"
import type { Section } from "../types"

export const iconButtonSection: Section = {
  title: "IconButton",
  pairs: [
    {
      id: "iconbutton-default",
      states: ["default", "hover", "active"],
      ref: (
        <Button data-target variant="ghost" size="icon" aria-label="More options">
          <Ellipsis />
        </Button>
      ),
      mui: (
        <MuiIconButton data-target aria-label="More options">
          <Ellipsis />
        </MuiIconButton>
      ),
    },
    {
      id: "iconbutton-small",
      ref: (
        <Button data-target variant="ghost" size="icon-sm" aria-label="More options">
          <Ellipsis />
        </Button>
      ),
      mui: (
        <MuiIconButton data-target size="small" aria-label="More options">
          <Ellipsis />
        </MuiIconButton>
      ),
    },
    {
      id: "iconbutton-large",
      ref: (
        <Button data-target variant="ghost" size="icon-lg" aria-label="More options">
          <Ellipsis />
        </Button>
      ),
      mui: (
        <MuiIconButton data-target size="large" aria-label="More options">
          <Ellipsis />
        </MuiIconButton>
      ),
    },
    {
      id: "iconbutton-disabled",
      ref: (
        <Button data-target variant="ghost" size="icon" disabled aria-label="More options">
          <Ellipsis />
        </Button>
      ),
      mui: (
        <MuiIconButton data-target disabled aria-label="More options">
          <Ellipsis />
        </MuiIconButton>
      ),
    },
  ],
}
