import { useMemo, useState, type CSSProperties } from "react"
import { stripComments } from "./stripComments"

export const THEME_PANEL_WIDTH = 380

/**
 * The theme file each gallery page shows, passed in by that page rather than imported here.
 *
 * The theme file is the deliverable, so the panel shows the real thing rather than a copy that
 * could drift: each page imports its own `packages/xui/src/themes/<name>.ts?raw`, and the
 * workspace has no build step between the two, so what is on screen is byte-for-byte what
 * `packages/xui` exports.
 */
export interface ThemeSource {
  /** Raw file text, before comment stripping. */
  source: string
  /** File name shown in the header and used for the download. */
  fileName: string
}

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
export function ThemePanel({ source: rawSource, fileName }: ThemeSource) {
  const source = useMemo(() => stripComments(rawSource), [rawSource])
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
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside style={panelStyle} aria-label="Theme source">
      {/* Say that the comments are gone. The provenance comments are the published file's
          evidence - the README calls shipping them in `src` a feature - so a download labelled
          with the real filename must not silently hand over a version with all of it removed. */}
      <p style={headerStyle}>
        {fileName} ({source.split("\n").length} lines, comments stripped - the published src keeps
        them)
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
