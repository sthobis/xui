import pixelmatch from "pixelmatch"
import { PNG } from "pngjs"

export interface DiffResult {
  mismatchedPixels: number
  totalPixels: number
  mismatchPct: number
  diff: PNG
}

/** Pad to the union size with fully transparent pixels (bottom/right). */
function pad(png: PNG, width: number, height: number): PNG {
  if (png.width === width && png.height === height) return png
  const out = new PNG({ width, height })
  PNG.bitblt(png, out, 0, 0, png.width, png.height, 0, 0)
  return out
}

export function diffPngs(aBuf: Buffer, bBuf: Buffer, pixelThreshold = 0.1): DiffResult {
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
  return {
    mismatchedPixels,
    totalPixels,
    mismatchPct: (mismatchedPixels / totalPixels) * 100,
    diff,
  }
}
