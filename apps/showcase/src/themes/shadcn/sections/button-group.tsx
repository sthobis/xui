import MuiButton from "@mui/material/Button"
import MuiButtonGroup from "@mui/material/ButtonGroup"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import type { Section } from "../../../gallery/types"

export const buttonGroupSection: Section = {
  title: "ButtonGroup",
  pairs: [
    {
      id: "buttongroup-basic",
      ref: (
        <ButtonGroup>
          <Button variant="outline">One</Button>
          <Button variant="outline">Two</Button>
          <Button variant="outline">Three</Button>
        </ButtonGroup>
      ),
      mui: (
        <MuiButtonGroup variant="outlined">
          <MuiButton>One</MuiButton>
          <MuiButton>Two</MuiButton>
          <MuiButton>Three</MuiButton>
        </MuiButtonGroup>
      ),
    },
  ],
}
