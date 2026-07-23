import { expect, test, type Locator, type Page } from "@playwright/test"
import { diffPngs } from "./lib/compare"

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
    if (r.mismatchPct > 0.5) failures.push(`${id}: ${r.mismatchPct.toFixed(2)}%`)
  }
  expect(failures, failures.join("\n")).toEqual([])
})
