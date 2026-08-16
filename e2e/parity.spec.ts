import { expect, test, type Locator, type Page } from "@playwright/test"
import { rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { PNG } from "pngjs"
import { captureRounded, projectDiffsDir, resultsDir } from "./lib/capture"
import { diffPngs } from "./lib/compare"
import { discoverPairs, filterByParityPair } from "./lib/pairs"
import {
  anchoredClip,
  applyState,
  matchOverlayPhase,
  openContentLocator,
  resetState,
  type OverlayPhase,
  type PairState,
} from "./lib/states"
import { activateDark, GALLERY_PAGE, targetOf } from "./lib/themes"
import { overrideKeys, ruleFor } from "./thresholds"

/**
 * Captures the screenshot to diff for a given state, per pair/side. Three shapes:
 *  - "open": overlay content (Tooltip/Select, etc.) renders in a portal outside the cell, so
 *    capture the overlay itself instead of the (visually empty) cell. The two libraries settle an
 *    overlay on different sub-pixel fractions (Floating UI rounds to the device grid, MUI's
 *    Popover to whole CSS pixels, Base UI's item-aligned Select not at all), which changes how
 *    everything inside it rasterizes - so the reference side is captured exactly where it landed
 *    and the MUI side is moved onto that same PHASE (see matchOverlayPhase's own banner).
 *  - "anchored": same open overlay, but captured together with its trigger via a page-level clip
 *    over their union bounding box (see anchoredClip's own banner for why - this is the only
 *    capture shape that can see anchor distance/placement at all).
 *  - everything else (default/hover/focus/active): the cell itself, which is where the
 *    :active press nudge - and every other inline visual state - actually renders. Captured via
 *    captureRounded (see its banner for the sub-pixel reasoning).
 */
async function captureState(
  page: Page,
  cell: Locator,
  state: PairState,
  pairId: string,
  /** The phase the other side of this pair rasterized at, or null when this side goes first. */
  phase: OverlayPhase | null,
): Promise<{ shot: Buffer; phase: OverlayPhase | null }> {
  if (state === "anchored") {
    const clip = await anchoredClip(page, cell, pairId)
    return { shot: await page.screenshot({ animations: "disabled", clip }), phase: null }
  }
  if (state === "open") {
    const overlay = await openContentLocator(page, cell, pairId)
    const settled = await matchOverlayPhase(overlay, phase)
    return { shot: await overlay.screenshot({ animations: "disabled" }), phase: settled }
  }
  return { shot: await captureRounded(page, cell, `${pairId} (${state})`), phase: null }
}

test.beforeEach(async ({ page }, testInfo) => {
  const { theme, mode } = targetOf(testInfo.project.name)
  await page.goto(GALLERY_PAGE[theme])
  await page.waitForLoadState("networkidle")
  if (mode === "dark") await activateDark(page, theme)
})

test("all pairs match within threshold", async ({ page }, testInfo) => {
  // Which gallery this project drives. The duration budget is set further down, once the pair
  // count is known - a per-pair budget rather than the flat constant this branch carried, since
  // that is the invariant that survives the gallery growing.
  const { theme } = targetOf(testInfo.project.name)

  const allPairs = await discoverPairs(page)
  expect(allPairs.length).toBeGreaterThan(0)

  // Iteration speedup: `PARITY_PAIR=slider` (comma-separated id prefixes) restricts the run to
  // matching pairs, so a single-component check takes ~seconds instead of the whole suite. A
  // filtered run writes a separate `.filtered.md` report and leaves prior diffs in place, so it
  // never clobbers the canonical report/diffs that only a full (unfiltered) run produces.
  const { pairs: pairIds, filtered } = filterByParityPair(allPairs)
  expect(pairIds.length, `no pairs matched PARITY_PAIR=${process.env.PARITY_PAIR}`).toBeGreaterThan(0)

  // This project's OWN diffs directory. Only that one is wiped: the five projects run over the
  // same results tree, and wiping the shared parent (as this spec once did) deleted every earlier
  // project's failure evidence, so a red CI run uploaded triptychs for the last project alone.
  const diffsDir = projectDiffsDir(testInfo)
  if (!filtered) {
    rmSync(diffsDir, { recursive: true, force: true })
    projectDiffsDir(testInfo)
  }

  // ONE test walks every pair and every state, so its budget has to scale with the gallery. It used
  // to be a flat 240_000, which was generous when the suite ran in ~90s and had quietly become a
  // near-miss: at ~100 pairs a full local run takes about 230s and failed intermittently, always
  // inside resetState, which reads like a stuck overlay rather than what it is. CI made it
  // unmissable by failing outright on a slower runner.
  //
  // Deriving it from the pair count instead means adding a pair can never silently eat the margin.
  // Measured cost is ~2.3s per pair locally; the multipliers below leave roughly 2.5x headroom
  // there and more on CI, whose hosted runners have far less CPU and rasterize every capture for
  // real. The floor keeps a filtered one-component run from getting an absurdly small budget.
  const perPair = process.env.CI ? 15_000 : 6_000
  testInfo.setTimeout(Math.max(120_000, pairIds.length * perPair))

  const rows: Array<{
    pair: string
    state: string
    pct: number
    px: number
    delta: number
    rule: string
  }> = []
  const failures: string[] = []

  // The report is (re)written after EVERY pair, not once at the end. The end never comes for
  // exactly the runs the report exists to diagnose: a stuck overlay fails applyState's assertion,
  // a wedged page runs out the test budget - and AGENTS.md's own advice for a red run is to read
  // this file. Writing incrementally costs ~100 small writes and means the report always describes
  // every pair measured before things went wrong.
  const reportName = filtered
    ? `report-${testInfo.project.name}.filtered.md`
    : `report-${testInfo.project.name}.md`
  const writeReport = () => {
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
    writeFileSync(path.join(resultsDir(testInfo), reportName), report)
    return report
  }

  for (const { id, states } of pairIds) {
    try {
      const row = page.locator(`[data-pair-id="${id}"]`)
      // CENTRE the row rather than scrolling it minimally into view. `scrollIntoViewIfNeeded` stops as
      // soon as the row is visible, so a row can end up hard against the bottom of the viewport, and
      // where it lands depends on which pair ran before it - which is to say, on the order and size of
      // everything else in the gallery.
      //
      // That matters because both libraries avoid collisions: a panel with no room below gets nudged
      // up, and Radix and MUI nudge by different amounts. It made popover-open pass when its section
      // was run alone and fail in a full run, with the MUI panel 6px closer to its trigger - a
      // difference in the harness's scroll position reported as a difference between two components.
      // Centring gives every overlay the same room to open into no matter what precedes it.
      await row.evaluate((el) => el.scrollIntoView({ block: "center" }))
      for (const state of states) {
        const refCell = row.locator('[data-side="ref"]')
        const muiCell = row.locator('[data-side="mui"]')

        // The trigger is squared onto whole pixels before an overlay opens, because an overlay is
        // positioned FROM its trigger at the moment it opens - afterwards is too late, the panel's
        // position is already computed. The two positioning engines round to different grids
        // (Floating UI to the device grid, MUI's Popover to whole CSS pixels with Math.round), so
        // from a fractional trigger they round the same intention to different places.
        //
        // That snap now lives inside `applyState`, which does it for both `open` and `anchored`
        // rather than only `anchored` here - see the note there, and its measurement on kumo's
        // popover. It is not repeated in this file.
        //
        // The reference side then goes FIRST and un-nudged, and its sub-pixel phase is what the MUI
        // side is matched to - see matchOverlayPhase. The reference is the one being replicated, so
        // it is the one whose rasterization the comparison is held to.
        await applyState(page, refCell, state, id)
        const ref = await captureState(page, refCell, state, id, null)
        await resetState(page)

        await applyState(page, muiCell, state, id)
        const mui = await captureState(page, muiCell, state, id, ref.phase)
        await resetState(page)
        const refShot = ref.shot
        const muiShot = mui.shot

        const result = diffPngs(refShot, muiShot)
        // The harness canary is judged INVERTED. Its two swatches render 1/255 apart on every
        // channel (see the section's banner for why the suite carries a pair built to differ), so
        // a measured difference is the pipeline working and a ZERO is the pipeline broken - the
        // grey-wash regression this suite once shipped would have been caught here. No triptych is
        // written for it: its "failure" images would be two indistinguishable grey squares.
        if (id === "harness-canary") {
          rows.push({
            pair: id,
            state,
            pct: result.mismatchPct,
            px: result.mismatchedPixels,
            delta: result.maxChannelDelta,
            rule: "canary: must differ",
          })
          if (result.mismatchedPixels === 0) {
            failures.push(
              `harness-canary: the intentionally-different pair measured ZERO differing pixels - ` +
                `the capture/diff pipeline is no longer detecting differences, and every other green row is suspect`,
            )
          }
          continue
        }
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
          writeFileSync(path.join(diffsDir, `${slug}-ref.png`), refShot)
          writeFileSync(path.join(diffsDir, `${slug}-mui.png`), muiShot)
          writeFileSync(path.join(diffsDir, `${slug}-diff.png`), PNG.sync.write(result.diff))
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
    } catch (error) {
      // One broken pair must not take the other ~99 measurements down with it. The error becomes
      // that pair's failure entry, the page is reset so the next pair starts clean, and the loop
      // carries on. Only a failed RESET aborts the walk: an overlay that cannot be closed would
      // composite into every capture after it, turning the rest of the report into noise about an
      // unrelated component (the exact failure mode resetState's own banner documents).
      const message = error instanceof Error ? error.message.split("\n")[0] : String(error)
      failures.push(`${id}: harness error - ${message}`)
      try {
        await resetState(page)
      } catch {
        failures.push(`${id}: the page could not be reset after the error above - aborting the remaining pairs`)
        break
      }
    } finally {
      writeReport()
    }
  }

  // Exemption keys must name live pairs. maxPixelOverrides/maxDeltaOverrides entries are proofs
  // about one specific pair of implementations, and nothing else ever re-reads them against the
  // gallery: rename or remove a pair and its exemption lingers, proving nothing - or waiting to
  // hand its allowance to a future pair that reuses the id. Validated only on a full run, since a
  // filtered run legitimately sees a subset of ids.
  if (!filtered) {
    const byId = new Map(allPairs.map((p) => [p.id, p]))
    for (const key of overrideKeys(theme)) {
      const [pairId, state] = key.split(":")
      const pair = byId.get(pairId)
      if (!pair) {
        failures.push(
          `thresholds.ts: override "${key}" names no pair in the ${theme} gallery - the pair was ` +
            `renamed or removed, so the exemption now exempts nothing. Remove it, or re-point it at the live id.`,
        )
      } else if (state && !pair.states.includes(state as PairState)) {
        failures.push(
          `thresholds.ts: override "${key}" names state "${state}", which pair "${pairId}" does not declare.`,
        )
      }
    }
  }

  console.log(writeReport())

  expect(failures, failures.join("\n")).toEqual([])
})
