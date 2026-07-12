import { sections } from "./gallery/sections"
import { renderSections } from "./gallery/PairGrid"
import { ModeToggle } from "./ModeToggle"

export default function App() {
  return (
    <>
      <ModeToggle />
      {renderSections(sections, ["shadcn", "mui"])}
    </>
  )
}
