import type { CSSProperties, ReactNode } from "react"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline"
import { createTheme } from "@mui/material/styles"
import { shadcnTheme, kumoTheme, blinkTheme } from "xui"
import { sections } from "../themes/kumo/sections"
import { GallerySidebar, SIDEBAR_WIDTH, sectionId } from "../gallery/Sidebar"

/**
 * The showcase: one MUI component per row, rendered four times - stock MUI, then each theme.
 *
 * This page carries NO design-system stylesheet, and that is what makes it possible at all. It
 * shows only MUI, so none of the three design systems' stylesheets are needed, and they can
 * therefore sit on one page without fighting over the cascade. The REAL components stay on their
 * own isolated pages (/shadcn.html, /kumo.html, /blink.html), where the parity harness compares
 * each against its themed twin - see AGENTS.md on why those stylesheets must never load together.
 *
 * The component list is the kumo gallery's, reused rather than rewritten: that theme now covers
 * every component the shadcn theme does, so its `mui` nodes already enumerate the full surface.
 * Only the `mui` side of each pair is read; the reference nodes are never rendered here.
 */

/** Stock MUI, for the leftmost column - no overrides at all, so the difference is the theme's. */
const defaultTheme = createTheme()

type ShowcaseTheme =
  | typeof defaultTheme
  | typeof shadcnTheme
  | typeof kumoTheme
  | typeof blinkTheme
type ThemeWithVars = { generateStyleSheets?: () => Array<Record<string, unknown>> }

const COLUMNS: Array<{ key: string; label: string; theme: ShowcaseTheme }> = [
  { key: "default", label: "MUI (default)", theme: defaultTheme },
  { key: "shadcn", label: "shadcn theme", theme: shadcnTheme },
  { key: "kumo", label: "kumo theme", theme: kumoTheme },
  { key: "blink", label: "blink theme", theme: blinkTheme },
]

const cellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  flex: "1 1 0",
  minWidth: 0,
  overflow: "hidden",
}

const labelStyle: CSSProperties = {
  font: "500 11px/16px system-ui",
  opacity: 0.5,
  padding: "0 4px",
  flex: "1 1 0",
  textAlign: "center",
}

/**
 * A theme's CSS custom properties, as an inline style object for one column's wrapper.
 *
 * THIS IS WHAT MAKES THREE THEMES ON ONE PAGE POSSIBLE, and it is not optional. Every themed value
 * in this repo is written as `theme.vars.palette.*`, which compiles to `var(--mui-palette-*)` - and
 * both themes emit those variables under the SAME names on `:root`. Mounting two providers
 * therefore does not give you two themes; it gives you one, whichever wrote `:root` last. Measured
 * before this existed: the shadcn column rendered its destructive button at kumo's danger hue
 * (oklch hue 25.331 against shadcn's own 27.325) while every non-variable value - radius, font,
 * height - was correctly shadcn's, which is exactly the kind of half-wrong that reads as fine.
 *
 * Re-declaring the same properties on a wrapper fixes it because custom properties INHERIT: the
 * column's subtree resolves them from the wrapper long before it reaches `:root`. The values come
 * from the theme's own generated stylesheet rather than being transcribed, so this cannot drift.
 *
 * Every block whose selector LIST contains `:root` is taken, which is each theme's light scheme.
 * Matching `:root` exactly is not enough and silently half-works: the ~49 layout variables sit under
 * a bare `:root`, but the palette - all 172 of shadcn's, 195 of kumo's - lives under a compound
 * `:root, .light` / `:root, [data-mode="light"]`. An exact match therefore copies the geometry and
 * leaves every colour resolving from whichever theme owns the real `:root`, which looked like the
 * fix had done nothing at all.
 *
 * The dark blocks are deliberately skipped: they are keyed by each theme's own colorSchemeSelector
 * (`.dark` for shadcn, `[data-mode="dark"]` for kumo), and those two conventions cannot both be
 * honoured by one page-level toggle - so this page is light-only, and dark mode stays on the
 * per-theme pages where each system's own convention applies.
 */
function cssVarStyle(theme: ShowcaseTheme): CSSProperties {
  const style: Record<string, string> = {}
  // Present only on themes built with `cssVariables` - the stock MUI theme has none, and needs
  // none, since it emits no variables to collide with in the first place.
  const sheets = (theme as ThemeWithVars).generateStyleSheets?.() ?? []
  for (const sheet of sheets) {
    for (const [selector, vars] of Object.entries(sheet)) {
      const targetsRoot = selector.split(",").some((s) => s.trim() === ":root")
      if (!targetsRoot || typeof vars !== "object" || vars === null) continue
      for (const [key, value] of Object.entries(vars as Record<string, unknown>)) {
        if (key.startsWith("--") && (typeof value === "string" || typeof value === "number")) {
          style[key] = String(value)
        }
      }
    }
  }
  return style as CSSProperties
}

/**
 * Each column gets its own ThemeProvider, its own scoped variables, and its own ScopedCssBaseline.
 *
 * ScopedCssBaseline rather than the global CssBaseline is load-bearing too: a global baseline
 * applies one theme's typography and background to the whole document, so whichever provider
 * rendered last would set the body font for all three columns. The scoped one writes those rules
 * onto a wrapper element instead, so each column keeps its own theme's defaults.
 */
function ThemedCell({ theme, children }: { theme: ShowcaseTheme; children: ReactNode }) {
  return (
    <div style={{ ...cellStyle, ...cssVarStyle(theme) }}>
      <ThemeProvider theme={theme} defaultMode="light">
        <ScopedCssBaseline sx={{ background: "transparent" }}>{children}</ScopedCssBaseline>
      </ThemeProvider>
    </div>
  )
}

export function Showcase() {
  return (
    <>
      <GallerySidebar sections={sections} />
      <main style={{ marginLeft: SIDEBAR_WIDTH, padding: 32 }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ font: "600 20px/28px system-ui", margin: "0 0 8px" }}>xui</h1>
          <p style={{ font: "400 13px/20px system-ui", opacity: 0.7, margin: 0, maxWidth: 640 }}>
            The same MUI components under each theme. Stock MUI on the left, then shadcn/ui, Kumo,
            and the Pulse Kit. For pixel comparison against the real design-system components, see{" "}
            <a href="/shadcn.html">/shadcn.html</a>, <a href="/kumo.html">/kumo.html</a> and{" "}
            <a href="/blink.html">/blink.html</a>.
          </p>
        </header>
        {sections.map((section) => (
          <section
            key={section.title}
            id={sectionId(section.title)}
            style={{ marginBottom: 48, scrollMarginTop: 24 }}
          >
            <h2 style={{ font: "600 16px/24px system-ui", margin: "0 0 4px" }}>{section.title}</h2>
            <div style={{ display: "flex" }}>
              {COLUMNS.map((c) => (
                <div key={c.key} style={labelStyle}>
                  {c.label}
                </div>
              ))}
            </div>
            {section.pairs.map((pair) => (
              <div
                key={pair.id}
                data-showcase-row={pair.id}
                style={{ display: "flex", borderBottom: "1px solid rgba(128,128,128,0.2)" }}
              >
                {COLUMNS.map((c) => (
                  <ThemedCell key={c.key} theme={c.theme}>
                    {pair.mui}
                  </ThemedCell>
                ))}
              </div>
            ))}
          </section>
        ))}
      </main>
      {/* A single global baseline for the page chrome itself (body margin, box-sizing). The columns
          each layer their own ScopedCssBaseline on top, so this never decides their typography. */}
      <CssBaseline />
    </>
  )
}
