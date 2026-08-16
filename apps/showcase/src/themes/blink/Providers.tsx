import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { blinkTheme } from "@sthobis/xui/blink"
import type { ReactNode } from "react"
import baselineTheme from "./reference/baselineTheme"

/**
 * Wraps the whole page: everything MUI renders here is styled by the theme under test.
 *
 * `injectFirst` is not decoration - it is load-bearing, and it is what the real app does
 * (the kit's own app wraps its entire tree in it). Seven of the kit's primitives are
 * built on MUI components, and they do their styling in a plain CSS module. A CSS module class and
 * an Emotion class have the SAME specificity, so whichever stylesheet comes later in <head> wins -
 * and Emotion injects at runtime, i.e. last. Without `injectFirst` the kit's Button renders with
 * MUI's ButtonBase reset showing through: no padding, no border, no radius, transparent
 * background. Measured exactly that before adding this - every filled variant was 5-14% different
 * with a reference cell that had no styling on it at all.
 *
 * It is equally correct for the MUI column, which is why it can wrap the whole page rather than
 * just the reference cells: the only CSS modules on this page belong to the kit, and they only
 * match elements the kit rendered.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={blinkTheme} defaultMode="light">
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
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
