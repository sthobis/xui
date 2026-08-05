import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./pure.css"
import { Providers } from "./Providers"
import { ModeToggle } from "../../ModeToggle"
import { sections } from "./sections"
import { renderSections } from "../../gallery/PairGrid"
import themeSource from "../../../../../packages/xui/src/themes/kumo.ts?raw"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <ModeToggle />
      {renderSections(sections, ["mui"], "kumo", { source: themeSource, fileName: "kumo.ts" })}
    </Providers>
  </StrictMode>,
)
