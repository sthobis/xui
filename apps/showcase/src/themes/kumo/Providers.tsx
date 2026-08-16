import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { kumoTheme } from "@sthobis/xui/kumo"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={kumoTheme} defaultMode="light">
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
