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
        zIndex: 1000,
        padding: "4px 10px",
        font: "500 12px/20px system-ui",
      }}
    >
      mode: {mode ?? "light"}
    </button>
  )
}
