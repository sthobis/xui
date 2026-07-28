import type { ReactNode } from "react"

// Duplicated from e2e/lib/states.ts (the showcase app cannot import e2e/ source, and vice
// versa - keep these two PairState unions in sync by hand).
export type PairState = "default" | "hover" | "focus" | "open" | "active" | "anchored"

/** Non-pixel behaviors asserted by e2e/behavior.spec.ts (declarative discovery via `data-behaviors`). */
export type PairBehavior = "animates" | "hover-opens" | "escape-closes" | "overlay-matches" | "item-hover-highlights"

export interface Pair {
  id: string
  /** states the harness exercises; default ["default"] */
  states?: PairState[]
  /** non-pixel behaviors e2e/behavior.spec.ts exercises for this pair; default none */
  behaviors?: PairBehavior[]
  shadcn: ReactNode
  mui: ReactNode
}

export interface Section {
  title: string
  pairs: Pair[]
}
