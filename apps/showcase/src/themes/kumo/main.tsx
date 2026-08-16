import { StrictMode } from "react"
import { mountWhenFontsReady } from "../../gallery/mountWhenFontsReady"
import "./kumo.css"
import App from "./App"
import { Providers } from "./Providers"

mountWhenFontsReady(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
)
