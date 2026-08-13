import { createRoot } from "react-dom/client"
import type { ReactNode } from "react"

/**
 * Mounts a gallery page only once its webfonts have loaded.
 *
 * Some MUI components MEASURE at mount and keep the result in sync through a ResizeObserver -
 * Tabs is the one that caught this out. It sizes its indicator from the selected tab's
 * `getBoundingClientRect()`, so a page that renders while the webfont is still swapping records
 * the FALLBACK font's width, and the observer only corrects it if some observed box later changes
 * size. Neither condition is guaranteed: a tab's own width is not observed, and a shrink-wrapped
 * root can settle at the same total width under both faces.
 *
 * Measured on blink.html before this existed: three tabs 89/78/69 wide under an 89.5312px
 * indicator, which is the width "Overview" has in the fallback face. blink-pure.html - the same
 * markup under a different font-family FALLBACK LIST, so a different pre-swap face - settled at a
 * correct 89. preflight compares those two pages and reported it as 5 pixels at Δ147, reading as
 * "the theme is leaning on Tailwind" when the theme was identical on both sides.
 *
 * Waiting is the fix rather than a threshold override, because the stale indicator is a real
 * artifact a user would see, not a measurement artifact of the harness.
 *
 * `document.fonts.ready` ALONE does not do it, and that is the subtle part: it resolves once no
 * load is PENDING, and nothing is pending before the page has rendered any text - a browser only
 * fetches a face when something needs it. Awaiting it on an empty document therefore resolves
 * immediately, React renders, the font request starts, and Tabs measures the fallback anyway.
 * Verified: gating on `ready` alone left the indicator at exactly the same 89.5312px.
 *
 * So every DECLARED face is loaded explicitly first. That costs nothing on a warm load, and a face
 * that fails to load is skipped rather than blocking the page forever.
 */
export function mountWhenFontsReady(node: ReactNode): void {
  const root = createRoot(document.getElementById("root")!)
  const mount = () => root.render(node)
  // `document.fonts` is universal in the browsers this gallery runs in; the guard is for a
  // non-DOM test environment importing the entry by accident.
  if (typeof document === "undefined" || !document.fonts) {
    mount()
    return
  }
  const faces = Array.from(document.fonts as unknown as Set<FontFace>)
  void Promise.all(faces.map((face) => face.load().catch(() => undefined)))
    .then(() => document.fonts.ready)
    .then(mount)
}
