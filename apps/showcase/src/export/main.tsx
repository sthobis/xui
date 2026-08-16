import { StrictMode } from "react"
import { mountWhenFontsReady } from "../gallery/mountWhenFontsReady"
import "./export.css"
import { ExportPage } from "./ExportPage"

mountWhenFontsReady(
  <StrictMode>
    <ExportPage />
  </StrictMode>,
)
