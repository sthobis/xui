import MuiButton from "@mui/material/Button"
import MuiCard from "@mui/material/Card"
import MuiCardActions from "@mui/material/CardActions"
import MuiCardContent from "@mui/material/CardContent"
import MuiCardHeader from "@mui/material/CardHeader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Section } from "../types"

const wrapStyle = { width: 320 } as const
// Both sides render the ambient card body copy as a real `<p>` (matching how card.tsx is
// actually used), inline-reset to margin:0 rather than relying on Tailwind's preflight - the
// shadcn side gets that reset from Tailwind for free, but the MUI twin has no such global
// reset available (see `pnpm verify`'s preflight-independence suite), so the reset is stated
// explicitly here instead of leaking in as an accidental Tailwind dependency.
const pStyle = { margin: 0 } as const

export const cardSection: Section = {
  title: "Card",
  pairs: [
    {
      id: "card-basic",
      shadcn: (
        <Card style={wrapStyle}>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have 3 unread messages.</CardDescription>
          </CardHeader>
          <CardContent>
            <p style={pStyle}>Manage your notification preferences here.</p>
          </CardContent>
          <CardFooter>
            <Button>Mark all as read</Button>
          </CardFooter>
        </Card>
      ),
      mui: (
        <MuiCard style={wrapStyle}>
          <MuiCardHeader title="Notifications" subheader="You have 3 unread messages." />
          <MuiCardContent>
            <p style={pStyle}>Manage your notification preferences here.</p>
          </MuiCardContent>
          <MuiCardActions>
            <MuiButton variant="contained">Mark all as read</MuiButton>
          </MuiCardActions>
        </MuiCard>
      ),
    },
  ],
}
