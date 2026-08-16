import type { Page } from "@playwright/test"
import type { PairState } from "./states"

/**
 * One gallery pair as the DOM declares it. This is the single discovery routine for every spec -
 * parity reads `states`, behavior reads `behaviors`, preflight reads only `id` - because the same
 * `page.evaluate` used to be written out verbatim in four places and a fix to how attributes are
 * parsed then had to find all of them.
 */
export interface DiscoveredPair {
  id: string
  states: PairState[]
  behaviors: string[]
}

export async function discoverPairs(page: Page): Promise<DiscoveredPair[]> {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-pair-id]")).map((el) => ({
      id: el.getAttribute("data-pair-id")!,
      // `states: []` is a legitimate declaration, not a mistake: a pair can exist to be judged by
      // e2e/behavior.spec.ts alone when the pixel harness structurally cannot compare it (kumo's
      // Select popup - see its section for the measurements). Filtering the empty string keeps that
      // from being read as one state named "".
      states: (el.getAttribute("data-states") ?? "default")
        .split(",")
        .filter(Boolean) as PairState[],
      behaviors: (el.getAttribute("data-behaviors") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    })),
  )
}

/**
 * The `PARITY_PAIR=slider,button` iteration filter (comma-separated id prefixes), applied
 * uniformly: parity always supported it, and the behavior sweeps now honour it too, so iterating
 * on one component runs its behaviours in seconds instead of sweeping the whole gallery.
 *
 * `filtered` is returned alongside because two decisions hang off it, not just the pair list:
 * parity writes a separate `.filtered.md` report and leaves the canonical diffs alone, and the
 * exemption-key validation only runs on a full run (a filtered run legitimately sees a subset of
 * ids, so every exemption for the rest would read as stale).
 */
export function filterByParityPair<T extends { id: string }>(
  pairs: T[],
): { pairs: T[]; filtered: boolean } {
  const only = (process.env.PARITY_PAIR ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  if (only.length === 0) return { pairs, filtered: false }
  return {
    pairs: pairs.filter((p) => only.some((f) => p.id === f || p.id.startsWith(f))),
    filtered: true,
  }
}
