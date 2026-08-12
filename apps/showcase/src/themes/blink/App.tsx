import { sections } from "./sections"
import { renderSections } from "../../gallery/PairGrid"
import themeSource from "../../../../../packages/xui/src/themes/blink.ts?raw"

/**
 * No ModeToggle: the Pulse Kit ships a dark scheme, but blink covers the light one only for now
 * (see the plan's Global Constraints), so there is no second scheme to switch to. Leaving the
 * toggle out also removes it as a source of page furniture compositing into a capture.
 */
export default function App() {
  return renderSections(sections, ["ref", "mui"], "kit", {
    source: themeSource,
    fileName: "blink.ts",
  })
}
