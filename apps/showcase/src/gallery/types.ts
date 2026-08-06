import type { ReactNode } from "react"

// Duplicated from e2e/lib/states.ts (the showcase app cannot import e2e/ source, and vice
// versa - keep these two PairState unions in sync by hand).
export type PairState = "default" | "hover" | "focus" | "open" | "active" | "anchored"

/** Non-pixel behaviors asserted by e2e/behavior.spec.ts (declarative discovery via `data-behaviors`). */
export type PairBehavior =
  | "animates"
  | "hover-opens"
  | "escape-closes"
  | "overlay-matches"
  | "item-hover-highlights"
  | "anchored-to-trigger"

/**
 * The two cells of a pair. `ref` is the real component of whichever design system the page is
 * replicating (shadcn, kumo, ...) - named for the ROLE rather than the system, so one gallery
 * harness serves every theme.
 */
export type Side = "ref" | "mui"

export interface Pair {
  id: string
  /** states the harness exercises; default ["default"] */
  states?: PairState[]
  /** non-pixel behaviors e2e/behavior.spec.ts exercises for this pair; default none */
  behaviors?: PairBehavior[]
  /**
   * Blank pixels to reserve below this pair's row, for pairs whose open overlay hangs past it.
   *
   * An overlay with rounded corners is TRANSPARENT outside the corner curves, and the harness's
   * element screenshot composites whatever the page has behind it there. The two overlays of a pair
   * open at the same y but at different x, so if either corner lands on page content, each side
   * composites over DIFFERENT content. Measured on autocomplete-open: both overlays are 223x92, at
   * x=277 and x=549, and shadcn's bottom-left corner sat exactly over the "S" of the next section's
   * "Slider" heading while MUI's sat over blank background - 16 stray pixels at a per-channel delta
   * of 235, which reads like a serious colour bug and is purely an artifact of where the cells are.
   *
   * Reserving room keeps the overlay over its own row's empty background, which is uniform across
   * the full width and therefore identical behind both corners. The row's bottom border spans the
   * whole width too, so it sits behind both sides at the same y and cancels out.
   *
   * Applied as padding on the row, below the cells, so it adds blank space without moving either
   * component. Only needed for pairs whose overlay actually extends past the row.
   */
  roomBelow?: number
  /**
   * CSS selector that finds this pair's open overlay when it CANNOT be tagged with
   * `data-portal-target`.
   *
   * The harness normally identifies a portalled overlay by a `data-portal-target="<pairId>"`
   * attribute both sides carry, which is exact and needs no knowledge of the component's internals.
   * Some reference components give you nowhere to put it: kumo's `Tooltip` spreads its rest props
   * onto the Base UI root and puts `className` on the TRIGGER, so nothing reaches the popup. Its
   * `container` prop portals into a node you supply, but that wrapper is `position: static` and
   * 0x0, so it is not the box to screenshot either.
   *
   * When set, the selector participates in overlay lookup and in resetState's "everything closed"
   * assertion alongside the attribute, so only the side that needs it uses it - the MUI side of the
   * same pair still carries `data-portal-target` as usual. Only one side's overlay is ever open at
   * a time, so the two never collide.
   *
   * Keep it a stable, component-owned class the package ships deliberately (kumo's popup carries
   * `kumo-tooltip-popup`), never a hashed/utility class, or a package update silently stops
   * matching and the pair fails as "overlay never opened" rather than as a style difference.
   */
  openSelector?: string
  /** The real reference-system component this pair is judged against. */
  ref: ReactNode
  mui: ReactNode
}

export interface Section {
  title: string
  pairs: Pair[]
}
