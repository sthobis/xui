import { expect, type Locator, type Page } from "@playwright/test"

// Duplicated from apps/showcase/src/gallery/types.ts (e2e must not import app source, and
// vice versa - keep these two PairState unions in sync by hand).
export type PairState = "default" | "hover" | "focus" | "open"

/** Selector matching any currently-open overlay content, portalled or in-cell. */
const OPEN_CONTENT_SELECTOR = "[data-portal-target], [data-open-target]"

/**
 * Make :focus-visible match on target: insert a helper button right before it,
 * focus the helper, then Tab so focus arrives via keyboard.
 */
export async function focusVisible(target: Locator): Promise<void> {
  try {
    await target.evaluate((el) => {
      const helper = document.createElement("button")
      helper.id = "__focus_helper__"
      helper.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;"
      el.parentElement!.insertBefore(helper, el)
      helper.focus()
    })
    await target.page().keyboard.press("Tab")
  } finally {
    await target.page().evaluate(() => document.getElementById("__focus_helper__")?.remove())
  }
}

/**
 * Locates a pair's open overlay content, regardless of whether it renders in a portal at
 * document.body (marked `[data-portal-target="<pairId>"]`) or inline inside the cell (marked
 * `[data-open-target]`). Both shadcn and MUI overlays for a pair carry the same
 * `data-portal-target` value; since the harness only ever has one side's overlay open at a
 * time (open -> screenshot -> reset -> open other side), the page-root selector is unambiguous.
 */
export function openContentLocator(page: Page, cell: Locator, pairId: string): Locator {
  return page
    .locator(`[data-portal-target="${pairId}"]`)
    .or(cell.locator("[data-open-target]"))
    .first()
}

export async function applyState(page: Page, cell: Locator, state: PairState, pairId: string): Promise<void> {
  const target = cell.locator("[data-target]").first()
  if (state === "hover") {
    await target.hover()
  } else if (state === "focus") {
    await focusVisible(target)
  } else if (state === "open") {
    await target.click()
    await expect(openContentLocator(page, cell, pairId)).toBeVisible({ timeout: 5000 })
  }
  // let 150ms transitions settle
  await page.waitForTimeout(300)
}

/**
 * Snaps a portalled overlay's rendered top-left to integer CSS pixels via a measurement-only
 * `transform: translate(...)` nudge, so Playwright's `element.screenshot()` clip (which rounds
 * outward to the nearest device pixel when the element's box starts at a fractional position)
 * lands on the exact same sub-pixel phase for both sides of a pair.
 *
 * Why this is needed: shadcn's Select overlay (Radix/Floating UI) positions its content with a
 * fractional `left`/`top` (e.g. 275.125px), while MUI's Popover always resolves to an integer
 * (e.g. 490px) - so two DOM-identical overlays get clipped to PNGs of different pixel widths and
 * different glyph sub-pixel phases, a pure capture artifact rather than a real style difference
 * (see e2e/parity.spec.ts's "open" branch and the select-open task brief for the full diagnosis).
 *
 * Only ever called on the element about to be screenshotted (never the cell, never inline
 * default/hover/focus states), and only shifts by the fractional remainder (< 1px), so it cannot
 * mask a genuine multi-pixel style difference - a real difference in size/position/color still
 * changes every pixel beyond that sub-pixel remainder and still fails the diff.
 */
export async function normalizeOverlayPosition(target: Locator): Promise<void> {
  await target.evaluate((el) => {
    const node = el as HTMLElement
    const rect = node.getBoundingClientRect()
    const dx = Math.round(rect.left) - rect.left
    const dy = Math.round(rect.top) - rect.top
    if (dx === 0 && dy === 0) return
    // Radix's tailwindcss-animate enter/exit classes leave a *finished* CSS Transition on
    // `transform` sitting on the node; a CSS Transition outranks a plain (non-!important) inline
    // style in the cascade, and - worse - setting `transform` while one is still wired up makes
    // the browser animate FROM the old value TOWARD ours over the transition's duration, so a
    // synchronous re-measure right after setting it would still observe the pre-nudge position.
    // Kill the transition first (with a forced reflow so it actually commits before the transform
    // write) and set the transform with `!important` so both the animation-cascade priority and
    // the timing race are neutralized - the nudge then takes effect instantly and synchronously.
    node.style.setProperty("transition", "none", "important")
    void node.offsetWidth // force reflow: commit transition:none before writing the transform
    // `transform: none` cannot be combined with a translate() in the same value list (`none` must
    // be the sole value), so treat "none"/unset the same as "no existing transform to preserve".
    const existing = node.style.transform
    const base = existing && existing !== "none" ? `${existing} ` : ""
    node.style.setProperty("transform", `${base}translate(${dx}px, ${dy}px)`, "important")
  })
}

export async function resetState(page: Page): Promise<void> {
  await page.mouse.move(0, 0)
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.keyboard.press("Escape")
  await expect(page.locator(OPEN_CONTENT_SELECTOR)).toHaveCount(0, { timeout: 5000 })
  await page.waitForTimeout(300)
}
