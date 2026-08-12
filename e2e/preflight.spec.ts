import { expect, test, type Locator, type Page } from "@playwright/test"
import { diffPngs } from "./lib/compare"
import { snapToPixelGrid } from "./lib/states"
import { GALLERY_PAGE, PURE_PAGE, targetOf } from "./lib/themes"

/**
 * The most any channel of any pixel may differ between the two pages.
 *
 * 2 is where the measured floor sits, and the floor is one pixel wide: with the pixel-grid snap in
 * captureCell applied, the whole suite comes in at Δ0 except the input-box family
 * (textfield-basic/-placeholder/-filled/-standard/-small/-multiline and formhelper-default), each of
 * which has exactly ONE pixel off by 2 - a corner of the box's border resolving a step differently.
 *
 * For scale, the rule this replaced was "under 0.5% of pixels may differ by any amount", which
 * happily passed 464 pixels at Δ245.
 */
const MAX_CHANNEL_DELTA = 2

/**
 * Per-pair allowances, for residuals PROVEN not to be a Tailwind dependency.
 *
 * This check is deliberately far stricter than the parity suite (Δ2, against Δ40) because it
 * compares the SAME MUI element under two stylesheets. An entry here has to show that the two
 * captures differ for a reason unrelated to Tailwind at all, not merely that the difference is
 * small - so each one records how that was established.
 */
const maxDeltaOverrides: Record<string, number> = {
  // switch-checked: `corner-shape: squircle` rasterizes differently at different device positions.
  //
  // Kumo's Switch is the only control drawn with a squircle, which Skia rasterizes from a
  // superellipse rather than an arc. The two pages lay the same cell out at different x by design
  // (the gallery page has a reference column beside it, the pure page does not), and the curve's
  // edge pixels land differently there.
  //
  // Proven rather than assumed. Every computed value on the track and thumb is byte-identical
  // across the two pages - 36x18 and 18x18, same integer x phase, same 10px radius, same resolved
  // `corner-shape: squircle`, same colours, same box-sizing - and the ONLY difference is that the
  // switch sits at x=594 on the gallery page and x=354 on the pure page. The parity suite sees the
  // same artifact from the other direction: its two sides sit at those exact two x positions and
  // differ by the same handful of corner pixels. Nothing here varies with Tailwind's presence.
  //
  // 38 pixels, worst channel Δ8, all of them on the four corner curves.
  "switch-checked": 8,

  // badge-outline: ONE pixel, Δ4, on the pill's border curve.
  //
  // The same phenomenon this file's header already records for the input-box family (one pixel at
  // Δ2 where a border corner resolves a step differently), just a touch larger because `outline` is
  // the only Badge variant with a real 1px border and it is drawn on a `rounded-full` pill, so the
  // curve is far tighter than an 8px radius. Every filled Badge variant - same box, same padding,
  // same type, no border - is at Δ0 across the two pages, which is what isolates it to the border.
  "badge-outline": 4,
}

/**
 * Captures a cell via a page-level clip with ROUNDED integer bounds, for the same reason
 * parity.spec.ts does: an element screenshot clips at the element's own fractional device-pixel
 * span, so one cell of a fixed CSS width captures to DIFFERENT PNG sizes depending on the
 * sub-pixel phase it happens to sit at. That bites especially hard here, because the two pages
 * being compared lay the cell out at different x-offsets by design (index.html has a shadcn
 * column beside it; pure.html does not), so a fractional-width cell lands at a different phase on
 * each page and diffPngs then counts real pixels against zero-padding. Rounding makes the capture
 * deterministic on both pages; a genuine rendering difference still shows.
 */
async function captureCell(page: Page, cell: Locator, id: string): Promise<Buffer> {
  await cell.scrollIntoViewIfNeeded()
  // Snap the cell onto whole pixels first, exactly as parity.spec.ts does, and for a sharper version
  // of the same reason: index.html lays this cell out beside a shadcn column and pure.html does not,
  // so its x-offset differs between the two pages BY DESIGN. Any pair whose content is not a whole
  // number of pixels wide therefore rasterizes at a different sub-pixel phase on each page, and the
  // text is redrawn rather than merely moved. Measured on the three pairs it bites: pagination-basic
  // 464 pixels at Δ245, breadcrumb-basic 283 at Δ113, checkbox-with-label 150 at Δ224 - all of it
  // phase, none of it a Tailwind dependency. Rounding the clip below cannot fix it; that moves the
  // crop, not the content inside it.
  await snapToPixelGrid(cell)
  const box = await cell.boundingBox()
  if (!box) throw new Error(`mui cell for ${id} has no bounding box`)
  return page.screenshot({
    animations: "disabled",
    clip: {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
    },
  })
}

test("mui renders identically with and without tailwind", async ({ page }, testInfo) => {
  // Duration budget, NOT a correctness threshold - the same distinction parity.spec.ts records.
  // This test screenshots EVERY pair on two pages, so its runtime grows with the gallery, and it
  // had been riding Playwright's 30s default: measured at 30.2s for shadcn (101 pairs, failed) and
  // 27.1s for kumo (77, passed). A timeout there reports as `locator.scrollIntoViewIfNeeded` on
  // whichever pair the clock happened to run out on, which reads exactly like a missing element -
  // it cost a real diagnostic detour chasing a `type-h2` cell that was present on both pages the
  // whole time. Raised with headroom so a slow machine reports real numbers instead.
  testInfo.setTimeout(300_000)
  const { theme, mode } = targetOf(test.info().project.name)
  test.skip(mode === "dark", "mode covered by parity suite; preflight is mode-independent")
  await page.goto(GALLERY_PAGE[theme])
  await page.waitForLoadState("networkidle")
  const ids: string[] = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-pair-id]")).map((el) => el.getAttribute("data-pair-id")!),
  )

  const withTailwind = new Map<string, Buffer>()
  for (const id of ids) {
    const cell = page.locator(`[data-pair-id="${id}"] [data-side="mui"]`)
    withTailwind.set(id, await captureCell(page, cell, id))
  }

  await page.goto(PURE_PAGE[theme])
  await page.waitForLoadState("networkidle")
  const failures: string[] = []
  for (const id of ids) {
    const cell = page.locator(`[data-pair-id="${id}"] [data-side="mui"]`)
    const pure = await captureCell(page, cell, id)
    const r = diffPngs(withTailwind.get(id)!, pure)
    // Judged on CHANNEL ERROR, not on a percentage or a pixel count - and far more tightly than the
    // parity suite, because this comparison is much stronger. Parity compares two different
    // implementations of the same design; this compares the SAME MUI element, with the same theme,
    // on two pages that differ only in whether Tailwind's stylesheet is present. Anything the theme
    // genuinely leans on Tailwind for moves a channel by a lot, so a real dependency cannot hide
    // under a cap this small.
    //
    // A percentage was the wrong instrument here for the same reason it was in thresholds.ts. The
    // Fab's shadow is a soft translucent gradient, and its compositing lands one level apart between
    // the two pages across roughly a thousand pixels - so it scored 1.18% while every single channel
    // was off by exactly 1, which is invisible. The count says how much of the cell moved; only the
    // delta says whether anything actually looks different.
    const cap = maxDeltaOverrides[id] ?? MAX_CHANNEL_DELTA
    if (r.maxChannelDelta > cap) {
      failures.push(
        `${id}: worst channel Δ${r.maxChannelDelta} > ${cap} ` +
          `(${r.mismatchedPixels}px, ${r.mismatchPct.toFixed(2)}%) - the theme is leaning on Tailwind for something`,
      )
    }
  }
  expect(failures, failures.join("\n")).toEqual([])
})
