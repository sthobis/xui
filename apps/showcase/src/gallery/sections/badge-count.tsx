import MuiBadge from "@mui/material/Badge"
import MuiIconButton from "@mui/material/IconButton"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Section } from "../types"

// PARTLY COMPOSED TWIN, and it is worth being precise about which half is which, because the two
// halves have very different standing.
//
// The PILL is not composed at all. shadcn's Badge (apps/showcase/src/components/ui/badge.tsx) is
// exactly this shape - a small pill holding short text - so every value below is a plain extraction
// from installed source, the same source the MuiChip block already cites:
//     inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden
//     rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap
// with `default` giving bg-primary/text-primary-foreground and `destructive` giving
// bg-destructive/10 text-destructive (dark: /20).
//
// The POSITION is composed, and deliberately is not themed. shadcn ships one anchored badge in the
// whole library - AvatarBadge - and it holds a dot or an icon, never a count, so there is no
// ground truth for where a count pill sits relative to its anchor. Rather than invent one, the
// theme leaves MUI's own placement alone (`top: 0; right: 0` with `translate(50%, -50%)`) and
// restyles only the pill's appearance. The shadcn side below restates that same placement by hand
// so the pair compares the half that HAS ground truth.
//
// This is the opposite call from badge-dot.tsx, where the theme does move the badge - and for the
// same reason: there, AvatarBadge is a real twin sitting flush inside the corner, so the ground
// truth exists and wins. Here it does not exist, so MUI's default stands.
//
// GOTCHA - the earlier note in the theme said shadcn "ships nothing of that shape" and used it to
// justify leaving the count pill unthemed entirely. That conflated the pill with its placement.
// The pill has a direct twin; only the placement does not.
// The ANCHOR is `variant="ghost" size="icon"`, matching what the iconbutton-* pairs establish
// MuiIconButton is themed to. Getting this wrong is not a subtle error and it is worth recording:
// an earlier version used `variant="outline"`, which in light mode differs from ghost only by a
// border and a white fill (277 pixels at Δ26, easy to read as a badge problem) but in dark mode
// also carries `dark:bg-input/30` across the whole 32px square - 2932 pixels. Both numbers came
// from the anchor; the pill under test was already exact.
const wrapStyle = { width: 96 } as const

// MUI wraps a Badge's children in `position: relative; display: inline-flex; vertical-align: middle`.
const anchorStyle = {
  position: "relative" as const,
  display: "inline-flex",
  verticalAlign: "middle",
}

// MUI's anchorOriginTopRight, restated: `top: 0; right: 0; transform: scale(1) translate(50%, -50%)`
// with `transform-origin: 100% 0%`. The scale(1) is MUI's hook for its own enter/exit animation and
// is a no-op at rest; it is written out anyway so the two transform strings are the same shape and a
// browser cannot compose them differently.
const pillPositionStyle = {
  position: "absolute" as const,
  top: 0,
  right: 0,
  transform: "scale(1) translate(50%, -50%)",
  transformOrigin: "100% 0%",
}

export const badgeCountSection: Section = {
  title: "Badge (count)",
  pairs: [
    {
      id: "badgecount-basic",
      shadcn: (
        <div style={wrapStyle}>
          <span style={anchorStyle}>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
            <Badge style={pillPositionStyle}>3</Badge>
          </span>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiBadge badgeContent={3} color="primary">
            <MuiIconButton aria-label="Notifications">
              <Bell />
            </MuiIconButton>
          </MuiBadge>
        </div>
      ),
    },
    {
      // Two characters plus the overflow marker, so the pill has to WIDEN rather than stay at the
      // 20px square a single digit happens to fill. `w-fit` with `px-2` is what does that on the
      // shadcn side; on MUI's, its own `min-width: 20px` has to not interfere.
      //
      // Also the destructive variant, which is the one surprise in badge.tsx: it is a SOFT
      // destructive (`bg-destructive/10 text-destructive`), not the solid red a notification badge
      // usually is. Transcribed as-is - guessing that shadcn "meant" solid red is exactly the kind
      // of reasoning-by-analogy this project bans.
      // This pair does not land at a literal zero, and that was checked rather than waved through.
      // pixelmatch counts 3 differing pixels in light and 7 in dark, against a cap of 64. Reading
      // the raw captures channel by channel, EVERY difference is exactly 1/255 - never 2 - spread
      // over the glyphs, which is the signature of antialiasing rounding rather than a wrong value.
      // The control that settles it: the same measurement on established pairs gives fab-primary
      // 24423 differing channels at Δ35 and avatar-image Δ86, both green for months, while
      // chip-destructive - the same bg-destructive/10 color-mix this pill uses - is a clean zero,
      // which rules the colour out as the source. So this pair is quieter than the suite's own
      // floor. No threshold override is needed and none was added.
      id: "badgecount-max",
      shadcn: (
        <div style={wrapStyle}>
          <span style={anchorStyle}>
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
            <Badge variant="destructive" style={pillPositionStyle}>
              99+
            </Badge>
          </span>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiBadge badgeContent={100} max={99} color="error">
            <MuiIconButton aria-label="Notifications">
              <Bell />
            </MuiIconButton>
          </MuiBadge>
        </div>
      ),
    },
  ],
}
