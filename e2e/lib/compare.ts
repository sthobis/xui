import pixelmatch from "pixelmatch"
import { PNG } from "pngjs"

export interface DiffResult {
  mismatchedPixels: number
  totalPixels: number
  mismatchPct: number
  /**
   * Largest absolute per-channel (R/G/B/A) difference, 0-255, across the pixels pixelmatch actually
   * COUNTED - not across every pixel. Independent of how many differ, so it separates "a whole
   * region is the wrong colour" (a style bug, large delta) from "a flat region landed on opposite
   * sides of an 8-bit rounding boundary" (a rasterization artifact, delta of exactly 1). See
   * thresholds.ts.
   *
   * Restricting it to counted pixels matters. Measured over EVERY pixel instead, this reported
   * deltas of 82-99 for pairs with ZERO differing pixels - progress-circular, avatar-image,
   * textfield-error - because the edge of a circle or a ring legitimately antialiases to very
   * different samples on two independently rasterized copies, and pixelmatch deliberately excludes
   * exactly those from its count. A delta drawn from pixels the diff has already dismissed
   * describes the antialiasing, not the defect, and makes this number useless as a pass rule.
   */
  maxChannelDelta: number
  /**
   * The two captures' pixel dimensions. Equal sizes are the normal case and the only one a
   * percentage can describe honestly: `pad()` below grows the smaller capture to the union with
   * TRANSPARENT pixels, so a size difference turns into "some fraction of the cell differs"
   * rather than "these are not the same shape". That dilution is how a real geometry bug reads as
   * a small percentage - sonner's toast captured 2 device px taller than MUI's and scored 6.27%,
   * a number indistinguishable from a font-rendering wobble. Callers should treat a size
   * difference as its own failure and never let a threshold absorb it.
   */
  sizes: { ref: { width: number; height: number }; mui: { width: number; height: number } }
  diff: PNG
}

/** Pad to the union size with fully transparent pixels (bottom/right). */
function pad(png: PNG, width: number, height: number): PNG {
  if (png.width === width && png.height === height) return png
  const out = new PNG({ width, height })
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0)
  return out
}

// Per-pixel color threshold for pixelmatch, in [0, 1]. Defaults to 0 (maximally sensitive)
// because both sides of every comparison are captured in the same browser session: a genuine
// match differs by exactly 0 pixels, so there is no cross-session noise to tolerate. pixelmatch's
// antialiasing detection (`includeAA`, left at its default of false) already excludes edge-AA
// pixels from the count, which is the only noise source that actually exists here - so raising
// this threshold buys no real robustness. It used to be 0.1, which tolerates a luminance delta
// of roughly 26/255 per pixel; that let a 24%-different grey background wash (textfield-filled
// focus state) score a perfect 0.00% mismatch. Keep this overridable for tests that want to
// assert specific pixelmatch behavior.
export function diffPngs(aBuf: Buffer, bBuf: Buffer, pixelThreshold = 0): DiffResult {
  const a = PNG.sync.read(aBuf)
  const b = PNG.sync.read(bBuf)
  const width = Math.max(a.width, b.width)
  const height = Math.max(a.height, b.height)
  const pa = pad(a, width, height)
  const pb = pad(b, width, height)
  const diff = new PNG({ width, height })
  // Colours stated explicitly rather than left to pixelmatch's defaults, because the diff image is
  // how we recover WHICH pixels were counted: pixelmatch paints counted differences with diffColor
  // (or diffColorAlt, where b is darker than a) and antialiasing-classified ones with aaColor, and
  // by default diffColorAlt falls back to diffColor. Pinning all three - and keeping alt distinct -
  // makes the classification readable below, and makes a diff image show at a glance which
  // direction each error went.
  const DIFF_COLOR: [number, number, number] = [255, 0, 0]
  const DIFF_COLOR_ALT: [number, number, number] = [0, 160, 255]
  const mismatchedPixels = pixelmatch(pa.data, pb.data, diff.data, width, height, {
    threshold: pixelThreshold,
    diffColor: DIFF_COLOR,
    diffColorAlt: DIFF_COLOR_ALT,
    aaColor: [255, 255, 0],
  })
  const totalPixels = width * height
  // Max channel delta over the COUNTED pixels only - see the field's own note. Reading the
  // classification back out of the diff image keeps this in lockstep with pixelmatch's own
  // antialiasing judgement instead of re-deriving it here and drifting from it.
  let maxChannelDelta = 0
  for (let p = 0; p < width * height; p += 1) {
    const i = p * 4
    const isCounted =
      (diff.data[i] === DIFF_COLOR[0] &&
        diff.data[i + 1] === DIFF_COLOR[1] &&
        diff.data[i + 2] === DIFF_COLOR[2]) ||
      (diff.data[i] === DIFF_COLOR_ALT[0] &&
        diff.data[i + 1] === DIFF_COLOR_ALT[1] &&
        diff.data[i + 2] === DIFF_COLOR_ALT[2])
    if (!isCounted) continue
    for (let c = 0; c < 4; c += 1) {
      const delta = Math.abs(pa.data[i + c] - pb.data[i + c])
      if (delta > maxChannelDelta) maxChannelDelta = delta
    }
  }
  return {
    mismatchedPixels,
    totalPixels,
    mismatchPct: (mismatchedPixels / totalPixels) * 100,
    maxChannelDelta,
    sizes: {
      ref: { width: a.width, height: a.height },
      mui: { width: b.width, height: b.height },
    },
    diff,
  }
}
