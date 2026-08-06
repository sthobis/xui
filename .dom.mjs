import { chromium } from "@playwright/test"
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })
await page.goto(`http://localhost:54243/kumo.html`)
await page.waitForLoadState("networkidle")
const row = page.locator(`[data-pair-id="${process.env.PAIR}"]`)
await row.scrollIntoViewIfNeeded()
await row.locator(`[data-side="${process.env.SIDE ?? "ref"}"] [data-target]`).click()
await page.waitForTimeout(700)
console.log(await page.evaluate(() => {
  const roots = Array.from(document.body.children).filter(n => n.id !== "root" && n.tagName !== "SCRIPT")
  const walk = (n, d = 0) => {
    if (d > 4) return ""
    const attrs = [...n.attributes].filter(a => a.name !== "style").map(a => `${a.name}="${a.value.slice(0,80)}"`).join(" ")
    const r = n.getBoundingClientRect()
    const c = getComputedStyle(n)
    return `${"  ".repeat(d)}<${n.tagName.toLowerCase()} ${attrs}>  [${r.width.toFixed(1)}x${r.height.toFixed(1)} @ ${r.x.toFixed(1)},${r.y.toFixed(1)}] bg=${c.backgroundColor} op=${c.opacity} radius=${c.borderRadius} shadow=${c.boxShadow.slice(0,60)}\n` +
      Array.from(n.children).map(ch => walk(ch, d + 1)).join("")
  }
  return roots.map(r => walk(r)).join("\n")
}))
await browser.close()
