import { expect, test, type Locator, type Page } from "@playwright/test"
import { readdirSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PNG } from "pngjs"
import { captureRounded, projectDiffsDir } from "./lib/capture"
import { diffPngs } from "./lib/compare"
import { discoverPairs } from "./lib/pairs"
import { GALLERY_PAGE, PURE_PAGE, targetOf } from "./lib/themes"

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

// NOTE: this file used to carry per-pair `maxDeltaOverrides` (switch-checked at 8, badge-outline
// at 4), calibrated against an older default of 2. They are gone because MAX_CHANNEL_DELTA above
// is now 40 for the reason its own banner gives - re-tuning a floor every time the gallery grows
// is a chore, not a check - and every one of those residuals sits far below it. The measurements
// behind them live in e2e/thresholds.ts, which still judges the same artifacts on the parity side.

/**
 * Captures the MUI cell for one pair. The rounded-clip mechanics live in captureRounded; the
 * scroll here is preflight's own concern (parity centres whole rows for overlay room, which this
 * suite never needs - no preflight capture opens an overlay).
 *
 * The snap-then-round routine bites especially hard on THIS suite, which is why it must share
 * parity's exact capture: the two pages being compared lay the cell out at different x-offsets by
 * design (the gallery page has a reference column beside it; the pure page does not), so a
 * fractional-width cell lands at a different sub-pixel phase on each page and the text is REDRAWN
 * rather than merely moved. Measured on the three pairs it bites: pagination-basic 464 pixels at
 * Δ245, breadcrumb-basic 283 at Δ113, checkbox-with-label 150 at Δ224 - all of it phase, none of it
 * a Tailwind dependency.
 */
async function captureCell(page: Page, cell: Locator, id: string): Promise<Buffer> {
  await cell.scrollIntoViewIfNeeded()
  return captureRounded(page, cell, `mui cell for ${id}`)
}

test("mui renders identically with and without tailwind", async ({ page }, testInfo) => {
  const { theme, mode } = targetOf(testInfo.project.name)
  test.skip(mode === "dark", "mode covered by parity suite; preflight is mode-independent")
  await page.goto(GALLERY_PAGE[theme])
  await page.waitForLoadState("networkidle")
  const ids = (await discoverPairs(page)).map((p) => p.id)
  expect(ids.length).toBeGreaterThan(0)

  // Duration budget, NOT a correctness threshold - the same distinction parity.spec.ts records,
  // and now the same DERIVATION: this test screenshots every pair on two pages, so a flat budget
  // quietly becomes a near-miss as the gallery grows. The flat 30s default this file first rode
  // failed at 101 pairs and passed at 77, reporting as `locator.scrollIntoViewIfNeeded` on
  // whichever pair the clock ran out on - which reads exactly like a missing element, and cost a
  // real diagnostic detour chasing a `type-h2` cell that was present on both pages the whole time.
  // Measured cost is ~0.3s per pair locally (two captures); the multipliers leave ample headroom.
  const perPair = process.env.CI ? 3_000 : 1_500
  testInfo.setTimeout(Math.max(120_000, ids.length * perPair))

  const withTailwind = new Map<string, Buffer>()
  for (const id of ids) {
    const cell = page.locator(`[data-pair-id="${id}"] [data-side="mui"]`)
    withTailwind.set(id, await captureCell(page, cell, id))
  }

  // This suite's failure artifacts live beside parity's, prefixed `preflight-`. Clear only that
  // prefix before writing: parity owns the wipe of the project directory as a whole, and a
  // preflight-only run (`pnpm verify:preflight`) must not leave stale triptychs from a previous
  // failure lying next to fresh ones.
  const diffsDir = projectDiffsDir(testInfo)
  for (const stale of readdirSync(diffsDir)) {
    if (stale.startsWith("preflight-")) rmSync(path.join(diffsDir, stale), { force: true })
  }

  await page.goto(PURE_PAGE[theme])
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
      // A preflight failure used to produce a Δ number and nothing else - no image ever reached
      // the CI artifact, so diagnosing one meant re-running locally with hand-written dumps. The
      // triptych matches parity's shape: the styled-page capture, the pure-page capture, the diff.
      writeFileSync(path.join(diffsDir, `preflight-${id}-styled.png`), withTailwind.get(id)!)
      writeFileSync(path.join(diffsDir, `preflight-${id}-pure.png`), pure)
      writeFileSync(path.join(diffsDir, `preflight-${id}-diff.png`), PNG.sync.write(r.diff))
    }
  }
  expect(failures, failures.join("\n")).toEqual([])
})
