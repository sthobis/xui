import MuiButton from "@mui/material/Button"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import type { Section } from "../../../gallery/types"

const s: Array<"default" | "hover" | "focus" | "active"> = ["default", "hover", "focus", "active"]

export const buttonSection: Section = {
  title: "Button",
  pairs: [
    {
      id: "button-contained",
      states: s,
      ref: <Button data-target>Button</Button>,
      mui: <MuiButton data-target variant="contained">Button</MuiButton>,
    },
    {
      id: "button-secondary",
      states: s,
      ref: <Button data-target variant="secondary">Secondary</Button>,
      mui: <MuiButton data-target variant="contained" color="secondary">Secondary</MuiButton>,
    },
    {
      id: "button-destructive",
      states: s,
      ref: <Button data-target variant="destructive">Destructive</Button>,
      mui: <MuiButton data-target variant="contained" color="error">Destructive</MuiButton>,
    },
    {
      id: "button-outline",
      states: s,
      ref: <Button data-target variant="outline">Outline</Button>,
      mui: <MuiButton data-target variant="outlined">Outline</MuiButton>,
    },
    {
      id: "button-ghost",
      states: s,
      ref: <Button data-target variant="ghost">Ghost</Button>,
      mui: <MuiButton data-target variant="text">Ghost</MuiButton>,
    },
    {
      id: "button-link",
      states: s,
      ref: <Button data-target variant="link">Link</Button>,
      mui: <MuiButton data-target variant="link">Link</MuiButton>,
    },
    {
      id: "button-small",
      ref: <Button data-target size="sm">Small</Button>,
      mui: <MuiButton data-target variant="contained" size="small">Small</MuiButton>,
    },
    {
      id: "button-large",
      ref: <Button data-target size="lg">Large</Button>,
      mui: <MuiButton data-target variant="contained" size="large">Large</MuiButton>,
    },
    {
      id: "button-with-icon",
      ref: (
        <Button data-target>
          <Mail /> Email
        </Button>
      ),
      mui: (
        <MuiButton data-target variant="contained" startIcon={<Mail />}>
          Email
        </MuiButton>
      ),
    },
    {
      id: "button-disabled",
      ref: <Button data-target disabled>Disabled</Button>,
      mui: <MuiButton data-target variant="contained" disabled>Disabled</MuiButton>,
    },
    {
      id: "button-outline-disabled",
      ref: <Button data-target variant="outline" disabled>Disabled</Button>,
      mui: <MuiButton data-target variant="outlined" disabled>Disabled</MuiButton>,
    },
  ],
}
