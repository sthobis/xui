import type { Locator, Page } from "@playwright/test"

export type PairState = "default" | "hover" | "focus"

/**
 * Make :focus-visible match on target: insert a helper button right before it,
 * focus the helper, then Tab so focus arrives via keyboard.
 */
export async function focusVisible(target: Locator): Promise<void> {
  await target.evaluate((el) => {
    const helper = document.createElement("button")
    helper.id = "__focus_helper__"
    helper.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;"
    el.parentElement!.insertBefore(helper, el)
    helper.focus()
  })
  await target.page().keyboard.press("Tab")
  await target.page().evaluate(() => document.getElementById("__focus_helper__")?.remove())
}

export async function applyState(page: Page, cell: Locator, state: PairState): Promise<void> {
  const target = cell.locator("[data-target]").first()
  if (state === "hover") {
    await target.hover()
  } else if (state === "focus") {
    await focusVisible(target)
  }
  // let 150ms transitions settle
  await page.waitForTimeout(300)
}

export async function resetState(page: Page): Promise<void> {
  await page.mouse.move(0, 0)
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.waitForTimeout(300)
}
