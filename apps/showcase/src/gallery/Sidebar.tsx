import type { CSSProperties } from "react"
import type { Section } from "./types"

export const SIDEBAR_WIDTH = 220

/** Stable anchor id for a section, shared by the sidebar link and the section heading. */
export function sectionId(title: string): string {
  return `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`
}

const navStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: SIDEBAR_WIDTH,
  height: "100vh",
  overflowY: "auto",
  boxSizing: "border-box",
  padding: "24px 12px 32px",
  borderRight: "1px solid rgba(128,128,128,0.25)",
  // Chrome only: no Tailwind, no theme tokens, so this renders identically on the
  // Tailwind-free pure.html page (see AGENTS.md).
  font: "500 13px/20px system-ui",
}

const headingStyle: CSSProperties = {
  font: "600 11px/16px system-ui",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  opacity: 0.5,
  padding: "0 8px",
  margin: "0 0 8px",
}

const linkStyle: CSSProperties = {
  display: "block",
  padding: "5px 8px",
  borderRadius: 6,
  color: "inherit",
  textDecoration: "none",
  opacity: 0.75,
}

/**
 * Fixed component index for the gallery, like MUI's own docs sidebar. Rendered on BOTH entries
 * (index.html and pure.html) so the two pages lay the content column out identically - preflight
 * compares the same MUI cell across them, so a layout that differed per page would shift every
 * cell's position between the two captures.
 */
export function GallerySidebar({ sections }: { sections: Section[] }) {
  return (
    <nav style={navStyle} aria-label="Components">
      {/* Hover/focus affordance needs a real selector; plain CSS (not Tailwind) so it still
          applies on the Tailwind-free page. Scoped to this nav only. */}
      <style>{`
        [data-gallery-nav] a:hover { opacity: 1; background: rgba(128,128,128,0.14); }
        [data-gallery-nav] a:focus-visible { opacity: 1; outline: 2px solid currentColor; outline-offset: -2px; }
      `}</style>
      <div data-gallery-nav="">
        <p style={headingStyle}>Components ({sections.length})</p>
        {sections.map((s) => (
          <a key={s.title} href={`#${sectionId(s.title)}`} style={linkStyle}>
            {s.title}
          </a>
        ))}
      </div>
    </nav>
  )
}
