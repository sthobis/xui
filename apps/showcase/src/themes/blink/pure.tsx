import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./pure.css"
import { Providers } from "./Providers"
import { sections } from "./sections"
import { renderSections } from "../../gallery/PairGrid"
import themeSource from "../../../../../packages/xui/src/themes/blink.ts?raw"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      {renderSections(sections, ["mui"], "kit", { source: themeSource, fileName: "blink.ts" })}
    </Providers>
  </StrictMode>,
)
