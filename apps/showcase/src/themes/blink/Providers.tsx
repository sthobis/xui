import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { blinkTheme } from "xui"
import type { ReactNode } from "react"
import baselineTheme from "./reference/baselineTheme"

/** Wraps the whole page: everything MUI renders here is styled by the theme under test. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={blinkTheme} defaultMode="light">
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}

/**
 * Wraps a REFERENCE cell, and only the seven kit primitives that are built on MUI internals -
 * Accordion, Button, Dialog, Menu, Popover, Tabs, Tooltip.
 *
 * Those primitives do their styling in their own CSS module but inherit whatever MUI theme is
 * above them, and the page's provider is `blinkTheme`. Left alone, a reference cell would be
 * styled by the very theme it is supposed to be judging, and the pair would compare the theme
 * against itself: a real regression would still show 0 differing pixels, because both sides moved
 * together. `baselineTheme` is the app's own minimal theme (the one the kit actually runs under),
 * so wrapping restores the real comparison.
 *
 * The other nineteen primitives are plain React and must NOT be wrapped - it would do nothing,
 * and it would suggest to the next reader that they depend on MUI.
 */
export function RefProviders({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={baselineTheme}>{children}</ThemeProvider>
}
