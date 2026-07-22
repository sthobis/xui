import { expect, test, type Locator, type Page } from "@playwright/test"
import { openContentLocator, resetState } from "./lib/states"

// Non-pixel behavior checks. The pixel harness (parity.spec.ts) only ever screenshots frozen
// frames of default/hover/focus/open/active/anchored states, so it structurally cannot see
// whether something ANIMATES over time, or whether an overlay opens/closes on the right TRIGGER
// (hover vs click) or the right KEY (Escape) - these are exactly the two remaining blind spots
// from the task brief (CircularProgress not spinning, Tooltip only opening on click). Pairs opt
// in declaratively via the gallery's own `behaviors` field (apps/showcase/src/gallery/types.ts),
// rendered as a `data-behaviors="a,b"` attribute on the pair wrapper (PairGrid.tsx) - discovered
// here the same way parity.spec.ts discovers `data-states`.

test.beforeEach(async ({ page }, testInfo) => {
  // Same convention as preflight.spec.ts: these checks (animation motion, hover/Escape trigger
  // semantics) are style-mode-independent - running them twice under both the "light" and "dark"
  // Playwright projects would just re-test the same JS behavior against the same (light) UI,
  // since dark mode is toggled by an in-app button this spec never clicks, not by the project's
  // colorScheme setting.
  test.skip(testInfo.project.name === "dark", "mode covered by parity suite; behavior checks are mode-independent")
  await page.goto("/")
  await page.waitForLoadState("networkidle")
})

type BehaviorPair = { id: string; behaviors: string[] }

async function discover(page: Page): Promise<BehaviorPair[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-pair-id]"))
      .map((el) => ({
        id: el.getAttribute("data-pair-id")!,
        behaviors: (el.getAttribute("data-behaviors") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }))
      .filter((p) => p.behaviors.length > 0),
  )
}

/**
 * Finds the element within `cell` that has a currently-RUNNING CSS animation (depth-first,
 * cell itself first) and samples a cheap signature of its rendered state (transform + opacity,
 * whichever the animation actually drives - a rotate uses transform, a pulse uses opacity) twice,
 * ~200ms apart, with real time elapsing in the browser (no `animations: "disabled"` anywhere in
 * this file - that Playwright screenshot option is what parity.spec.ts uses to FREEZE animations
 * for pixel capture; this spec needs the opposite, animations actually running). Returns both
 * samples so the caller can assert they differ - proving motion, not just a static frame.
 */
async function sampleAnimationSignature(cell: Locator): Promise<{ first: string; second: string }> {
  return cell.evaluate((root) => {
    function findAnimated(node: Element): Element | null {
      const style = getComputedStyle(node)
      if (style.animationName && style.animationName !== "none") return node
      for (const child of Array.from(node.children)) {
        const found = findAnimated(child)
        if (found) return found
      }
      return null
    }
    const el = findAnimated(root)
    if (!el) throw new Error("sampleAnimationSignature: no descendant with a running CSS animation")
    const signature = () => {
      const style = getComputedStyle(el)
      return `${style.transform}|${style.opacity}`
    }
    const first = signature()
    return new Promise<{ first: string; second: string }>((resolve) => {
      setTimeout(() => resolve({ first, second: signature() }), 200)
    })
  })
}

test.describe("animates", () => {
  test("each tagged pair's animated element changes over time on both sides", async ({ page }) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("animates"))
    expect(pairs.length, "no pairs tagged with the animates behavior").toBeGreaterThan(0)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await row.scrollIntoViewIfNeeded()
      for (const side of ["shadcn", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        const { first, second } = await sampleAnimationSignature(cell)
        expect(
          first,
          `${id} (${side}): animated element's transform/opacity did not change across a ` +
            `200ms window (sampled "${first}" twice) - it is not actually animating`,
        ).not.toEqual(second)
      }
    }
  })
})

test.describe("hover-opens", () => {
  test("each tagged pair's overlay opens on hover alone, no click", async ({ page }) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("hover-opens"))
    expect(pairs.length, "no pairs tagged with the hover-opens behavior").toBeGreaterThan(0)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await row.scrollIntoViewIfNeeded()
      for (const side of ["shadcn", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        const target = cell.locator("[data-target]").first()
        await target.hover()
        await expect(
          openContentLocator(page, cell, id),
          `${id} (${side}): overlay did not become visible on hover (no click was performed)`,
        ).toBeVisible({ timeout: 3000 })
        await resetState(page)
      }
    }
  })
})

test.describe("escape-closes", () => {
  test("each tagged pair's open overlay detaches on Escape", async ({ page }) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("escape-closes"))
    expect(pairs.length, "no pairs tagged with the escape-closes behavior").toBeGreaterThan(0)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await row.scrollIntoViewIfNeeded()
      for (const side of ["shadcn", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        const target = cell.locator("[data-target]").first()
        await target.click()
        const overlay = openContentLocator(page, cell, id)
        await expect(
          overlay,
          `${id} (${side}): overlay never opened on click, so Escape-close cannot be tested`,
        ).toBeVisible({ timeout: 5000 })

        // Blur first, matching e2e/lib/states.ts's own resetState() convention - discovered
        // live while writing this exact check: a real (trusted) click leaves the MUI trigger
        // focused, and with focus still on it, MUI's own event handling never lets the bubbling
        // Escape reach this pair's document-level close listener (tooltip.tsx/select.tsx's own
        // useControlledOpen) - confirmed shadcn's real Radix side closes fine either way, but
        // MUI's does not while its trigger holds focus. This is the reason resetState() itself
        // blurs before every Escape it sends.
        await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
        await page.keyboard.press("Escape")
        await expect(
          overlay,
          `${id} (${side}): overlay was still attached to the DOM after Escape was pressed`,
        ).toHaveCount(0, { timeout: 5000 })
        await resetState(page)
      }
    }
  })
})
