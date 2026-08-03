import MuiAvatar from "@mui/material/Avatar"
import MuiBadge from "@mui/material/Badge"
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar"
import type { Section } from "../../../gallery/types"

const INITIALS = "CN"

// Ground truth is apps/showcase/src/components/ui/avatar.tsx's AvatarBadge, which IS installed
// shadcn source - so this is a normal extraction, not a composition like AppBar or Fab:
//     "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full
//      bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none"
// with `group-data-[size=default]/avatar:size-2.5` giving the default a 10px dot.
//
// SCOPE: the DOT variant only, and anchored to an avatar. MUI's Badge also has a count variant - a
// pill holding a number, MUI's `badgeContent` - and shadcn ships nothing of that shape anywhere, so
// it gets no treatment. AvatarBadge can hold an icon but never a count.
//
// Position: AvatarBadge sits bottom-right (`right-0 bottom-0`), where MUI's Badge defaults to
// top-right. The gallery states the anchor explicitly on the MUI side rather than the theme moving
// it, because `anchorOrigin` is a genuine prop choice a consumer makes, not a styling detail - the
// theme has no business overriding where a consumer asked for their badge.
const wrapStyle = { width: 96 } as const

export const badgeDotSection: Section = {
  title: "Badge (dot)",
  pairs: [
    {
      id: "badgedot-avatar",
      ref: (
        <div style={wrapStyle}>
          <Avatar>
            <AvatarFallback>{INITIALS}</AvatarFallback>
            <AvatarBadge />
          </Avatar>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiBadge variant="dot" color="primary" anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
            <MuiAvatar>{INITIALS}</MuiAvatar>
          </MuiBadge>
        </div>
      ),
    },
  ],
}
