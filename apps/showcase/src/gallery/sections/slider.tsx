import MuiSlider from "@mui/material/Slider"
import { Slider } from "@/components/ui/slider"
import type { Section } from "../types"

const withHoverFocus: Array<"default" | "hover" | "focus"> = ["default", "hover", "focus"]

// `data-target` is the parity harness's hover/focus marker (see e2e/lib/states.ts), placed on
// the Slider ROOT on BOTH sides. At defaultValue 50 on a 0-100 range the thumb sits at the exact
// center of Root's box, so:
//   - hover(): Playwright moves the pointer to Root's center = the thumb's pixel; the hit-test
//     passes because the thumb is a DESCENDANT of Root, and the real browser `:hover` bubbles so
//     the thumb's own `&:hover` ring fires. (Marking MUI's hidden `<input type="range">` instead
//     hangs: its center is covered by the thumb, which is NOT its descendant, so Playwright's
//     actionability hit-test never resolves and retries until timeout.)
//   - focusVisible(): the harness inserts a helper button before Root and Tabs; Root holds no
//     tabIndex, so focus lands on the first focusable descendant - the shadcn Thumb
//     (role="slider" tabIndex 0) / MUI's hidden range input - firing the thumb focus-visible ring.
// MUI forwards unknown props (data-target) to the root span, so a direct prop suffices; typed as
// a plain object to sidestep MUI SliderProps' data-* excess-property check without `any`.
const rootDataTarget: { "data-target"?: boolean } = { "data-target": true }
const sliderWrapStyle = { width: 180 } as const

export const sliderSection: Section = {
  title: "Slider",
  pairs: [
    {
      id: "slider-default",
      states: withHoverFocus,
      ref: (
        <div style={sliderWrapStyle}>
          <Slider data-target defaultValue={[50]} aria-label="Volume" />
        </div>
      ),
      mui: (
        <div style={sliderWrapStyle}>
          <MuiSlider defaultValue={50} aria-label="Volume" {...rootDataTarget} />
        </div>
      ),
    },
    {
      id: "slider-disabled",
      ref: (
        <div style={sliderWrapStyle}>
          <Slider data-target defaultValue={[50]} disabled aria-label="Disabled" />
        </div>
      ),
      mui: (
        <div style={sliderWrapStyle}>
          <MuiSlider defaultValue={50} disabled aria-label="Disabled" {...rootDataTarget} />
        </div>
      ),
    },
  ],
}
