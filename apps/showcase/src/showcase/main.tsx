import { StrictMode } from "react"
import { mountWhenFontsReady } from "../gallery/mountWhenFontsReady"
import "./showcase.css"
import { Showcase } from "./Showcase"

mountWhenFontsReady(
  <StrictMode>
    <Showcase />
  </StrictMode>,
)
