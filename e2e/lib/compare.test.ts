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
    expect(r.sizes).toEqual({ ref: { width: 10, height: 10 }, mui: { width: 10, height: 12 } })
  })

  // The delta MUST ignore pixels pixelmatch classified as antialiasing, or it describes the
  // antialiasing instead of the defect. Live, the all-pixels version reported deltas of 82-99 for
  // pairs with zero differing pixels (progress-circular, avatar-image) purely from the edge of a
  // circle sampling differently on two independently rasterized copies.
  //
  // Built here as a lone off-colour pixel in a flat field: with a uniform neighbourhood on every
  // side, pixelmatch's antialiasing test cannot explain it away, so it stays counted and its delta
  // is reported. The companion case - a real AA edge, excluded and NOT contributing - is the test
  // below this one.
  it("reports the delta of a counted pixel", () => {
    const png = PNG.sync.read(solidPng(10, 10, [200, 200, 200, 255]))
    png.data[4 * 55] = 100 // one pixel, red channel 100 levels off
    const r = diffPngs(solidPng(10, 10, [200, 200, 200, 255]), PNG.sync.write(png))
    expect(r.mismatchedPixels).toBe(1)
    expect(r.maxChannelDelta).toBe(100)
  })

  // The companion case, and the single most load-bearing property of maxChannelDelta: pixels that
  // pixelmatch CLASSIFIES as antialiasing contribute nothing, even when their raw channel
  // differences are large. This used to be deferred to the parity suite, which covers it only
  // implicitly - a regression here (say, a pixelmatch update changing its aa classification or its
  // diff-image colours, which is how compare.ts recovers the classification) would have surfaced
  // as a wall of mysterious parity failures rather than as one failing unit test naming the cause.
  //
  // The synthetic that produces genuine AA classification: an antialiased diagonal edge (black,
  // one row of mid-grey, white) shifted by one pixel between the two images. Every differing pixel
  // sits on the moving edge with a gradient neighbourhood, which is exactly the shape pixelmatch's
  // antialiasing test exists to dismiss. Verified against pixelmatch directly while writing this:
  // all 19 differing pixels classify as AA, none are counted - despite raw channel differences of
  // up to 128 (grey against black) on the very pixels being dismissed.
  it("excludes antialiasing-classified pixels from the delta even at large raw differences", () => {
    const edgePng = (boundary: number): Buffer => {
      const size = 12
      const png = new PNG({ width: size, height: size })
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const i = (y * size + x) * 4
          const v = x + y < boundary ? 0 : x + y === boundary ? 128 : 255
          png.data[i] = png.data[i + 1] = png.data[i + 2] = v
          png.data[i + 3] = 255
        }
      }
      return PNG.sync.write(png)
    }
    const r = diffPngs(edgePng(8), edgePng(9))
    expect(r.mismatchedPixels).toBe(0)
    expect(r.maxChannelDelta).toBe(0)
  })

  // The escape hatch the signature carries must keep demonstrating the bug that set the default to
  // 0: a 0.1 pixelmatch threshold tolerates a uniform 24-level wash - the textfield-filled focus
  // state shipped a 24%-different grey background scoring a perfect 0.00% mismatch under it. The
  // parameter existed "for tests that want to assert specific pixelmatch behavior" with no such
  // test; this is that test, and it is the reason the parameter is worth keeping at all. If it
  // ever grows a production caller, that caller is re-introducing the bug below.
  it("pixelThreshold 0.1 masks a 24-level wash that the 0 default catches", () => {
    const a = solidPng(10, 10, [200, 200, 200, 255])
    const b = solidPng(10, 10, [176, 176, 176, 255])
    expect(diffPngs(a, b).mismatchedPixels).toBe(100)
    expect(diffPngs(a, b, 0.1).mismatchedPixels).toBe(0)
  })
})
