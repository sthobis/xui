/** Mismatch % allowed per pair id. Antialiasing noise stays under ~1%. */
const DEFAULT_THRESHOLD = 1.5

const overrides: Record<string, number> = {
  // "button-with-icon": 2.0,  // example shape; keep empty until a pair earns an exception
}

export function thresholdFor(pairId: string): number {
  return overrides[pairId] ?? DEFAULT_THRESHOLD
}
