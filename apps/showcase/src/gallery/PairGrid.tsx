import type { CSSProperties } from "react"
import type { Pair, Section } from "./types"

const cellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  minWidth: 240,
  minHeight: 88,
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
      style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(128,128,128,0.2)" }}
    >
      {sides.map((side) => (
        <PairCell key={side} pair={pair} side={side} />
      ))}
    </div>
  )
}

export function SectionBlock({ section, sides }: { section: Section; sides: Array<"shadcn" | "mui"> }) {
  return (
    <section style={{ marginBottom: 48 }}>
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
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
      {sections.map((s) => (
        <SectionBlock key={s.title} section={s} sides={sides} />
      ))}
    </main>
  )
}
