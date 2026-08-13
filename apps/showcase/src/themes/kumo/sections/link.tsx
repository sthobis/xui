import MuiLink from "@mui/material/Link"
import { Link } from "@cloudflare/kumo/components/link"
import type { Section } from "../../../gallery/types"

const s: Array<"default" | "hover" | "focus"> = ["default", "hover", "focus"]

export const linkSection: Section = {
  title: "Link",
  pairs: [
    {
      id: "link-inline",
      states: s,
      ref: (
        <Link data-target href="#">
          Default link
        </Link>
      ),
      mui: (
        <MuiLink data-target href="#">
          Default link
        </MuiLink>
      ),
    },
    {
      id: "link-current",
      states: s,
      // kumo: the `current` variant inherits its colour from the surrounding text instead of using
      // the link colour. MUI spells the same thing `color="inherit"`.
      ref: (
        <Link data-target href="#" variant="current">
          Current color link
        </Link>
      ),
      mui: (
        <MuiLink data-target href="#" color="inherit">
          Current color link
        </MuiLink>
      ),
    },
    {
      id: "link-plain",
      states: s,
      // kumo: `plain` drops the underline and fades the colour on hover.
      ref: (
        <Link data-target href="#" variant="plain">
          Plain link
        </Link>
      ),
      mui: (
        <MuiLink data-target href="#" underline="none">
          Plain link
        </MuiLink>
      ),
    },
  ],
}
