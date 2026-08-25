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
/**
 * Open gaps against blink, kept here as a note because the assertion below no longer sees them.
 *
 * `shared` is shadcn + kumo, so a component only blink styles is out of scope for this test by
 * design - blink covers ALL of MUI and holding the other two to that would be a ratchet pointing
 * the wrong way. Most of what that removed was mapping detail ("blink's Select twin is the native
 * variant"), which is no longer information. One is not:
 *
 *   MuiPaper - a bare <Paper> under shadcn or kumo still wears Material's elevation chrome. blink
 *   closed this from its own flat surface; the other two each need their own extraction (shadcn's
 *   Card carries a border and shadow-sm and its overlay radii differ, so blink's value does not
 *   transfer). This is a real quality gap in both themes, not a difference of surface.
 */
const DELIBERATE_GAPS: Record<"shadcn" | "kumo" | "blink", Record<string, string>> = {
  shadcn: {
    MuiFormControl:
      "same surface, different key: the field family is themed through MuiInputLabel/MuiFormHelperText, the components shadcn's own field markup maps to",
    MuiFormLabel:
      "same surface, different key: see MuiFormControl",
    MuiListItemButton:
      "same surface, different key: list interactivity is themed via MuiListItem/MuiMenuItem; kumo's list rows are ListItemButtons",
    MuiSnackbar:
      "same surface, different key: shadcn's snackbar twin is sonner, themed through MuiSnackbarContent",
  },
  kumo: {
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

  /**
   * The shared surface is what shadcn and kumo cover, NOT the union of all three.
   *
   * blink is deliberately excluded from it, and that is the whole asymmetry: shadcn and kumo
   * replicate systems somebody else owns, so their surface stops where the original's does and
   * they are held to each other. blink's design system is ours, so it covers ALL of MUI and is a
   * strict SUPERSET of both - measured against MUI itself in `blink-coverage.test.ts`.
   *
   * Folding blink into the union would turn every component it authors for full coverage into a
   * fresh "gap" the other two have to excuse, which is a ratchet pointing the wrong way: it would
   * either block blink from covering MUI or fill the allowlist with entries that say nothing.
   * blink is still checked in the direction that MATTERS here - it must not fall behind the shared
   * surface - because the loop below still runs over it against that same shared set.
   */
  const shared = new Set([...keysOf(shadcnTheme), ...keysOf(kumoTheme)])

  for (const [name, theme] of Object.entries(themes) as Array<
    [keyof typeof themes, (typeof themes)[keyof typeof themes]]
  >) {
    it(`${name} covers every Mui* key the shared surface covers, minus its recorded gaps`, () => {
      const keys = keysOf(theme)
      const missing = [...shared].filter((k) => !keys.has(k)).sort()
      const excused = Object.keys(DELIBERATE_GAPS[name]).sort()
      // One assertion, both directions: `missing` beyond the allowlist means a new component was
      // themed elsewhere and this theme has not caught up (or has not recorded why it will not);
      // `excused` beyond the missing set means the gap has since been closed and the entry above
      // is stale - delete it so the record stays true.
      expect(missing).toEqual(excused)
    })
  }
})
