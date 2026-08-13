import MuiButton from "@mui/material/Button"
import MuiIconButton from "@mui/material/IconButton"
import { Button } from "@cloudflare/kumo/components/button"
import { PlusIcon } from "@phosphor-icons/react"
import type { Section } from "../../../gallery/types"

// The MUI side uses Kumo's OWN Phosphor icon, not a lucide equivalent: an icon is content, not
// styling, and no theme override can turn one vector into another. Same call the shadcn gallery
// makes for its rating and table-pagination glyphs.

const s: Array<"default" | "hover" | "focus" | "active"> = ["default", "hover", "focus", "active"]

export const buttonSection: Section = {
  title: "Button",
  pairs: [
    {
      id: "button-primary",
      states: s,
      ref: (
        <Button data-target variant="primary">
          Primary
        </Button>
      ),
      mui: (
        <MuiButton data-target variant="contained">
          Primary
        </MuiButton>
      ),
    },
    {
      id: "button-secondary",
      states: s,
      ref: (
        <Button data-target variant="secondary">
          Secondary
        </Button>
      ),
      mui: (
        <MuiButton data-target variant="outlined">
          Secondary
        </MuiButton>
      ),
    },
    {
      id: "button-ghost",
      states: s,
      ref: (
        <Button data-target variant="ghost">
          Ghost
        </Button>
      ),
      mui: (
        <MuiButton data-target variant="text">
          Ghost
        </MuiButton>
      ),
    },
    {
      id: "button-destructive",
      states: s,
      ref: (
        <Button data-target variant="destructive">
          Destructive
        </Button>
      ),
      mui: (
        <MuiButton data-target variant="contained" color="error">
          Destructive
        </MuiButton>
      ),
    },
    {
      id: "button-secondary-destructive",
      states: s,
      ref: (
        <Button data-target variant="secondary-destructive">
          Secondary Destructive
        </Button>
      ),
      mui: (
        <MuiButton data-target variant="outlined" color="error">
          Secondary Destructive
        </MuiButton>
      ),
    },
    {
      id: "button-outline",
      states: s,
      ref: (
        <Button data-target variant="outline">
          Outline
        </Button>
      ),
      mui: (
        <MuiButton data-target variant="outlined" color="inherit">
          Outline
        </MuiButton>
      ),
    },
    {
      id: "button-xs",
      ref: (
        <Button data-target size="xs" variant="secondary">
          Extra Small
        </Button>
      ),
      mui: (
        <MuiButton data-target size="xsmall" variant="outlined">
          Extra Small
        </MuiButton>
      ),
    },
    {
      id: "button-sm",
      ref: (
        <Button data-target size="sm" variant="secondary">
          Small
        </Button>
      ),
      mui: (
        <MuiButton data-target size="small" variant="outlined">
          Small
        </MuiButton>
      ),
    },
    {
      id: "button-lg",
      ref: (
        <Button data-target size="lg" variant="secondary">
          Large
        </Button>
      ),
      mui: (
        <MuiButton data-target size="large" variant="outlined">
          Large
        </MuiButton>
      ),
    },
    {
      id: "button-with-icon",
      ref: (
        <Button data-target variant="secondary" icon={PlusIcon}>
          Create Worker
        </Button>
      ),
      mui: (
        <MuiButton data-target variant="outlined" startIcon={<PlusIcon />}>
          Create Worker
        </MuiButton>
      ),
    },
    {
      id: "button-disabled",
      ref: (
        <Button data-target variant="secondary" disabled>
          Disabled
        </Button>
      ),
      mui: (
        <MuiButton data-target variant="outlined" disabled>
          Disabled
        </MuiButton>
      ),
    },
    {
      id: "iconbutton-square",
      states: s,
      ref: <Button data-target variant="secondary" shape="square" icon={PlusIcon} aria-label="Add" />,
      mui: (
        <MuiIconButton data-target aria-label="Add">
          <PlusIcon />
        </MuiIconButton>
      ),
    },
  ],
}
