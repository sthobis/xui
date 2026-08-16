import type { Locator, Page, TestInfo } from "@playwright/test"
import { mkdirSync } from "node:fs"
import path from "node:path"
import { snapToPixelGrid } from "./states"

/**
 * Captures a cell via a page-level clip with ROUNDED integer bounds rather than an element
 * screenshot. This is the one capture routine for inline (non-overlay) cells, shared by parity and
 * preflight - the rounding rule is load-bearing and used to exist in two hand-synced copies.
 *
 * Why not an element screenshot: it clips at the element's own fractional device-pixel span, so
 * two cells of byte-identical CSS width capture to DIFFERENT PNG sizes purely from sub-pixel
 * phase - measured: pagination-basic is 319.6719px wide on both sides, but shadcn sits at x=202
 * (integer) and MUI at x=521.672 (fractional), yielding 640px vs 642px captures. diffPngs then
 * zero-pads to the union and counts real pixels against transparent padding (0.66% of a pair whose
 * every computed style matched). Rounding both origin and size makes the capture deterministic and
 * phase-consistent, the same reasoning anchoredClip uses, without mutating the DOM. A genuine size
 * difference still shows: the rounded sizes would differ too.
 *
 * The cell is snapped onto whole pixels FIRST, so both sides rasterize at the same sub-pixel
 * phase - rounding the clip below only moves the crop; it cannot fix where the content inside it
 * landed. See snapToPixelGrid's banner for the measurements that made this necessary.
 */
export async function captureRounded(page: Page, cell: Locator, label: string): Promise<Buffer> {
  await snapToPixelGrid(cell)
  const box = await cell.boundingBox()
  if (!box) throw new Error(`cell for ${label} has no bounding box`)
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

/**
 * `e2e/results`, resolved from the Playwright config's own directory rather than from
 * `process.cwd()`. The old bare relative path made every report and diff write silently depend on
 * the run starting at the repo root - `pnpm -C e2e exec playwright test` would have scattered them
 * somewhere else or thrown ENOENT mid-run.
 */
export function resultsDir(testInfo: TestInfo): string {
  const configDir = testInfo.config.configFile
    ? path.dirname(testInfo.config.configFile)
    : process.cwd()
  return path.join(configDir, "e2e", "results")
}

/**
 * The diff-triptych directory for ONE project, created on demand.
 *
 * Per project, because the five projects used to share a single flat `diffs/` that each project
 * WIPED at the start of its run - so a full run kept only the last project's failure evidence, and
 * the CI artifact shipped without the triptychs for everything before it. A project may only ever
 * wipe its own subdirectory.
 */
export function projectDiffsDir(testInfo: TestInfo): string {
  const dir = path.join(resultsDir(testInfo), "diffs", testInfo.project.name)
  mkdirSync(dir, { recursive: true })
  return dir
}
