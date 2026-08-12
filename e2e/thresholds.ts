import type { ThemeName } from "./lib/themes"

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
//
// Overrides are scoped PER THEME. Pair ids are only unique within a theme's own gallery (both
// galleries have a `button-*` family), and an exception is always a proof about one specific pair
// of implementations - shadcn's Radix slider against MUI's, say. Letting one theme's allowance
// leak onto a same-named pair in another theme would silently hand it a pass it never earned.

// Per-pair(+state) pixel-count allowances.
const maxPixelOverrides: Record<ThemeName, Record<string, number>> = {
  shadcn: {
    // slider-disabled: judged on channel error alone, so its count is unbounded - see the note in
    // maxDeltaOverrides below. The artifact is a 1/255 rail rounding step spread over more than a
    // thousand pixels, which is exactly the shape a count cannot describe.
    "slider-disabled": Number.POSITIVE_INFINITY,

    // fab-primary: same shape of artifact as slider-disabled, in a soft shadow rather than a rail, so
    // the count is again the wrong invariant - see the proof in maxDeltaOverrides below.
    "fab-primary": Number.POSITIVE_INFINITY,
  },
  kumo: {
    // The two emphasis buttons: gradient dithering, judged on channel error alone. Same shape of
    // artifact as slider-disabled and the same reasoning - see the proof in maxDeltaOverrides.
    "button-primary": Number.POSITIVE_INFINITY,
    "button-destructive": Number.POSITIVE_INFINITY,

    // dialog-open: rounded-corner antialiasing, and again ONLY the count is relaxed - the worst
    // pixel here is Δ3 against a cap of 40.
    //
    // The panel is a 384x106 box with a 12px radius, and both sides land it on exactly the same
    // pixel (measured: 384.000x106.000 at 528,447 on both), with the same fill, the same
    // `0 0 0 1px` ring and the same two 3%-alpha shadow layers. What differs is a handful of
    // pixels along each of the four corner CURVES, by one or two levels: reading the top-left
    // corner's first row off both captures gives 220 220 220 221 229 239 242 246 250 253 against
    // 220 220 220 220 230 238 242 246 249 254 - the same curve, with the coverage of a few
    // partially covered pixels rounded the other way. Everything straight is byte-identical.
    //
    // Both panels are drawn into their own compositing layer (kumo centres with a translate, MUI
    // mounts the paper inside a Fade), and matching kumo's centring mechanism exactly was tried
    // and changed nothing, which is what places this with the other rasterization entries here
    // rather than with a geometry bug.
    "dialog-open": 200,

    // switch-checked: squircle-corner antialiasing, and ONLY the count is relaxed - the channel cap
    // stays at the default 40, which the worst pixel here (Δ10) is nowhere near.
    //
    // Kumo's Switch is the only control in either gallery drawn with `corner-shape: squircle`, a
    // shape Chrome rasterizes from a superellipse rather than an arc. Kumo nests its thumb INSIDE
    // the track element; MUI paints the track and the thumb as siblings. Same curve, two different
    // paint trees, and the edge pixels of the curve land fractionally differently.
    //
    // Everything measurable matches, read off the live controls: both tracks are 36x18 and both
    // thumbs 18x18, at the same offsets (thumb at track + 18px on both sides), same 10px radius,
    // same computed `corner-shape: squircle`, and identical track/ring/thumb/shadow colours. The
    // 134 differing pixels sit only at x[201..203], x[274..277] and the thumb's own edge - the four
    // corner regions - with a histogram that is 66 pixels at Δ1 and just two at Δ10.
    //
    // It shows in dark and not light because the corner sits against a much darker canvas there.
    "switch-checked": 200,
  },
  // blink: no allowances. Every pair is expected to hold the defaults; an entry here needs the
  // same written proof the two above carry.
  blink: {},
}

// Per-pair(+state) channel-error allowances. Use this when a residual is provably NOT misplaced
// geometry - prove the boxes, colours and fonts match first, and record the proof here.
const maxDeltaOverrides: Record<ThemeName, Record<string, number>> = {
  shadcn: {
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
  },
  kumo: {
    // button-primary / button-destructive: Kumo's two emphasis variants are the only components in
    // either gallery painted with a GRADIENT, and Chrome dithers a gradient differently depending
    // on which paint op draws it. Kumo puts its gradient on an absolutely positioned child span;
    // MUI's Button renders its children as bare text nodes, so there is no element to style and the
    // theme uses a ::before of identical geometry instead. Same picture, different paint op, and
    // the dither pattern lands a single level apart across the button's face.
    //
    // The proof this is dithering and not a colour or geometry error:
    //   - EVERY differing pixel is off by exactly 1/255. The delta histogram of the light default
    //     capture is literally { 1: 802 } - not a distribution with a tail, a single bucket.
    //   - The differences are strictly INTERIOR. The capture's differing bbox is y[56..123] while
    //     the button spans y[50..125], so the 1px ring rows top and bottom - the thing a geometry
    //     error would move first - are byte-identical, as are both captures' dimensions.
    //   - Every non-gradient state of the same components is clean: secondary, ghost, outline and
    //     secondary-destructive all reach 0-4px, and they share this file's entire box recipe.
    //
    // Two alternatives were measured and are worse, so this is the floor rather than a shortcut:
    // folding the gradient onto the root's own background-image scores Δ41 (a real colour error,
    // 716px), and it was Δ36 before the ::before existed. The pseudo-element is what took it to Δ1.
    //
    // Judged on channel error alone for the same reason slider-disabled is: a 1/255 step spread
    // over hundreds of pixels is invisible, and a genuine regression moves a channel by far more
    // (every defect this suite has caught moved 20-247 levels), so Δ1 still trips instantly.
    "button-primary": 1,
    "button-destructive": 1,
  },
  // blink: no allowances. See the note in maxPixelOverrides.
  blink: {},
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

export function ruleFor(theme: ThemeName, pairId: string, state?: string): ParityRule {
  const maxPixels = scoped(maxPixelOverrides[theme], pairId, state) ?? DEFAULT_MAX_PIXELS
  const maxDelta = scoped(maxDeltaOverrides[theme], pairId, state) ?? DEFAULT_MAX_DELTA
  const pixelPart = maxPixels === Number.POSITIVE_INFINITY ? "any px" : `≤ ${maxPixels}px`
  return { maxPixels, maxDelta, label: `${pixelPart}, Δ ≤ ${maxDelta}` }
}
