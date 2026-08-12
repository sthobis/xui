import { expect, type Locator, type Page } from "@playwright/test"

// Duplicated from apps/showcase/src/gallery/types.ts (e2e must not import app source, and
// vice versa - keep these two PairState unions in sync by hand).
export type PairState =
  | "default"
  | "hover"
  | "focus"
  | "open"
  | "active"
  | "anchored"
  | "hover-child"

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
  } else if (state === "hover-child") {
    // Hovers a NOMINATED DESCENDANT rather than the pair's own `data-target`.
    //
    // `hover` is enough while a component reacts as one box, and stops being enough the moment the
    // thing under the pointer matters: a Rating previews a value from WHICH star you are over, and
    // a SpeedDial shows the tooltip belonging to the action you are on. Pointing the existing state
    // at those children is not an option - `data-target` is also what `focus` and `active` use, and
    // what the anchored capture measures from.
    //
    // Marks every hoverable child and hovers the LAST of them, rather than nominating one.
    // Nominating was tried first and does not survive contact with MUI: a Rating renders one `icon`
    // element for all five stars, so marking "the last star" through that prop marks all five, and
    // v9 has no per-star hook to distinguish them (`IconContainerComponent` is gone, and the `icon`
    // slot's ownerState belongs to the component rather than to a star).
    //
    // Taking the last match is symmetric - both sides mark the same set - and deterministic, and it
    // is the useful end of the range anyway: hovering the last star of a Rating previews a full
    // value, which the twin can express as one rule over every star instead of a per-star ladder.
    const children = cell.locator("[data-hover-target]")
    await expect(
      children.first(),
      `applyState("hover-child"): no [data-hover-target] inside this cell`,
    ).toBeAttached({ timeout: 5000 })
    const box = await children.last().boundingBox()
    if (!box) throw new Error(`applyState("hover-child"): [data-hover-target] has no bounding box`)
    // `mouse.move` rather than `locator.hover()`, for the same reason the "active" branch below uses
    // it. `hover()` waits for the element to be the hit target, and these icons never are: MUI lays
    // a <label> over every star and shadcn's own icons take `pointer-events: none` in places, so the
    // actionability check retries until the test times out. Moving the pointer to the centre of the
    // box produces the hover the pair is testing without asking whether the icon could be clicked.
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
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
/**
 * Freezes an overlay at its RESTING appearance, so it can be measured.
 *
 * Radix's enter effects are CSS ANIMATIONS (`animate-in`, `zoom-in-95`, `fade-in-0` via
 * tailwindcss-animate), not transitions, and the two need separate handling. `transition: none`
 * does nothing to an animation, and Playwright's `animations: "disabled"` applies to the SCREENSHOT
 * only - it does not affect what `boundingBox()` returns a moment earlier. So an overlay measured
 * while its enter animation is in flight reports an interpolated box while the screenshot that
 * follows shows the settled one.
 *
 * Removing the animation is what settles it: these are enter effects that finish at the element's
 * natural style, so with the animation gone the element is already where it was heading.
 *
 * This is what made menu-open and popover-open FLAKY in the `anchored` state, and flaky is the
 * important word - two consecutive runs of the same commit reported 210 and 212 pixels tall for the
 * same panel, because the measurement was racing a 150ms zoom from 95%. It surfaced as a pair
 * "breaking" when an unrelated row was added elsewhere in the gallery, which is exactly the kind of
 * false lead that costs an afternoon: the change did not touch either component, it only moved them
 * enough to shift the timing.
 */
async function settleOverlay(target: Locator): Promise<void> {
  await target.evaluate((el) => {
    const node = el as HTMLElement
    node.style.setProperty("animation", "none", "important")
    node.style.setProperty("transition", "none", "important")
    void node.offsetWidth // force reflow so both commit before anything measures
  })
}

export async function normalizeOverlayPosition(target: Locator): Promise<void> {
  await settleOverlay(target)
  await target.evaluate((el) => {
    const node = el as HTMLElement
    // Radix's tailwindcss-animate enter/exit classes leave a *finished* CSS Transition on
    // `transform` sitting on the node; a CSS Transition outranks a plain (non-!important) inline
    // style in the cascade, and - worse - setting `transform` while one is still wired up makes
    // the browser animate FROM the old value TOWARD ours over the transition's duration, so a
    // synchronous re-measure right after setting it would still observe the pre-nudge position.
    // Kill the transition first (with a forced reflow so it actually commits before anything else)
    // and set the transform with `!important` so both the animation-cascade priority and the
    // timing race are neutralized - the nudge then takes effect instantly and synchronously.
    node.style.setProperty("transition", "none", "important")
    void node.offsetWidth // force reflow: commit transition:none before measuring or writing

    // MEASURE AFTER killing the transition, never before. An overlay caught with a transform
    // transition still in flight reports an interpolated position, so a dx/dy computed from it
    // aims at where the element WAS rather than where it comes to rest - it lands off-integer and
    // the capture clip rounds outward by an extra device pixel. Found on sonner's toast, which
    // still had `matrix(1, 0, 0, 1, 0, 0.209426)` on it 400ms after opening: normalizing moved it
    // to y=922.88 instead of 923, so its capture came out 110 device px tall against MUI's 108 and
    // every glyph ghosted (6.27% mismatch on a pair whose every computed style already matched).
    const rect = node.getBoundingClientRect()
    const dx = Math.round(rect.left) - rect.left
    const dy = Math.round(rect.top) - rect.top
    if (dx === 0 && dy === 0) return

    // Compose against the COMPUTED transform, not the inline one. Radix and MUI both write their
    // overlay transform inline, so reading `node.style.transform` happened to work for them; a
    // library that sets it from a stylesheet instead (sonner: `transform: var(--y)`) reports ""
    // there, and the nudge then REPLACED that transform rather than adding to it - silently
    // moving the element by the wrong amount. getComputedStyle returns a matrix that already
    // includes whatever the stylesheet contributed, and `matrix(...) translate(dx, dy)` adds the
    // nudge on top of it. dx/dy are measured from a rect that already reflects the base
    // transform, so adding is the correct composition.
    //
    // Caveat, unexercised today: a base transform carrying a scale/rotate applies to the appended
    // translate too, so the nudge would be scaled. Every overlay here rests at scale 1 by capture
    // time (MUI's Grow settles to `transform: none`), and this only ever shifts by a sub-pixel
    // remainder, so it cannot mask a real difference either way.
    // `transform: none` cannot be combined with a translate() in the same value list (`none` must
    // be the sole value), so treat "none"/unset the same as "no existing transform to preserve".
    const existing = getComputedStyle(node).transform
    const base = existing && existing !== "none" ? `${existing} ` : ""
    node.style.setProperty("transform", `${base}translate(${dx}px, ${dy}px)`, "important")
  })
}

/**
 * Snaps an INLINE cell's rendered top-left onto whole CSS pixels, the same measurement-only nudge
 * normalizeOverlayPosition applies to portalled overlays, for the same reason - and, it turns out,
 * against a much larger source of noise.
 *
 * The two cells of a pair sit side by side, so their absolute page positions are unrelated: the
 * shadcn cell always starts at x=252, while the MUI cell starts wherever the shadcn cell's
 * content-sized width happens to end. Measured, that lands on a fraction for any pair whose
 * content is not a whole number of pixels wide - pagination-basic at x=571.672, breadcrumb-basic
 * at 550.156, checkbox-with-label at 511.453 - so the same glyphs rasterize at a different
 * sub-pixel phase on each side. Rounding the screenshot CLIP (which captureState already did)
 * does not help: it moves the crop, not the content inside it, so the phase difference survives.
 *
 * That was the single biggest residual in the suite. pagination-basic reported 469 differing
 * pixels at a per-channel delta of 245 - a number that looks like a serious colour bug and was
 * really just every letter landing two thirds of a pixel over. Pairs that happened to line up
 * (togglegroup-basic, avatar-fallback, both at phase 0) were already clean.
 *
 * MARGIN, not transform - this matters, and a transform here was wrong.
 *
 * A fractional transform does not re-lay-out anything; it offsets a layer that has ALREADY been
 * rasterized at its old position. Text happens to survive that (Chrome re-rasterizes glyphs), but
 * borders, rounded corners and SVG strokes keep their pre-transform raster, so nudging one side and
 * not the other leaves them genuinely different. Measured directly on one cell, same element and
 * same position throughout: adding `translateX(0.328px)` changed 117 pixels at a per-channel delta
 * of 185, while `translateX(0px)`, `translateZ(0)` and `will-change: transform` all changed nothing
 * that counted - so it is the fractional offset, not layer promotion, that does the damage.
 *
 * A margin shift moves the box through layout instead, so everything inside rasterizes naturally at
 * the new position. Switching this one property took pagination-basic from 258 differing pixels at
 * delta 245 to exactly 0, checkbox-with-label from 27 to 0, and breadcrumb-basic's worst channel
 * from 47 to 0 - the transform had been masking real geometry the whole time it was "fixing" the
 * text. (For the record, the earlier belief that pagination's residual was an unreachable
 * absolute-position artifact was simply wrong: moving one cell by 1, 2, 100 and 272 whole pixels
 * with its neighbour hidden changes nothing at all.)
 *
 * Undone by resetState via `clearPixelSnap`, because unlike an overlay - which is destroyed when
 * it closes - a cell lives for the whole run, and a leftover offset would follow it into every
 * later state and measurement.
 */
export async function snapToPixelGrid(target: Locator): Promise<void> {
  await target.evaluate((el) => {
    const node = el as HTMLElement
    const rect = node.getBoundingClientRect()
    const dx = Math.round(rect.left) - rect.left
    const dy = Math.round(rect.top) - rect.top
    if (dx === 0 && dy === 0) return
    if (dx !== 0) node.style.setProperty("margin-left", `${dx}px`, "important")
    if (dy !== 0) node.style.setProperty("margin-top", `${dy}px`, "important")
    node.setAttribute("data-pixel-snapped", "")
  })
}

/** Removes every nudge snapToPixelGrid left behind. Called from resetState. */
export async function clearPixelSnap(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("[data-pixel-snapped]")) {
      ;(el as HTMLElement).style.removeProperty("margin-left")
      ;(el as HTMLElement).style.removeProperty("margin-top")
      el.removeAttribute("data-pixel-snapped")
    }
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
  // Settle BEFORE measuring. Unlike the "open" state this capture is deliberately not normalized
  // onto the pixel grid - that is what lets it see real placement errors - so it has nothing to
  // absorb a box measured mid-animation. See settleOverlay for what that cost.
  await settleOverlay(overlay)
  const [targetBox, overlayBox] = await Promise.all([target.boundingBox(), overlay.boundingBox()])
  if (!targetBox) throw new Error(`anchoredClip(${pairId}): no bounding box for [data-target]`)
  if (!overlayBox) throw new Error(`anchoredClip(${pairId}): no bounding box for open overlay`)
  const left = Math.min(targetBox.x, overlayBox.x)
  const top = Math.min(targetBox.y, overlayBox.y)
  const right = Math.max(targetBox.x + targetBox.width, overlayBox.x + overlayBox.width)
  const bottom = Math.max(targetBox.y + targetBox.height, overlayBox.y + overlayBox.height)
  // Round the ORIGIN and the SIZE independently, never the far edges. Size is a property of the two
  // components - trigger height plus gap plus panel height - so it is the same real number on both
  // sides and rounds to the same integer. A far edge is not: it carries the row's own position on
  // the page, so `bottom - Math.round(top)` mixes a rounded origin into an unrounded extent and the
  // height then depends on where the row happens to sit.
  //
  // That is how a 2px height difference appeared in a pair that had not changed - adding a row
  // higher up the gallery shifted this one's sub-pixel phase, and captures of 210 and 212 were
  // compared as though a component had moved. Rounding the size makes the capture describe the
  // components; rounding the origin keeps it on the pixel grid.
  return {
    x: Math.round(left),
    y: Math.round(top),
    width: Math.round(right - left),
    height: Math.round(bottom - top),
  }
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
  await clearPixelSnap(page)
  await page.keyboard.press("Escape")
  await expect(page.locator(OPEN_CONTENT_SELECTOR)).toHaveCount(0, { timeout: 5000 })
  await page.waitForTimeout(300)
}
