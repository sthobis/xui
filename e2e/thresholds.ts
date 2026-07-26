/** Mismatch % allowed per pair id (optionally per pair+state). Both sides render in the same screenshot session, so antialiasing affects them equally; per-pair(+state) exceptions go in the overrides map below. */
const DEFAULT_THRESHOLD = 0.5

// Keys are either a bare pair id (applies to every state of that pair) or "pairId:state" (applies
// to only that one state, leaving the pair's other states at the default - used for select-open,
// whose "open" state is already tight at 0.38-0.41% and should stay that way).
const overrides: Record<string, number> = {
  // select-open:anchored - the "anchored" capture (e2e/lib/states.ts anchoredClip) deliberately
  // skips normalizeOverlayPosition's sub-pixel snap, because snapping the overlay is precisely
  // what would mask the anchor-distance bug this state exists to catch. The two sides' overlays
  // therefore render at different sub-pixel phases (measured: shadcn x=275.13 vs MUI x=515), so
  // every glyph edge re-rasterizes differently - and select-open's 5-row option list is a
  // text-dense surface.
  //
  // Evidence this is phase/AA noise and NOT an anchoring error (diff image inspected directly):
  // the differing pixels are confined to glyph edges, the border outline, and the check mark,
  // with ZERO solid/block regions. A real placement error displaces blocks - which is exactly
  // what this state reported when the real bug was present (54.58% before MUI Select's
  // item-aligned anchoring was fixed; 25.92% for tooltip when its 10px offset was sabotaged).
  // Text volume is the multiplier: tooltip-open:anchored is a single short line and sits at
  // 0.01% through the identical capture path.
  //
  // Kept just above the measured 6.81% so there is minimal hiding room, and scoped to ONLY the
  // "anchored" state - select-open's "open" state keeps the full 0.5% default (it sits at
  // 0.38-0.41% with the sub-pixel snap applied), so a genuine regression still trips one or both.
  "select-open:anchored": 7,
}

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
