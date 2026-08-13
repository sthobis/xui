import MuiIconButton from "@mui/material/IconButton"
import MuiImageList from "@mui/material/ImageList"
import MuiImageListItem from "@mui/material/ImageListItem"
import MuiImageListItemBar from "@mui/material/ImageListItemBar"
import { Ellipsis } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Section } from "../../../gallery/types"

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

// The tile's intrinsic ratio matters for masonry, where an item's height comes from its image
// rather than from a row track - so the size is a parameter rather than a fixed square.
const TILE = (fill: string, w = 4, h = 4) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E%3Crect width='${w}' height='${h}' fill='%23${fill}'/%3E%3C/svg%3E`

const TILES = ["7c7c7c", "9a9a9a", "b5b5b5", "8a8a8a", "a4a4a4", "c0c0c0"] as const

const CAPTIONED = [
  { fill: "7c7c7c", title: "Harbour" },
  { fill: "9a9a9a", title: "Rooftops" },
] as const

// Deliberately uneven ratios: a masonry column packs items of different heights, so tiles that were
// all square would prove nothing about the layout.
// Quilted is the spans variant: a fixed row height with items claiming more than one cell. The
// first tile takes a 2x2 block and the rest fill in around it.
const QUILTED = [
  { fill: "7c7c7c", cols: 2, rows: 2 },
  { fill: "9a9a9a", cols: 1, rows: 1 },
  { fill: "b5b5b5", cols: 1, rows: 1 },
  { fill: "8a8a8a", cols: 1, rows: 1 },
  { fill: "a4a4a4", cols: 1, rows: 1 },
  { fill: "c0c0c0", cols: 1, rows: 1 },
] as const

const ROW_HEIGHT = 64
const SUBTITLE = "12 photos"

const MASONRY = [
  { fill: "7c7c7c", w: 4, h: 5 },
  { fill: "9a9a9a", w: 4, h: 3 },
  { fill: "b5b5b5", w: 4, h: 4 },
  { fill: "8a8a8a", w: 4, h: 3 },
  { fill: "a4a4a4", w: 4, h: 5 },
  { fill: "c0c0c0", w: 4, h: 4 },
] as const

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
    {
      // variant="quilted" plus per-item `cols`/`rows`. This is the spans case: a fixed row track
      // with the first tile claiming a 2x2 block. MUI writes `grid-column-end: span N` and
      // `grid-row-end: span M` on the item and drives the track from `rowHeight`, which is what the
      // twin's `auto-rows` plus explicit spans say directly.
      //
      // `variant="woven"` is not covered and is a deliberate omission rather than an oversight: it
      // is quilted's grid with an alternating aspect-ratio rule per item, so a pair would exercise
      // the same span machinery and prove nothing new about the theme.
      id: "imagelist-quilted",
      ref: (
        <div style={wrapStyle}>
          <div
            className="grid grid-cols-3 gap-2"
            style={{ gridAutoRows: `${ROW_HEIGHT}px` }}
          >
            {QUILTED.map(({ fill, cols, rows }) => (
              <img
                key={fill}
                src={TILE(fill)}
                alt=""
                className="block h-full w-full rounded-lg object-cover"
                style={{ gridColumnEnd: `span ${cols}`, gridRowEnd: `span ${rows}` }}
              />
            ))}
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiImageList variant="quilted" cols={3} rowHeight={ROW_HEIGHT} gap={8}>
            {QUILTED.map(({ fill, cols, rows }) => (
              <MuiImageListItem key={fill} cols={cols} rows={rows}>
                <img src={TILE(fill)} alt="" />
              </MuiImageListItem>
            ))}
          </MuiImageList>
        </div>
      ),
    },
    {
      // variant="woven". A grid like quilted, but the item HEIGHTS alternate rather than the spans:
      // MUI gives every item `height: 100%; align-self: center` and every even one `height: 70%`,
      // which is the whole variant.
      //
      // Two things it does that are easy to get wrong. It IGNORES `rowHeight` - ImageListItem
      // leaves height undefined for woven - so the row is `auto` and sized by the tile's own ratio,
      // not by a track. And the height sits on the ITEM with the image filling it, so the twin
      // needs the same wrapper rather than a bare img; a bare img makes `70%` resolve against a
      // different box.
      id: "imagelist-woven",
      ref: (
        <div style={wrapStyle}>
          <div className="grid grid-cols-3 gap-2">
            {TILES.map((fill) => (
              <div key={fill} className="h-full self-center even:h-[70%]">
                <img
                  src={TILE(fill)}
                  alt=""
                  className="block h-full w-full rounded-lg object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiImageList variant="woven" cols={3} gap={8}>
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
      // variant="masonry". Not a grid at all: MUI switches to CSS multi-column, where each item
      // keeps its own height and the browser packs columns rather than rows. `columns-3` is the
      // shadcn-language equivalent, and `break-inside-avoid` is what stops a tile splitting across
      // a column boundary - MUI sets the same thing on its items.
      id: "imagelist-masonry",
      ref: (
        <div style={wrapStyle}>
          <div className="columns-3 gap-2">
            {MASONRY.map(({ fill, w, h }) => (
              <img
                key={fill}
                src={TILE(fill, w, h)}
                alt=""
                className="mb-2 block w-full break-inside-avoid rounded-lg"
              />
            ))}
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiImageList variant="masonry" cols={3} gap={8}>
            {MASONRY.map(({ fill, w, h }) => (
              <MuiImageListItem key={fill}>
                <img src={TILE(fill, w, h)} alt="" />
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
      ref: (
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
    {
      // The bar's other two slots. A subtitle stacks under the title in the same column, and an
      // actionIcon sits beside that column - MUI lays the bar out as a flex row for exactly this,
      // which is why the title wrap is its own box rather than the bar's only child.
      id: "imagelist-bar-full",
      ref: (
        <div style={wrapStyle}>
          <div className="grid grid-cols-2 gap-2">
            {CAPTIONED.map(({ fill, title }) => (
              <div key={fill} className="relative">
                <img
                  src={TILE(fill)}
                  alt=""
                  className="block aspect-square w-full rounded-lg object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center rounded-b-lg bg-background/80 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-foreground">
                      {title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{SUBTITLE}</span>
                  </div>
                  <Button variant="ghost" size="icon-sm" aria-label="More">
                    <Ellipsis />
                  </Button>
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
                <MuiImageListItemBar
                  title={title}
                  subtitle={SUBTITLE}
                  actionIcon={
                    <MuiIconButton size="small" aria-label="More">
                      <Ellipsis />
                    </MuiIconButton>
                  }
                />
              </MuiImageListItem>
            ))}
          </MuiImageList>
        </div>
      ),
    },
    {
      // position="top". The bar moves to the other edge and takes its rounded corners with it.
      id: "imagelist-bar-top",
      ref: (
        <div style={wrapStyle}>
          <div className="grid grid-cols-2 gap-2">
            {CAPTIONED.map(({ fill, title }) => (
              <div key={fill} className="relative">
                <img
                  src={TILE(fill)}
                  alt=""
                  className="block aspect-square w-full rounded-lg object-cover"
                />
                <div className="absolute inset-x-0 top-0 rounded-t-lg bg-background/80 px-3 py-2">
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
                <MuiImageListItemBar position="top" title={title} />
              </MuiImageListItem>
            ))}
          </MuiImageList>
        </div>
      ),
    },
    {
      // position="below". Not an overlay: MUI turns the bar relative and transparent, so it becomes
      // a caption sitting under the tile rather than on it. The twin is the same - plain text after
      // the image, no panel, no rounding.
      id: "imagelist-bar-below",
      ref: (
        <div style={wrapStyle}>
          <div className="grid grid-cols-2 gap-2">
            {CAPTIONED.map(({ fill, title }) => (
              <div key={fill}>
                <img
                  src={TILE(fill)}
                  alt=""
                  className="block aspect-square w-full rounded-lg object-cover"
                />
                <div className="pt-2">
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
                <MuiImageListItemBar position="below" title={title} />
              </MuiImageListItem>
            ))}
          </MuiImageList>
        </div>
      ),
    },
  ],
}
