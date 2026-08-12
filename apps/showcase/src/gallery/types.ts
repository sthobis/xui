import type { ReactNode } from "react"

// Duplicated from e2e/lib/states.ts (the showcase app cannot import e2e/ source, and vice
// versa - keep these two PairState unions in sync by hand).
export type PairState =
  | "default"
  | "hover"
  | "focus"
  | "open"
  | "active"
  | "anchored"
  // Hovers the cell's `[data-hover-target]` instead of its `[data-target]`, for components whose
  // appearance depends on WHICH child the pointer is over - a Rating's value preview, a SpeedDial
  // action's tooltip. Both sides must mark the same child.
  | "hover-child"

/** Non-pixel behaviors asserted by e2e/behavior.spec.ts (declarative discovery via `data-behaviors`). */
export type PairBehavior = "animates" | "hover-opens" | "escape-closes" | "overlay-matches" | "item-hover-highlights" | "filters-on-type"

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
  shadcn: ReactNode
  mui: ReactNode
}

export interface Section {
  title: string
  pairs: Pair[]
}
