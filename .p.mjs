import { chromium } from "@playwright/test"
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })
await page.goto("http://localhost:5173/blink.html")
const out = {}
for (const side of ["ref", "mui"]) {
  const cell = page.locator(`[data-pair-id="menu-open"] [data-side="${side}"]`)
  await cell.locator("[data-target]").scrollIntoViewIfNeeded()
  await cell.locator("[data-target]").click()
  await page.waitForTimeout(400)
  out[side] = await page.evaluate(() => {
    const paper = document.querySelector('[data-portal-target="menu-open"]')
    const list = paper.querySelector("ul")
    const item = list.querySelector("li")
    const g = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect()
      return { rect: `${r.width.toFixed(2)}x${r.height.toFixed(2)}`, padding: cs.padding, margin: cs.margin,
               font: cs.font, background: cs.backgroundColor, minHeight: cs.minHeight, borderRadius: cs.borderRadius,
               color: cs.color, gap: cs.gap, display: cs.display, listStyle: cs.listStyleType } }
    return { paper: g(paper), list: g(list), item: g(item) }
  })
  await page.keyboard.press("Escape"); await page.waitForTimeout(300)
}
for (const k of Object.keys(out.ref)) for (const p of Object.keys(out.ref[k])) if (out.ref[k][p] !== out.mui[k][p]) console.log(`${k}.${p}: ref="${out.ref[k][p]}" mui="${out.mui[k][p]}"`)
await browser.close()
