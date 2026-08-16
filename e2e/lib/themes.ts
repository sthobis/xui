import { expect, type Page } from "@playwright/test"
import { SETTLE_MS } from "./states"

/**
 * The themes the harness knows about.
 *
 * A Playwright project is named `<theme>-<mode>`, which is what lets one suite cover several
 * reference systems: the project name is the only thing that decides which page a spec opens and
 * how it switches to dark. Everything else in the harness reads the DOM and stays theme-agnostic.
 */
export type ThemeName = "shadcn" | "kumo" | "blink"

// Each theme's own isolated page, carrying that design system's Tailwind and nothing else. `/` is
// NOT one of them: it is the showcase, which renders only MUI under all three themes at once and
// therefore loads no design-system stylesheet at all. The parity pages have to stay separate for
// the reason AGENTS.md gives - two Tailwind graphs on one page and a 0-threshold diff is measuring
// whichever won the cascade.
export const GALLERY_PAGE: Record<ThemeName, string> = {
  shadcn: "/shadcn.html",
  kumo: "/kumo.html",
  blink: "/blink.html",
}

/**
 * The Tailwind-free twin of each gallery page, rendering only the MUI column. preflight.spec.ts
 * compares the same MUI cell across the pair of pages to prove the theme does not lean on the
 * reference system's stylesheet for anything.
 */
export const PURE_PAGE: Record<ThemeName, string> = {
  shadcn: "/pure.html",
  kumo: "/kumo-pure.html",
  blink: "/blink-pure.html",
}

export function targetOf(projectName: string): { theme: ThemeName; mode: "light" | "dark" } {
  const match = projectName.match(/^(shadcn|kumo|blink)-(light|dark)$/)
  if (!match) {
    throw new Error(`project "${projectName}" is not named <theme>-<mode> (e.g. "shadcn-light")`)
  }
  return { theme: match[1] as ThemeName, mode: match[2] as "light" | "dark" }
}

/**
 * Clicks the in-app mode toggle and asserts the theme's OWN dark-mode contract on <html>.
 *
 * The two reference systems disagree on how dark mode is expressed, and each xui theme follows its
 * own rather than normalizing: shadcn drives a `.dark` class, kumo a `data-mode="dark"` attribute.
 * Both are written by MUI's `useColorScheme().setMode` via the theme's `colorSchemeSelector`, so a
 * single toggle button moves the MUI theme and the reference system's CSS together. Asserting the
 * attribute (rather than just clicking) is what catches a theme whose selector silently stopped
 * matching - the page would still render, in the wrong scheme, and every pair would still "match".
 */
export async function activateDark(page: Page, theme: ThemeName): Promise<void> {
  if (theme === "blink") {
    // blink is a light-only theme and registers no `blink-dark` project, so nothing should ever
    // ask it to switch. Throwing beats returning quietly: a silent no-op would let a mistakenly
    // added dark project run the whole suite in LIGHT and report every pair as passing.
    throw new Error("blink has no dark scheme - there should be no blink-dark project")
  }
  await page.getByTestId("mode-toggle").click()
  if (theme === "shadcn") {
    await expect(page.locator("html")).toHaveClass(/dark/)
  } else {
    await expect(page.locator("html")).toHaveAttribute("data-mode", "dark")
  }
  await page.waitForTimeout(SETTLE_MS)
}
