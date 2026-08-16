import type { ReactNode } from "react"
import MuiButton from "@mui/material/Button"
import MuiChip from "@mui/material/Chip"

/**
 * Per-column replacements for a showcase cell whose props only mean something under kumo.
 *
 * The showcase reads the KUMO gallery's `mui` nodes as its component list (see Showcase.tsx on
 * why). That reuse is almost always harmless - a `<Button variant="contained">` is the same request
 * under every theme - but it breaks down wherever a kumo pair reaches for a prop value that only
 * kumo's theme declares. `<Chip color="blue">` is the clearest case: kumo augments MUI's Chip with
 * its own five-colour axis, and neither of the other themes has ever heard of `blue`, so their
 * columns fall through to MUI's unstyled default and the whole Badge row reads as grey.
 *
 * That is not the harmless kind of "looks wrong under another theme" AGENTS.md warns about, where a
 * cell composed for one system's layout legitimately renders differently under another. Here the
 * cell asks for something the theme cannot answer at all, so the column shows nothing about the
 * theme - which is the one thing this page exists to show.
 *
 * The fix is deliberately a lookup rather than a rewrite of the kumo pair: kumo's own column has to
 * keep rendering exactly what its parity page proves. A column names its own node for the pair id
 * it cannot express, and everything else keeps reusing kumo's.
 *
 * There is a second, subtler case, and the Button row is where it shows up: the props are perfectly
 * portable and still mean a DIFFERENT DESIGN in the other system. `<Button variant="contained"
 * color="error">` is kumo's destructive button and it renders fine under blink - as a solid red
 * button the Pulse Kit does not have. Its destructive is a tinted fill with a 20%-alpha border,
 * which is `variant="light" color="error"` here. The showcase row is labelled "Destructive", so the
 * cell that answers it should be the theme's destructive button, and someone comparing this page
 * against /blink.html should see the same control on both.
 *
 * KEEP THIS SMALL. An entry here is a claim that the shared cell asks a question this theme answers
 * differently, not a place to hand a theme a prettier demo. If a component's props are portable AND
 * mean the same thing, reuse them.
 */
export const COLUMN_OVERRIDES: Record<string, Record<string, ReactNode>> = {
  /**
   * Badge. The Pulse Kit's Badge is six colours times two emphases, so every one of kumo's colour
   * cells has a real answer here - it just has to be spelled in the kit's own vocabulary.
   *
   * `variant="solid"` (the kit's saturated fill) rather than the kit's default `soft` emphasis: the
   * row is a COLOUR comparison and the columns either side of it paint solid pills, so a 10% tint
   * would answer the question with something that still reads as grey at a glance. Both emphases,
   * all six colours and all three sizes are on /blink.html, where they are pixel-diffed against the
   * real Badge; this row is the showcase's one-per-row sample of them.
   *
   * `blue` maps to `primary` because the kit HAS no blue - its one accent is the indigo the whole
   * system is built on, and that is what a Pulse badge in the "blue" role paints.
   *
   * The `outline` cell is the one that has no equivalent: the kit ships no bordered pill at all
   * (the theme's MuiChip leaves MUI's `outlined` unstyled on purpose, for exactly that reason), so
   * the honest answer is the kit's quiet badge - `soft` + `default` - rather than a border invented
   * for this page.
   *
   * shadcn is deliberately absent from this map. Its Badge has no colour axis to map ONTO -
   * badge.tsx defines default/secondary/destructive/outline and no green, orange or blue exists
   * anywhere in it - so any entry would be inventing a shadcn look rather than showing one. Its
   * column stays as the shared cell renders it.
   */
  blink: {
    /**
     * Button. Two of kumo's cells do not survive the trip, for the two different reasons above.
     *
     * `button-destructive` is the design-mapping case: kumo's destructive is a solid red fill and
     * the kit's is a tinted one, so the shared `contained`+`error` cell renders a real blink button
     * that is not the kit's destructive button. /blink.html diffs `variant="light" color="error"`
     * against the kit's `.destructive`, and this is that same control.
     *
     * `button-xs` is the vocabulary case: kumo's extra-small step is `size="xsmall"` and the kit's
     * is `size="xs"`, so the shared cell asks blink for a size it has never declared and gets the
     * default 36px control back - the one row on the page where the blink button is not smaller
     * than its neighbours.
     *
     * `button-secondary-destructive` is deliberately NOT overridden, and it is worth saying why
     * rather than leaving a reader to wonder. The kit ships exactly one destructive button; there
     * is no red-outlined second tier to point at, and blink's `outlined` carries no colour axis at
     * all, so the cell renders a neutral secondary button. That is what this theme does with those
     * props, and inventing a red outline here would be putting a variant on the page that neither
     * the kit nor the theme has.
     */
    "button-destructive": (
      <MuiButton variant="light" color="error">
        Destructive
      </MuiButton>
    ),
    "button-xs": (
      <MuiButton size="xs" variant="outlined">
        Extra Small
      </MuiButton>
    ),

    "badge-blue": <MuiChip variant="solid" color="primary" label="Blue" />,
    "badge-green": <MuiChip variant="solid" color="success" label="Green" />,
    "badge-orange": <MuiChip variant="solid" color="warning" label="Orange" />,
    "badge-neutral": <MuiChip variant="solid" color="default" label="Neutral" />,
    "badge-red": <MuiChip variant="solid" color="error" label="Red" />,
    "badge-outline": <MuiChip color="default" label="Outline" />,
  },
}
