import { useColorScheme } from "@mui/material/styles"
import { sections } from "./sections"
import { renderSections } from "../../gallery/PairGrid"
import { ModeToggle } from "../../ModeToggle"
import { Toaster } from "@/components/ui/sonner"

export default function App() {
  // shadcn's sonner.tsx reads next-themes, which defaults to "system" and would follow the OS
  // rather than this showcase's `.dark` class - so the toast would render light on a dark page.
  // Passing `theme` explicitly is the wrapper's own override path (it spreads incoming props after
  // its own `theme`), not a hack around it: a class-driven scheme is what shadcn's docs set up, and
  // it is only next-themes' provider that is absent here.
  const { mode } = useColorScheme()
  return (
    <>
      <ModeToggle />
      {renderSections(sections, ["ref", "mui"], "shadcn")}
      <Toaster theme={mode === "dark" ? "dark" : "light"} />
    </>
  )
}
