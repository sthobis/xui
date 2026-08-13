import type { CSSProperties } from "react"
import type { Pair, Section, Side } from "./types"
import { GallerySidebar, SIDEBAR_WIDTH, sectionId } from "./Sidebar"
import { ThemePanel, THEME_PANEL_WIDTH, type ThemeSource } from "./ThemePanel"

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

const derivedNoteStyle: CSSProperties = {
  ...cellStyle,
  font: "500 11px/16px system-ui",
  opacity: 0.4,
  textAlign: "center",
}

export function PairCell({ pair, side }: { pair: Pair; side: Side }) {
  // A derived component has no reference (see `Pair.ref`). The note deliberately carries NO
  // `data-side`, so every query the harness makes for a ref cell finds nothing and skips the side
  // rather than comparing against a caption.
  if (side === "ref" && pair.ref === undefined) {
    return <div style={derivedNoteStyle}>derived — no reference component</div>
  }
  return (
    <div data-side={side} style={cellStyle}>
      {side === "ref" ? pair.ref : pair.mui}
    </div>
  )
}

export function PairRow({ pair, sides }: { pair: Pair; sides: Side[] }) {
  return (
    <div
      data-pair-id={pair.id}
      // A derived pair publishes NO states, whatever it declares: with no reference there is
      // nothing for the pixel harness to diff, and this makes that structural rather than a rule
      // an author has to remember. `states: []` is already the suite's "not pixel-comparable"
      // declaration, so this reuses it instead of inventing a second mechanism.
      data-states={pair.ref === undefined ? "" : (pair.states ?? ["default"]).join(",")}
      data-behaviors={(pair.behaviors ?? []).join(",")}
      data-open-selector={pair.openSelector}
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

export function SectionBlock({
  section,
  sides,
  refLabel,
}: {
  section: Section
  sides: Side[]
  /** Display name for the reference column ("shadcn", "kumo"); the DOM side key stays "ref". */
  refLabel: string
}) {
  return (
    <section id={sectionId(section.title)} style={{ marginBottom: 48, scrollMarginTop: 24 }}>
      <h2 style={{ font: "600 16px/24px system-ui", margin: "0 0 4px" }}>{section.title}</h2>
      <div style={{ display: "flex" }}>
        {sides.map((side) => (
          <div key={side} style={{ ...labelStyle, minWidth: 240, textAlign: "center" }}>
            {side === "ref" ? refLabel : side}
          </div>
        ))}
      </div>
      {section.pairs.map((pair) => (
        <PairRow key={pair.id} pair={pair} sides={sides} />
      ))}
    </section>
  )
}

export function renderSections(sections: Section[], sides: Side[], refLabel: string, themeSource: ThemeSource) {
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
          <SectionBlock key={s.title} section={s} sides={sides} refLabel={refLabel} />
        ))}
      </main>
      <ThemePanel source={themeSource.source} fileName={themeSource.fileName} />
    </>
  )
}
