import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { ANCHORS, customizeSource } from "../../apps/showcase/src/export/customize"
import { evaluateTheme, toJavaScript } from "../../apps/showcase/src/export/evaluate"
import { DEFAULT_OPTIONS, type ThemeId } from "../../apps/showcase/src/export/options"

/**
 * Holds the export page to the theme files as they actually ship. The page substitutes on exact
 * anchored lines, so an edit to shadcn.ts that reshapes one of them must fail HERE, on the next
 * `pnpm test:unit` - not in a user's download, where a missed anchor would throw at page time (or
 * worse, silently export the unmodified value if the anchoring were ever loosened).
 */

const themePath = (id: ThemeId) =>
  fileURLToPath(new URL(`../../packages/xui/src/themes/${id}.ts`, import.meta.url))
const sourceOf = (id: ThemeId) => readFileSync(themePath(id), "utf8")

describe("export page anchors", () => {
  it("every shadcn anchor matches the shipped file exactly once", () => {
    const source = sourceOf("shadcn")
    for (const [name, anchor] of Object.entries(ANCHORS.shadcn)) {
      expect(source.split(anchor).length - 1, `anchor "${name}"`).toBe(1)
    }
  })

  it("all-default options export the shipped file byte-identically", () => {
    const source = sourceOf("shadcn")
    const { source: out, fileName, changes } = customizeSource(source, DEFAULT_OPTIONS)
    expect(out).toBe(source)
    expect(changes).toEqual([])
    expect(fileName).toBe("shadcn.ts")
  })

  it("a full customization lands every option and marks every changed line", () => {
    const { source: out, fileName, changes } = customizeSource(sourceOf("shadcn"), {
      ...DEFAULT_OPTIONS,
      color: "blue",
      font: "inter",
      radius: "md",
    })
    expect(changes).toHaveLength(3)
    expect(fileName).toBe("shadcn-custom.ts")
    expect(out).toContain(`const RADIUS = "0.5rem"`)
    expect(out).toContain(`"Inter Variable"`)
    expect(out).toContain(`primary: "oklch(0.546 0.245 262.881)"`)
    // The banner and the per-line notes: a customized file says so, and says what shipped.
    expect(out).toContain("Customized shadcn theme")
    expect(out.match(/\/\/ export:/g)!.length).toBeGreaterThanOrEqual(6)
    // The original provenance comments on substituted lines are gone; the rest survive.
    expect(out).not.toContain(`// shadcn: --primary\n`)
    expect(out).toContain(`// shadcn: --secondary`)
  })

  it("kumo and blink take no design knobs and export as shipped", () => {
    for (const id of ["kumo", "blink"] as const) {
      const source = sourceOf(id)
      const { source: out, changes } = customizeSource(source, {
        ...DEFAULT_OPTIONS,
        theme: id,
        color: "blue",
        radius: "md",
        font: "inter",
      })
      expect(out).toBe(source)
      expect(changes).toEqual([])
    }
  })

  it("the JavaScript rendition strips types and keeps comments", () => {
    const out = toJavaScript(customizeSource(sourceOf("shadcn"), DEFAULT_OPTIONS).source)
    // Assertions target the type SYNTAX, not bare words - the theme's own comments legitimately
    // contain the word "satisfies", and comments must survive the strip.
    expect(out).not.toContain("declare module")
    expect(out).not.toContain("type CssVarsTheme")
    expect(out).toContain("createTheme(")
    expect(out).toContain("// shadcn: --primary")
  })

  // Also what keeps evaluate.ts's icon shims honest: a theme importing an unshimmed icon throws
  // here, in the suite, rather than on the deployed page.
  it("every shipped theme evaluates to a theme object through the preview pipeline", () => {
    for (const id of ["shadcn", "kumo", "blink"] as const) {
      const theme = evaluateTheme(sourceOf(id))
      expect(theme, id).toHaveProperty("components")
      expect(theme, id).toHaveProperty("vars")
    }
  })

  it("a customized source still evaluates, with the custom primary in the palette", () => {
    const { source } = customizeSource(sourceOf("shadcn"), { ...DEFAULT_OPTIONS, color: "blue" })
    const theme = evaluateTheme(source) as unknown as {
      colorSchemes: { light: { palette: { primary: { main: string } } } }
    }
    expect(theme.colorSchemes.light.palette.primary.main).toBe("oklch(0.546 0.245 262.881)")
  })
})
