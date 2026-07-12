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

  it("pads mismatched dimensions and flags the padded region as diff", () => {
    const a = solidPng(10, 10, [0, 128, 0, 255])
    const b = solidPng(10, 12, [0, 128, 0, 255])
    const r = diffPngs(a, b)
    expect(r.totalPixels).toBe(120)
    expect(r.mismatchedPixels).toBe(20)
  })
})
