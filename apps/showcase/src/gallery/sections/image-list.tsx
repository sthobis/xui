import MuiImageList from "@mui/material/ImageList"
import MuiImageListItem from "@mui/material/ImageListItem"
import type { Section } from "../types"

// COMPOSED TWIN - shadcn ships no image grid. The composition is the obvious one in its language:
// `grid grid-cols-3 gap-2` with `rounded-lg` tiles. Real utilities, assembled here.
//
// Tiles fill their grid column (`aspect-square w-full`) rather than taking a fixed size, because
// MUI's items are sized by the 1fr columns and a fixed tile would simply be a different size.
//
// The tiles are inline SVG data URIs rather than fetched images, so the pair has no network
// dependency and renders byte-identically on every run - a real image would also make the parity
// result depend on decode timing.
//
// SCOPE: the standard variant at a fixed column count. `variant="masonry"`/`"quilted"`/`"woven"`,
// ImageListItemBar, and per-item row/col spans have no pair and get no treatment.
const wrapStyle = { width: 224 } as const

const TILE = (fill: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23${fill}'/%3E%3C/svg%3E`

const TILES = ["7c7c7c", "9a9a9a", "b5b5b5", "8a8a8a", "a4a4a4", "c0c0c0"] as const

export const imageListSection: Section = {
  title: "ImageList",
  pairs: [
    {
      id: "imagelist-standard",
      ref: (
        <div style={wrapStyle}>
          <div className="grid grid-cols-3 gap-2">
            {TILES.map((fill) => (
              <img
                key={fill}
                src={TILE(fill)}
                alt=""
                className="block aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiImageList cols={3}>
            {TILES.map((fill) => (
              <MuiImageListItem key={fill}>
                <img src={TILE(fill)} alt="" />
              </MuiImageListItem>
            ))}
          </MuiImageList>
        </div>
      ),
    },
  ],
}
