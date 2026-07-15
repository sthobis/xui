/** Mismatch % allowed per pair id. Both sides render in the same screenshot session, so antialiasing affects them equally; per-pair exceptions go in the overrides map below. */
const DEFAULT_THRESHOLD = 0.5

const overrides: Record<string, number> = {
  // "button-with-icon": 2.0,  // example shape; keep empty until a pair earns an exception
}

export function thresholdFor(pairId: string): number {
  return overrides[pairId] ?? DEFAULT_THRESHOLD
}
