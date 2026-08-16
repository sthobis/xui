import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test"
import { discoverPairs, filterByParityPair, parityFilterActive, type DiscoveredPair } from "./lib/pairs"
import { openContentLocator, resetState, SETTLE_MS } from "./lib/states"
import { GALLERY_PAGE, targetOf, type ThemeName } from "./lib/themes"

/**
 * Settle for an overlay OPEN transition before its box or paint is read. SETTLE_MS plus margin:
 * both libraries open with a scale/opacity transition, and a box measured while one is running is
 * the INTERPOLATED box - a 144px panel reports 108px a frame in. The margin exists because these
 * sweeps read geometry and computed style rather than pixels, so a last-frame straggler that the
 * pixel harness would absorb shows up here as a hard numeric mismatch.
 */
const OVERLAY_SETTLE_MS = SETTLE_MS + 100

/** Settle for a pointer-hover restyle - no box is measured, only a computed colour. */
const HOVER_SETTLE_MS = 200

/**
 * Every sweep's duration budget derives from the number of pairs it walks, floored for tiny
 * filtered runs - the same invariant parity.spec.ts derives, for the same reason: a flat budget
 * quietly becomes a near-miss as the gallery grows, and this file's flat 120s editable-control
 * budget was the last one left. CI multiplies the per-pair cost the same way parity's does.
 */
function sweepBudget(testInfo: TestInfo, count: number, perPairMs: number): void {
  const factor = process.env.CI ? 2.5 : 1
  testInfo.setTimeout(Math.max(90_000, Math.ceil(count * perPairMs * factor)))
}

/**
 * CENTRE a row before opening anything from it, exactly as parity.spec.ts does and for the
 * documented reason: `scrollIntoViewIfNeeded` can leave a row hard against the viewport's bottom
 * edge, where both libraries' collision avoidance nudges a panel up - by DIFFERENT amounts - so a
 * measurement changes with the scroll position of whatever ran before it. Sweeps that open no
 * overlay keep the cheaper minimal scroll.
 */
async function centreRow(row: Locator): Promise<void> {
  await row.evaluate((el) => el.scrollIntoView({ block: "center" }))
}

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
  // semantics) are style-mode-independent - running them twice under both the light and dark
  // Playwright projects would just re-test the same JS behavior against the same (light) UI,
  // since dark mode is toggled by an in-app button this spec never clicks, not by the project's
  // colorScheme setting. The THEME half of the project name does matter, though: each theme has
  // its own gallery page with its own pairs.
  const { theme, mode } = targetOf(testInfo.project.name)
  test.skip(mode === "dark", "mode covered by parity suite; behavior checks are mode-independent")
  await page.goto(GALLERY_PAGE[theme])
  await page.waitForLoadState("networkidle")
})

/**
 * Each of these checks is opt-in per pair, so a gallery that has not yet grown a component of that
 * shape has nothing to exercise - the kumo gallery has no portalled overlay and no editable control
 * until its Tier 2 components land. That is a legitimately empty sweep, not a failure.
 *
 * The guard these calls replaced (`expect(count).toBeGreaterThan(0)`) existed to stop a test
 * quietly proving nothing, and that is still worth having: skipping is REPORTED by Playwright,
 * where a silent pass would not be, and the shadcn project still runs every one of them for real.
 */
function skipIfNothingToCheck(count: number, what: string) {
  const { theme } = targetOf(test.info().project.name)
  test.skip(count === 0, `the ${theme} gallery has no ${what} pairs yet`)
}

/** Pairs that opted into at least one behavior, honouring the PARITY_PAIR iteration filter. */
async function discover(page: Page): Promise<DiscoveredPair[]> {
  const { pairs } = filterByParityPair(await discoverPairs(page))
  return pairs.filter((p) => p.behaviors.length > 0)
}

/** Every pair id in the gallery, honouring the PARITY_PAIR iteration filter - for the full sweeps. */
async function allPairIds(page: Page): Promise<string[]> {
  const { pairs } = filterByParityPair(await discoverPairs(page))
  return pairs.map((p) => p.id)
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

test.describe("declared behaviors", () => {
  // The authoring side (`PairBehavior` in gallery/types.ts) is a typed union, but this file matches
  // its members as bare strings - so adding a member to the union and tagging pairs with it
  // typechecks perfectly while exercising nothing, the exact "check that quietly proves nothing"
  // failure skipIfNothingToCheck's banner describes. This is the bridge: every behavior string the
  // gallery actually declares must be one this file implements. Keep the list in sync with the
  // describe blocks below (the sweeps that discover per-pair, not the page-wide ripple/input/
  // metrics/geometry sweeps, which no pair opts into).
  const IMPLEMENTED = [
    "animates",
    "overlay-matches",
    "anchored-to-trigger",
    "item-hover-highlights",
    "hover-opens",
    "escape-closes",
    "filters-on-type",
  ] as const
  test("every behavior the gallery declares has a sweep in this file", async ({ page }) => {
    // Deliberately UNFILTERED: the guard is about the gallery/spec contract as a whole, not about
    // whichever pairs a PARITY_PAIR iteration happens to select.
    const declared = [...new Set((await discoverPairs(page)).flatMap((p) => p.behaviors))]
    const unimplemented = declared.filter((b) => !(IMPLEMENTED as readonly string[]).includes(b))
    expect(
      unimplemented,
      `these data-behaviors values have no sweep in behavior.spec.ts, so declaring them proves ` +
        `nothing: ${unimplemented.join(", ")} - implement the sweep or remove the tag`,
    ).toEqual([])
  })
})

test.describe("animates", () => {
  test("each tagged pair's animated element changes over time on both sides", async ({ page }, testInfo) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("animates"))
    skipIfNothingToCheck(pairs.length, "animates")
    sweepBudget(testInfo, pairs.length, 2_500)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await row.scrollIntoViewIfNeeded()
      for (const side of ["ref", "mui"] as const) {
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

/**
 * Drops fully transparent layers from a computed `box-shadow` before comparing two of them.
 *
 * Tailwind builds its shadow utilities out of stacked custom properties, so anything using one
 * carries placeholder layers for the slots it does NOT use - shadcn's dialog panel computes to four
 * `rgba(0, 0, 0, 0) 0px 0px 0px 0px` entries around its single real ring. A zero-alpha layer paints
 * nothing, so keeping them would fail the comparison on strings that render identically. Splitting
 * respects parentheses, since every colour function in these values contains commas of its own.
 */
function significantShadowLayers(boxShadow: string): string[] {
  const layers: string[] = []
  let depth = 0
  let current = ""
  for (const ch of boxShadow) {
    if (ch === "(") depth++
    if (ch === ")") depth--
    if (ch === "," && depth === 0) {
      layers.push(current.trim())
      current = ""
      continue
    }
    current += ch
  }
  layers.push(current.trim())
  return layers.filter((layer) => layer !== "none" && !/(,\s*0\s*\)|\/\s*0\s*\))/.test(layer))
}

/**
 * Rewrites every colour inside a measured value to its sRGB bytes, so two spellings of the SAME
 * colour compare equal.
 *
 * Needed because getComputedStyle preserves the colour space a value was authored in, and the two
 * sides of a pair reach the same colour by different routes. Kumo's tooltip shadow is
 * `shadow-kumo-tip-shadow`, and Tailwind pipes every shadow colour through its own alpha
 * `color-mix(in oklab, ...)`, so Chrome reports `oklab(0.928 -0.000571842 -0.00597269)`; the theme
 * names the token directly and Chrome reports `oklch(0.928 0.006 264.531)`. Those are one colour -
 * the pixel harness renders the pair at exactly zero differing pixels - and a string comparison
 * that failed on them would be reporting Tailwind's internal plumbing as a theme bug.
 *
 * Canvas is the canonicaliser rather than a parser: assigning to `fillStyle` keeps the authored
 * space (measured - it returns the oklab and oklch spellings unchanged), but actually PAINTING the
 * colour and reading the pixel back gives the sRGB bytes the screen would show. Colours are located
 * by scanning for a colour function and matching balanced parentheses, since `color-mix(...)` nests
 * and a regex cannot.
 */
async function inSrgb<T>(page: Page, value: T): Promise<T> {
  return page.evaluate((input) => {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!
    const SENTINEL = "#010203"
    const toSrgb = (colour: string): string => {
      ctx.fillStyle = SENTINEL
      ctx.fillStyle = colour
      // fillStyle silently ignores a value it cannot parse, so an unchanged sentinel means "not a
      // colour I can resolve" - leave it exactly as measured rather than reporting it as black.
      if (ctx.fillStyle === SENTINEL && colour !== SENTINEL) return colour
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillRect(0, 0, 1, 1)
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
      return `srgb(${r} ${g} ${b} / ${a})`
    }
    const COLOUR_FN = /\b(?:color-mix|oklab|oklch|lab|lch|hwb|color|rgba?|hsla?)\(/g
    const canon = (s: string): string => {
      let out = ""
      let i = 0
      for (;;) {
        COLOUR_FN.lastIndex = i
        const match = COLOUR_FN.exec(s)
        if (!match) return out + s.slice(i)
        let depth = 0
        let j = match.index + match[0].length - 1
        for (; j < s.length; j++) {
          if (s[j] === "(") depth++
          else if (s[j] === ")" && --depth === 0) {
            j++
            break
          }
        }
        out += s.slice(i, match.index) + toSrgb(s.slice(match.index, j))
        i = j
      }
    }
    const walk = (v: unknown): unknown => {
      if (typeof v === "string") return canon(v)
      if (Array.isArray(v)) return v.map(walk)
      if (v && typeof v === "object") {
        return Object.fromEntries(Object.entries(v).map(([k, entry]) => [k, walk(entry)]))
      }
      return v
    }
    return walk(input)
  }, value) as Promise<T>
}

// The scrim behind a MODAL overlay, per theme and per side. MUI's is always a Backdrop; the
// reference selector belongs to the design system under test, because a scrim is rendered by the
// reference component internally and a pair has nowhere to put a marker on it (shadcn's
// DialogContent uses a data-slot; kumo's modals are Base UI, whose backdrop carries its own
// data attribute). These are the only side-specific selectors in the harness.
//
// A pair whose overlay is NOT modal - a tooltip, a popover - simply has no scrim on either side,
// which is a legitimate shape rather than a failure: see the test below for how that is handled
// without weakening the check for the pairs that do have one.
const BACKDROP_SELECTOR: Record<ThemeName, { ref: string; mui: string }> = {
  shadcn: { ref: "[data-slot$='-overlay']", mui: ".MuiBackdrop-root:not(.MuiBackdrop-invisible)" },
  // Base UI gives its backdrop no attribute of its own, so kumo's is identified structurally: the
  // one presentation box that is both OPEN and hidden from assistive tech. Base UI's internal inert
  // layer shares the role but carries no `data-open`, and a Select positioner carries `data-open`
  // but is not aria-hidden.
  kumo: {
    ref: '[role="presentation"][data-open][aria-hidden="true"]',
    mui: ".MuiBackdrop-root:not(.MuiBackdrop-invisible)",
  },
  // blink is the one theme whose two sides agree here, and not by coincidence: the Pulse Kit
  // builds its own Dialog on MUI's, so the reference scrim IS a MuiBackdrop. The check still has
  // teeth - it compares the two scrims' computed paint, and the kit styles its dialog through a
  // CSS module while the theme has to reproduce that from the MuiBackdrop slot.
  blink: {
    ref: ".MuiBackdrop-root:not(.MuiBackdrop-invisible)",
    mui: ".MuiBackdrop-root:not(.MuiBackdrop-invisible)",
  },
}

test.describe("overlay-matches", () => {
  // Covers the things an open overlay paints that the pixel harness structurally cannot reach.
  //
  // The scrim, because it is a full-viewport translucent, blurred layer sitting over whatever the
  // page shows behind each cell - and the two cells are 240px apart, so any framing compares
  // different content (see dialog.tsx's own note).
  //
  // The panel's OUTER decoration, because the open state screenshots the panel element, and an
  // element capture clips at its border box: a drop shadow, a ring or an OUTLINE falls outside it
  // and is simply not in the picture. Sabotaging the drawer's shadow left the pair at 0.00% before
  // this, and kumo's tooltip is decorated entirely by an outline and a shadow-lg - neither of which
  // any capture of that pair contains.
  test("each tagged pair's scrim and panel chrome match on both sides", async ({ page }, testInfo) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("overlay-matches"))
    skipIfNothingToCheck(pairs.length, "overlay-matches")
    sweepBudget(testInfo, pairs.length, 5_000)
    const { theme } = targetOf(testInfo.project.name)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await centreRow(row)
      const measured: Record<string, unknown> = {}
      for (const side of ["ref", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        await cell.locator("[data-target]").first().click()
        const panel = await openContentLocator(page, cell, id)
        await expect(panel, `${id} (${side}): no panel appeared after opening`).toBeVisible({
          timeout: 5000,
        })
        // Let the open transition finish before reading anything. Now that element opacity is
        // folded into the scrim's colour, a measurement taken mid-fade reports whatever alpha the
        // animation happened to be at - shadcn's overlay read back at 2/255 on one side and 0 on
        // the other, purely from being sampled a frame apart.
        await page.waitForTimeout(OVERLAY_SETTLE_MS)
        // The scrim is measured only if this overlay HAS one. A missing scrim is not asserted away
        // here, it is folded into the comparison as `null` - so a non-modal pair (tooltip, popover)
        // compares null against null and passes, while a modal pair that loses its scrim on one
        // side only compares an object against null and still fails, with both values printed.
        const scrim = page.locator(BACKDROP_SELECTOR[theme][side]).first()
        measured[side] = await inSrgb(page, {
          scrim: (await scrim.count())
            ? await scrim.evaluate((el) => {
                const c = getComputedStyle(el)
                const r = el.getBoundingClientRect()
                return {
                  // Element opacity is folded INTO the colour, because the two sides express the
                  // same translucent layer differently and both spellings paint the same thing.
                  // kumo writes `bg-kumo-recessed opacity-80`; the theme has to carry the alpha in
                  // the colour, since MUI mounts every Backdrop inside a Fade that writes
                  // `opacity: 1` inline once the transition ends and outranks any rule.
                  backgroundColor:
                    c.opacity === "1"
                      ? c.backgroundColor
                      : `color-mix(in srgb, ${c.backgroundColor} ${parseFloat(c.opacity) * 100}%, transparent)`,
                  backdropFilter: c.backdropFilter,
                  isolation: c.isolation,
                  box: `${Math.round(r.width)}x${Math.round(r.height)} @ ${Math.round(r.x)},${Math.round(r.y)}`,
                }
              })
            : null,
          panel: await panel
            .evaluate((root) => {
              // An outline (or border) with no style, or zero width, paints NOTHING - and its
              // colour and width are then whatever each library happens to leave lying around.
              // Comparing those would fail two overlays that look identical: shadcn's dialog panel
              // reports a 3px translucent grey `none` outline on one side and a 0px black `none`
              // outline on the other, and neither draws a single pixel. Collapse both to "none" so
              // the check only ever compares decoration that actually paints.
              const drawn = (style: string, width: string, value: string) =>
                style === "none" || parseFloat(width) === 0 ? "none" : value
              // The chrome is measured on the first element that PAINTS anything, not necessarily
              // on the element the overlay is located by. The located element is the OUTERMOST
              // portalled box, which the pixel captures need (it is what phase-matching moves, and
              // for a tooltip it is what frames the arrow) - but it can be a bare positioning
              // wrapper: MUI's Tooltip carries data-portal-target on its Popper, whose
              // border-radius resolves to 0px while the bubble inside it rounds at 8px, and
              // comparing wrapper against bubble failed two overlays that paint identically. The
              // same "only what paints" principle as `drawn`, applied to picking the element.
              const paints = (el: Element): boolean => {
                const s = getComputedStyle(el)
                const bg = s.backgroundColor === "transparent" || /^rgba\(\d+, \d+, \d+, 0\)$/.test(s.backgroundColor)
                return (
                  !bg ||
                  s.backgroundImage !== "none" ||
                  s.boxShadow !== "none" ||
                  drawn(s.borderStyle, s.borderWidth, "b") !== "none" ||
                  drawn(s.outlineStyle, s.outlineWidth, "o") !== "none"
                )
              }
              const firstPainting = (el: Element): Element | null => {
                if (paints(el)) return el
                for (const child of Array.from(el.children)) {
                  const found = firstPainting(child)
                  if (found) return found
                }
                return null
              }
              const c = getComputedStyle(firstPainting(root) ?? root)
              return {
                boxShadow: c.boxShadow,
                border: drawn(c.borderStyle, c.borderWidth, c.border),
                borderRadius: c.borderRadius,
                // Kumo draws the tooltip and popover edge with an OUTLINE, which sits outside the
                // border box and therefore outside every capture of the pair. Its offset is part of
                // it: kumo pulls the tooltip's outline inward in dark mode only.
                outline: drawn(c.outlineStyle, c.outlineWidth, c.outline),
                outlineOffset: drawn(c.outlineStyle, c.outlineWidth, c.outlineOffset),
              }
            })
            .then((p) => ({ ...p, boxShadow: significantShadowLayers(p.boxShadow) })),
        })
        await resetState(page)
      }
      expect(
        measured.mui,
        `${id}: the MUI overlay does not match the reference one\n` +
          `  ref: ${JSON.stringify(measured.ref)}\n  mui:    ${JSON.stringify(measured.mui)}`,
      ).toEqual(measured.ref)
    }
  })
})

test.describe("anchored-to-trigger", () => {
  // The numeric equivalent of the "anchored" pixel state: it proves an overlay opens on the same
  // side of its trigger, at the same distance, at the same size - without putting the trigger in
  // the picture.
  //
  // That distinction is what this exists for. The "anchored" capture frames the trigger and the
  // overlay together, so it also compares the TRIGGER, and for some pairs the trigger legitimately
  // looks different while the overlay is open: the harness opens an overlay by clicking, which
  // leaves the pointer on the trigger, and MUI renders Menu/Select/Popover inside a Modal whose
  // invisible backdrop covers the trigger and suppresses its `:hover`, while Base UI deliberately
  // keeps a menu trigger live so a second click closes the menu. Measured on kumo's dropdown: the
  // panels matched exactly and the pair still reported 12478 differing pixels, every one of them
  // the trigger's own hover fill. No theme can reconcile that - it is Modal versus non-modal
  // behavior - so those pairs prove placement here and leave the trigger to its own pairs.
  //
  // Distances are relative to the trigger, because the two cells sit at unrelated absolute
  // positions. Sub-pixel differences survive: this catches the half-pixel divergence between
  // Popper's rounding and Floating UI's that the pixel diff needs a capture to see.
  test("each tagged pair's overlay opens at the same offset from its trigger", async ({ page }, testInfo) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("anchored-to-trigger"))
    skipIfNothingToCheck(pairs.length, "anchored-to-trigger")
    sweepBudget(testInfo, pairs.length, 5_000)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      // Centred, not minimally scrolled - this sweep asserts gapBelow/gapAbove to half a pixel, so
      // it is MORE sensitive to collision-avoidance nudging than the pixel capture it mirrors.
      await centreRow(row)
      const measured: Record<string, unknown> = {}
      for (const side of ["ref", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        const trigger = cell.locator("[data-target]").first()
        await trigger.click()
        const overlay = await openContentLocator(page, cell, id)
        await expect(overlay, `${id} (${side}): no overlay appeared after opening`).toBeVisible({
          timeout: 5000,
        })
        // A box measured mid-transition is the interpolated box - see OVERLAY_SETTLE_MS's banner.
        await page.waitForTimeout(OVERLAY_SETTLE_MS)
        const [triggerBox, overlayBox] = await Promise.all([trigger.boundingBox(), overlay.boundingBox()])
        if (!triggerBox || !overlayBox) throw new Error(`${id} (${side}): missing bounding box`)
        const round = (n: number) => Math.round(n * 1000) / 1000
        measured[side] = {
          size: `${round(overlayBox.width)}x${round(overlayBox.height)}`,
          fromTriggerLeft: round(overlayBox.x - triggerBox.x),
          fromTriggerTop: round(overlayBox.y - triggerBox.y),
          // The gap on the side the overlay actually opens on, stated as its own number so a
          // failure reads as "8px became 4px" rather than as a pair of coordinates.
          gapBelow: round(overlayBox.y - (triggerBox.y + triggerBox.height)),
          gapAbove: round(triggerBox.y - (overlayBox.y + overlayBox.height)),
        }
        await resetState(page)
      }
      const ref = measured.ref as Record<string, string | number>
      const mui = measured.mui as Record<string, string | number>
      const context =
        `\n  ref: ${JSON.stringify(measured.ref)}\n  mui:    ${JSON.stringify(measured.mui)}`
      // Size is compared exactly - two overlays of different sizes are a real difference, and
      // nothing rounds a box's dimensions.
      expect(mui.size, `${id}: the two overlays are different sizes${context}`).toBe(ref.size)
      // Offsets are compared to within half a pixel, and that is the tightest this check can
      // honestly be: MUI's Popover rounds every overlay position with Math.round, so a whole CSS
      // pixel is the finest placement it can express, and any target is met to within half of one.
      // Measured on kumo's Select, whose popup Base UI places at an unrounded -70.5 from its
      // trigger where MUI can only manage -70.875. A real placement error - the wrong side, a
      // missing gap, an overlap - moves whole pixels and still fails here, and sub-pixel placement
      // is what the pixel states see for the pairs that can use them.
      for (const key of ["fromTriggerLeft", "fromTriggerTop", "gapBelow", "gapAbove"] as const) {
        expect(mui[key] as number, `${id}: ${key} differs by more than a pixel's rounding${context}`).toBeCloseTo(
          ref[key] as number,
          0,
        )
      }
    }
  })
})

test.describe("item-hover-highlights", () => {
  // Hovering an item inside an open overlay is invisible to the pixel harness: its "open" state
  // parks the mouse on the trigger and screenshots the panel, so no item is ever under the pointer.
  // That let the themed menus ship with NO hover feedback at all - the class lists have no `hover:`
  // rule, so hover had been neutralized, missing that Radix focuses the item under the pointer on
  // pointermove and `focus:bg-accent` is what paints. This compares the hovered item's own
  // background across the two sides, which is the thing that differed.
  test("each tagged pair's overlay items highlight the same way on hover", async ({ page }, testInfo) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("item-hover-highlights"))
    skipIfNothingToCheck(pairs.length, "item-hover-highlights")
    sweepBudget(testInfo, pairs.length, 5_000)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await centreRow(row)
      const measured: Record<string, string> = {}
      for (const side of ["ref", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        await cell.locator("[data-target]").first().click()
        const overlay = await openContentLocator(page, cell, id)
        await expect(overlay).toBeVisible({ timeout: 5000 })
        // The LAST item, so the result cannot be confused with whatever the overlay autofocuses.
        const item = overlay.locator("[role='menuitem'], [role='option']").last()
        await item.hover()
        await page.waitForTimeout(HOVER_SETTLE_MS)
        measured[side] = await item.evaluate((el) => getComputedStyle(el).backgroundColor)
        await resetState(page)
      }
      expect(
        measured.mui,
        `${id}: hovering an item paints a different background on the two sides\n` +
          `  ref: ${measured.ref}\n  mui:    ${measured.mui}`,
      ).toBe(measured.ref)
      expect(
        measured.ref,
        `${id}: hovering an item paints nothing on either side - the check proves nothing`,
      ).not.toBe("rgba(0, 0, 0, 0)")
    }
  })
})

test.describe("accepts input", () => {
  // Swept rather than opted into per pair, like the ripple check: a control that renders perfectly
  // and ignores the keyboard is invisible to the pixel harness, and the gallery's own wiring has
  // been the weak point twice - the tabs pair held a controlled value with no change handler, and
  // the autocomplete pair was pinned read-only on both sides. Both looked right in every capture.
  //
  // Anything genuinely disabled is skipped, since that IS the intended behavior. Everything else
  // must take a keystroke on BOTH sides, which also catches one side being read-only while the
  // other is not.
  test("every editable control in the gallery takes a keystroke on both sides", async ({ page }, testInfo) => {
    // Excludes the inputs that are not user-facing text controls. The aria-hidden/tabindex=-1 pair
    // is what rules out MUI's `.MuiSelect-nativeInput`: a Select renders one to carry its value for
    // form submission, and it is not typeable by design - without this it reported as a control
    // that ignores input, which is true and irrelevant.
    const EDITABLE =
      "input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden])" +
      ':not([aria-hidden]):not([tabindex="-1"]), textarea'
    const pairIds = await allPairIds(page)
    sweepBudget(testInfo, pairIds.length, 1_500)

    const offenders: string[] = []
    let checked = 0
    for (const id of pairIds) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      for (const side of ["ref", "mui"] as const) {
        const control = row.locator(`[data-side="${side}"]`).locator(EDITABLE).first()
        if ((await control.count()) === 0) continue
        if (!(await control.isVisible())) continue
        if (await control.isDisabled()) continue

        await row.scrollIntoViewIfNeeded()
        const before = await control.inputValue()
        checked++
        // `fill` rather than click-and-type: it needs no pointer, so it never opens an overlay that
        // would then sit over the next control, and it probes both failure modes directly. A
        // read-only control makes it throw; a control whose value is pinned with no change handler
        // lets it write and then React puts the old value straight back.
        try {
          await control.fill(`${before}xy`, { timeout: 5000 })
        } catch {
          offenders.push(`${id} (${side}): not editable - fill was rejected`)
          continue
        }
        if ((await control.inputValue()) === before) {
          offenders.push(`${id} (${side}): value snapped back to "${before}" - no change handler?`)
        }
      }
    }

    skipIfNothingToCheck(checked, "an editable control")
    expect(offenders, `these controls ignored typed input:\n${offenders.join("\n")}`).toEqual([])
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
  test("no MUI ButtonBase paints a ripple when pressed", async ({ page }, testInfo) => {
    const bases = page.locator(".MuiButtonBase-root")
    const count = await bases.count()
    expect(count, "no MUI ButtonBase instances found in the gallery").toBeGreaterThan(0)
    // Swept per INSTANCE rather than per pair - a gallery holds several ButtonBases per row - so
    // the budget derives from the instance count.
    sweepBudget(testInfo, count, 400)

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
  test("each tagged pair's overlay opens on hover alone, no click", async ({ page }, testInfo) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("hover-opens"))
    skipIfNothingToCheck(pairs.length, "hover-opens")
    sweepBudget(testInfo, pairs.length, 4_000)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await centreRow(row)
      for (const side of ["ref", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        const target = cell.locator("[data-target]").first()
        await target.hover()
        await expect(
          await openContentLocator(page, cell, id),
          `${id} (${side}): overlay did not become visible on hover (no click was performed)`,
        ).toBeVisible({ timeout: 3000 })
        await resetState(page)
      }
    }
  })
})

test.describe("escape-closes", () => {
  test("each tagged pair's open overlay detaches on Escape", async ({ page }, testInfo) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("escape-closes"))
    skipIfNothingToCheck(pairs.length, "escape-closes")
    sweepBudget(testInfo, pairs.length, 5_000)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await centreRow(row)
      for (const side of ["ref", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        const target = cell.locator("[data-target]").first()
        await target.click()
        const overlay = await openContentLocator(page, cell, id)
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

test.describe("text metrics", () => {
  /**
   * Compares the resolved FONT METRICS of every piece of rendered text between the two sides of
   * each pair - size, line-height, weight, letter-spacing.
   *
   * This exists because the pixel suite provably cannot see small geometry errors. Worked example:
   * MuiPaginationItem was missing the line-height that Tailwind's `text-sm` pairs with its size, so
   * MUI resolved 20.016px where shadcn resolved 20px and the label sat 0.016px high. Removing that
   * override and re-running the parity suite reports a clean 0 differing pixels - 0.032 device pixels
   * at this scale rounds away - so nothing in the screenshot comparison holds that value. Here the
   * same defect fails immediately and names the element.
   *
   * Correspondence is by rendered TEXT, not by DOM position. The two sides deliberately have
   * different markup (that is the whole point of the project), so a structural walk cannot pair
   * elements up - but a pair renders the same visible strings on both sides by definition, which
   * makes the text itself a reliable join key. Only leaf text counts (elements whose own children
   * account for none of it), and only strings appearing exactly once per side, so a repeated label is
   * skipped rather than guessed at.
   *
   * METRICS, not box sizes. Comparing width/height was tried first and is unusable: the join pairs a
   * bare text span on one side against a padded container on the other (shadcn's select value span,
   * 61.734x20, against MUI's whole select display div, 101.734x36), so nearly every row was a false
   * positive about padding rather than a real defect. Font metrics are immune to that - padding and
   * structure do not change them - while still being exactly what a line-height or font-size mistake
   * moves. Where a box size genuinely matters, the parity diff already covers it.
   */
  test("each pair resolves the same font metrics on both sides", async ({ page }, testInfo) => {
    const pairs = await allPairIds(page)
    skipIfNothingToCheck(pairs.length, "matching") // only ever empty under a PARITY_PAIR filter
    sweepBudget(testInfo, pairs.length, 1_000)

    const offenders: string[] = []
    for (const id of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await row.scrollIntoViewIfNeeded()
      const found = await row.evaluate((rowEl) => {
        const METRICS = ["fontSize", "lineHeight", "fontWeight", "letterSpacing"] as const
        type Metrics = Record<string, string> & { __tag: string }
        const collect = (side: string) => {
          const cell = rowEl.querySelector(`[data-side="${side}"]`)
          const seen = new Map<string, Metrics | null>()
          if (!cell) return seen
          for (const el of Array.from(cell.querySelectorAll<HTMLElement>("*"))) {
            const own = (el.textContent ?? "").trim()
            if (!own) continue
            const childText = Array.from(el.children)
              .map((c) => (c.textContent ?? "").trim())
              .join("")
            if (childText === own) continue // not a text leaf
            const r = el.getBoundingClientRect()
            if (r.width === 0 || r.height === 0) continue
            if (seen.has(own)) {
              seen.set(own, null) // ambiguous, skip on both sides
              continue
            }
            const cs = getComputedStyle(el)
            const m = { __tag: el.tagName } as Metrics
            for (const k of METRICS) {
              // line-height is inert on SVG text: an SVG <text> is positioned by its baseline
              // attributes, not by a line box, so the property resolves to something (18px on MUI's
              // step counter against 16px on the HTML twin) without affecting a single pixel.
              // Comparing it would only invite a theme declaration that changes nothing, which is
              // exactly the kind of unbacked value this project refuses to ship. font-size and weight
              // DO drive SVG text, so they stay in.
              if (k === "lineHeight" && el instanceof SVGElement) continue
              m[k] = cs[k]
            }
            seen.set(own, m)
          }
          return seen
        }
        const a = collect("ref")
        const b = collect("mui")
        const out: string[] = []
        for (const [text, m] of a) {
          const other = b.get(text)
          if (!m || !other) continue
          for (const k of METRICS) {
            // A metric omitted on either side (see the SVG line-height note above) is not compared -
            // omitted means "does not apply here", not "differs".
            if (m[k] === undefined || other[k] === undefined) continue
            if (m[k] !== other[k]) {
              out.push(`"${text.slice(0, 24)}" ${k}: ref ${m[k]} (${m.__tag}) vs mui ${other[k]} (${other.__tag})`)
            }
          }
        }
        return out
      })
      for (const f of found) offenders.push(`${id}: ${f}`)
    }
    expect(
      offenders,
      `these text runs resolve different font metrics on the two sides:\n${offenders.join("\n")}`,
    ).toEqual([])
  })
})

test.describe("painted geometry", () => {
  /**
   * Compares the set of PAINTED RECTANGLES between the two sides of each pair - every box that puts
   * ink on the screen, with no reliance on it containing text.
   *
   * This closes the gap the font-metrics sweep above leaves open. That one joins elements by their
   * rendered text, so anything without text is invisible to it: a divider, a slider rail, a switch
   * track, an icon, an avatar. Any of those could change size and no non-pixel check would notice -
   * and the pixel diff is exactly the thing that cannot see a sub-pixel change.
   *
   * Correspondence is by VALUE, not identity: collect each side's painted boxes relative to its own
   * cell origin, sort them, and compare the two lists. The two sides deliberately have different
   * markup, so nothing can be paired up structurally - but if they render the same design they must
   * put ink in the same places, whatever elements happen to produce it. That property survives the
   * structural differences this project is built on: shadcn draws an input's border on the <input>
   * itself while MUI draws it on a wrapper, and both yield one rectangle at the same place; Radix
   * nests a slider's Range inside its Track where MUI puts rail and track side by side, and both
   * yield the same two rectangles.
   *
   * An element counts as painted when it has a visible background, a visible border, or is an image
   * or icon. Layout wrappers contribute nothing, which is what keeps MUI's deeper markup from
   * registering as extra boxes - and a transparent border (MUI's button-group seam) correctly counts
   * as no border at all.
   */
  // Pairs whose painted boxes differ BY DESIGN, with the reason. Adding to this list means claiming
  // the difference is intended and pixel-neutral - the parity diff still has to agree.
  // Scoped PER THEME, for the reason thresholds.ts gives: a pair id is only unique within one
  // gallery, and `button-destructive` exists in both. A flat set would exempt the shadcn pair too,
  // silently, and an exemption is always a claim about one specific pair of implementations.
  const BY_DESIGN: Record<ThemeName, Set<string>> = {
    shadcn: new Set([
      // buttongroup-basic: the two libraries build the shared seam differently and neither is wrong.
      // shadcn drops the left border off every non-first child, so each of those buttons is 1px
      // narrower and the seam is the previous button's right border. MUI keeps the border, makes the
      // earlier button's right border transparent, and pulls the next button 1px left to overlap. The
      // outer edges and the seam land on identical pixels either way - which the parity diff confirms
      // at 0 differing pixels in light - but the intermediate boxes are a pixel apart. See the
      // MuiButtonGroup banner in the theme.
      "buttongroup-basic",
    ]),
    kumo: new Set([
      // The two emphasis buttons: kumo paints its gradient on an absolutely positioned child SPAN,
      // and MUI's Button renders its children as bare text nodes - there is no element to style - so
      // the theme uses a ::before of identical geometry instead. A pseudo-element is not a DOM node,
      // so it contributes no rectangle here while kumo's span does. That substitution is deliberate
      // and is what makes the pair MATCH: folding the gradient onto the root's own background-image
      // instead scores Δ41, against Δ1 for the pseudo-element. Measurements in thresholds.ts.
      "button-primary",
      "button-destructive",

      // radio-group: kumo draws the selected dot as a child element; MUI draws it as a second,
      // scaled SVG icon inside the same control. Same 8x8 dot on the same pixels - the pair is at
      // zero - but one side reaches it with an extra box.
      "radio-group",

      // tabs-underline: same shape of difference twice over. Kumo's tab icons are wrapped in their
      // own sized span where MUI renders the svg directly, and kumo's active underline is a child
      // element where MUI's Tabs paints its indicator as a separate absolutely positioned span that
      // this collector sees at a different depth. Both land on identical pixels.
      "tabs-underline",
    ]),
    blink: new Set([
      // The Switch family: the kit paints its knob as a ::after on the input - one element owning
      // both the track and the knob - while MUI has a real `MuiSwitch-thumb` span. A pseudo-element
      // contributes no rectangle here, so MUI shows one 18x18 box the kit cannot. The knob lands on
      // identical pixels either way (the parity diff agrees), and the substitution is forced: there
      // is no way to make MUI paint its thumb from a pseudo-element.
      //
      // This is also why switch-disabled needs its threshold entry in thresholds.ts - the same two
      // constructions dim through different layer trees. The measurements are there.
      "switch-off",
      "switch-on",
      "switch-disabled",
      "switch-disabled-on",

      // The Input family: same shape of difference, at the other end. The kit puts a real
      // `1px solid` border on the root div, so its box IS the border. MUI paints the border on an
      // absolutely positioned <fieldset> - the notched outline - which is a second painted element,
      // 5px taller than the control because it is inset `top: -5px` to make room for a label notch
      // this design never uses.
      //
      // Pixel-neutral, and deliberately so: the theme pays for the kit's border out of the padding
      // (12px becomes 13px) precisely so both constructions put their ink on the same pixels. See
      // the MuiOutlinedInput banner in the theme; every input pair diffs at 0 or 1 px.
      "input-sm",
      "input-md",
      "input-lg",
      "input-placeholder",
      "input-error",
      "input-disabled",

      // The Select family is the SAME construction as the Input family above, for the same reason:
      // the kit's Select is a native <select> inside a bordered wrapper div, and MUI's
      // `<Select native>` is a native <select> inside an OutlinedInput - so MUI again shows the
      // notched-outline fieldset as a second painted box, 5px taller than the control. The theme
      // pays for the kit's border out of the padding here too, and additionally out of the
      // chevron's `right` (12px becomes 13px), which is what keeps the ink identical: every select
      // pair diffs at 0 or 1 px.
      "select-md",
      "select-error",
      "select-disabled",
      "select-sm",

      // And the FormField pairs, for the third time and the same reason: each wraps an
      // OutlinedInput, so each shows MUI's notched-outline fieldset as a second painted box. The
      // field's own parts - the label, the message, the column gap - are ordinary elements and are
      // compared normally; both pairs diff at 0 or 1 px.
      "formfield-helper",
      "formfield-error",
    ]),
  }

  test("each pair paints the same rectangles on both sides", async ({ page }, testInfo) => {
    const ids = await allPairIds(page)
    const byDesign = BY_DESIGN[targetOf(testInfo.project.name).theme]
    // A BY_DESIGN entry is the same kind of claim as a thresholds.ts override - a proof about one
    // specific pair - and it rots the same way: rename the pair and the exemption lingers, keeping
    // this sweep blind to the construction it once excused long after that construction changed.
    // Validated only on a full run; a filtered run legitimately sees a subset of ids.
    if (!parityFilterActive()) {
      const stale = [...byDesign].filter((id) => !ids.includes(id))
      expect(
        stale,
        `BY_DESIGN exempts pairs that no longer exist: ${stale.join(", ")} - remove the entries or re-point them`,
      ).toEqual([])
    }
    const pairs = ids.filter((id) => !byDesign.has(id))
    skipIfNothingToCheck(pairs.length, "matching") // only ever empty under a PARITY_PAIR filter
    sweepBudget(testInfo, pairs.length, 1_000)

    const offenders: string[] = []
    for (const id of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await row.scrollIntoViewIfNeeded()
      const found = await row.evaluate((rowEl) => {
        // A DERIVED pair has no reference cell at all (see Pair.ref) - there is no second side to
        // compare rectangles against, so every box the MUI side paints would otherwise be reported
        // as "extra". Skipped rather than special-cased below, so the comparison only ever runs on
        // pairs that actually have two sides.
        if (!rowEl.querySelector('[data-side="ref"]')) return []

        const transparent = (c: string) => c === "transparent" || /^(rgba?|oklab|oklch|color)\(.*[,/]\s*0\s*\)$/.test(c)

        const collect = (side: string): string[] => {
          const cell = rowEl.querySelector(`[data-side="${side}"]`)
          if (!cell) return []
          const base = cell.getBoundingClientRect()
          const boxes: string[] = []
          for (const el of Array.from(cell.querySelectorAll<HTMLElement>("*"))) {
            const cs = getComputedStyle(el)
            if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue
            // Anything mid-animation has a time-dependent box: the spinner's ring is a rotating
            // square, and a rotated square's axis-aligned bounds grow and shrink as it turns
            // (measured 21.86 against a resting 16). Motion is the `animates` check's job; this one
            // only judges things that hold still.
            //
            // Checked up the ANCESTOR chain, not just on the element: the two spinners animate at
            // different levels - shadcn rotates the icon itself, MUI rotates the root and scales the
            // svg inside it - so testing the element alone excluded one side and kept the other.
            let animated = false
            for (let n: HTMLElement | null = el; n && n !== cell; n = n.parentElement) {
              if (getComputedStyle(n).animationName !== "none") {
                animated = true
                break
              }
            }
            if (animated) continue
            const r = el.getBoundingClientRect()
            if (r.width === 0 || r.height === 0) continue

            const hasBg = !transparent(cs.backgroundColor) || cs.backgroundImage !== "none"
            const hasBorder = (["Top", "Right", "Bottom", "Left"] as const).some(
              (s) =>
                parseFloat(cs[`border${s}Width` as "borderTopWidth"]) > 0 &&
                !transparent(cs[`border${s}Color` as "borderTopColor"]),
            )
            const isGraphic = el.tagName === "IMG" || el instanceof SVGSVGElement
            if (!hasBg && !hasBorder && !isGraphic) continue

            // One decimal place. Sub-pixel layout rounding differs harmlessly between two ways of
            // reaching the same size - an image list tile is 69.33 tall as a grid item and 69.34 as
            // an aspect-ratio box - while every real defect this has found is a whole pixel or more.
            boxes.push(
              [
                (r.x - base.x).toFixed(1),
                (r.y - base.y).toFixed(1),
                r.width.toFixed(1),
                r.height.toFixed(1),
              ].join(","),
            )
          }
          return boxes.sort()
        }

        const a = collect("ref")
        const b = collect("mui")
        if (a.length === b.length && a.every((v, i) => v === b[i])) return []

        // Report only the boxes that are NOT common to both, so a difference reads as "this
        // rectangle is on one side and not the other" rather than as two long lists.
        const countOf = (list: string[]) =>
          list.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map<string, number>())
        const ca = countOf(a)
        const cb = countOf(b)
        const out: string[] = []
        for (const [box, n] of ca) {
          const extra = n - (cb.get(box) ?? 0)
          if (extra > 0) out.push(`ref only (x${extra}): ${box}`)
        }
        for (const [box, n] of cb) {
          const extra = n - (ca.get(box) ?? 0)
          if (extra > 0) out.push(`mui only (x${extra}): ${box}`)
        }
        return out
      })
      for (const f of found) offenders.push(`${id}: ${f}`)
    }
    expect(
      offenders,
      `these painted rectangles (x,y,w,h relative to the cell) exist on one side only:\n${offenders.join("\n")}`,
    ).toEqual([])
  })
})

test.describe("filters-on-type", () => {
  /**
   * Types into a combobox and checks that both sides narrow their list to the same options.
   *
   * Filtering is behaviour, not appearance: the pixel harness opens a list and screenshots it, so it
   * sees a static set of options and can never tell whether typing narrows them - or whether the two
   * sides narrow them the SAME way. Two libraries can both "filter" and still disagree (prefix versus
   * substring, case sensitivity, diacritics), which would look correct in every screenshot.
   *
   * The query is derived from the options actually rendered rather than hard-coded, so the check
   * cannot drift out of sync with the gallery: it opens the list, takes a slice from the middle of one
   * option's label, types that, and compares. It also asserts the result is a PROPER subset of the
   * full list, so a side that ignores the query entirely fails rather than trivially matching.
   */
  test("each tagged pair narrows to the same options on both sides", async ({ page }, testInfo) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("filters-on-type"))
    skipIfNothingToCheck(pairs.length, "filters-on-type")
    sweepBudget(testInfo, pairs.length, 8_000)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await centreRow(row)

      const seen: Record<string, { all: string[]; filtered: string[]; query: string }> = {}
      for (const side of ["ref", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        const input = cell.locator("[data-target]").first()
        await input.click()
        const list = await openContentLocator(page, cell, id)
        await expect(list, `${id} (${side}): list did not open`).toBeVisible({ timeout: 5000 })

        const optionsOf = () => list.locator('[role="option"]').allInnerTexts()
        const all = (await optionsOf()).map((s) => s.trim())
        expect(all.length, `${id} (${side}): opened list has no options to filter`).toBeGreaterThan(1)

        // A slice from the MIDDLE of a label, so a prefix-only matcher fails rather than passing by
        // accident - which is exactly the kind of disagreement this check exists to surface.
        const source = all[Math.floor(all.length / 2)]
        const query = source.slice(1, 4).toLowerCase()

        await input.fill(query)
        await page.waitForTimeout(SETTLE_MS)
        const filtered = (await optionsOf()).map((s) => s.trim())

        seen[side] = { all, filtered, query }
        await input.fill("")
        await resetState(page)
      }

      expect(
        seen.mui.query,
        `${id}: the two sides rendered different options, so they were typed different queries ` +
          `(ref ${JSON.stringify(seen.ref.all)}, mui ${JSON.stringify(seen.mui.all)})`,
      ).toEqual(seen.ref.query)
      expect(
        seen.ref.filtered.length,
        `${id}: typing "${seen.ref.query}" did not narrow the reference list at all ` +
          `(${JSON.stringify(seen.ref.filtered)}) - nothing is being filtered`,
      ).toBeLessThan(seen.ref.all.length)
      expect(
        seen.mui.filtered,
        `${id}: the two sides filtered "${seen.mui.query}" differently\n` +
          `  ref:    ${JSON.stringify(seen.ref.filtered)}\n  mui:    ${JSON.stringify(seen.mui.filtered)}`,
      ).toEqual(seen.ref.filtered)
    }
  })
})
