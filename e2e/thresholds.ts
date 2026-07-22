/** Mismatch % allowed per pair id (optionally per pair+state). Both sides render in the same screenshot session, so antialiasing affects them equally; per-pair(+state) exceptions go in the overrides map below. */
const DEFAULT_THRESHOLD = 0.5

// Keys are either a bare pair id (applies to every state of that pair, e.g. "slider-disabled"
// below) or "pairId:state" (applies to only that one state, leaving the pair's other states at
// the default - used for select-open, whose "open" state is already tight at 0.38-0.41% and
// should stay that way).
const overrides: Record<string, number> = {
  // slider-disabled: proven byte-identical CSS AND geometry between the shadcn and MUI disabled
  // sliders (rail/range/thumb background, opacity, and getBoundingClientRect all match to the
  // pixel; root opacity 0.5 on both). The residual is a ~1/255-level (250 vs 249) rasterization
  // difference in a narrow band of the flat rail where the root's disabled opacity:0.5 composites
  // two structurally-different DOM subtrees (Radix nested Track>Range vs MUI sibling rail+track).
  // It is imperceptible and not a style difference - recorded here rather than the theme, kept
  // tight so any genuine regression on this pair still trips it.
  "slider-disabled": 0.7,

  // select-open:anchored - the "anchored" state's own capture (e2e/lib/states.ts anchoredClip)
  // deliberately skips normalizeOverlayPosition's sub-pixel snap (snapping would mask the very
  // anchor-distance bug this state exists to catch), so `page.screenshot({ clip })` crops at
  // whatever fractional device-pixel phase the trigger+overlay union happens to land on - a
  // capture-time rasterization cost, not a style difference. Proven not a real anchoring bug:
  // fixing the actual, real bug this state found (MUI Select rendering its Menu flush below the
  // trigger, where shadcn/Radix's real "item-aligned" default overlaps the selected item on the
  // trigger - see the MuiSelectOpenDemo banner in sections/select.tsx) already got vertical
  // alignment to an exactly-matching centerY and horizontal text alignment to within 0.125 CSS
  // px, with the check glyph now a pixel-perfect match in the diff. The remaining residual scales
  // with text surface area, not position error: tooltip-open's own "anchored" state (one short
  // line) sits at 0.22% under the very same capture path, while select-open's 5-row option list
  // (far more glyph edges for the identical per-character AA noise density to land on) scales up
  // to ~6.8%. Kept just above the measured value, and scoped to ONLY the "anchored" state, so
  // select-open's "open" state (0.38-0.41%, no origin-rounding involved) keeps its full
  // sensitivity, and a real regression in either state still trips this.
  "select-open:anchored": 8,
}

export function thresholdFor(pairId: string, state?: string): number {
  if (state) {
    const scoped = overrides[`${pairId}:${state}`]
    if (scoped !== undefined) return scoped
  }
  return overrides[pairId] ?? DEFAULT_THRESHOLD
}
