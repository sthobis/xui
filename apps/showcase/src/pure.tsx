import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./pure.css"
import MuiButton from "@mui/material/Button"
import { Providers } from "./Providers"
import { ModeToggle } from "./ModeToggle"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <ModeToggle />
      <div style={{ display: "flex", minHeight: "100svh", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <MuiButton variant="contained">MUI pure</MuiButton>
      </div>
    </Providers>
  </StrictMode>,
)
