import { useMemo, useState, type CSSProperties } from "react"
// The theme file is the deliverable, so the panel shows the real thing rather than a copy that
// could drift. Imported straight from the package source as text - the workspace has no build step
// between the two, so what is on screen is byte-for-byte what `packages/xui` exports.
import themeSource from "../../../../packages/xui/src/themes/shadcn.ts?raw"
import { stripComments } from "./stripComments"

export const THEME_PANEL_WIDTH = 380

const FILE_NAME = "shadcn.ts"

const panelStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  right: 0,
  width: THEME_PANEL_WIDTH,
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  borderLeft: "1px solid rgba(128,128,128,0.25)",
  // Chrome only, no Tailwind and no theme tokens, so this renders identically on the
  // Tailwind-free pure.html page (see AGENTS.md).
  font: "500 13px/20px system-ui",
}

const headerStyle: CSSProperties = {
  font: "600 11px/16px system-ui",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  opacity: 0.5,
  padding: "24px 16px 8px",
}

const codeStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
  margin: 0,
  padding: "0 16px 16px",
  font: "400 11px/16px ui-monospace, SFMono-Regular, Menlo, monospace",
  whiteSpace: "pre",
  tabSize: 2,
}

const footerStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  padding: 12,
  borderTop: "1px solid rgba(128,128,128,0.25)",
}

const buttonStyle: CSSProperties = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid rgba(128,128,128,0.4)",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  cursor: "pointer",
}

/**
 * Fixed source panel for the theme, opposite the component index. Plain elements and inline styles
 * only, for the same reason the sidebar uses them - it renders on the Tailwind-free page too, and
 * both gallery entries must lay the content column out identically or preflight compares cells at
 * different positions. Deliberately NOT built from MUI or shadcn components: everything inside a
 * gallery page that is not a pair would otherwise show up in the parity sweep.
 */
export function ThemePanel() {
  const source = useMemo(() => stripComments(themeSource), [])
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle")

  async function handleCopy() {
    // navigator.clipboard rejects outside a secure context and when the document is not focused,
    // and the deployed page is one iframe away from both. Falling back to a selected textarea keeps
    // the button working there, and the failure case says so rather than looking like a no-op.
    try {
      await navigator.clipboard.writeText(source)
      setCopyState("copied")
    } catch {
      const scratch = document.createElement("textarea")
      scratch.value = source
      scratch.style.cssText = "position:fixed;top:0;left:0;opacity:0"
      document.body.appendChild(scratch)
      scratch.select()
      const ok = document.execCommand("copy")
      scratch.remove()
      setCopyState(ok ? "copied" : "failed")
    }
    window.setTimeout(() => setCopyState("idle"), 1500)
  }

  const copyLabel = copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"

  function handleDownload() {
    const url = URL.createObjectURL(new Blob([source], { type: "text/plain" }))
    const link = document.createElement("a")
    link.href = url
    link.download = FILE_NAME
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside style={panelStyle} aria-label="Theme source">
      <p style={headerStyle}>
        {FILE_NAME} ({source.split("\n").length} lines)
      </p>
      <pre style={codeStyle}>{source}</pre>
      <div style={footerStyle}>
        <button type="button" style={buttonStyle} onClick={handleCopy}>
          {copyLabel}
        </button>
        <button type="button" style={buttonStyle} onClick={handleDownload}>
          Download
        </button>
      </div>
    </aside>
  )
}
