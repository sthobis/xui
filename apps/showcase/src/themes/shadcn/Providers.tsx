import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { shadcnTheme } from "@sthobis/xui/shadcn"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={shadcnTheme} defaultMode="light">
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
