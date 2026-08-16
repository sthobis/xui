import { useMemo, useState, type CSSProperties, type ReactNode } from "react"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline"
import { createTheme } from "@mui/material/styles"
import { shadcnTheme, kumoTheme, blinkTheme } from "@sthobis/xui"
import { sections } from "../themes/kumo/sections"
import { GallerySidebar, SIDEBAR_WIDTH, sectionId } from "../gallery/Sidebar"
import { COLUMN_OVERRIDES } from "./columnOverrides"

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
 *
 * One consequence of that reuse needs an escape hatch, and `columnOverrides` is it: a kumo pair may
 * ask for a prop VALUE only kumo's theme declares (`<Chip color="blue">`), which another theme
 * cannot answer at all, leaving its column showing stock MUI rather than itself. Such a column names
 * its own node for that pair id there. Everything else keeps reusing kumo's.
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
 * A portal host, sitting INSIDE the column, that every overlay in that column renders into.
 *
 * The scoping this page depends on - the variables re-declared on the column wrapper, the
 * typography written by its ScopedCssBaseline - reaches an element by INHERITANCE, and a portal
 * leaves the subtree that inherits it. MUI portals Dialog, Drawer, Menu, Select, Popover, Tooltip
 * and Autocomplete's popup to `document.body` by default, so all four columns' overlays land in the
 * same place, outside every wrapper: they resolve `--mui-palette-*` from `:root` (one theme,
 * whichever wrote it last) and take Material's own Roboto stack instead of the column's font.
 * Measured before this existed: opening the shadcn column's Dialog produced a panel whose
 * font-family was `Roboto, Helvetica, Arial, sans-serif` - the page renders no design system's
 * stylesheet, so nothing about it looked broken, it just was not the theme under test.
 *
 * This was invisible while nothing on the page could be opened. It stops being invisible the moment
 * the gallery is interactive, which is the point of the pairs carrying their own state.
 *
 * `position: fixed` rather than a static box, for two reasons: a fixed element is not clipped by an
 * ancestor's `overflow: hidden` (the cell has one, to keep a wide component from bleeding into its
 * neighbour), and it gives Popper a containing block at the viewport origin, so the coordinates it
 * computes mean the same thing they would at `document.body`. No z-index: an `auto` one leaves the
 * overlays' own stacking to MUI, where a stacking context here would trap them under the page.
 */
const portalHostStyle: CSSProperties = { position: "fixed", top: 0, left: 0 }

/**
 * The three components that decide where an overlay is portalled, each of which has to be told
 * separately - a Popover does NOT inherit Modal's default.
 *
 *   MuiModal     Dialog and Drawer render one directly.
 *   MuiPopover   Menu and Select render one, and it computes its own container from the anchor
 *                (`ownerDocument(anchorEl).body`) and passes that to Modal explicitly, which
 *                overrides anything set on MuiModal. Setting it here is what actually moves them.
 *   MuiPopper    Tooltip and Autocomplete's popup.
 */
function withPortalHost(theme: ShowcaseTheme, host: HTMLElement | null): ShowcaseTheme {
  if (!host) return theme
  const components = (theme as { components?: Record<string, { defaultProps?: object }> }).components
  const withContainer = (name: string) => ({
    ...components?.[name],
    defaultProps: { ...components?.[name]?.defaultProps, container: host },
  })
  return {
    ...theme,
    components: {
      ...components,
      MuiModal: withContainer("MuiModal"),
      MuiPopover: withContainer("MuiPopover"),
      MuiPopper: withContainer("MuiPopper"),
    },
  } as ShowcaseTheme
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
  // State rather than a ref, because the theme has to be rebuilt once the host exists: a ref's
  // `.current` fills in after the render that would have read it, so the first open still portals
  // to the body.
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null)
  const scopedTheme = useMemo(() => withPortalHost(theme, portalHost), [theme, portalHost])
  return (
    <div style={{ ...cellStyle, ...cssVarStyle(theme) }}>
      <ThemeProvider theme={scopedTheme} defaultMode="light">
        <ScopedCssBaseline sx={{ background: "transparent" }}>
          {children}
          <div ref={setPortalHost} style={portalHostStyle} />
        </ScopedCssBaseline>
      </ThemeProvider>
    </div>
  )
}

/**
 * A link to one theme's parity page, resolved against the app's BASE path.
 *
 * A bare `href="/shadcn.html"` is correct in dev and broken in production, and nothing catches it:
 * Vite rewrites asset references it finds in the HTML entry files, but an `<a href>` written in JSX
 * is a plain string it never sees. The built site is served from https://sthobis.github.io/xui/, so
 * those links resolved to https://sthobis.github.io/shadcn.html - off the project subpath entirely,
 * and 404 for every one of the three.
 *
 * `import.meta.env.BASE_URL` is the value vite.config.ts already sets (`/` in dev, `/xui/` in a
 * build) and it always ends in a slash, so one expression covers both. The visible text shows the
 * resolved path rather than a hardcoded one, so what a reader sees is what they get.
 */
function ParityLink({ page }: { page: string }) {
  const href = `${import.meta.env.BASE_URL}${page}.html`
  return <a href={href}>{href}</a>
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
            <ParityLink page="shadcn" />, <ParityLink page="kumo" /> and <ParityLink page="blink" />
            .
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
                    {COLUMN_OVERRIDES[c.key]?.[pair.id] ?? pair.mui}
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
