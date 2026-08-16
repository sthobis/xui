import MuiCard from "@mui/material/Card"
import MuiCardHeader from "@mui/material/CardHeader"
import MuiCardContent from "@mui/material/CardContent"
import MuiCardActions from "@mui/material/CardActions"
import MuiDivider from "@mui/material/Divider"
import MuiAvatar from "@mui/material/Avatar"
import Card from "../reference/primitives/Card"
import Divider from "../reference/primitives/Divider"
import Avatar from "../reference/primitives/Avatar"

// No RefProviders: Card, Divider and Avatar are all plain React with no MUI underneath.
import type { ReactNode } from "react"
import type { Section } from "../../../gallery/types"

// A fixed-width box around BOTH sides of a pair, so neither component has to take a width prop of
// its own. A Card has no intrinsic width, and giving the MUI side an `sx` to match the reference
// would be the kind of per-pair compensation this gallery is not allowed to use.
const Box = ({ children }: { children: ReactNode }) => (
  <div style={{ width: 320 }}>{children}</div>
)

// Card. The kit's is a flat white box - no shadow, no border - whose header, body and footer each
// own their padding, with two rules that only fire in combination:
//   - `.header + .body` drops the body's top padding to 12px, so a header and body read as one
//     block rather than two stacked ones
//   - `.footer` is the only part with a rule between it and the body
// MUI's CardHeader/CardContent/CardActions map onto those three. MUI's own paddings differ
// everywhere, and CardContent adds a `:last-child { padding-bottom: 24px }` that has to go.
//
// The header's internal structure differs and cannot be matched structurally: the kit nests
// icon + (title, description) inside a `.main` flex row, while MUI has separate `avatar` and
// `content` slots. Both put the same ink in the same places, which is what the pair measures.

export const cardSection: Section = {
  title: "Card",
  pairs: [
    {
      id: "card-body-only",
      ref: (
        <Box>
          <Card>Nine clusters are reporting.</Card>
        </Box>
      ),
      mui: (
        <Box>
          <MuiCard>
            <MuiCardContent>Nine clusters are reporting.</MuiCardContent>
          </MuiCard>
        </Box>
      ),
    },
    {
      // The pair that exercises `.header + .body`.
      id: "card-header-body",
      ref: (
        <Box>
          <Card title="Cluster health" description="Last 24 hours">
            Nine clusters are reporting.
          </Card>
        </Box>
      ),
      mui: (
        <Box>
          <MuiCard>
            <MuiCardHeader title="Cluster health" subheader="Last 24 hours" />
            <MuiCardContent>Nine clusters are reporting.</MuiCardContent>
          </MuiCard>
        </Box>
      ),
    },
    {
      // The footer is the only part of a Card with a rule above it.
      id: "card-footer",
      ref: (
        <Box>
          <Card footer="Updated 2 minutes ago">Nine clusters are reporting.</Card>
        </Box>
      ),
      mui: (
        <Box>
          <MuiCard>
            <MuiCardContent>Nine clusters are reporting.</MuiCardContent>
            <MuiCardActions>Updated 2 minutes ago</MuiCardActions>
          </MuiCard>
        </Box>
      ),
    },
  ],
}

// Divider. A 1px rule in `--color-border-strong`, and a labelled form that draws its two rules as
// ::before/::after either side of the text.
//
// SCOPE: the kit's `subtle` flag (the same rule in the lighter `--color-border` token) and its
// vertical orientation are NOT paired. MUI's Divider has no equivalent of `subtle` - its `light`
// prop is deprecated and computes a different colour entirely - so a pair would have to invent a
// class, and inventing API on the MUI side is what this gallery exists to avoid. The vertical rule
// needs a stretching flex parent to have any height at all, which makes it a layout fixture rather
// than a component test.
export const dividerSection: Section = {
  title: "Divider",
  pairs: [
    {
      id: "divider-horizontal",
      ref: (
        <Box>
          <Divider />
        </Box>
      ),
      mui: (
        <Box>
          <MuiDivider />
        </Box>
      ),
    },
    {
      id: "divider-label",
      ref: (
        <Box>
          <Divider>or</Divider>
        </Box>
      ),
      mui: (
        <Box>
          <MuiDivider>or</MuiDivider>
        </Box>
      ),
    },
  ],
}

// Avatar. A fixed square sized by a `--avatar-size` custom property, defaulting to 32px, in one of
// seven fills.
//
// Shape maps cleanly - the kit's `square` is a `--radius-2` corner, which is MUI's `rounded`, and
// its `circle` is MUI's `circular` - but note the DEFAULTS are opposite: the kit defaults to square
// and MUI to circular, so the theme changes nothing there and callers say which they want.
//
// SCOPE: only the `default` fill is paired. The kit has six more (`plain` for logos, plus five
// semantic tints) and MUI's Avatar has no colour axis at all - `variant` there already means the
// shape - so the rest would need an invented prop. The kit's four sizes are unpaired for the same
// reason: MUI sizes an Avatar through `sx`, not a prop, so there is nothing for a theme to style.
export const avatarSection: Section = {
  title: "Avatar",
  pairs: [
    {
      id: "avatar-square",
      ref: <Avatar variant="default">BB</Avatar>,
      mui: <MuiAvatar variant="rounded">BB</MuiAvatar>,
    },
    {
      id: "avatar-circle",
      ref: (
        <Avatar variant="default" shape="circle">
          BB
        </Avatar>
      ),
      mui: <MuiAvatar variant="circular">BB</MuiAvatar>,
    },
  ],
}
