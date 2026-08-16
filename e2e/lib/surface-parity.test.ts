import { describe, expect, it } from "vitest"
import { blinkTheme } from "../../packages/xui/src/themes/blink.js"
import { kumoTheme } from "../../packages/xui/src/themes/kumo.js"
import { shadcnTheme } from "../../packages/xui/src/themes/shadcn.js"

/**
 * The three themes cover one shared MUI surface - that is the project's core claim, and until now
 * it was enforced by discipline alone. This test makes it a ratchet: every `Mui*` component key
 * any theme carries must be carried by the others too, OR be listed below with the reason it is
 * deliberately absent.
 *
 * The allowlist is compared EXACTLY, in both directions, so it cannot rot: a theme that loses a
 * key it should have fails, and a theme that later gains a key an entry excuses also fails, so the
 * entry is removed the moment it stops being true. This mirrors how thresholds.ts treats pixel
 * exemptions - an exception is a recorded claim, not a hole.
 *
 * Two very different things land here, and an entry must say which it is:
 *  - SAME SURFACE, DIFFERENT KEY: the design system covers the surface but its MUI transcription
 *    reaches it through a different component key (shadcn's snackbar twin is sonner, themed via
 *    MuiSnackbarContent; kumo's toast is a real MuiSnackbar).
 *  - MEASURED OMISSION: the correct block is NO block, proved in the theme file (blink's
 *    MuiBackdrop - MUI's default already IS the kit's scrim, and a root override breaks the
 *    invisible backdrops Menu/Select/Popover rely on).
 */
const DELIBERATE_GAPS: Record<"shadcn" | "kumo" | "blink", Record<string, string>> = {
  shadcn: {
    MuiAlertTitle:
      "same surface, different key: the title's font-medium lives in the MuiAlert block's own selectors",
    MuiCssBaseline:
      "blink-only surface: the Pulse Kit styles every bare <a> globally; shadcn's link treatment is MuiLink's alone",
    MuiDialogActions:
      "same surface, different key: dialog spacing is built on the panel plus MuiDialogTitle/MuiDialogContentText",
    MuiDialogContent:
      "same surface, different key: see MuiDialogActions",
    MuiFormControl:
      "same surface, different key: the field family is themed through MuiInputLabel/MuiFormHelperText, the components shadcn's own field markup maps to",
    MuiFormLabel:
      "same surface, different key: see MuiFormControl",
    MuiListItemButton:
      "same surface, different key: list interactivity is themed via MuiListItem/MuiMenuItem; kumo's list rows are ListItemButtons",
    MuiNativeSelect:
      "blink-only surface: blink's Select twin is MUI's native variant; shadcn's select is the listbox Select",
    MuiSnackbar:
      "same surface, different key: shadcn's snackbar twin is sonner, themed through MuiSnackbarContent",
  },
  kumo: {
    MuiAlertTitle: "kumo's Banner is single-line; the reference has no title element to extract",
    MuiCssBaseline:
      "blink-only surface: kumo styles links through MuiLink; the kit has no global bare-anchor rule to carry",
    MuiDialogActions:
      "same surface, different key: kumo's Dialog is themed through the panel plus MuiDialogContentText",
    MuiDialogContent: "same surface, different key: see MuiDialogActions",
    MuiNativeSelect: "blink-only surface: kumo's Select replicates the listbox variant, not the native one",
  },
  blink: {
    MuiBackdrop:
      "measured omission: MUI's default already IS the kit's scrim, and a root override breaks the invisible backdrops - see the NO MuiBackdrop BLOCK note in blink.ts",
    MuiInputBase:
      "same surface, different key: the kit's inputs are transcribed onto MuiOutlinedInput, multiline included; shadcn needs MuiInputBase only for adornment padding",
    MuiTableHead:
      "measured omission: the kit's table head paints no background of its own - see the NO MuiTableHead BLOCK note in blink.ts",
    MuiTouchRipple:
      "same surface, different key: ripple is disabled per component exactly as the kit does; shadcn/kumo additionally carry a display:none backstop on this key",
  },
}

describe("theme surface parity", () => {
  const themes = { shadcn: shadcnTheme, kumo: kumoTheme, blink: blinkTheme } as const
  const keysOf = (theme: (typeof themes)[keyof typeof themes]) =>
    new Set(Object.keys(theme.components ?? {}))
  const union = new Set(Object.values(themes).flatMap((t) => [...keysOf(t)]))

  for (const [name, theme] of Object.entries(themes) as Array<
    [keyof typeof themes, (typeof themes)[keyof typeof themes]]
  >) {
    it(`${name} covers every Mui* key the other themes cover, minus its recorded gaps`, () => {
      const keys = keysOf(theme)
      const missing = [...union].filter((k) => !keys.has(k)).sort()
      const excused = Object.keys(DELIBERATE_GAPS[name]).sort()
      // One assertion, both directions: `missing` beyond the allowlist means a new component was
      // themed elsewhere and this theme has not caught up (or has not recorded why it will not);
      // `excused` beyond the missing set means the gap has since been closed and the entry above
      // is stale - delete it so the record stays true.
      expect(missing).toEqual(excused)
    })
  }
})
