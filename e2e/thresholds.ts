/**
 * The pass rule for a parity pair.
 *
 * TWO caps, both of which must hold, and NEITHER of them a percentage:
 *   - maxPixels: how many pixels may differ at all.
 *   - maxDelta:  how far off any single channel of any pixel may be.
 *
 * Why not a percentage, which this suite used until now: it divides by the capture's area, so the
 * same defect scores wildly differently depending on which pair it lands in. 47 differing pixels is
 * 0.43% of the tooltip's 196x56 capture and 0.01% of a large cell - so a single threshold is
 * simultaneously too tight for small pairs and far too loose for big ones. Every real bug this suite
 * has missed was missed that way: the pagination line-height bug measured 0.23%, comfortably inside
 * a 0.5% limit, while being 258 wrong pixels.
 *
 * The two caps also answer different questions, which is why both are needed. A count bounds how
 * much of the pair may be wrong; a delta bounds how wrong any of it may be. Geometry that has moved
 * shows up in the count (hundreds of pixels), while a small shape in the wrong place shows up almost
 * entirely in the delta (togglegroup-basic was 9 pixels at delta 235). Either alone would have let
 * one of this session's bugs through.
 */
const DEFAULT_MAX_PIXELS = 64
const DEFAULT_MAX_DELTA = 40

/**
 * Where these two numbers come from, and what they would have caught.
 *
 * They sit just above the measured floor of the current suite. The worst clean rows are
 * tooltip-open:anchored at 59 pixels (a 196x56 capture, each of those pixels off by no more than 2)
 * and buttongroup-basic in dark at a delta of 31 across 4 pixels. Nothing else exceeds 33 pixels or
 * a delta of 30.
 *
 * Checked against every defect this suite has actually found, all of which these caps reject:
 *     pagination-basic     258px Δ245     breadcrumb-basic     283px Δ123
 *     select-open:anchored 268px Δ68      checkbox-with-label  150px Δ238
 *     textfield-multiline   81px Δ153     togglegroup-basic      9px Δ235  (delta arm)
 *     autocomplete-open     16px Δ235     (delta arm)
 * The first five trip the count; the last two are small enough to pass a count and are caught only
 * because the delta arm exists.
 *
 * Tighten these rather than loosen them. If a pair cannot meet them, the answer is a fix or an
 * entry in maxDeltaOverrides with a proof - not a bigger number here. A previous incarnation of this
 * file made the opposite trade twice (a 0.1 pixelmatch threshold that scored a 24%-different grey
 * wash as a perfect match, and a 7% allowance on select-open:anchored that turned out to be a
 * harness bug), and both times the loose number hid a real defect for two suites running.
 */

// Per-pair(+state) pixel-count allowances. Keys are either a bare pair id or "pairId:state".
// Empty on purpose - every pair currently meets the default.
const maxPixelOverrides: Record<string, number> = {}

// A pair listed here is judged ONLY by its largest per-channel difference; its pixel count is
// ignored. Use this - not a bigger count - when a residual is provably a rounding artifact spread
// over a wide area: capping the delta bounds the visible error directly, and unlike a count it does
// not move when a layout change shifts the pair to a different device-pixel offset.
const maxDeltaOverrides: Record<string, number> = {
  // slider-disabled: every value on both sides is byte-identical (rail/range/thumb background,
  // border radius, opacity, and getBoundingClientRect all match exactly; only the DOM shape
  // differs - Radix nests Track > Range where MUI puts rail + track as siblings). The rail's
  // bg-muted is oklch(0.97 0 0) = 244.95/255, and the root's disabled opacity-50 composites it
  // over white to 249.97/255 - a value sitting one hundredth of a level below the 249/250
  // rounding boundary. Skia resolves it to 250 across part of the span and 249 across the rest,
  // so the error is exactly 1/255 across a wide band - invisible, but far more than 64 pixels.
  //
  // This started life as a 0.7% percentage threshold and had to be revisited the moment the
  // gallery gained a sidebar and shifted every cell 50px right: same 1/255 artifact, but the
  // flip point moved and the pixel count jumped 0.56% -> 1.51%. A delta cap is the invariant the
  // proof actually supports. A real style regression moves a channel by far more than 1 (the
  // bugs this suite has caught moved 20-245 levels), so it still trips immediately.
  //
  // NOTE: the original justification for this entry also claimed the flip point depends on the
  // element's absolute device-pixel position, "which the two cells can never share". That part was
  // wrong and was disproved directly - moving one cell by 1, 2, 100 and 272 whole pixels with its
  // neighbour hidden changes nothing at all. The 1/255 rounding boundary is real; the
  // absolute-position explanation for it was not, and it should not be cited elsewhere.
  "slider-disabled": 1,
}

export interface ParityRule {
  maxPixels: number
  maxDelta: number
  /** True when the pair is judged by delta alone (maxDeltaOverrides), so the count is not applied. */
  deltaOnly: boolean
  /** Human-readable form for the report's `rule` column. */
  label: string
}

function scoped<T>(map: Record<string, T>, pairId: string, state?: string): T | undefined {
  if (state) {
    const hit = map[`${pairId}:${state}`]
    if (hit !== undefined) return hit
  }
  return map[pairId]
}

export function ruleFor(pairId: string, state?: string): ParityRule {
  const deltaOverride = scoped(maxDeltaOverrides, pairId, state)
  if (deltaOverride !== undefined) {
    return {
      maxPixels: Number.POSITIVE_INFINITY,
      maxDelta: deltaOverride,
      deltaOnly: true,
      label: `Δ ≤ ${deltaOverride}`,
    }
  }
  const maxPixels = scoped(maxPixelOverrides, pairId, state) ?? DEFAULT_MAX_PIXELS
  return {
    maxPixels,
    maxDelta: DEFAULT_MAX_DELTA,
    deltaOnly: false,
    label: `≤ ${maxPixels}px, Δ ≤ ${DEFAULT_MAX_DELTA}`,
  }
}
