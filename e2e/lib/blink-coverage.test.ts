import { readdirSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname } from "node:path"
import { describe, expect, it } from "vitest"
import { blinkTheme } from "../../packages/xui/src/themes/blink.js"

/**
 * blink covers ALL of MUI, and this is the test that says so.
 *
 * shadcn and kumo replicate systems somebody else owns, so their surface stops where the original's
 * does and `surface-parity.test.ts` compares them to EACH OTHER. blink's design system is ours, so
 * there is no original to stop at - a consumer drops the theme in and must never meet a stock
 * Material control. Its surface is therefore measured against MUI itself.
 *
 * Every component MUI ships is either styled by `blink.ts` or listed below with the reason it is
 * not. The list is compared EXACTLY: a component that gains a block while still being excused fails
 * too, so an entry is deleted the moment it stops being true. Same ratchet as `thresholds.ts` and
 * `surface-parity.test.ts` - an exception is a recorded claim, never a hole.
 *
 * An entry must say WHICH KIND of absence it is:
 *
 *  - NOTHING TO STYLE: the component paints nothing of its own. Layout primitives whose whole API
 *    is props (Box, Stack, Grid), transition wrappers (Fade, Grow), behaviour-only helpers
 *    (Portal, NoSsr, ClickAwayListener). A block here would be dead code.
 *  - SAME SURFACE, DIFFERENT KEY: what a user sees IS styled, through another component's block.
 *  - MEASURED OMISSION: the correct block is provably NO block, and the theme file carries the
 *    measurement. blink has two, and both cost real pixels to discover.
 *  - NOT A COMPONENT: a directory in @mui/material that is not a themeable component at all.
 */
const NOT_STYLED: Record<string, string> = {
  // ---- nothing to style: these paint nothing of their own ----
  MuiBox: "nothing to style: a style-prop primitive with no chrome of its own",
  MuiStack: "nothing to style: flex layout driven entirely by props",
  MuiGrid: "nothing to style: layout only, and every value comes from props",
  MuiContainer: "nothing to style: a max-width wrapper; blink states no page gutter of its own",
  MuiCollapse: "nothing to style: a height transition; the Accordion block styles what is inside it",
  MuiFade: "nothing to style: an opacity transition",
  MuiGrow: "nothing to style: a scale transition",
  MuiSlide: "nothing to style: a translate transition",
  MuiZoom: "nothing to style: a scale transition",
  MuiPortal: "nothing to style: renders children into another node, no DOM of its own",
  MuiNoSsr: "nothing to style: a render gate",
  MuiClickAwayListener: "nothing to style: an event helper",
  MuiTextareaAutosize: "nothing to style: a bare textarea that measures itself; blink styles it through MuiOutlinedInput's multiline rules",
  MuiUnstable_TrapFocus: "nothing to style: focus management only",
  MuiGlobalStyles: "not a component: an emotion escape hatch",
  MuiInitColorSchemeScript: "not a component: an inline script tag",
  MuiDefaultPropsProvider: "not a component: a context provider",
  MuiOverridableComponent: "not a component: a type-only helper",
  MuiPigmentContainer: "not a component: Pigment CSS build variant of MuiContainer",
  MuiPigmentGrid: "not a component: Pigment CSS build variant of MuiGrid",
  MuiPigmentStack: "not a component: Pigment CSS build variant of MuiStack",

  // ---- same surface, different key ----
  MuiInputBase:
    "same surface, different key: the field rules live on the three shape components - MuiOutlinedInput carries the kit's field, and MuiInput/MuiFilledInput COLLAPSE onto the same design (see collapsedFieldRoot in the theme). A block here would state shared rules a fourth time at a key none of the pairs exercise",
  MuiTextField:
    "same surface, different key: TextField renders a FormControl around an OutlinedInput and an InputLabel, all three of which carry blink's rules; its own root paints nothing",
  MuiModal:
    "same surface, different key: the Modal root is position + z-index only. What a user sees is the Dialog paper and the backdrop, both styled",
  MuiPopper:
    "same surface, different key: Popper is a positioner with no chrome; the Tooltip, Menu and Popover blocks style what it carries",
  MuiSwipeableDrawer:
    "same surface, different key: it renders a MuiDrawer, which is styled; the swipe area is behaviour",
  MuiMenuList:
    "same surface, different key: the menu's list box is styled through MuiMenu's paper and MuiList, which MenuList renders",
  MuiRadioGroup:
    "same surface, different key: a bare FormGroup wrapper; the radios and their labels carry the style",
  MuiIcon:
    "nothing to style: the ligature-font icon component. blink's icon language is lucide SVGs, so a consumer never reaches this - and sizing it would claim a Material Icons font the theme does not ship",
  MuiTabScrollButton:
    "same surface, different key: the scroll arrows ARE styled, from MuiTabs' root via a descendant selector. MUI v9 names the component MuiTabScrollButton at runtime but omits the key from its Components type, so a block of its own does not typecheck",
  MuiTableFooter:
    "same surface, different key: the kit's footer rules land on the CELL (`.footer .cell` - a top border, no bottom border, muted ink), which MuiTableCell's `footer` slot carries with provenance. A block on the footer ROOT is not a second opinion, it is a second border - an authored one measured 47 painted pixels the reference does not have, and invented a background the kit's footer has never had",
  MuiAvatarGroup:
    "same surface, different key: the group's overlap and surplus chip are built from MuiAvatar, which carries blink's avatar rules",

  // ---- measured omissions: the correct block is NO block ----
  MuiBackdrop:
    "measured omission: MUI's default already IS blink's scrim, and a root override breaks the INVISIBLE backdrops Menu/Select/Popover rely on - .MuiBackdrop-invisible is one class, so a plain root rule ties on specificity and wins on order. 230 differing pixels open, 12337 anchored. See the block comment in blink.ts",
  MuiTableHead:
    "measured omission: a head reads white in blink only because whatever is behind the table is; its container paints no background at all. Writing --color-surface there overpaints the page - 57948 pixels at Δ18, #fff against the #edeff0 canvas. See the block comment in blink.ts",
}

/** Every component directory @mui/material ships, as `Mui<Name>` keys. */
function muiComponentKeys(): string[] {
  const require = createRequire(import.meta.url)
  const root = dirname(require.resolve("@mui/material/package.json"))
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^[A-Z]/.test(e.name))
    .map((e) => `Mui${e.name}`)
    .sort()
}

describe("blink covers all of MUI", () => {
  const shipped = new Set(Object.keys(blinkTheme.components ?? {}))
  const all = muiComponentKeys()

  it("styles every MUI component, or records why not", () => {
    const unexplained = all.filter((k) => !shipped.has(k) && !(k in NOT_STYLED))
    expect(
      unexplained,
      `blink does not style these and gives no reason:\n${unexplained.join("\n")}\n\n` +
        `blink covers ALL of MUI - see AGENTS.md, "Deriving a component blink has no twin for". ` +
        `Either add a block derived from blink's own tokens and neighbouring decisions, or add an ` +
        `entry to NOT_STYLED saying which kind of absence it is.`,
    ).toEqual([])
  })

  it("keeps no stale exemptions", () => {
    const nowStyled = Object.keys(NOT_STYLED).filter((k) => shipped.has(k))
    expect(
      nowStyled,
      `these are excused in NOT_STYLED but blink styles them - delete the entries:\n${nowStyled.join("\n")}`,
    ).toEqual([])

    const gone = Object.keys(NOT_STYLED).filter((k) => !all.includes(k))
    expect(
      gone,
      `these are excused in NOT_STYLED but MUI no longer ships them - delete the entries:\n${gone.join("\n")}`,
    ).toEqual([])
  })

  it("gives every exemption a reason of a recognised kind", () => {
    const KINDS = ["nothing to style:", "same surface, different key:", "measured omission:", "not a component:"]
    const bad = Object.entries(NOT_STYLED)
      .filter(([, reason]) => !KINDS.some((k) => reason.startsWith(k)))
      .map(([k]) => k)
    expect(
      bad,
      `these exemptions do not say which KIND of absence they are (${KINDS.join(" / ")}):\n${bad.join("\n")}`,
    ).toEqual([])
  })
})
