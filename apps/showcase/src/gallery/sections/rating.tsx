import MuiRating from "@mui/material/Rating"
import { Star } from "lucide-react"
import type { Section } from "../types"

const VALUE = 3
const HALF_VALUE = 3.5
const MAX = 5

// A star at a given fill state, in shadcn's language. `full` and `empty` are one glyph; a HALF star
// is a composition, because there is no half-star glyph - it is an empty star with a filled one
// clipped to 50% laid over it, which is also exactly how MUI builds its own decimal ratings.
function fullStar(key: number) {
  return <Star key={key} className="size-4 fill-current text-primary" />
}
function emptyStar(key: number) {
  return <Star key={key} className="size-4 text-muted-foreground" />
}
function halfStar(key: number) {
  return (
    <span key={key} className="relative inline-flex">
      <Star className="size-4 text-muted-foreground" />
      {/* The clip. `overflow-hidden` on a half-width box over the filled star is what MUI's
          decimal mode does too, so the two are the same construction rather than two different
          ways of arriving at a similar picture. */}
      <span className="absolute top-0 left-0 inline-flex w-1/2 overflow-hidden">
        <Star className="size-4 fill-current text-primary" />
      </span>
    </span>
  )
}

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
// SCOPE: read-only display at whole and half values. Interaction (hover preview, click to set) has
// no pair. Neither does the `size` ladder, and that one is a deliberate omission rather than an
// oversight: shadcn ships no rating at all, so there is no ladder to extract - see the theme block,
// which scopes its sizing to MUI's default so the other sizes keep MUI's own geometry instead of
// being silently pinned to it.
const wrapStyle = { width: 128 } as const

export const ratingSection: Section = {
  title: "Rating",
  pairs: [
    {
      id: "rating-readonly",
      shadcn: (
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
    {
      // A half star. MUI needs `precision` to accept a fractional value at all - without it the
      // value rounds and the pair silently compares two whole-star ratings.
      id: "rating-half",
      shadcn: (
        <div style={wrapStyle}>
          <div className="inline-flex gap-0.5">
            {Array.from({ length: MAX }, (_, i) => {
              if (i < Math.floor(HALF_VALUE)) return fullStar(i)
              if (i === Math.floor(HALF_VALUE)) return halfStar(i)
              return emptyStar(i)
            })}
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiRating
            readOnly
            precision={0.5}
            value={HALF_VALUE}
            max={MAX}
            icon={<Star />}
            emptyIcon={<Star />}
          />
        </div>
      ),
    },
  ],
}
