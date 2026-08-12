import MuiLink from "@mui/material/Link"
import type { Section } from "../../../gallery/types"

// The Pulse Kit ships no Link primitive - links are styled globally, by the one `a` rule in
// global.css that base.css vendors verbatim:
//
//     a { text-decoration: none; color: #5a63b0; }
//     a:hover, button, [role="button"] { cursor: pointer; }
//
// So the reference side here is a bare `<a>`, which is exactly what the design system gives a link
// in the real app. Note the rule hardcodes the brand hex rather than using var(--color-primary);
// transcribed as found.
//
// There is no hover or focus TREATMENT in the kit at all - `cursor: pointer` is the whole of it.
// Both states are still exercised, because MUI's Link adds an underline on hover and a focus ring
// of its own, and those have to be taken back off.

export const linkSection: Section = {
  title: "Link",
  pairs: [
    {
      id: "link-default",
      states: ["default", "hover", "focus"],
      ref: (
        <a data-target href="#link-default">
          Documentation
        </a>
      ),
      mui: (
        <MuiLink data-target href="#link-default">
          Documentation
        </MuiLink>
      ),
    },
  ],
}
