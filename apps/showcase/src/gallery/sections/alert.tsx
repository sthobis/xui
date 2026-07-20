import { CircleAlert, Terminal } from "lucide-react"
import MuiAlert from "@mui/material/Alert"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { Section } from "../types"

const wrapStyle = { width: 320 } as const

// alert.tsx renders AlertTitle/AlertDescription as direct grid children of Alert (sibling
// to the icon), each individually placed by CSS (`*:[svg]:row-span-2`, AlertTitle's own
// `col-start-2`). MUI's Alert always wraps ALL non-icon children in one internal
// `message` slot div (see MuiAlert banner in the theme), so the twin below renders plain
// `data-slot`-tagged divs inside that slot instead - the theme targets those exact
// `data-slot="alert-title"` / `data-slot="alert-description"` selectors to reproduce the
// same font-weight/color split the real component gets from its two separate elements.
export const alertSection: Section = {
  title: "Alert",
  pairs: [
    {
      id: "alert-default",
      shadcn: (
        <Alert style={wrapStyle}>
          <Terminal />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
        </Alert>
      ),
      mui: (
        <MuiAlert icon={<Terminal />} style={wrapStyle}>
          <div data-slot="alert-title">Heads up!</div>
          <div data-slot="alert-description">You can add components to your app using the CLI.</div>
        </MuiAlert>
      ),
    },
    {
      id: "alert-destructive",
      shadcn: (
        <Alert variant="destructive" style={wrapStyle}>
          <CircleAlert />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
        </Alert>
      ),
      mui: (
        <MuiAlert severity="error" icon={<CircleAlert />} style={wrapStyle}>
          <div data-slot="alert-title">Error</div>
          <div data-slot="alert-description">Your session has expired. Please log in again.</div>
        </MuiAlert>
      ),
    },
  ],
}
