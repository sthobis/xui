import MuiBreadcrumbs from "@mui/material/Breadcrumbs"
import MuiLink from "@mui/material/Link"
import MuiTypography from "@mui/material/Typography"
import { Breadcrumbs } from "@cloudflare/kumo/components/breadcrumbs"
import type { Section } from "../../../gallery/types"

// kumo: Breadcrumbs is a `flex items-center` row whose size row sets the type and height
// (`text-sm h-10 gap-0.5` / `text-base h-12 gap-1`). A link item is
// `flex shrink-0 items-center gap-1 whitespace-nowrap text-kumo-subtle no-underline`, the current
// page is `font-medium`, and the separator is a hand-rolled 24x24 chevron in text-kumo-inactive -
// NOT the "/" its docs page suggests.
//
// That chevron is reproduced verbatim on the MUI side: a separator is content, and no theme
// override can turn one vector into another.
const Separator = (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M10.75 8.75L14.25 12L10.75 15.25"
    />
  </svg>
)

export const breadcrumbsSection: Section = {
  title: "Breadcrumbs",
  pairs: [
    {
      id: "breadcrumbs-basic",
      ref: (
        <Breadcrumbs>
          <Breadcrumbs.Link href="#">Home</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Link href="#">Docs</Breadcrumbs.Link>
          <Breadcrumbs.Separator />
          <Breadcrumbs.Current>Page</Breadcrumbs.Current>
        </Breadcrumbs>
      ),
      mui: (
        <MuiBreadcrumbs separator={Separator}>
          <MuiLink href="#">Home</MuiLink>
          <MuiLink href="#">Docs</MuiLink>
          <MuiTypography variant="subtitle2">Page</MuiTypography>
        </MuiBreadcrumbs>
      ),
    },
  ],
}
