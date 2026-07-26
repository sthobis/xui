import pixelmatch from "pixelmatch"
import { PNG } from "pngjs"

export interface DiffResult {
  mismatchedPixels: number
  totalPixels: number
  mismatchPct: number
  /**
   * Largest absolute per-channel (R/G/B/A) difference across every pixel, 0-255. Independent of
   * HOW MANY pixels differ, so it separates "a whole region is the wrong colour" (a style bug,
   * large delta) from "a flat region landed on opposite sides of an 8-bit rounding boundary"
   * (a rasterization artifact, delta of exactly 1). See thresholds.ts's maxDeltaOverrides.
   */
  maxChannelDelta: number
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
  const mismatchedPixels = pixelmatch(pa.data, pb.data, diff.data, width, height, {
    threshold: pixelThreshold,
  })
  const totalPixels = width * height
  let maxChannelDelta = 0
  for (let i = 0; i < pa.data.length; i += 1) {
    const delta = Math.abs(pa.data[i] - pb.data[i])
    if (delta > maxChannelDelta) maxChannelDelta = delta
  }
  return {
    mismatchedPixels,
    totalPixels,
    mismatchPct: (mismatchedPixels / totalPixels) * 100,
    maxChannelDelta,
    diff,
  }
}
