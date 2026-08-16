import { stripComments } from "../gallery/stripComments"
import {
  COLOR_PRESETS,
  CUSTOMIZABLE,
  FONT_PRESETS,
  RADIUS_PRESETS,
  type ExportOptions,
  type ThemeId,
} from "./options"

/**
 * Applies the export page's options to a theme file's SOURCE TEXT.
 *
 * Substitution over source rather than a parameterized theme builder, deliberately: the one-file
 * theme is the product, and the export has to be that same file with a handful of recorded edits,
 * not a second implementation that could drift from it. Every replacement is ANCHORED on the exact
 * line as it ships - including its provenance comment - and a miss throws instead of silently
 * exporting the unmodified value. The unit test in customize.test.ts runs every anchor against the
 * real theme sources on every `pnpm test:unit`, so editing shadcn.ts in a way that breaks an
 * anchor fails the suite at the moment of the edit, not in a user's download.
 *
 * Substituted lines swap their `// shadcn:` provenance for an `// export:` note naming the shipped
 * value. A customized file must never claim an extraction it does not have - the provenance
 * comments are the project's evidence, and the export page is the one place values legitimately
 * leave the extracted set.
 */

/** The exact shipped lines substitution anchors on, per theme. Single source for page and test. */
export const ANCHORS = {
  shadcn: {
    radius: `const RADIUS = "0.625rem"`,
    font: `const FONT_SANS = '"Geist Variable", ui-sans-serif, system-ui, sans-serif'`,
    lightPrimary: `  primary: "oklch(0.205 0 0)", // shadcn: --primary`,
    lightPrimaryForeground: `  primaryForeground: "oklch(0.985 0 0)", // shadcn: --primary-foreground`,
    darkPrimary: `  primary: "oklch(0.922 0 0)", // shadcn: .dark --primary`,
    darkPrimaryForeground: `  primaryForeground: "oklch(0.205 0 0)", // shadcn: .dark --primary-foreground`,
  },
} as const satisfies Partial<Record<ThemeId, Record<string, string>>>

function replaceOnce(source: string, find: string, replace: string, what: string): string {
  const parts = source.split(find)
  if (parts.length !== 2) {
    throw new Error(
      `export anchor for ${what} matched ${parts.length - 1} times (expected exactly 1) - ` +
        `the theme file changed shape and customize.ts must be updated`,
    )
  }
  return parts.join(replace)
}

export interface CustomizeResult {
  source: string
  fileName: string
  /** Human-readable summary of what was changed, for the page and the banner. */
  changes: string[]
}

export function customizeSource(rawSource: string, options: ExportOptions): CustomizeResult {
  const color = COLOR_PRESETS.find((c) => c.id === options.color)
  const font = FONT_PRESETS.find((f) => f.id === options.font)
  const radius = RADIUS_PRESETS.find((r) => r.id === options.radius)
  if (!color || !font || !radius) throw new Error("export: unknown preset id")

  let source = rawSource
  const changes: string[] = []

  // Design knobs only exist for themes that take them; the option state cannot even ask (the page
  // disables the controls), but the engine still guards so a programmatic caller cannot either.
  if (CUSTOMIZABLE[options.theme]) {
    const a = ANCHORS.shadcn
    if (radius.value) {
      source = replaceOnce(
        source,
        a.radius,
        `const RADIUS = "${radius.value}" // export: customized (shipped: 0.625rem)`,
        "radius",
      )
      changes.push(`radius ${radius.value}`)
    }
    if (font.stack) {
      source = replaceOnce(
        source,
        a.font,
        `const FONT_SANS = '${font.stack}' // export: customized (shipped: Geist; ${font.note})`,
        "font",
      )
      changes.push(`font ${font.label}`)
    }
    if (color.values) {
      const v = color.values
      const tag = `tailwind ${color.id}`
      source = replaceOnce(
        source,
        a.lightPrimary,
        `  primary: "${v.light.primary}", // export: ${tag} (customized; shipped: oklch(0.205 0 0))`,
        "light primary",
      )
      source = replaceOnce(
        source,
        a.lightPrimaryForeground,
        `  primaryForeground: "${v.light.primaryForeground}", // export: ${tag} foreground (customized; shipped: oklch(0.985 0 0))`,
        "light primaryForeground",
      )
      source = replaceOnce(
        source,
        a.darkPrimary,
        `  primary: "${v.dark.primary}", // export: ${tag} (customized; shipped: oklch(0.922 0 0))`,
        "dark primary",
      )
      source = replaceOnce(
        source,
        a.darkPrimaryForeground,
        `  primaryForeground: "${v.dark.primaryForeground}", // export: ${tag} foreground (customized; shipped: oklch(0.205 0 0))`,
        "dark primaryForeground",
      )
      changes.push(`primary ${color.label}`)
    }
  }

  // The banner only exists on a CUSTOMIZED file. An all-defaults TypeScript export stays
  // byte-identical to the file in the repo - being able to say "this download IS the verified
  // file" is worth more than a decorative header.
  if (changes.length > 0) {
    source =
      `// Customized ${options.theme} theme, generated by the xui export page.\n` +
      `// Changed from the shipped file: ${changes.join(", ")}. Every changed line is marked\n` +
      `// with an \`// export:\` comment naming the shipped value; all other values keep their\n` +
      `// extraction provenance. NOTE: a customized file is yours - it no longer renders the\n` +
      `// pixel-verified ${options.theme} look, and the parity claims in the repo do not apply to it.\n` +
      (font.stack ? `// Font: ${font.note}\n` : "") +
      `\n` +
      source
  }

  if (options.comments === "strip") source = stripComments(source)

  const base = options.theme
  const suffix = changes.length > 0 ? "-custom" : ""
  return { source, fileName: `${base}${suffix}.${options.language}`, changes }
}
