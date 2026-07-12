import { useColorScheme } from "@mui/material/styles"

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
        right: 8,
        zIndex: 1000,
        padding: "4px 10px",
        font: "500 12px/20px system-ui",
      }}
    >
      mode: {mode ?? "light"}
    </button>
  )
}
