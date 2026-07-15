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

export async function resetState(page: Page): Promise<void> {
  await page.mouse.move(0, 0)
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.keyboard.press("Escape")
  await expect(page.locator(OPEN_CONTENT_SELECTOR)).toHaveCount(0, { timeout: 5000 })
  await page.waitForTimeout(300)
}
