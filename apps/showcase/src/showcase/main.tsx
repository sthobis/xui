import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./showcase.css"
import { Showcase } from "./Showcase"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Showcase />
  </StrictMode>,
)
