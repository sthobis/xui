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
 * How long a state change is given to settle before anything is measured or captured: the
 * galleries' transitions run at 150ms, so double that with margin. One named constant because the
 * same wait appears in applyState, resetState, activateDark and several behavior sweeps, and the
 * copies had already drifted - one site's comment claimed "same 300ms settle" over a literal 400.
 */
export const SETTLE_MS = 300

/**
 * Make :focus-visible match on target: insert a helper button right before it,
 * focus the helper, then Tab so focus arrives via keyboard.
 */
async function focusVisible(target: Locator): Promise<void> {
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
 * Reads a pair's opt-in overlay selector (`Pair.openSelector`, emitted by PairGrid as
 * `data-open-selector`) off its row. Absent for the overwhelming majority of pairs, which tag
 * their overlay with `data-portal-target` instead.
 */
async function openSelectorOf(page: Page, pairId: string): Promise<string | null> {
  return page.locator(`[data-pair-id="${pairId}"]`).getAttribute("data-open-selector")
}

/**
 * Locates a pair's open overlay content, regardless of whether it renders in a portal at
 * document.body (marked `[data-portal-target="<pairId>"]`) or inline inside the cell (marked
 * `[data-open-target]`). Both the reference and MUI overlays for a pair carry the same
 * `data-portal-target` value; since the harness only ever has one side's overlay open at a
 * time (open -> screenshot -> reset -> open other side), the page-root selector is unambiguous.
 *
 * A pair whose reference component gives no way to place that attribute declares an
 * `openSelector` instead (see Pair.openSelector for when and why), which is folded in here for
 * that pair only. Same one-side-at-a-time reasoning applies, so adding it cannot make the lookup
 * ambiguous: the MUI side of such a pair still matches by attribute.
 */
export async function openContentLocator(page: Page, cell: Locator, pairId: string): Promise<Locator> {
  const declared = await openSelectorOf(page, pairId)
  const portalled = page.locator(`[data-portal-target="${pairId}"]`)
  const byAttributeOrSelector = declared ? portalled.or(page.locator(declared)) : portalled
  return byAttributeOrSelector.or(cell.locator("[data-open-target]")).first()
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
    // Snap the CELL onto whole pixels BEFORE opening, so the trigger the overlay is measured
    // against sits at a deterministic position. Both positioning engines round, but to different
    // grids - Floating UI to the device grid (half a CSS pixel here), MUI's Popover to whole CSS
    // pixels with Math.round - so when the trigger sits at a fraction the two round the same
    // intention to different places. Measured on kumo's popover: an 8px gap became 8.125 on one
    // side and 7.625 on the other, and the anchored capture ghosted every glyph. From an integral
    // trigger both engines land on the same pixel. Undone by resetState's clearPixelSnap.
    await snapToPixelGrid(cell)
    await target.click()
    await expect(await openContentLocator(page, cell, pairId)).toBeVisible({ timeout: 5000 })
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
  await page.waitForTimeout(SETTLE_MS)
}

/** The sub-pixel position an overlay rasterizes at: the fractional part of its top-left corner. */
export interface OverlayPhase {
  x: number
  y: number
}

/**
 * Waits until an overlay's bounding box stops MOVING before anything measures or captures it.
 *
 * The flat SETTLE_MS wait assumed every transition in the galleries runs 150ms, and sonner broke
 * the assumption: its toast lifts in over 400ms, so at the 300ms mark the reference toast was
 * captured mid-flight - translateY(1.96) and still moving - while MUI's 225ms transition had
 * already landed. That measured as a STABLE failure (captures are deterministic at fixed timing):
 * snackbar-description read 712x148 against 712x150 with the page showing through the top rows,
 * and snackbar-message ghosted every glyph at Δ220+, identically on macOS CI, Linux CI and local
 * runs - while both toasts at REST measure 356x73.688 to the thousandth on both sides.
 *
 * Two samples of the box 150ms apart, equal to a thousandth of a pixel, mean resting: a running
 * transition cannot hold a box still for 150ms and then resume (CSS transitions are continuous),
 * and a box that IS still for 150ms has nothing left to move it. The deadline keeps a genuinely
 * animated overlay (none exists today - `animates` pairs are inline) from hanging the capture:
 * after 3s whatever is on screen is captured, and the pixel diff reports what that costs.
 */
export async function awaitRestingBox(target: Locator): Promise<void> {
  await target.evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        const t0 = performance.now()
        let last = ""
        const tick = () => {
          const r = el.getBoundingClientRect()
          const key = `${r.x.toFixed(3)},${r.y.toFixed(3)},${r.width.toFixed(3)},${r.height.toFixed(3)}`
          if (key === last || performance.now() - t0 > 3000) return resolve()
          last = key
          setTimeout(tick, 150)
        }
        tick()
      }),
  )
}

/**
 * Makes both sides of a pair rasterize at the same sub-pixel PHASE, by leaving the reference
 * overlay exactly where its own library put it and moving only the MUI one onto that phase.
 *
 * WHY A PHASE AND NOT A WHOLE PIXEL. An element whose box starts at a fraction is drawn with its
 * glyph edges, curves and hairlines resolved against that fraction, and Playwright's element
 * capture rounds the clip outward from it - so two DOM-identical overlays at different fractions
 * produce different PNGs, and sometimes different PNG sizes. The two libraries land on different
 * fractions routinely and for reasons neither is wrong about: Floating UI rounds a position to the
 * device grid (half a CSS pixel at this harness's deviceScaleFactor of 2), MUI's Popover rounds it
 * with `Math.round` to whole CSS pixels, and Base UI's item-aligned Select does not round at all.
 *
 * This used to force BOTH sides onto whole pixels, which is a stricter thing to ask and turned out
 * to be the wrong one. Every mechanism for moving an overlay damages what is inside it:
 *
 *   - a TRANSFORM promotes the overlay to its own compositing layer, where Chrome switches text
 *     from subpixel to grayscale antialiasing. Harmless while both sides need a nudge - which is
 *     why forcing whole pixels worked for so long - and ruinous the moment only one does. kumo's
 *     Select popup lays out at y=626.375 against MUI's 626.000, so only the reference side was
 *     transformed: the boxes agreed exactly and every label in the list ghosted with colour
 *     fringes, 1858 pixels at Δ232.
 *   - a MARGIN re-lays-out properly but changes the element's outer size, and Base UI and Floating
 *     UI watch an overlay with a ResizeObserver and re-run positioning when that changes. Measured
 *     on kumo's tooltip: identical rects immediately after the write, one device pixel apart by
 *     the time the capture was taken.
 *   - an OFFSET (top/left/bottom/right) re-lays-out and leaves the size alone, which is why it is
 *     what this uses - but it has to be written to the edge the library actually positioned from.
 *
 * Matching the phase asks for the minimum: when the two sides already agree - which is most pairs,
 * most of the time - NOTHING is written to either side, so the majority of overlays are now
 * captured exactly as their libraries rendered them.
 *
 * This cannot hide a placement bug, because it never claims to check placement: the `open` capture
 * frames the overlay alone, so where that overlay sits is invisible to it either way. Anchoring is
 * proved by the `anchored` capture and the `anchored-to-trigger` behavior, neither of which goes
 * through here. The shift is also always under half a pixel, so nothing about the overlay's size or
 * content can survive it unchanged.
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

export async function matchOverlayPhase(
  target: Locator,
  wanted: OverlayPhase | null,
): Promise<OverlayPhase> {
  // Freeze the enter ANIMATION before touching position - see settleOverlay. The transition kill
  // below is not a substitute for it: Radix's enter effects are CSS animations, which
  // `transition: none` does not affect at all.
  await settleOverlay(target)
  return target.evaluate((el, want: OverlayPhase | null) => {
    const node = el as HTMLElement
    // Radix's tailwindcss-animate enter/exit classes leave a *finished* CSS Transition on
    // `transform` sitting on the node; a CSS Transition outranks a plain (non-!important) inline
    // style in the cascade, and - worse - writing a property while one is still wired up makes the
    // browser animate FROM the old value TOWARD ours over the transition's duration, so a
    // synchronous re-measure right after would still observe the pre-nudge position. Kill the
    // transition first, with a forced reflow so it commits before anything else happens.
    node.style.setProperty("transition", "none", "important")
    void node.offsetWidth

    // MEASURE AFTER killing the transition, never before. An overlay caught with a transition still
    // in flight reports an interpolated position, so a delta computed from it aims at where the
    // element WAS rather than where it comes to rest. Found on sonner's toast, which still had
    // `matrix(1, 0, 0, 1, 0, 0.209426)` on it 400ms after opening.
    const fraction = (v: number) => v - Math.floor(v)
    const phaseOf = () => {
      const rect = node.getBoundingClientRect()
      return { x: fraction(rect.left), y: fraction(rect.top) }
    }
    const current = phaseOf()
    // The FIRST side of a pair is snapped onto whole CSS pixels rather than left where it landed.
    // A capture is clipped from the element's box, and Playwright expands that clip outward to
    // whole pixels - so an overlay resting on a fraction has a sliver of the PAGE in its capture,
    // and the two cells are 240px apart with different content behind them. Measured on kumo's
    // tooltip at a .5 phase: seven pixels of unrelated page content in the top row, at Δ121.
    //
    // ...EXCEPT on an axis where the library anchored the overlay's FAR edge. MUI's Snackbar and
    // sonner's toast are both fixed to the viewport's bottom, so their BOTTOM edges rest on a
    // whole pixel and their tops carry the fraction of their own height. Snapping the top is then
    // snapping the wrong edge: it moves the bottom ONTO a half pixel, and Chrome paints a
    // rounded-rect border half a pixel short of such a box - measured on snackbar-message, whose
    // bottom border landed at capture rows 104-105 against the reference's 106-107 while both
    // boxes measured 356x53.5 exactly. Left where they rest, the same captures are byte-identical.
    //
    // Which edge the library positioned from cannot be read off getComputedStyle (an auto inset
    // resolves to its used value - see below), but the two shapes tell themselves apart: Popper,
    // Floating UI and Base UI write INLINE top/left on the positioner they place, while an
    // edge-anchored overlay is positioned by its stylesheet and carries none. No inline near-inset
    // plus a whole far edge under a fractional near edge = far-edge anchored: the reference is
    // left exactly where it rests (its phase still flows to the MUI side, which matches it and
    // thereby lands its own far edge whole). Both toasts open at the SAME viewport spot, so the
    // sliver this declines to remove shows the same page pixels in both captures and cancels.
    // Find the element a nudge would be written to BEFORE deciding the target: the far-edge
    // anchoring test below needs its inline style. Move the nearest POSITIONED element, which for
    // a popup is its positioner wrapper.
    //
    // Every popup here is a statically positioned box inside an absolutely positioned one - that is
    // how Base UI, Radix and MUI's Popper all build them - and making the popup itself `relative`
    // so it could take an offset changes the containing block for everything absolutely positioned
    // INSIDE it. Its arrow is exactly that, so the popup would shift half a pixel and the arrow
    // would jump: 535 pixels at Δ241 on the shadcn tooltip. Nudging the positioner moves the popup
    // and its arrow together and re-parents nothing.
    let moved: HTMLElement = node
    while (getComputedStyle(moved).position === "static" && moved.parentElement) {
      moved = moved.parentElement
    }
    // ...and keep climbing while a PARENT still carries a transform, so the element that gets
    // rewritten is the one holding the compositing layer rather than something inside it. MUI's
    // Popper puts its translate on the popper root and the tooltip sits inside it; neutralizing the
    // tooltip alone leaves the whole subtree in its parent's layer, which is the state this is
    // trying to get out of (1202 pixels at Δ230 on kumo's tooltip in dark).
    while (moved.parentElement && getComputedStyle(moved.parentElement).transform !== "none") {
      moved = moved.parentElement
    }

    const rect = node.getBoundingClientRect()
    const farAnchored = (nearFrac: number, farEdge: number, inlineNear: string) =>
      inlineNear === "" && fraction(farEdge) === 0 && nearFrac !== 0
    const target = want ?? {
      x: farAnchored(current.x, rect.right, moved.style.left) ? current.x : 0,
      y: farAnchored(current.y, rect.bottom, moved.style.top) ? current.y : 0,
    }

    // Take the SHORTEST route to the wanted fraction, so the overlay never travels more than half a
    // pixel: matching 0.9 from 0.1 means moving back 0.2, not forward 0.8.
    const shortest = (to: number, from: number) => {
      const d = to - from
      return d > 0.5 ? d - 1 : d < -0.5 ? d + 1 : d
    }
    const dx = shortest(target.x, current.x)
    const dy = shortest(target.y, current.y)
    // An overlay already on a whole pixel is left ALONE, layer and all. Rewriting it anyway - so
    // that both sides are de-layered symmetrically - was tried and is worse: it changes nothing for
    // the kumo pairs (byte-identical numbers) and breaks shadcn's, because folding a transform away
    // is only safe on an element the harness has a reason to move. The rule stays "touch as little
    // as possible": no delta, no write.
    if (dx === 0 && dy === 0) return current

    // Then rewrite that element's position as PURE LAYOUT: fold whatever translate it carries into
    // `left`/`top` and drop the transform.
    //
    // A positioner is almost always placed with a transform - it is what Floating UI and Popper
    // both emit - and a transform makes it a compositing layer, where the subtree is rasterized in
    // layer space and then composited. Moving that layer by a fraction resamples what is already
    // drawn instead of redrawing it, which is the whole reason this function stopped using a
    // transform of its own; inheriting one from the positioner is the same mistake one level up
    // (measured on kumo's tooltip: 532 pixels at Δ216, the entire label ghosted). With the
    // translate folded into the offsets there is no layer left, and the popup rasterizes at its
    // final position the way any ordinary box does.
    //
    // The opposite edges are pinned to `auto` deliberately. getComputedStyle resolves an `auto`
    // offset on a positioned element to its USED value, so there is no way to tell from it which
    // edge the library actually anchored to - and writing `top` on something anchored by `bottom`
    // leaves both specified, which stretches a height-auto box instead of moving it. Anchoring
    // explicitly to top/left at the position it already occupies is unambiguous and cannot stretch.
    // One write is not always one landing. Chrome lays out on a 1/64px LayoutUnit grid, and on an
    // element anchored by its OPPOSITE edges - MUI's Snackbar is the one overlay fixed to
    // right/bottom - re-anchoring to left/top through getComputedStyle's used values can quantize
    // the result one unit short. Measured on snackbar-description: asked to move -0.3125, the
    // toast landed at fraction 63/64, one 1/64 shy - which at deviceScaleFactor 2 is exactly one
    // extra device row of page-behind in the capture (712x150 against the reference's 712x148),
    // and a different rasterization phase for every glyph in the message pair (2278px at Δ220+,
    // identical on every platform because the arithmetic is). The function then MEASURED the miss
    // and returned it, and nothing acted on it. So: write, re-measure, and correct with the
    // measured residual until the phase is actually hit - two writes in practice, with a bounded
    // loop so a box that genuinely will not land (none is known) cannot hang the capture.
    const applyDelta = (ddx: number, ddy: number) => {
      const s = getComputedStyle(moved)
      const t = new DOMMatrixReadOnly(s.transform === "none" ? undefined : s.transform)
      const left = parseFloat(s.left) || 0
      const top = parseFloat(s.top) || 0
      moved.style.setProperty("transform", "none", "important")
      moved.style.setProperty("left", `${left + t.e + ddx}px`, "important")
      moved.style.setProperty("right", "auto", "important")
      moved.style.setProperty("top", `${top + t.f + ddy}px`, "important")
      moved.style.setProperty("bottom", "auto", "important")
    }
    applyDelta(dx, dy)
    let achieved = phaseOf()
    for (let attempt = 0; attempt < 3; attempt++) {
      const rx = shortest(target.x, achieved.x)
      const ry = shortest(target.y, achieved.y)
      if (rx === 0 && ry === 0) break
      applyDelta(rx, ry)
      achieved = phaseOf()
    }
    return achieved
  }, wanted)
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
async function clearPixelSnap(page: Page): Promise<void> {
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
  const overlay = await openContentLocator(page, cell, pairId)
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
  // Every pair that declares an `openSelector` contributes it here too. Without that, an overlay
  // the attribute cannot reach would be invisible to this assertion, so the run would proceed with
  // it still on screen and the NEXT pair's capture would composite it - a failure that reads as a
  // colour bug in an unrelated component. Collected from the DOM so no caller has to pass it.
  const declared: string[] = await page.evaluate(() => [
    ...new Set(
      Array.from(document.querySelectorAll("[data-open-selector]"), (el) =>
        el.getAttribute("data-open-selector"),
      ).filter((s): s is string => !!s),
    ),
  ])
  await expect(page.locator([OPEN_CONTENT_SELECTOR, ...declared].join(", "))).toHaveCount(0, {
    timeout: 5000,
  })
  await page.waitForTimeout(SETTLE_MS)
}
