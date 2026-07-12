import { expect, test } from "@playwright/test"
import { mkdirSync, writeFileSync } from "node:fs"
import { PNG } from "pngjs"
import { diffPngs } from "./lib/compare"
import { applyState, resetState, type PairState } from "./lib/states"
import { thresholdFor } from "./thresholds"

const RESULTS_DIR = "e2e/results"
const rows: Array<{ pair: string; state: string; pct: number; threshold: number }> = []

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto("/")
  await page.waitForLoadState("networkidle")
  if (testInfo.project.name === "dark") {
    await page.getByTestId("mode-toggle").click()
    await expect(page.locator("html")).toHaveClass(/dark/)
    await page.waitForTimeout(300)
  }
})

test("all pairs match within threshold", async ({ page }, testInfo) => {
  testInfo.setTimeout(240_000)
  mkdirSync(`${RESULTS_DIR}/diffs`, { recursive: true })

  const pairIds: Array<{ id: string; states: PairState[] }> = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-pair-id]")).map((el) => ({
      id: el.getAttribute("data-pair-id")!,
      states: (el.getAttribute("data-states") ?? "default").split(",") as PairState[],
    })),
  )
  expect(pairIds.length).toBeGreaterThan(0)

  const failures: string[] = []
  for (const { id, states } of pairIds) {
    const row = page.locator(`[data-pair-id="${id}"]`)
    await row.scrollIntoViewIfNeeded()
    for (const state of states) {
      const shadcnCell = row.locator('[data-side="shadcn"]')
      const muiCell = row.locator('[data-side="mui"]')

      await applyState(page, shadcnCell, state)
      const shadcnShot = await shadcnCell.screenshot({ animations: "disabled" })
      await resetState(page)

      await applyState(page, muiCell, state)
      const muiShot = await muiCell.screenshot({ animations: "disabled" })
      await resetState(page)

      const result = diffPngs(shadcnShot, muiShot)
      const threshold = thresholdFor(id)
      rows.push({ pair: id, state, pct: result.mismatchPct, threshold })

      const slug = `${testInfo.project.name}-${id}-${state}`
      if (result.mismatchPct > threshold) {
        writeFileSync(`${RESULTS_DIR}/diffs/${slug}-shadcn.png`, shadcnShot)
        writeFileSync(`${RESULTS_DIR}/diffs/${slug}-mui.png`, muiShot)
        writeFileSync(`${RESULTS_DIR}/diffs/${slug}-diff.png`, PNG.sync.write(result.diff))
        failures.push(`${slug}: ${result.mismatchPct.toFixed(2)}% > ${threshold}%`)
      }
    }
  }

  const report = [
    `# Parity report (${testInfo.project.name})`,
    "",
    "| pair | state | mismatch % | threshold |",
    "| --- | --- | --- | --- |",
    ...rows
      .sort((a, b) => b.pct - a.pct)
      .map((r) => `| ${r.pair} | ${r.state} | ${r.pct.toFixed(2)} | ${r.threshold} |`),
  ].join("\n")
  writeFileSync(`${RESULTS_DIR}/report-${testInfo.project.name}.md`, report)
  console.log(report)

  expect(failures, failures.join("\n")).toEqual([])
})
