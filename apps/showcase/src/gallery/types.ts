import type { ReactNode } from "react"

export type PairState = "default" | "hover" | "focus"

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
