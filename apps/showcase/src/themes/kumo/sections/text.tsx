import MuiTypography from "@mui/material/Typography"
import { Text } from "@cloudflare/kumo/components/text"
import type { Section } from "../../../gallery/types"

// Kumo's Text takes a `variant` (body / secondary / error / heading1-3 / mono) and, for the four
// "copy" variants only, a `size` (xs / sm / base / lg) and a `bold` flag. MUI expresses the same
// space as one flat list of typography variants, so the mapping is variant+size -> variant.

// Kumo's Text makes `as` REQUIRED for the heading variants - it renders a <span> and expects the
// caller to choose the semantic element. "span" is what it would render anyway, so this states the
// default rather than steering the pair.
const COPY = "The quick brown fox"

export const textSection: Section = {
  title: "Text",
  pairs: [
    {
      id: "text-body",
      ref: <Text>{COPY}</Text>,
      mui: <MuiTypography>{COPY}</MuiTypography>,
    },
    {
      id: "text-sm",
      ref: <Text size="sm">{COPY}</Text>,
      mui: <MuiTypography variant="body2">{COPY}</MuiTypography>,
    },
    {
      id: "text-xs",
      ref: <Text size="xs">{COPY}</Text>,
      mui: <MuiTypography variant="caption">{COPY}</MuiTypography>,
    },
    {
      id: "text-lg",
      ref: <Text size="lg">{COPY}</Text>,
      mui: <MuiTypography variant="subtitle1">{COPY}</MuiTypography>,
    },
    {
      id: "text-bold",
      ref: <Text bold>{COPY}</Text>,
      mui: <MuiTypography variant="subtitle2">{COPY}</MuiTypography>,
    },
    {
      id: "text-secondary",
      ref: <Text variant="secondary">{COPY}</Text>,
      mui: <MuiTypography color="textSecondary">{COPY}</MuiTypography>,
    },
    {
      id: "text-error",
      ref: <Text variant="error">{COPY}</Text>,
      mui: <MuiTypography color="error">{COPY}</MuiTypography>,
    },
    {
      id: "text-heading3",
      ref: <Text variant="heading3" as="span">Subsection</Text>,
      mui: <MuiTypography variant="h6">Subsection</MuiTypography>,
    },
    {
      id: "text-heading2",
      ref: <Text variant="heading2" as="span">Section</Text>,
      mui: <MuiTypography variant="h5">Section</MuiTypography>,
    },
    {
      id: "text-heading1",
      ref: <Text variant="heading1" as="span">Page Title</Text>,
      mui: <MuiTypography variant="h4">Page Title</MuiTypography>,
    },
  ],
}
