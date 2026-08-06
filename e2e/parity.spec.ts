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
  snapToPixelGrid,
  type PairState,
} from "./lib/states"
import { activateDark, GALLERY_PAGE, targetOf } from "./lib/themes"
import { ruleFor } from "./thresholds"

const RESULTS_DIR = "e2e/results"
const rows: Array<{
  pair: string
  state: string
  pct: number
  px: number
  delta: number
  rule: string
}> = []

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
    const overlay = await openContentLocator(page, cell, pairId)
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
  // Snap the cell onto whole pixels FIRST, so both sides rasterize at the same sub-pixel phase.
  // Rounding the clip below only moves the crop; it cannot fix where the content inside it landed.
  // See snapToPixelGrid's banner for the measurements that made this necessary.
  await snapToPixelGrid(cell)
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
  const { theme, mode } = targetOf(testInfo.project.name)
  await page.goto(GALLERY_PAGE[theme])
  await page.waitForLoadState("networkidle")
  if (mode === "dark") await activateDark(page, theme)
})

test("all pairs match within threshold", async ({ page }, testInfo) => {
  // Duration budget, NOT a correctness threshold. Each project drives every pair through every one
  // of its states, so the run grows with the gallery: shadcn-dark alone now takes ~3.9 minutes, and
  // at the old 240s it tipped over the moment anything else competed for the machine. Raised with
  // headroom so a slow run reports real numbers instead of a timeout.
  testInfo.setTimeout(600_000)
  const { theme } = targetOf(testInfo.project.name)

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
      // `states: []` is a legitimate declaration, not a mistake: a pair can exist to be judged by
      // e2e/behavior.spec.ts alone when the pixel harness structurally cannot compare it (kumo's
      // Select popup - see its section for the measurements). Filtering the empty string keeps that
      // from being read as one state named "".
      states: (el.getAttribute("data-states") ?? "default")
        .split(",")
        .filter(Boolean) as PairState[],
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
      const refCell = row.locator('[data-side="ref"]')
      const muiCell = row.locator('[data-side="mui"]')

      await applyState(page, refCell, state, id)
      const refShot = await captureState(page, refCell, state, id)
      await resetState(page)

      await applyState(page, muiCell, state, id)
      const muiShot = await captureState(page, muiCell, state, id)
      await resetState(page)

      const result = diffPngs(refShot, muiShot)
      // A pair with a maxDelta override is judged on the size of its worst per-channel error
      // instead of on how many pixels differ - see thresholds.ts maxDeltaOverrides. Both numbers
      // are always reported so a delta-judged pair's pixel count stays visible.
      const rule = ruleFor(theme, id, state)
      // A size difference is its own failure and is NEVER judged by a threshold. diffPngs pads the
      // smaller capture to the union with transparent pixels, so two differently-shaped captures
      // produce a percentage - and a percentage cannot distinguish "one side is a pixel taller"
      // from "a glyph rendered slightly differently". Both sides render the same component at the
      // same size in the same browser, so unequal captures always mean a real geometry difference
      // (or a capture bug); either way the number underneath is meaningless and the run should say
      // so in those terms rather than quoting a mismatch percentage.
      const { ref: sizeA, mui: sizeB } = result.sizes
      const sizeMismatch = sizeA.width !== sizeB.width || sizeA.height !== sizeB.height
      const overPixels = result.mismatchedPixels > rule.maxPixels
      const overDelta = result.maxChannelDelta > rule.maxDelta
      const failed = sizeMismatch || overPixels || overDelta
      rows.push({
        pair: id,
        state,
        pct: result.mismatchPct,
        px: result.mismatchedPixels,
        delta: result.maxChannelDelta,
        rule: rule.label,
      })

      const slug = `${testInfo.project.name}-${id}-${state}`
      // `PARITY_DUMP=1` writes the captures and diff for every pair the run touches, not just the
      // failing ones. A pair that PASSES can still differ - that is the whole point of the raw
      // pixel count in the report - and diagnosing one used to mean temporarily editing
      // thresholds.ts to force a failure, which is both fiddly and easy to commit by accident.
      if (failed || process.env.PARITY_DUMP) {
        writeFileSync(`${RESULTS_DIR}/diffs/${slug}-ref.png`, refShot)
        writeFileSync(`${RESULTS_DIR}/diffs/${slug}-mui.png`, muiShot)
        writeFileSync(`${RESULTS_DIR}/diffs/${slug}-diff.png`, PNG.sync.write(result.diff))
      }
      if (failed) {
        const detail = `${result.mismatchedPixels}px differ, worst channel Δ${result.maxChannelDelta} (${result.mismatchPct.toFixed(2)}% of the capture); rule is ${rule.label}`
        failures.push(
          sizeMismatch
            ? `${slug}: captures are different sizes - ref ${sizeA.width}x${sizeA.height}, mui ${sizeB.width}x${sizeB.height}. The two sides do not render the same geometry; the numbers below are padding noise, not a colour difference.`
            : overPixels && overDelta
              ? `${slug}: too many differing pixels AND too large a channel error - ${detail}`
              : overPixels
                ? `${slug}: too many differing pixels - ${detail}`
                : `${slug}: channel error too large - ${detail}`,
        )
      }
    }
  }

  const report = [
    `# Parity report (${testInfo.project.name})`,
    "",
    // Raw mismatched-pixel count sits next to the percentage on purpose: "0.00" is a rounded
    // number and hides the difference between an exact match and a handful of stray pixels, which
    // is exactly the resolution needed to tell a real residual from a clean pair.
    "| pair | state | mismatch % | px | max Δ | rule |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows
      .sort((a, b) => b.pct - a.pct)
      .map((r) => `| ${r.pair} | ${r.state} | ${r.pct.toFixed(2)} | ${r.px} | ${r.delta} | ${r.rule} |`),
  ].join("\n")
  const reportName = filtered
    ? `report-${testInfo.project.name}.filtered.md`
    : `report-${testInfo.project.name}.md`
  writeFileSync(`${RESULTS_DIR}/${reportName}`, report)
  console.log(report)

  expect(failures, failures.join("\n")).toEqual([])
})
