import { describe, expect, it } from "vitest"
import { PNG } from "pngjs"
import { diffPngs } from "./compare"

function solidPng(width: number, height: number, rgba: [number, number, number, number]): Buffer {
  const png = new PNG({ width, height })
  for (let i = 0; i < width * height; i++) {
    png.data[i * 4] = rgba[0]
    png.data[i * 4 + 1] = rgba[1]
    png.data[i * 4 + 2] = rgba[2]
    png.data[i * 4 + 3] = rgba[3]
  }
  return PNG.sync.write(png)
}

describe("diffPngs", () => {
  it("returns 0% for identical images", () => {
    const a = solidPng(10, 10, [255, 0, 0, 255])
    const b = solidPng(10, 10, [255, 0, 0, 255])
    const r = diffPngs(a, b)
    expect(r.mismatchedPixels).toBe(0)
    expect(r.mismatchPct).toBe(0)
    expect(r.totalPixels).toBe(100)
  })

  it("counts differing pixels", () => {
    const a = solidPng(10, 10, [255, 0, 0, 255])
    const b = solidPng(10, 10, [0, 0, 255, 255])
    const r = diffPngs(a, b)
    expect(r.mismatchedPixels).toBe(100)
    expect(r.mismatchPct).toBe(100)
  })

  it("reports 0 max channel delta for identical images", () => {
    const a = solidPng(10, 10, [200, 200, 200, 255])
    const b = solidPng(10, 10, [200, 200, 200, 255])
    expect(diffPngs(a, b).maxChannelDelta).toBe(0)
  })

  // The property slider-disabled's exception relies on: a whole-image 1/255 shift reports a delta
  // of exactly 1, and pixelmatch still counts every pixel as differing - so the delta rule and the
  // percentage rule genuinely disagree here, which is the point of having both.
  it("reports a max channel delta of 1 for a whole-image one-level shift", () => {
    const a = solidPng(10, 10, [250, 250, 250, 255])
    const b = solidPng(10, 10, [249, 249, 249, 255])
    const r = diffPngs(a, b)
    expect(r.maxChannelDelta).toBe(1)
    expect(r.mismatchPct).toBe(100)
  })

  it("reports the largest per-channel delta, not the average", () => {
    const a = solidPng(10, 10, [10, 250, 10, 255])
    const b = solidPng(10, 10, [10, 120, 10, 255])
    expect(diffPngs(a, b).maxChannelDelta).toBe(130)
  })

  it("pads mismatched dimensions and flags the padded region as diff", () => {
    const a = solidPng(10, 10, [0, 128, 0, 255])
    const b = solidPng(10, 12, [0, 128, 0, 255])
    const r = diffPngs(a, b)
    expect(r.totalPixels).toBe(120)
    expect(r.mismatchedPixels).toBe(20)
  })

  it("reports both sides' dimensions so a size difference can be failed on its own terms", () => {
    const r = diffPngs(solidPng(10, 10, [0, 0, 0, 255]), solidPng(10, 12, [0, 0, 0, 255]))
    expect(r.sizes).toEqual({ shadcn: { width: 10, height: 10 }, mui: { width: 10, height: 12 } })
  })

  // The delta MUST ignore pixels pixelmatch classified as antialiasing, or it describes the
  // antialiasing instead of the defect. Live, the all-pixels version reported deltas of 82-99 for
  // pairs with zero differing pixels (progress-circular, avatar-image) purely from the edge of a
  // circle sampling differently on two independently rasterized copies.
  //
  // Built here as a lone off-colour pixel in a flat field: with a uniform neighbourhood on every
  // side, pixelmatch's antialiasing test cannot explain it away, so it stays counted and its delta
  // is reported. The companion case - a real AA edge, excluded and NOT contributing - is the one
  // that showed up live; it needs a gradient neighbourhood that this synthetic helper cannot build,
  // so it is covered by the parity suite rather than here.
  it("reports the delta of a counted pixel", () => {
    const png = PNG.sync.read(solidPng(10, 10, [200, 200, 200, 255]))
    png.data[4 * 55] = 100 // one pixel, red channel 100 levels off
    const r = diffPngs(solidPng(10, 10, [200, 200, 200, 255]), PNG.sync.write(png))
    expect(r.mismatchedPixels).toBe(1)
    expect(r.maxChannelDelta).toBe(100)
  })
})
