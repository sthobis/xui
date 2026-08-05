import type { CSSProperties } from "react"
import type { Pair, Section } from "./types"
import { GallerySidebar, SIDEBAR_WIDTH, sectionId } from "./Sidebar"
import { ThemePanel, THEME_PANEL_WIDTH } from "./ThemePanel"

/**
 * The widest a pair's own content may be.
 *
 * Two cells sit side by side, each adding `padding: 24` on both sides, and the row has to fit
 * between the fixed sidebar and the fixed theme panel. Go over and the MUI cell - the right-hand
 * one - slides under the theme panel, whose left border then lands INSIDE the screenshot, because
 * the capture clips to the cell and does not know the panel is not part of it.
 *
 * That failure is worth naming because of how it reads: a crisp full-height line at Δ245, scoring
 * hundreds of differing pixels, in a pair whose every computed style matches. It has been diagnosed
 * twice now - once at 360 on the AppBar, once at 368 on TablePagination's edge buttons - so the
 * limit lives here rather than in a comment inside whichever section hit it last.
 */
export const MAX_PAIR_CONTENT_WIDTH = 336

const cellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  minWidth: 240,
  minHeight: 88,
  // A cell must never resize to fit the column. index.html lays out two cells per row and pure.html
  // only one, so a shrinkable cell ends up a different width on the two pages the moment a row
  // stops fitting - and preflight compares the same MUI cell across both. That is exactly what
  // happened when the theme panel narrowed the column: every typography pair reported ~13% against
  // itself. Pinning shrink to 0 makes a cell's width depend only on its own content.
  flexShrink: 0,
}

const labelStyle: CSSProperties = {
  font: "500 11px/16px system-ui",
  opacity: 0.5,
  padding: "0 4px",
}

export function PairCell({ pair, side }: { pair: Pair; side: "shadcn" | "mui" }) {
  return (
    <div data-side={side} style={cellStyle}>
      {side === "shadcn" ? pair.shadcn : pair.mui}
    </div>
  )
}

export function PairRow({ pair, sides }: { pair: Pair; sides: Array<"shadcn" | "mui"> }) {
  return (
    <div
      data-pair-id={pair.id}
      data-states={(pair.states ?? ["default"]).join(",")}
      data-behaviors={(pair.behaviors ?? []).join(",")}
      style={{
        display: "flex",
        gap: 0,
        borderBottom: "1px solid rgba(128,128,128,0.2)",
        // Padding rather than height: the cells are stretch-aligned flex items, so their own boxes
        // are sized by content and this only adds blank space beneath them. Neither component moves.
        paddingBottom: pair.roomBelow,
      }}
    >
      {sides.map((side) => (
        <PairCell key={side} pair={pair} side={side} />
      ))}
    </div>
  )
}

export function SectionBlock({ section, sides }: { section: Section; sides: Array<"shadcn" | "mui"> }) {
  return (
    <section id={sectionId(section.title)} style={{ marginBottom: 48, scrollMarginTop: 24 }}>
      <h2 style={{ font: "600 16px/24px system-ui", margin: "0 0 4px" }}>{section.title}</h2>
      <div style={{ display: "flex" }}>
        {sides.map((side) => (
          <div key={side} style={{ ...labelStyle, minWidth: 240, textAlign: "center" }}>
            {side}
          </div>
        ))}
      </div>
      {section.pairs.map((pair) => (
        <PairRow key={pair.id} pair={pair} sides={sides} />
      ))}
    </section>
  )
}

export function renderSections(sections: Section[], sides: Array<"shadcn" | "mui">) {
  return (
    <>
      <GallerySidebar sections={sections} />
      {/* Margins (not a flex row) keep the content column's own box independent of the two fixed
          rails, so cell widths stay predictable regardless of what the rails do. */}
      <main
        style={{
          marginLeft: SIDEBAR_WIDTH,
          marginRight: THEME_PANEL_WIDTH,
          maxWidth: 1100,
          padding: 32,
        }}
      >
        {sections.map((s) => (
          <SectionBlock key={s.title} section={s} sides={sides} />
        ))}
      </main>
      <ThemePanel />
    </>
  )
}
