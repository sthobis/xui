import MuiButton from "@mui/material/Button"
import type { ButtonProps as MuiButtonProps } from "@mui/material/Button"
import Button from "../reference/primitives/Button"
import type { Section, Pair } from "../../../gallery/types"
import { RefProviders } from "../Providers"

// The kit's Button has five variants and four sizes. MUI has three variants and three sizes, so
// neither axis lines up on its own:
//
//   kit variant | MUI                          | why
//   ----------- | ---------------------------- | ------------------------------------------------
//   primary     | variant="contained"          | the one solid brand fill
//   secondary   | variant="outlined"           | surface + 1px border; the kit's DEFAULT variant
//   tonal       | variant="light"              | tinted fill, no visible border  (custom variant)
//   ghost       | variant="text"               | transparent until hover
//   destructive | variant="light" color="error"| tinted fill WITH a border       (custom variant)
//
// The `light` variant is the app's own MUI theme's addition and is kept rather than re-litigated: it reads
// as "tinted fill", and the colour prop picks the tint, which is exactly how tonal and destructive
// differ from each other in the kit. They are not the same shape otherwise - tonal's border is
// `1px solid transparent` and destructive's is a visible 20%-alpha error - so a single variant with
// no colour axis could not have expressed both.
//
// Sizes map by position, and the kit's fourth is added as a custom `xs`: MUI small/medium/large are
// the kit's sm/md/lg, and `size="xs"` is declared in the theme's module augmentation. Both defaults
// already agree - MUI's `medium` IS the kit's `md` - so the theme sets no default size, only
// `variant: "outlined"` to match the kit defaulting to `secondary`.
//
// Every reference cell is wrapped in RefProviders: the kit's Button is a MUI ButtonBase, so without
// it the reference side would be styled by the very theme it is judging.

const VARIANTS = [
  { kit: "primary", mui: { variant: "contained" } },
  { kit: "secondary", mui: { variant: "outlined" } },
  { kit: "tonal", mui: { variant: "light" } },
  { kit: "ghost", mui: { variant: "text" } },
  { kit: "destructive", mui: { variant: "light", color: "error" } },
] as const

const SIZES = [
  { kit: "xs", mui: "xs" },
  { kit: "sm", mui: "small" },
  { kit: "md", mui: "medium" },
  { kit: "lg", mui: "large" },
] as const

const pairs: Pair[] = []

for (const v of VARIANTS) {
  for (const s of SIZES) {
    pairs.push({
      id: `button-${v.kit}-${s.kit}`,
      // The default size carries the interaction states; the other three are there for geometry,
      // which is what actually differs between them.
      states: s.kit === "md" ? ["default", "hover", "focus"] : ["default"],
      ref: (
        <RefProviders>
          <Button data-target variant={v.kit} size={s.kit}>
            Button
          </Button>
        </RefProviders>
      ),
      mui: (
        <MuiButton data-target size={s.mui} {...(v.mui as MuiButtonProps)}>
          Button
        </MuiButton>
      ),
    })
  }
  pairs.push({
    id: `button-${v.kit}-disabled`,
    ref: (
      <RefProviders>
        <Button disabled variant={v.kit}>
          Button
        </Button>
      </RefProviders>
    ),
    mui: (
      <MuiButton disabled {...(v.mui as MuiButtonProps)}>
        Button
      </MuiButton>
    ),
  })
}

// The loading state, blink: Button .loading + .spinner. Found broken in a consuming app - MUI
// hides the label with `color: transparent` and the theme's variant inks, emitted later, won it
// back, so every loading button drew its text over its spinner. Primary and secondary cover the
// two inks the spinner inherits; the small pair holds the indicator's per-size scale.
for (const v of [
  { kit: "primary", mui: { variant: "contained" } },
  { kit: "secondary", mui: { variant: "outlined" } },
] as const) {
  pairs.push({
    id: `button-loading-${v.kit}`,
    ref: (
      <RefProviders>
        <Button loading variant={v.kit}>
          Button
        </Button>
      </RefProviders>
    ),
    mui: (
      <MuiButton loading {...(v.mui as MuiButtonProps)}>
        Button
      </MuiButton>
    ),
  })
}
pairs.push({
  id: "button-loading-sm",
  ref: (
    <RefProviders>
      <Button loading variant="secondary" size="sm">
        Button
      </Button>
    </RefProviders>
  ),
  mui: (
    <MuiButton loading variant="outlined" size="small">
      Button
    </MuiButton>
  ),
})

export const buttonSection: Section = {
  title: "Button",
  pairs,
}
