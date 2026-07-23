import { expect, test, type Locator, type Page } from "@playwright/test"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { PNG } from "pngjs"
import { diffPngs } from "./lib/compare"
import {
  anchoredClip,
  applyState,
  normalizeOverlayPosition,
  openContentLocator,
  resetState,
  type PairState,
} from "./lib/states"
import { thresholdFor } from "./thresholds"

const RESULTS_DIR = "e2e/results"
const rows: Array<{ pair: string; state: string; pct: number; threshold: number }> = []

/**
 * Captures the screenshot to diff for a given state, per pair/side. Three shapes:
 *  - "open": overlay content (Tooltip/Select, etc.) renders in a portal outside the cell, so
 *    capture the overlay itself instead of the (visually empty) cell. Portalled overlays can
 *    land at a fractional sub-pixel position (Radix/Floating UI vs MUI's integer rounding) -
 *    normalize both sides to the same phase first so the diff isn't dominated by capture-clip/
 *    glyph-AA artifacts (see normalizeOverlayPosition's own banner).
 *  - "anchored": same open overlay, but captured together with its trigger via a page-level clip
 *    over their union bounding box (see anchoredClip's own banner for why - this is the only
 *    capture shape that can see anchor distance/placement at all).
 *  - everything else (default/hover/focus/active): the cell itself, which is where the
 *    :active press nudge - and every other inline visual state - actually renders.
 */
async function captureState(page: Page, cell: Locator, state: PairState, pairId: string): Promise<Buffer> {
  if (state === "anchored") {
    const clip = await anchoredClip(page, cell, pairId)
    return page.screenshot({ animations: "disabled", clip })
  }
  if (state === "open") {
    const overlay = openContentLocator(page, cell, pairId)
    await normalizeOverlayPosition(overlay)
    return overlay.screenshot({ animations: "disabled" })
  }
  // Inline states capture the cell via a page-level clip with ROUNDED integer bounds rather than
  // an element screenshot. Element screenshots clip at the element's own fractional device-pixel
  // span, so two cells of byte-identical CSS width capture to DIFFERENT PNG sizes purely from
  // sub-pixel phase - measured: pagination-basic is 319.6719px wide on both sides, but shadcn sits
  // at x=202 (integer) and MUI at x=521.672 (fractional), yielding 640px vs 642px. diffPngs then
  // zero-pads to the union and counts real pixels against transparent padding (0.66% of a pair
  // whose every computed style matched). Rounding both origin and size makes the capture
  // deterministic and phase-consistent, the same reasoning anchoredClip already uses, without
  // mutating the DOM. A genuine size difference still shows: the rounded sizes would differ too.
  const box = await cell.boundingBox()
  if (!box) throw new Error(`cell for ${pairId} (${state}) has no bounding box`)
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
      const shadcnShot = await captureState(page, shadcnCell, state, id)
      await resetState(page)

      await applyState(page, muiCell, state, id)
      const muiShot = await captureState(page, muiCell, state, id)
      await resetState(page)

      const result = diffPngs(shadcnShot, muiShot)
      const threshold = thresholdFor(id, state)
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
