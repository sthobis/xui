import { StrictMode } from "react"
import { mountWhenFontsReady } from "../../gallery/mountWhenFontsReady"
import "./pure.css"
import { Providers } from "./Providers"
import { ModeToggle } from "../../ModeToggle"
import { sections } from "./sections"
import { renderSections } from "../../gallery/PairGrid"
import themeSource from "../../../../../packages/xui/src/themes/shadcn.ts?raw"

mountWhenFontsReady(
  <StrictMode>
    <Providers>
      <ModeToggle />
      {renderSections(sections, ["mui"], "shadcn", { source: themeSource, fileName: "shadcn.ts" })}
    </Providers>
  </StrictMode>,
)
