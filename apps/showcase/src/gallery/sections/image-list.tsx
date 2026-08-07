import MuiImageList from "@mui/material/ImageList"
import MuiImageListItem from "@mui/material/ImageListItem"
import MuiImageListItemBar from "@mui/material/ImageListItemBar"
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
// SCOPE: the standard variant at a fixed column count, with and without a caption bar.
// `variant="masonry"`/`"quilted"`/`"woven"` and per-item row/col spans have no pair.
const wrapStyle = { width: 224 } as const

const TILE = (fill: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23${fill}'/%3E%3C/svg%3E`

const TILES = ["7c7c7c", "9a9a9a", "b5b5b5", "8a8a8a", "a4a4a4", "c0c0c0"] as const

const CAPTIONED = [
  { fill: "7c7c7c", title: "Harbour" },
  { fill: "9a9a9a", title: "Rooftops" },
] as const

export const imageListSection: Section = {
  title: "ImageList",
  pairs: [
    {
      id: "imagelist-standard",
      shadcn: (
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
    {
      // The caption bar. MUI's own is a Material scrim - a black panel with 16px white text - which
      // is the one part of this component that plainly does not belong in shadcn's surface language,
      // so the theme restyles it to a translucent `bg-background` panel with ordinary foreground
      // text. Composed, like the grid above: the tokens are real, the arrangement is a decision here.
      //
      // SCOPE: `position="bottom"` with a title. The `subtitle` and `actionIcon` slots and the
      // `"top"`/`"below"` positions have no pair.
      id: "imagelist-bar",
      shadcn: (
        <div style={wrapStyle}>
          <div className="grid grid-cols-2 gap-2">
            {CAPTIONED.map(({ fill, title }) => (
              <div key={fill} className="relative">
                <img
                  src={TILE(fill)}
                  alt=""
                  className="block aspect-square w-full rounded-lg object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 rounded-b-lg bg-background/80 px-3 py-2">
                  <span className="block truncate text-xs font-medium text-foreground">{title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiImageList cols={2}>
            {CAPTIONED.map(({ fill, title }) => (
              <MuiImageListItem key={fill}>
                <img src={TILE(fill)} alt="" />
                <MuiImageListItemBar title={title} />
              </MuiImageListItem>
            ))}
          </MuiImageList>
        </div>
      ),
    },
  ],
}
