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

export function thresholdFor(pairId: string, state?: string): number {
  if (state) {
    const scoped = overrides[`${pairId}:${state}`]
    if (scoped !== undefined) return scoped
  }
  return overrides[pairId] ?? DEFAULT_THRESHOLD
}
