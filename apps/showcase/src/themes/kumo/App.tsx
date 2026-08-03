import { sections } from "./sections"
import { renderSections } from "../../gallery/PairGrid"
import { ModeToggle } from "../../ModeToggle"
import themeSource from "../../../../../packages/xui/src/themes/kumo.ts?raw"

export default function App() {
  return (
    <>
      <ModeToggle />
      {renderSections(sections, ["ref", "mui"], "kumo", { source: themeSource, fileName: "kumo.ts" })}
    </>
  )
}
