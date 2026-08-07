import { expect, test, type Locator, type Page } from "@playwright/test"
import { diffPngs } from "./lib/compare"
import { snapToPixelGrid } from "./lib/states"

/**
 * The most any channel of any pixel may differ between the two pages.
 *
 * 40, matching the parity suite's own delta cap, because what this check exists to catch is a THEME
 * DEPENDENCY on Tailwind - and those are structural, not subtle. Every one found so far was an order
 * of magnitude above this: the image list's missing list-margin reset moved a third of the cell at
 * Δ255, and the sub-pixel phase cases sat at Δ113-245.
 *
 * It was 2 first, calibrated to the measured floor of the suite as it stood. That proved brittle for
 * a reason worth recording: adding pairs moves every later cell, and the Fab's soft shadow then
 * composites and antialiases its rounded edge slightly differently, which took the floor from Δ1 to
 * Δ34 without anything about the theme changing. Verified at the time by reading the Fab's computed
 * styles on both pages - width, height, radius, background, shadow, border, padding, box-sizing, all
 * identical - so the difference was compositing, not a dependency. Re-tuning a number every time the
 * gallery grows is not a check, it is a chore.
 */
const MAX_CHANNEL_DELTA = 40

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

test("mui renders identically with and without tailwind", async ({ page }) => {
  test.skip(test.info().project.name === "dark", "mode covered by parity suite; preflight is mode-independent")
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  const ids: string[] = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-pair-id]")).map((el) => el.getAttribute("data-pair-id")!),
  )

  const withTailwind = new Map<string, Buffer>()
  for (const id of ids) {
    const cell = page.locator(`[data-pair-id="${id}"] [data-side="mui"]`)
    withTailwind.set(id, await captureCell(page, cell, id))
  }

  await page.goto("/pure.html")
  await page.waitForLoadState("networkidle")
  const failures: string[] = []
  for (const id of ids) {
    const cell = page.locator(`[data-pair-id="${id}"] [data-side="mui"]`)
    const pure = await captureCell(page, cell, id)
    const r = diffPngs(withTailwind.get(id)!, pure)
    // Judged on CHANNEL ERROR, not on a percentage or a pixel count. A percentage was the wrong
    // instrument here for the same reason it was in thresholds.ts: the Fab's shadow is a soft
    // translucent gradient whose compositing lands a level or two apart between the two pages across
    // roughly a thousand pixels, which scored 1.18% while nothing was visibly different - and the
    // rule it replaced happily passed 464 pixels at Δ245. The count says how much of the cell moved;
    // only the delta says whether anything actually looks different. See MAX_CHANNEL_DELTA above for
    // where the number comes from.
    if (r.maxChannelDelta > MAX_CHANNEL_DELTA) {
      failures.push(
        `${id}: worst channel Δ${r.maxChannelDelta} > ${MAX_CHANNEL_DELTA} ` +
          `(${r.mismatchedPixels}px, ${r.mismatchPct.toFixed(2)}%) - the theme is leaning on Tailwind for something`,
      )
    }
  }
  expect(failures, failures.join("\n")).toEqual([])
})
