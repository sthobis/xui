import MuiCard from "@mui/material/Card"
import { LayerCard } from "@cloudflare/kumo/components/layer-card"
import type { Section } from "../../../gallery/types"

// kumo: LayerCard's plain surface is `overflow-hidden rounded-lg bg-kumo-base shadow-xs ring
// ring-kumo-line`. It carries NO padding of its own - Kumo's own docs pass `p-6` at the call site -
// so the pair puts an identically sized plain box inside each surface and measures the surface
// alone: radius, fill, shadow and ring.
//
// LayerCard.Primary / .Secondary (the layered two-tone form) is a composition of two more class
// sets with no MUI counterpart, and is out of scope here.
const BOX = { width: 160, height: 48 } as const

export const layerCardSection: Section = {
  title: "LayerCard",
  pairs: [
    {
      id: "layercard-basic",
      ref: (
        <LayerCard>
          <div style={BOX} />
        </LayerCard>
      ),
      mui: (
        <MuiCard>
          <div style={BOX} />
        </MuiCard>
      ),
    },
  ],
}
