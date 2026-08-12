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

// THE TWO CAPS OVERRIDE INDEPENDENTLY. A pair that needs more room on one axis keeps the default on
// the other, so an exception never silently widens both. Keys are either a bare pair id or
// "pairId:state".

// Per-pair(+state) pixel-count allowances.
const maxPixelOverrides: Record<string, number> = {
  // slider-disabled: judged on channel error alone, so its count is unbounded - see the note in
  // maxDeltaOverrides below. The artifact is a 1/255 rail rounding step spread over more than a
  // thousand pixels, which is exactly the shape a count cannot describe.
  "slider-disabled": Number.POSITIVE_INFINITY,

  // fab-primary: same shape of artifact as slider-disabled, in a soft shadow rather than a rail, so
  // the count is again the wrong invariant - see the proof in maxDeltaOverrides below.
  "fab-primary": Number.POSITIVE_INFINITY,
}

// Per-pair(+state) channel-error allowances. Use this when a residual is provably NOT misplaced
// geometry - prove the boxes, colours and fonts match first, and record the proof here.
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

  // stepper-horizontal: MUI draws a step's counter as an SVG - a <circle> plus a <text> centred with
  // `dominant-baseline: central` - while the composed twin uses ordinary HTML text centred in a flex
  // box. Everything measurable about them matches: both counters are 24px at the same relative
  // offsets (384px apart on both sides, to the pixel), same background, same fill, same 12px Geist
  // at weight 400. What differs is where the two text engines land the glyph inside that box, and
  // only for the two INACTIVE digits - the active one, white on a filled circle, matches exactly.
  //
  // Nudging it was tried and every direction was worse: `dominant-baseline: middle` took it from 26
  // pixels to 186, and translating the text by ±0.5px or +0.25px to 109-113. 26 is the floor.
  //
  // The count cap is deliberately left at the default, so this allows a slightly wrong-looking glyph
  // edge but still fails the moment anything MOVES.
  "stepper-horizontal": 60,

  // fab-primary: `shadow-lg` is two translucent black layers spread over ~150x150 device pixels, and
  // compositing them lands a level apart across part of that spread. Every one of the 8169 differing
  // pixels in dark is off by 1 or 2, none by more, and they sit entirely inside the shadow's falloff.
  //
  // Geometry was proved identical before this entry was written, not assumed: width, height,
  // background, padding, box-sizing, position, z-index and the sub-pixel phase of the bounding box
  // all match exactly on both sides. Two textual differences remain and neither can account for it -
  // the radius reads 1.67772e+07px against 9999px, which clamps to the same 28px on a 56px box, and
  // shadcn's shadow carries four fully transparent Tailwind ring layers in front of the two real
  // ones. That second one was tested directly by giving MUI the identical six-layer string: the
  // measurement did not move by a single pixel, so the layer count is not the cause.
  //
  // It is POSITION-DEPENDENT, which is what rules out a style regression and rules in rounding. The
  // pair measured a clean zero for weeks, then adding an unrelated Fab row above it moved this one
  // down the page and the rounding flipped. A genuine difference does not care where the row sits.
  //
  // THE NUMBER IS NOT THE MEASURED WORST, and that is deliberate - it was, and that was a mistake
  // worth recording. Set to 2 because 2 was what the artifact measured at the time, it went red the
  // next time a row was added ABOVE this pair: the Fab moved down the page, the rounding shifted,
  // and the hover state came back at 3. Tuning a bound to one observation of a POSITION-DEPENDENT
  // artifact bakes the current layout into the suite, exactly the way the flat 240s parity timeout
  // baked in a pair count (see parity.spec.ts). The gallery grows; the bound has to survive it.
  //
  // 8 is chosen as "still invisible in a shadow's falloff" with room for the rounding to land
  // wherever the next row puts it. It stays far below anything that would signal a real change:
  // altering the shadow's colour, offset, blur or spread moves channels by tens of levels, and the
  // count arm is separately unbounded only because a soft gradient's count carries no information.
  "fab-primary": 8,
}

export interface ParityRule {
  maxPixels: number
  maxDelta: number
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
  const maxPixels = scoped(maxPixelOverrides, pairId, state) ?? DEFAULT_MAX_PIXELS
  const maxDelta = scoped(maxDeltaOverrides, pairId, state) ?? DEFAULT_MAX_DELTA
  const pixelPart = maxPixels === Number.POSITIVE_INFINITY ? "any px" : `≤ ${maxPixels}px`
  return { maxPixels, maxDelta, label: `${pixelPart}, Δ ≤ ${maxDelta}` }
}
