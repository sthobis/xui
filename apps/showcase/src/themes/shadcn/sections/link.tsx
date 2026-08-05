import MuiLink from "@mui/material/Link"
import type { Section } from "../../../gallery/types"

const withHover: Array<"default" | "hover"> = ["default", "hover"]

// shadcn/ui ships no dedicated Link component. The twin is a plain anchor styled with the
// exact treatment button.tsx's own `variant="link"` already defines and this theme already
// implements: `text-primary underline-offset-4 hover:underline` (see the MuiButton "link"
// variant class citation in packages/xui/src/themes/shadcn.ts). `preventDefault` keeps the
// gallery on-page since these anchors point at `#`.
const linkClassName = "text-primary underline-offset-4 hover:underline"

export const linkSection: Section = {
  title: "Link",
  pairs: [
    {
      id: "link-default",
      states: withHover,
      ref: (
        <a data-target href="#" className={linkClassName} onClick={(e) => e.preventDefault()}>
          Terms of Service
        </a>
      ),
      mui: (
        <MuiLink data-target href="#" underline="hover" onClick={(e) => e.preventDefault()}>
          Terms of Service
        </MuiLink>
      ),
    },
    {
      id: "link-hover",
      states: withHover,
      ref: (
        <a data-target href="#" className={linkClassName} onClick={(e) => e.preventDefault()}>
          Learn more
        </a>
      ),
      mui: (
        <MuiLink data-target href="#" underline="hover" onClick={(e) => e.preventDefault()}>
          Learn more
        </MuiLink>
      ),
    },
  ],
}
