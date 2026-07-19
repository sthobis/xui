import { expect, test } from "@playwright/test"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { PNG } from "pngjs"
import { diffPngs } from "./lib/compare"
import {
  applyState,
  normalizeOverlayPosition,
  openContentLocator,
  resetState,
  type PairState,
} from "./lib/states"
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

  // Iteration speedup: `PARITY_PAIR=slider` (comma-separated id prefixes) restricts the run to
  // matching pairs, so a single-component check takes ~seconds instead of the whole suite. A
  // filtered run writes a separate `.filtered.md` report and leaves prior diffs in place, so it
  // never clobbers the canonical report/diffs that only a full (unfiltered) run produces.
  const only = (process.env.PARITY_PAIR ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const filtered = only.length > 0

  if (!filtered) rmSync(`${RESULTS_DIR}/diffs`, { recursive: true, force: true })
  mkdirSync(`${RESULTS_DIR}/diffs`, { recursive: true })

  const allPairs: Array<{ id: string; states: PairState[] }> = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-pair-id]")).map((el) => ({
      id: el.getAttribute("data-pair-id")!,
      states: (el.getAttribute("data-states") ?? "default").split(",") as PairState[],
    })),
  )
  expect(allPairs.length).toBeGreaterThan(0)

  const pairIds = filtered
    ? allPairs.filter((p) => only.some((f) => p.id === f || p.id.startsWith(f)))
    : allPairs
  expect(pairIds.length, `no pairs matched PARITY_PAIR=${only.join(",")}`).toBeGreaterThan(0)

  const failures: string[] = []
  for (const { id, states } of pairIds) {
    const row = page.locator(`[data-pair-id="${id}"]`)
    await row.scrollIntoViewIfNeeded()
    for (const state of states) {
      const shadcnCell = row.locator('[data-side="shadcn"]')
      const muiCell = row.locator('[data-side="mui"]')

      await applyState(page, shadcnCell, state, id)
      // "open" content (Tooltip/Select, etc.) renders in a portal outside the cell - capture
      // the overlay itself instead of the (visually empty) cell.
      const shadcnTarget = state === "open" ? openContentLocator(page, shadcnCell, id) : shadcnCell
      // Portalled overlays can land at a fractional sub-pixel position (Radix/Floating UI vs
      // MUI's integer rounding) - normalize both sides to the same phase before screenshotting so
      // the diff isn't dominated by capture-clip/glyph-AA artifacts. No-op for inline states.
      if (state === "open") await normalizeOverlayPosition(shadcnTarget)
      const shadcnShot = await shadcnTarget.screenshot({ animations: "disabled" })
      await resetState(page)

      await applyState(page, muiCell, state, id)
      const muiTarget = state === "open" ? openContentLocator(page, muiCell, id) : muiCell
      if (state === "open") await normalizeOverlayPosition(muiTarget)
      const muiShot = await muiTarget.screenshot({ animations: "disabled" })
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
  const reportName = filtered
    ? `report-${testInfo.project.name}.filtered.md`
    : `report-${testInfo.project.name}.md`
  writeFileSync(`${RESULTS_DIR}/${reportName}`, report)
  console.log(report)

  expect(failures, failures.join("\n")).toEqual([])
})
