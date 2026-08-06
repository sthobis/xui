import { chromium } from "@playwright/test"
const PORT = process.env.PORT ?? "54243"
const PAIR = process.env.PAIR
const REF = process.env.REF, MUI = process.env.MUI ?? `[data-portal-target="${PAIR}"]`
const PICK = (process.env.PICK ?? "").split(",").filter(Boolean)
const DEFAULT_PICK = ["backgroundColor","color","fontSize","fontFamily","fontWeight","lineHeight","letterSpacing","paddingTop","paddingRight","paddingBottom","paddingLeft","marginTop","marginBottom","borderRadius","boxShadow","outline","outlineOffset","border","minWidth","maxWidth","maxHeight","overflowX","overflowY","display","flexDirection","alignItems","justifyContent","gap","zIndex","opacity","transform"]
const keys = PICK.length ? PICK : DEFAULT_PICK
const ITEM = process.env.ITEM
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })
await page.goto(`http://localhost:${PORT}/kumo.html`)
await page.waitForLoadState("networkidle")
if (process.env.MODE === "dark") { await page.evaluate(() => document.documentElement.setAttribute("data-mode","dark")); await page.waitForTimeout(300) }
const row = page.locator(`[data-pair-id="${PAIR}"]`)
await row.scrollIntoViewIfNeeded()
const out = {}
for (const [side, sel] of [["ref", REF], ["mui", MUI]]) {
  await row.locator(`[data-side="${side}"] [data-target]`).click()
  await page.waitForTimeout(500)
  out[side] = await page.evaluate(([sel, keys, side, itemSel]) => {
    const bb = (n) => { if (!n) return null; const r = n.getBoundingClientRect(); return `${r.width.toFixed(3)}x${r.height.toFixed(3)} @ ${r.x.toFixed(3)},${r.y.toFixed(3)}` }
    const el = document.querySelector(sel)
    if (!el) return { error: "not found: " + sel }
    const c = getComputedStyle(el)
    const styles = {}; for (const k of keys) styles[k] = c[k]
    const trig = document.querySelector(`[data-pair-id="${document.querySelector("[data-pair-id]") && ""}"]`)
    const item = itemSel ? el.querySelector(itemSel) : null
    return {
      styles, box: bb(el), tag: el.tagName, cls: el.className.toString().slice(0, 160),
      parentCls: el.parentElement?.className.toString().slice(0, 120),
      parentBox: bb(el.parentElement),
      html: el.outerHTML.slice(0, 260),
      item: item ? { box: bb(item), cls: item.className.toString().slice(0,160), styles: Object.fromEntries(keys.map(k => [k, getComputedStyle(item)[k]])) } : null,
    }
  }, [sel, keys, side, ITEM])
  const t = await row.locator(`[data-side="${side}"] [data-target]`).evaluate((el) => { const r = el.getBoundingClientRect(); return `${r.width.toFixed(3)}x${r.height.toFixed(3)} @ ${r.x.toFixed(3)},${r.y.toFixed(3)}` })
  out[side].trigger = t
  await page.evaluate(() => document.activeElement?.blur()); await page.keyboard.press("Escape"); await page.waitForTimeout(350)
}
console.log(JSON.stringify(out, null, 1))
await browser.close()
