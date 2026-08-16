/**
 * The export page's option catalogue. Every knob is a closed list of presets, never a free-form
 * value - the same shape as shadcn's own create page - because an arbitrary value would put the
 * generated file outside anything this repo can reason about, while a preset is a recorded,
 * reviewable choice.
 *
 * Colour presets are Tailwind's published oklch palette (v4), named accordingly, with the same
 * light/dark split shadcn's themes use: the 600 step carries light mode, the 500 step dark, and
 * the foreground stays the token set's near-white. Substituted lines carry an `// export:` note
 * in place of the original `// shadcn:` one, so a customized file never claims extraction it does
 * not have.
 */

export type ThemeId = "shadcn" | "kumo" | "blink"

export interface ColorPreset {
  id: string
  label: string
  /** Swatch colour for the option chip (light-mode primary). */
  swatch: string
  /** null = keep the theme's own values (the verified defaults). */
  values: {
    light: { primary: string; primaryForeground: string }
    dark: { primary: string; primaryForeground: string }
  } | null
}

export const COLOR_PRESETS: ColorPreset[] = [
  { id: "default", label: "Default", swatch: "oklch(0.205 0 0)", values: null },
  {
    id: "blue",
    label: "Blue",
    swatch: "oklch(0.546 0.245 262.881)",
    values: {
      light: { primary: "oklch(0.546 0.245 262.881)", primaryForeground: "oklch(0.985 0 0)" },
      dark: { primary: "oklch(0.623 0.214 259.815)", primaryForeground: "oklch(0.985 0 0)" },
    },
  },
  {
    id: "green",
    label: "Green",
    swatch: "oklch(0.627 0.194 149.214)",
    values: {
      light: { primary: "oklch(0.627 0.194 149.214)", primaryForeground: "oklch(0.985 0 0)" },
      dark: { primary: "oklch(0.723 0.219 149.579)", primaryForeground: "oklch(0.145 0 0)" },
    },
  },
  {
    id: "violet",
    label: "Violet",
    swatch: "oklch(0.541 0.281 293.009)",
    values: {
      light: { primary: "oklch(0.541 0.281 293.009)", primaryForeground: "oklch(0.985 0 0)" },
      dark: { primary: "oklch(0.606 0.25 292.717)", primaryForeground: "oklch(0.985 0 0)" },
    },
  },
  {
    id: "rose",
    label: "Rose",
    swatch: "oklch(0.586 0.253 17.585)",
    values: {
      light: { primary: "oklch(0.586 0.253 17.585)", primaryForeground: "oklch(0.985 0 0)" },
      dark: { primary: "oklch(0.645 0.246 16.439)", primaryForeground: "oklch(0.985 0 0)" },
    },
  },
  {
    id: "orange",
    label: "Orange",
    swatch: "oklch(0.646 0.222 41.116)",
    values: {
      light: { primary: "oklch(0.646 0.222 41.116)", primaryForeground: "oklch(0.985 0 0)" },
      dark: { primary: "oklch(0.705 0.213 47.604)", primaryForeground: "oklch(0.145 0 0)" },
    },
  },
  {
    id: "teal",
    label: "Teal",
    swatch: "oklch(0.6 0.118 184.704)",
    values: {
      light: { primary: "oklch(0.6 0.118 184.704)", primaryForeground: "oklch(0.985 0 0)" },
      dark: { primary: "oklch(0.704 0.14 182.503)", primaryForeground: "oklch(0.145 0 0)" },
    },
  },
]

export interface FontPreset {
  id: string
  label: string
  /** null = keep the theme's own stack. */
  stack: string | null
  /** What the generated file's install note should say. */
  note: string
}

export const FONT_PRESETS: FontPreset[] = [
  { id: "geist", label: "Geist", stack: null, note: "npm install @fontsource-variable/geist" },
  {
    id: "inter",
    label: "Inter",
    stack: '"Inter Variable", ui-sans-serif, system-ui, sans-serif',
    note: "npm install @fontsource-variable/inter",
  },
  {
    id: "system",
    label: "System",
    stack: "ui-sans-serif, system-ui, sans-serif",
    note: "no font package needed",
  },
]

export interface RadiusPreset {
  id: string
  label: string
  /** null = keep the theme's own base radius (shadcn: 0.625rem). */
  value: string | null
}

/** The same ladder shadcn's create page offers, around the shipped 0.625rem default. */
export const RADIUS_PRESETS: RadiusPreset[] = [
  { id: "none", label: "0", value: "0rem" },
  { id: "sm", label: "0.3", value: "0.3rem" },
  { id: "md", label: "0.5", value: "0.5rem" },
  { id: "default", label: "0.625", value: null },
  { id: "lg", label: "0.75", value: "0.75rem" },
  { id: "xl", label: "1", value: "1rem" },
]

export type Language = "ts" | "js"
export type CommentsMode = "keep" | "strip"

export interface ExportOptions {
  theme: ThemeId
  color: string
  font: string
  radius: string
  language: Language
  comments: CommentsMode
}

export const DEFAULT_OPTIONS: ExportOptions = {
  theme: "shadcn",
  color: "default",
  font: "geist",
  radius: "default",
  language: "ts",
  comments: "keep",
}

/** Which themes take design knobs at all. kumo and blink replicate fixed, branded design systems
 * pixel-for-pixel; recolouring one produces a file that is neither the brand nor verified, so they
 * export exactly as shipped and only the language/comments knobs apply. */
export const CUSTOMIZABLE: Record<ThemeId, boolean> = {
  shadcn: true,
  kumo: false,
  blink: false,
}
