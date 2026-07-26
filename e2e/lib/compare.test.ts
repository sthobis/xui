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
})
