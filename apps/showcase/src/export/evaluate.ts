import type { Theme } from "@mui/material/styles"
import * as muiStyles from "@mui/material/styles"
import { CheckIcon as PhosphorCheckIcon, MinusIcon as PhosphorMinusIcon } from "@phosphor-icons/react"
import {
  Check,
  ChevronDown,
  ChevronDownIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react"
import * as React from "react"
import { transform } from "sucrase"

/**
 * Turns customized theme SOURCE back into things the page can use: a JavaScript rendition for the
 * `language: "js"` export, and a live Theme object for the preview.
 *
 * The preview deliberately evaluates the exact text the user will download rather than rebuilding
 * a lookalike theme by hand - a second implementation of the options would drift from the
 * substitution engine and preview something the export does not contain. Sucrase does the type
 * stripping both paths need: it removes types without touching runtime code, comments or
 * formatting, which is exactly what a "JS version" of a comment-is-the-product file has to mean.
 */

/** The customized file with its types stripped - the `language: "js"` output.
 * `disableESTransforms` keeps modern syntax (`??`, `?.`) as written instead of injecting sucrase's
 * downlevel helpers above the file's own header comment - types out, everything else untouched. */
export function toJavaScript(tsSource: string): string {
  return transform(tsSource, { transforms: ["typescript"], disableESTransforms: true }).code
}

/**
 * The bare-import surface of the three theme files, served to the evaluated module by name.
 *
 * ONLY the icons the themes actually import are shimmed - a namespace import of lucide-react
 * would drag the entire icon set into this page's bundle. The Proxy makes a future theme edit
 * that imports a new icon fail with a message naming this file, and customize.test.ts evaluates
 * all three shipped themes on every test run, so that failure surfaces in the suite rather than
 * on the deployed page.
 */
const MODULES: Record<string, object> = {
  react: React,
  "@mui/material/styles": muiStyles,
  "lucide-react": wrapIconModule("lucide-react", {
    Check,
    ChevronDown,
    ChevronDownIcon,
    CircleAlertIcon,
    CircleCheckIcon,
    InfoIcon,
    TriangleAlertIcon,
  }),
  "@phosphor-icons/react": wrapIconModule("@phosphor-icons/react", {
    CheckIcon: PhosphorCheckIcon,
    MinusIcon: PhosphorMinusIcon,
  }),
}

function wrapIconModule(name: string, icons: Record<string, unknown>): object {
  return new Proxy(icons, {
    get(target, prop) {
      if (typeof prop === "string" && !(prop in target) && prop !== "__esModule" && prop !== "default") {
        throw new Error(
          `export page: the theme imports "${String(prop)}" from ${name}, which evaluate.ts does ` +
            `not shim yet - add it to MODULES (customize.test.ts holds this)`,
        )
      }
      return target[prop as keyof typeof target]
    },
  })
}

/**
 * Evaluates a theme file's source and returns the theme it exports.
 *
 * Sucrase's `imports` transform turns the file's ESM into CommonJS, which a Function wrapper can
 * run with a two-line require shim - no bundler in the loop, no import maps, no network. The file
 * ends in exactly one `export const <name>Theme`, so the single export is the theme.
 */
export function evaluateTheme(tsSource: string): Theme {
  const cjs = transform(tsSource, {
    transforms: ["typescript", "imports"],
    disableESTransforms: true,
  }).code
  const requireShim = (specifier: string): object => {
    const mod = MODULES[specifier]
    if (!mod) {
      throw new Error(
        `export page: the theme imports "${specifier}", which evaluate.ts does not shim - ` +
          `add it to MODULES (customize.test.ts holds this)`,
      )
    }
    return mod
  }
  const moduleShim = { exports: {} as Record<string, unknown> }
  new Function("require", "module", "exports", cjs)(requireShim, moduleShim, moduleShim.exports)
  const themes = Object.entries(moduleShim.exports).filter(([key]) => key.endsWith("Theme"))
  if (themes.length !== 1) {
    throw new Error(
      `export page: expected the evaluated file to export exactly one *Theme, found ` +
        `[${Object.keys(moduleShim.exports).join(", ")}]`,
    )
  }
  return themes[0][1] as Theme
}
