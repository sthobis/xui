import ScopedCssBaseline from "@mui/material/ScopedCssBaseline"
import { ThemeProvider, type Theme } from "@mui/material/styles"
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react"
import blinkSource from "../../../../packages/xui/src/themes/blink.ts?raw"
import kumoSource from "../../../../packages/xui/src/themes/kumo.ts?raw"
import shadcnSource from "../../../../packages/xui/src/themes/shadcn.ts?raw"
import { customizeSource } from "./customize"
import { evaluateTheme, toJavaScript } from "./evaluate"
import {
  COLOR_PRESETS,
  CUSTOMIZABLE,
  DEFAULT_OPTIONS,
  FONT_PRESETS,
  RADIUS_PRESETS,
  type ExportOptions,
  type ThemeId,
} from "./options"
import { Preview } from "./Preview"

/**
 * The export page: pick a theme, turn a few closed-list knobs, download the one-file theme.
 *
 * Only shadcn takes design knobs. kumo and blink replicate FIXED, branded design systems - the
 * entire point of those themes is that they are pixel-verified against the real thing, so a
 * recoloured kumo would be neither Cloudflare's design nor anything this repo can vouch for. They
 * export exactly as shipped, with only the language and comments options live.
 *
 * The preview renders the EVALUATED export - the same text the download contains - so what you
 * see is what you get, not a second implementation of the options (see evaluate.ts).
 */

const SOURCES: Record<ThemeId, string> = {
  shadcn: shadcnSource,
  kumo: kumoSource,
  blink: blinkSource,
}

/** Which dark-mode marker each theme's stylesheet keys on (blink is light-only so far). */
const DARK_MARKER: Record<ThemeId, ((on: boolean) => void) | null> = {
  shadcn: (on) => document.documentElement.classList.toggle("dark", on),
  kumo: (on) => {
    if (on) document.documentElement.setAttribute("data-mode", "dark")
    else document.documentElement.removeAttribute("data-mode")
  },
  blink: null,
}

const SIDEBAR_WIDTH = 260

const sidebarStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: SIDEBAR_WIDTH,
  height: "100vh",
  boxSizing: "border-box",
  overflowY: "auto",
  padding: 16,
  borderRight: "1px solid rgba(128,128,128,0.25)",
  font: "400 13px/20px system-ui",
  display: "flex",
  flexDirection: "column",
  gap: 16,
}

const groupLabelStyle: CSSProperties = {
  font: "600 11px/16px system-ui",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  opacity: 0.5,
  margin: "0 0 6px",
}

const chipRowStyle: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6 }

function OptionChip({
  selected,
  disabled,
  onClick,
  children,
  title,
}: {
  selected: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 8,
        border: selected ? "1px solid currentColor" : "1px solid rgba(128,128,128,0.4)",
        background: selected ? "rgba(128,128,128,0.12)" : "transparent",
        color: "inherit",
        font: "500 12px/16px system-ui",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  )
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p style={groupLabelStyle}>{label}</p>
      <div style={chipRowStyle}>{children}</div>
    </div>
  )
}

async function copyText(text: string): Promise<boolean> {
  // Same fallback ladder as ThemePanel: clipboard rejects outside a secure, focused context.
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const scratch = document.createElement("textarea")
    scratch.value = text
    scratch.style.cssText = "position:fixed;top:0;left:0;opacity:0"
    document.body.appendChild(scratch)
    scratch.select()
    const ok = document.execCommand("copy")
    scratch.remove()
    return ok
  }
}

export function ExportPage() {
  const [options, setOptions] = useState<ExportOptions>(DEFAULT_OPTIONS)
  const [mode, setMode] = useState<"light" | "dark">("light")
  const [view, setView] = useState<"preview" | "code">("preview")
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle")
  const set = (patch: Partial<ExportOptions>) => setOptions((o) => ({ ...o, ...patch }))
  const customizable = CUSTOMIZABLE[options.theme]

  // The customized artifact, and the theme object evaluated FROM it for the preview. One memo, so
  // the preview can never show anything but the current download's contents.
  const built = useMemo(() => {
    try {
      const result = customizeSource(SOURCES[options.theme], options)
      const output = options.language === "js" ? toJavaScript(result.source) : result.source
      const theme = evaluateTheme(result.source)
      return { ...result, output, theme, error: null as string | null }
    } catch (error) {
      return {
        source: "",
        output: "",
        fileName: "",
        changes: [],
        theme: null,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }, [options])

  // Write the active theme's own dark-mode marker onto <html> - the same selector the exported
  // file keys its dark scheme on - and clear every marker when the theme or the page goes away.
  useEffect(() => {
    DARK_MARKER[options.theme]?.(mode === "dark")
    return () => {
      document.documentElement.classList.remove("dark")
      document.documentElement.removeAttribute("data-mode")
    }
  }, [options.theme, mode])

  const darkAvailable = DARK_MARKER[options.theme] !== null

  async function handleCopy() {
    setCopyState((await copyText(built.output)) ? "copied" : "failed")
    window.setTimeout(() => setCopyState("idle"), 1500)
  }

  function handleDownload() {
    const url = URL.createObjectURL(new Blob([built.output], { type: "text/plain" }))
    const link = document.createElement("a")
    link.href = url
    link.download = built.fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  const base = import.meta.env.BASE_URL
  return (
    <>
      <aside style={sidebarStyle} aria-label="Export options">
        <div>
          <h1 style={{ font: "600 16px/24px system-ui", margin: 0 }}>xui export</h1>
          <p style={{ margin: "4px 0 0", opacity: 0.7 }}>
            A customized copy of a theme, as the same single file. Options only - every knob is a
            preset, so each change is a recorded choice.
          </p>
        </div>

        <Group label="Theme">
          {(Object.keys(SOURCES) as ThemeId[]).map((id) => (
            <OptionChip key={id} selected={options.theme === id} onClick={() => set({ theme: id })}>
              {id}
            </OptionChip>
          ))}
        </Group>

        {!customizable && (
          <p style={{ margin: 0, opacity: 0.7 }}>
            {options.theme} replicates a fixed, branded design system, so it exports exactly as
            shipped - the pixel-verified file. Language and comments still apply.
          </p>
        )}

        <Group label="Primary color">
          {COLOR_PRESETS.map((c) => (
            <OptionChip
              key={c.id}
              selected={options.color === c.id}
              disabled={!customizable}
              onClick={() => set({ color: c.id })}
              title={c.values ? `${c.label} (Tailwind ${c.id})` : "The theme's own primary"}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: c.swatch,
                  border: "1px solid rgba(128,128,128,0.4)",
                }}
              />
              {c.label}
            </OptionChip>
          ))}
        </Group>

        <Group label="Font family">
          {FONT_PRESETS.map((f) => (
            <OptionChip
              key={f.id}
              selected={options.font === f.id}
              disabled={!customizable}
              onClick={() => set({ font: f.id })}
              title={f.note}
            >
              {f.label}
            </OptionChip>
          ))}
        </Group>

        <Group label="Radius">
          {RADIUS_PRESETS.map((r) => (
            <OptionChip
              key={r.id}
              selected={options.radius === r.id}
              disabled={!customizable}
              onClick={() => set({ radius: r.id })}
            >
              {r.label}
            </OptionChip>
          ))}
        </Group>

        <Group label="Language">
          <OptionChip selected={options.language === "ts"} onClick={() => set({ language: "ts" })}>
            TypeScript
          </OptionChip>
          <OptionChip
            selected={options.language === "js"}
            onClick={() => set({ language: "js" })}
            title="Types stripped; comments and formatting kept"
          >
            JavaScript
          </OptionChip>
        </Group>

        <Group label="Comments">
          <OptionChip
            selected={options.comments === "keep"}
            onClick={() => set({ comments: "keep" })}
            title="Every value keeps the comment naming where it came from"
          >
            Keep provenance
          </OptionChip>
          <OptionChip selected={options.comments === "strip"} onClick={() => set({ comments: "strip" })}>
            Strip
          </OptionChip>
        </Group>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {built.changes.length > 0 && (
            <p style={{ margin: 0, opacity: 0.7 }}>
              Customized: {built.changes.join(", ")}. A customized file is yours - the repo's
              pixel-parity claims no longer apply to it.
            </p>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" style={actionStyle} onClick={handleCopy} disabled={!!built.error}>
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy failed" : "Copy"}
            </button>
            <button type="button" style={actionStyle} onClick={handleDownload} disabled={!!built.error}>
              Download {built.fileName}
            </button>
          </div>
          <p style={{ margin: 0, opacity: 0.5 }}>
            <a href={`${base}index.html`}>showcase</a> · <a href={`${base}shadcn.html`}>shadcn</a> ·{" "}
            <a href={`${base}kumo.html`}>kumo</a> · <a href={`${base}blink.html`}>blink</a>
          </p>
        </div>
      </aside>

      <main style={{ marginLeft: SIDEBAR_WIDTH, padding: 32 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, font: "400 13px/20px system-ui" }}>
          <OptionChip selected={view === "preview"} onClick={() => setView("preview")}>
            Preview
          </OptionChip>
          <OptionChip selected={view === "code"} onClick={() => setView("code")}>
            Code
          </OptionChip>
          {darkAvailable ? (
            <OptionChip selected={mode === "dark"} onClick={() => setMode(mode === "dark" ? "light" : "dark")}>
              Dark
            </OptionChip>
          ) : (
            <span style={{ alignSelf: "center", opacity: 0.5 }}>light only</span>
          )}
        </div>

        {built.error ? (
          <pre
            style={{
              font: "400 12px/18px ui-monospace, monospace",
              color: "#b91c1c",
              whiteSpace: "pre-wrap",
            }}
          >
            {built.error}
          </pre>
        ) : view === "code" ? (
          <pre
            style={{
              font: "400 11px/16px ui-monospace, SFMono-Regular, Menlo, monospace",
              whiteSpace: "pre",
              overflow: "auto",
              maxHeight: "calc(100vh - 140px)",
              margin: 0,
              padding: 16,
              border: "1px solid rgba(128,128,128,0.25)",
              borderRadius: 8,
            }}
          >
            {built.output}
          </pre>
        ) : (
          built.theme && <ThemedPreview theme={built.theme} />
        )}
      </main>
    </>
  )
}

const actionStyle: CSSProperties = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid rgba(128,128,128,0.4)",
  background: "transparent",
  color: "inherit",
  font: "500 12px/16px system-ui",
  cursor: "pointer",
}

function ThemedPreview({ theme }: { theme: Theme }) {
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      {/* Scoped rather than global baseline, exactly as the showcase columns do: the preview gets
          the theme's background and typography without the page chrome inheriting either. */}
      <ScopedCssBaseline sx={{ background: "transparent", padding: 3, borderRadius: 2 }}>
        <Preview />
      </ScopedCssBaseline>
    </ThemeProvider>
  )
}
