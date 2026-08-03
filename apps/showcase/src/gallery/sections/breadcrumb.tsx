import type { MouseEvent } from "react"
import MuiBreadcrumbs from "@mui/material/Breadcrumbs"
import MuiLink from "@mui/material/Link"
import MuiTypography from "@mui/material/Typography"
import { ChevronRight } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { Section } from "../types"

const preventDefault = (e: MouseEvent) => e.preventDefault()

// shadcn's BreadcrumbSeparator renders a lucide ChevronRightIcon sized by the parent's own
// `[&>svg]:size-3.5` rule (breadcrumb.tsx) - 14px, inheriting ambient color (text-muted-foreground,
// from BreadcrumbList's own text-muted-foreground class - no separate color class on the separator
// itself). No `size` prop on lucide's own icon defaults to 24px, so it is restated here.
const separatorIconStyle = { width: "0.875rem", height: "0.875rem" } as const

export const breadcrumbSection: Section = {
  title: "Breadcrumbs",
  pairs: [
    {
      id: "breadcrumb-basic",
      states: ["default", "hover"],
      ref: (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink data-target href="#" onClick={preventDefault}>
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#" onClick={preventDefault}>
                Components
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ),
      mui: (
        <MuiBreadcrumbs
          separator={<ChevronRight aria-hidden style={separatorIconStyle} />}
        >
          <MuiLink
            data-target
            href="#"
            underline="none" // shadcn: no underline class anywhere on BreadcrumbLink
            color="textSecondary" // shadcn: ambient text-muted-foreground (BreadcrumbList), overridden to
            // text-foreground on hover by the theme's MuiLink "textSecondary" variant below
            onClick={preventDefault}
          >
            Home
          </MuiLink>
          <MuiLink
            href="#"
            underline="none"
            color="textSecondary"
            onClick={preventDefault}
          >
            Components
          </MuiLink>
          <MuiTypography
            component="span"
            variant="inherit" // shadcn: BreadcrumbPage's font-normal is already the inherited ambient weight -
            // "inherit" skips Typography's own font styling so it keeps inheriting size/weight/line-height
            // from the Breadcrumbs root's body2 variant above
            color="textPrimary" // shadcn: text-foreground (overrides the ambient text-muted-foreground)
          >
            Breadcrumb
          </MuiTypography>
        </MuiBreadcrumbs>
      ),
    },
  ],
}
