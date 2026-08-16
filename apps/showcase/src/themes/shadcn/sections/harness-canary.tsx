import type { Section } from "../../../gallery/types"

/**
 * A pair that is INTENTIONALLY different, and whose job is to fail to match.
 *
 * Everything else in every gallery proves the themes correct; nothing proved the instrument
 * correct. The harness's own history is the argument for this: a 0.1 pixelmatch threshold once
 * scored a 24%-different grey wash as a perfect match for two suites running (see thresholds.ts),
 * and a regression of that shape - in the diff routine, in capture plumbing, in a Playwright or
 * Chromium update - would turn every green row meaningless while looking exactly like success.
 * The unit tests in e2e/lib/compare.test.ts cover diffPngs in isolation; this pair covers the
 * whole path a real pair takes - render, snap, capture, diff - end to end.
 *
 * The two swatches differ by exactly 1/255 on every channel over a 40x40 box: the smallest
 * difference the pipeline can be asked to see, in the largest quantity, with no antialiasing story
 * to argue about. parity.spec.ts special-cases this id - it must measure a NONZERO difference, and
 * a zero is reported as a broken pipeline rather than as a passing pair. It lives in the shadcn
 * gallery only: the check exercises the harness, not a theme, and once is enough. The kumo gallery
 * would be the wrong home anyway - the showcase page reuses its `mui` nodes as the component list,
 * and a meaningless grey swatch has no business in the component matrix.
 *
 * Deliberately inline-styled, text-free and interaction-free, so every other sweep sees two sides
 * that agree: preflight (inline styles resolve identically without Tailwind), painted geometry
 * (one box at one place on both sides), text metrics and accepts-input (nothing to join on).
 */
const swatch = (background: string) => <div style={{ width: 40, height: 40, background }} />

export const harnessCanarySection: Section = {
  title: "Harness canary",
  pairs: [
    {
      id: "harness-canary",
      ref: swatch("#000000"),
      mui: swatch("#010101"),
    },
  ],
}
