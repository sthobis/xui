import { useColorScheme } from "@mui/material/styles"
import { THEME_PANEL_WIDTH } from "./gallery/ThemePanel"

export function ModeToggle() {
  const { mode, setMode } = useColorScheme()
  const next = mode === "dark" ? "light" : "dark"
  return (
    <button
      type="button"
      data-testid="mode-toggle"
      onClick={() => setMode(next)}
      style={{
        position: "fixed",
        top: 8,
        // Clear of the theme panel, which is fixed to the right edge and would otherwise sit under
        // this button - the harness clicks it to switch schemes for every dark-mode run.
        right: THEME_PANEL_WIDTH + 8,
        // BELOW every overlay, deliberately. This was 1000, which is above shadcn's `z-50` panels
        // and below MUI's 1200, so a full-width top Drawer covered this button on the MUI side
        // while the shadcn Sheet let it show through - 383 pixels of the page's own furniture at
        // Δ245, attributed to a component that was rendering correctly on both sides.
        //
        // Nothing needs it to be high. It clears the theme panel by POSITION, not by stacking, and
        // the harness only clicks it in beforeEach when no overlay is open.
        zIndex: 40,
        padding: "4px 10px",
        font: "500 12px/20px system-ui",
      }}
    >
      mode: {mode ?? "light"}
    </button>
  )
}
