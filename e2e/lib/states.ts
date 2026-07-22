import { expect, type Locator, type Page } from "@playwright/test"

// Duplicated from apps/showcase/src/gallery/types.ts (e2e must not import app source, and
// vice versa - keep these two PairState unions in sync by hand).
export type PairState = "default" | "hover" | "focus" | "open" | "active" | "anchored"

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
  } else if (state === "open" || state === "anchored") {
    await target.click()
    await expect(openContentLocator(page, cell, pairId)).toBeVisible({ timeout: 5000 })
  } else if (state === "active") {
    // Press and HOLD the primary button over the target's center so the screenshot captures
    // the pressed (`:active`) state - this is what catches shadcn's press nudge
    // (active:not-aria-[haspopup]:translate-y-px), which no other state exercises. Uses
    // mouse.move + mouse.down (not target.click(), which presses and releases in one call)
    // so the button stays down until the caller screenshots and calls resetState.
    const box = await target.boundingBox()
    if (!box) throw new Error(`applyState("active"): no bounding box for [data-target] in pair`)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
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

/**
 * Computes the page-viewport rectangle that contains BOTH a pair's trigger (`[data-target]`) and
 * its currently-open overlay, for the "anchored" state's page-level clip screenshot
 * (e2e/parity.spec.ts). This is what makes anchor distance/placement provable: capturing the
 * overlay ALONE (as "open" does) throws away the trigger entirely, so a 10px vertical offset (or
 * a wrong Popper/Menu placement) between the two sides is invisible to the diff - the overlay PNG
 * looks identical either way, just shifted, and shifting doesn't change pixel content. Unioning in
 * the trigger means the relative distance between the two elements becomes part of what's
 * rasterized, so a real anchoring difference changes the union's size and/or the gap of
 * background pixels between the two shapes, and the diff sees it.
 *
 * The ORIGIN (top-left corner) only is rounded to the nearest integer CSS pixel, identically for
 * both sides (same Math.round call, no side-specific branching) - width/height are left exactly
 * as measured. This is the "normalize the union origin identically on both sides" option this
 * function's own callers were told to consider (see e2e/parity.spec.ts's captureState banner):
 * two same-content captures whose crop origin sits at two DIFFERENT fractional device-pixel
 * phases (e.g. shadcn's cell starts at x=270.125, MUI's at x=511.125 - unrelated absolute page
 * positions, since the two cells just sit side by side) force the browser to resample/interpolate
 * every pixel in the crop independently for each side, and that resampling is not guaranteed to
 * land the same way even for bit-identical content - this shows up as antialiasing "ghosting" on
 * every glyph, unrelated to any real style or position difference (confirmed live on this exact
 * pair: after fixing the actual anchoring bug, vertical alignment was provably exact - identical
 * centerY - and horizontal text alignment was within 0.125 CSS px, yet the diff still ghosted
 * every line until the origin was rounded). Rounding the origin removes that phase mismatch while
 * leaving width/height untouched, so a genuine anchor-distance difference - which changes the
 * union's SIZE, not just its origin's sub-pixel remainder - still changes the diff and still fails.
 */
export async function anchoredClip(
  page: Page,
  cell: Locator,
  pairId: string,
): Promise<{ x: number; y: number; width: number; height: number }> {
  const target = cell.locator("[data-target]").first()
  const overlay = openContentLocator(page, cell, pairId)
  const [targetBox, overlayBox] = await Promise.all([target.boundingBox(), overlay.boundingBox()])
  if (!targetBox) throw new Error(`anchoredClip(${pairId}): no bounding box for [data-target]`)
  if (!overlayBox) throw new Error(`anchoredClip(${pairId}): no bounding box for open overlay`)
  const left = Math.round(Math.min(targetBox.x, overlayBox.x))
  const top = Math.round(Math.min(targetBox.y, overlayBox.y))
  const right = Math.max(targetBox.x + targetBox.width, overlayBox.x + overlayBox.width)
  const bottom = Math.max(targetBox.y + targetBox.height, overlayBox.y + overlayBox.height)
  return { x: left, y: top, width: right - left, height: bottom - top }
}

export async function resetState(page: Page): Promise<void> {
  // Unconditional/idempotent: releases the primary button regardless of whether the state just
  // applied was "active" (or a prior failure left it pressed). Playwright's mouse.up() is a pure
  // input-protocol dispatch with no assertion against current button state (see
  // playwright-core/lib/client/input.js), so calling it when the button is already up is a safe
  // no-op - this guarantees a stuck-down mouse can never leak into later pairs/states.
  await page.mouse.up()
  await page.mouse.move(0, 0)
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
  await page.keyboard.press("Escape")
  await expect(page.locator(OPEN_CONTENT_SELECTOR)).toHaveCount(0, { timeout: 5000 })
  await page.waitForTimeout(300)
}
