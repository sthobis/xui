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

const BACKDROP_SELECTOR = {
  shadcn: "[data-slot$='-overlay']",
  mui: ".MuiBackdrop-root:not(.MuiBackdrop-invisible)",
} as const

test.describe("overlay-matches", () => {
  // Covers the two things a modal overlay paints that the pixel harness structurally cannot reach.
  //
  // The scrim, because it is a full-viewport translucent, blurred layer sitting over whatever the
  // page shows behind each cell - and the two cells are 240px apart, so any framing compares
  // different content (see dialog.tsx's own note).
  //
  // The panel's OUTER decoration, because the open state screenshots the panel element, and an
  // element capture clips at its border box: a drop shadow or a ring falls outside it and is simply
  // not in the picture. Sabotaging the drawer's shadow left the pair at 0.00% before this.
  test("each tagged pair's scrim and panel chrome match on both sides", async ({ page }) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("overlay-matches"))
    expect(pairs.length, "no pairs tagged with the overlay-matches behavior").toBeGreaterThan(0)

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
        const panel = openContentLocator(page, cell, id)
        await expect(panel, `${id} (${side}): no panel appeared after opening`).toBeVisible({
          timeout: 5000,
        })
        measured[side] = {
          scrim: await scrim.evaluate((el) => {
            const c = getComputedStyle(el)
            const r = el.getBoundingClientRect()
            return {
              backgroundColor: c.backgroundColor,
              backdropFilter: c.backdropFilter,
              isolation: c.isolation,
              box: `${Math.round(r.width)}x${Math.round(r.height)} @ ${Math.round(r.x)},${Math.round(r.y)}`,
            }
          }),
          panel: await panel
            .evaluate((el) => {
              const c = getComputedStyle(el)
              return { boxShadow: c.boxShadow, border: c.border, borderRadius: c.borderRadius }
            })
            .then((p) => ({ ...p, boxShadow: significantShadowLayers(p.boxShadow) })),
        }
        await resetState(page)
      }
      expect(
        measured.mui,
        `${id}: the MUI overlay does not match the shadcn one\n` +
          `  shadcn: ${JSON.stringify(measured.shadcn)}\n  mui:    ${JSON.stringify(measured.mui)}`,
      ).toEqual(measured.shadcn)
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
  test("each tagged pair's overlay items highlight the same way on hover", async ({ page }) => {
    const pairs = (await discover(page)).filter((p) => p.behaviors.includes("item-hover-highlights"))
    expect(pairs.length, "no pairs tagged with the item-hover-highlights behavior").toBeGreaterThan(0)

    for (const { id } of pairs) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      await row.scrollIntoViewIfNeeded()
      const measured: Record<string, string> = {}
      for (const side of ["shadcn", "mui"] as const) {
        const cell = row.locator(`[data-side="${side}"]`)
        await cell.locator("[data-target]").first().click()
        const overlay = openContentLocator(page, cell, id)
        await expect(overlay).toBeVisible({ timeout: 5000 })
        // The LAST item, so the result cannot be confused with whatever the overlay autofocuses.
        const item = overlay.locator("[role='menuitem'], [role='option']").last()
        await item.hover()
        await page.waitForTimeout(200)
        measured[side] = await item.evaluate((el) => getComputedStyle(el).backgroundColor)
        await resetState(page)
      }
      expect(
        measured.mui,
        `${id}: hovering an item paints a different background on the two sides\n` +
          `  shadcn: ${measured.shadcn}\n  mui:    ${measured.mui}`,
      ).toBe(measured.shadcn)
      expect(
        measured.shadcn,
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
    testInfo.setTimeout(120_000) // a sweep over every pair, two sides each
    // Excludes the inputs that are not user-facing text controls. The aria-hidden/tabindex=-1 pair
    // is what rules out MUI's `.MuiSelect-nativeInput`: a Select renders one to carry its value for
    // form submission, and it is not typeable by design - without this it reported as a control
    // that ignores input, which is true and irrelevant.
    const EDITABLE =
      "input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=hidden])" +
      ':not([aria-hidden]):not([tabindex="-1"]), textarea'
    const pairIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-pair-id]")).map((el) => el.getAttribute("data-pair-id")!),
    )

    const offenders: string[] = []
    let checked = 0
    for (const id of pairIds) {
      const row = page.locator(`[data-pair-id="${id}"]`)
      for (const side of ["shadcn", "mui"] as const) {
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

    expect(checked, "no editable controls found in the gallery").toBeGreaterThan(0)
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
  test("each pair resolves the same font metrics on both sides", async ({ page }) => {
    const pairs: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-pair-id]")).map((el) => el.getAttribute("data-pair-id")!),
    )
    expect(pairs.length).toBeGreaterThan(0)

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
        const a = collect("shadcn")
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
              out.push(`"${text.slice(0, 24)}" ${k}: shadcn ${m[k]} (${m.__tag}) vs mui ${other[k]} (${other.__tag})`)
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
