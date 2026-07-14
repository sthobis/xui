import { expect, test } from "@playwright/test"
import { diffPngs } from "./lib/compare"

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
    await cell.scrollIntoViewIfNeeded()
    withTailwind.set(id, await cell.screenshot({ animations: "disabled" }))
  }

  await page.goto("/pure.html")
  await page.waitForLoadState("networkidle")
  const failures: string[] = []
  for (const id of ids) {
    const cell = page.locator(`[data-pair-id="${id}"] [data-side="mui"]`)
    await cell.scrollIntoViewIfNeeded()
    const pure = await cell.screenshot({ animations: "disabled" })
    const r = diffPngs(withTailwind.get(id)!, pure)
    if (r.mismatchPct > 0.5) failures.push(`${id}: ${r.mismatchPct.toFixed(2)}%`)
  }
  expect(failures, failures.join("\n")).toEqual([])
})
