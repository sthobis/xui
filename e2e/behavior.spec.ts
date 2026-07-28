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

// The scrim behind a modal overlay, per side. shadcn marks its own with a data-slot; MUI's is a
// Backdrop. These are the only two side-specific selectors in the harness, and they are here rather
// than in the gallery because shadcn's DialogContent renders its overlay internally - a pair cannot
// put a marker on it.
const BACKDROP_SELECTOR = {
  shadcn: "[data-slot$='-overlay']",
  mui: ".MuiBackdrop-root:not(.MuiBackdrop-invisible)",
} as const

test.describe("backdrop-matches", () => {
  // A full-viewport translucent, blurred scrim cannot be compared by pixels: it sits over whatever
  // the page shows behind each cell, and the two cells are 240px apart, so the two captures are
  // over different content by construction (see dialog.tsx's own note). What CAN be compared is the
  // layer itself - the tint it paints, the blur it applies, and the box it covers - which is what
  // the theme actually owns.
  test("each tagged pair's scrim has the same tint, blur and box on both sides", async ({ page }) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("backdrop-matches"))
    expect(pairs.length, "no pairs tagged with the backdrop-matches behavior").toBeGreaterThan(0)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await row.scrollIntoViewIfNeeded()
      const measured: Record<string, unknown> = {}
      for (const side of ["shadcn", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        await cell.locator("[data-target]").first().click()
        const scrim = page.locator(BACKDROP_SELECTOR[side]).first()
        await expect(scrim, `${id} (${side}): no scrim appeared after opening`).toBeVisible({
          timeout: 5000,
        })
        measured[side] = await scrim.evaluate((el) => {
          const c = getComputedStyle(el)
          const r = el.getBoundingClientRect()
          return {
            backgroundColor: c.backgroundColor,
            backdropFilter: c.backdropFilter,
            isolation: c.isolation,
            box: `${Math.round(r.width)}x${Math.round(r.height)} @ ${Math.round(r.x)},${Math.round(r.y)}`,
          }
        })
        await resetState(page)
      }
      expect(
        measured.mui,
        `${id}: the MUI scrim does not match the shadcn one\n` +
          `  shadcn: ${JSON.stringify(measured.shadcn)}\n  mui:    ${JSON.stringify(measured.mui)}`,
      ).toEqual(measured.shadcn)
    }
  })
})

test.describe("no ripple", () => {
  // Not a per-pair opt-in: shadcn has no ripple anywhere, so this sweeps EVERY MUI ButtonBase in
  // the gallery at once. The pixel harness cannot cover it - a ripple only exists mid-interaction
  // and is gone by the time a frozen frame is captured - and the theme's defence is partly an
  // enumeration of components that resolve their own `disableRipple` default, which is exactly the
  // kind of list that rots as components are added.
  //
  // GOTCHA - simply counting `.MuiTouchRipple-root` in the DOM proves nothing. ButtonBase mounts
  // the ripple container lazily (`ripple.shouldMount`, flipped inside the pointer handlers), so a
  // freshly loaded page has zero of them whether or not the ripple is disabled. Every button has
  // to be pressed first. Verified to catch a regression by removing the theme's
  // `disableTouchRipple`/`focusRipple` defaults: one press then mounted a visible ripple.
  test("no MUI ButtonBase paints a ripple when pressed", async ({ page }) => {
    const bases = page.locator(".MuiButtonBase-root")
    const count = await bases.count()
    expect(count, "no MUI ButtonBase instances found in the gallery").toBeGreaterThan(0)

    const offenders: string[] = []
    for (let i = 0; i < count; i++) {
      const base = bases.nth(i)
      await base.scrollIntoViewIfNeeded()
      const box = await base.boundingBox()
      if (!box) continue // disabled/hidden instances have no box and cannot be pressed
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
      await page.mouse.down()
      const painted = await base.evaluate((el) => {
        const ripple = el.querySelector(":scope > .MuiTouchRipple-root")
        if (!ripple) return null
        return getComputedStyle(ripple).display
      })
      await page.mouse.up()
      if (painted !== null && painted !== "none") {
        const label = await base.evaluate((el) => `${el.className} :: ${el.textContent?.trim() ?? ""}`)
        offenders.push(`${label} -> ripple display: ${painted}`)
      }
    }
    await page.mouse.move(0, 0)
    expect(offenders, `these MUI components painted a ripple on press:\n${offenders.join("\n")}`).toEqual([])
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
