import MuiRating from "@mui/material/Rating"
import { Star } from "lucide-react"
import type { Section } from "../types"

const VALUE = 3
const MAX = 5

// COMPOSED TWIN - shadcn ships no rating control, so there is nothing to extract. The composition
// below is the obvious one in shadcn's language: lucide's Star at `size-4`, filled stars in
// `text-primary` with `fill-current`, empty ones in `text-muted-foreground`, separated by `gap-0.5`.
// Real utilities, but the arrangement is a decision taken here - read the parity number as "MUI's
// Rating renders this composition exactly".
//
// The MUI side passes lucide's Star through `icon`/`emptyIcon`, which is plain prop use rather than
// a styling workaround: MUI ships its own star path, and no theme override can turn one vector into
// a different one. Matching the glyph is the consumer's call, so the gallery makes it.
//
// SCOPE: read-only display at a whole-number value. Interaction (hover preview, click to set),
// `precision` below 1 and the `size` ladder have no pair and get no treatment.
const wrapStyle = { width: 128 } as const

export const ratingSection: Section = {
  title: "Rating",
  pairs: [
    {
      id: "rating-readonly",
      ref: (
        <div style={wrapStyle}>
          {/* inline-flex, not flex: MUI's Rating is inline-level, and since this twin is composed
              here anyway, matching that is more honest than making the theme force MUI's Rating to
              be block-level - a layout change with no ground truth behind it. */}
          <div className="inline-flex gap-0.5">
            {Array.from({ length: MAX }, (_, i) => (
              <Star
                key={i}
                className={
                  i < VALUE ? "size-4 fill-current text-primary" : "size-4 text-muted-foreground"
                }
              />
            ))}
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiRating
            readOnly
            value={VALUE}
            max={MAX}
            icon={<Star />}
            emptyIcon={<Star />}
          />
        </div>
      ),
    },
  ],
}
