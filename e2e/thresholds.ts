/** Mismatch % allowed per pair id. Both sides render in the same screenshot session, so antialiasing affects them equally; per-pair exceptions go in the overrides map below. */
const DEFAULT_THRESHOLD = 0.5

const overrides: Record<string, number> = {
  // slider-disabled: proven byte-identical CSS AND geometry between the shadcn and MUI disabled
  // sliders (rail/range/thumb background, opacity, and getBoundingClientRect all match to the
  // pixel; root opacity 0.5 on both). The residual is a ~1/255-level (250 vs 249) rasterization
  // difference in a narrow band of the flat rail where the root's disabled opacity:0.5 composites
  // two structurally-different DOM subtrees (Radix nested Track>Range vs MUI sibling rail+track).
  // It is imperceptible and not a style difference - recorded here rather than the theme, kept
  // tight so any genuine regression on this pair still trips it.
  "slider-disabled": 0.7,
}

export function thresholdFor(pairId: string): number {
  return overrides[pairId] ?? DEFAULT_THRESHOLD
}
