import type { ReactNode } from "react"

// Duplicated from e2e/lib/states.ts (the showcase app cannot import e2e/ source, and vice
// versa - keep these two PairState unions in sync by hand).
export type PairState = "default" | "hover" | "focus" | "open"

export interface Pair {
  id: string
  /** states the harness exercises; default ["default"] */
  states?: PairState[]
  shadcn: ReactNode
  mui: ReactNode
}

export interface Section {
  title: string
  pairs: Pair[]
}
