/** Mismatch % allowed per pair id (optionally per pair+state). Both sides render in the same screenshot session, so antialiasing affects them equally; per-pair(+state) exceptions go in the overrides map below. */
const DEFAULT_THRESHOLD = 0.5

// Keys are either a bare pair id (applies to every state of that pair) or "pairId:state" (applies
// to only that one state, leaving the pair's other states at the default - used for select-open,
// whose "open" state is already tight at 0.38-0.41% and should stay that way).
// Empty on purpose. `select-open:anchored` used to sit here at 7%, justified as sub-pixel phase
// noise across a text-dense overlay. That reasoning was wrong: the residual was the harness
// comparing two differently-sized captures, because the pair marked `data-target` on shadcn's
// whole trigger but on MUI's inner display div (144x32 against 142x36), and the anchored capture
// unions the marked box with the overlay's. Marking the same box on both sides took it from 6.81%
// to 0.32%, under the default threshold, and pinning the trigger to a whole number of pixels wide
// took the `open` state from 0.38% to 0.00% (see select.tsx and menu.tsx for both notes).
//
// Worth remembering before adding an entry here: a residual blamed on antialiasing had a concrete,
// fixable cause for two suites running. Prefer finding it.
const overrides: Record<string, number> = {}

// A pair listed here is judged by the LARGEST per-channel difference it produces rather than by
// how many pixels differ (DiffResult.maxChannelDelta), and its percentage threshold is ignored.
// Use this - not a bigger percentage - when a residual is provably an 8-bit rounding artifact:
// capping the delta bounds the visual error directly, and unlike a percentage it does not move
// when the page layout shifts the pair to a different device-pixel offset.
const maxDeltaOverrides: Record<string, number> = {
  // slider-disabled: every value on both sides is byte-identical (rail/range/thumb background,
  // border radius, opacity, and getBoundingClientRect all match exactly; only the DOM shape
  // differs - Radix nests Track > Range where MUI puts rail + track as siblings). The rail's
  // bg-muted is oklch(0.97 0 0) = 244.95/255, and the root's disabled opacity-50 composites it
  // over white to 249.97/255 - a value sitting one hundredth of a level below the 249/250
  // rounding boundary. Skia resolves it to 250 across part of the span and 249 across the rest,
  // and WHERE it flips depends on the element's absolute device-pixel position, which the two
  // cells can never share (they sit side by side). Row-by-row the two captures use only those
  // two values, so the error is exactly 1/255 - invisible, and stable no matter where the pair
  // lands on the page.
  //
  // This started life as a 0.7% percentage threshold and had to be revisited the moment the
  // gallery gained a sidebar and shifted every cell 50px right: same 1/255 artifact, but the
  // flip point moved and the pixel count jumped 0.56% -> 1.51%. A delta cap is the invariant the
  // proof actually supports. A real style regression moves a channel by far more than 1 (the
  // bugs this suite has caught moved 20-130 levels), so it still trips immediately.
  "slider-disabled": 1,
}

export function thresholdFor(pairId: string, state?: string): number {
  if (state) {
    const scoped = overrides[`${pairId}:${state}`]
    if (scoped !== undefined) return scoped
  }
  return overrides[pairId] ?? DEFAULT_THRESHOLD
}

/**
 * Max per-channel delta allowed for a pair judged by delta instead of pixel count, or undefined
 * when the pair uses the normal percentage rule.
 */
export function maxDeltaFor(pairId: string, state?: string): number | undefined {
  if (state) {
    const scoped = maxDeltaOverrides[`${pairId}:${state}`]
    if (scoped !== undefined) return scoped
  }
  return maxDeltaOverrides[pairId]
}
