import type { Section } from "../../../gallery/types"
import { buttonSection } from "./button"
import { textSection } from "./text"
import { labelSection } from "./label"
import { linkSection } from "./link"
import { inputSection } from "./input"
import { checkboxSection } from "./checkbox"
import { switchSection } from "./switch"
import { radioSection } from "./radio"
import { badgeSection } from "./badge"
import { bannerSection } from "./banner"
import { meterSection } from "./meter"
import { layerCardSection } from "./layer-card"
import { tabsSection } from "./tabs"

// DELIBERATELY ABSENT, both from the gallery and from the theme - a component with no pair does
// not ship, so neither MuiCircularProgress nor MuiSkeleton is themed:
//
//   SkeletonLine  is not in @cloudflare/kumo 2.9.0 at all. The docs site demonstrates it, but the
//                 published package exports no such component, so there is no ground truth to
//                 extract. It can be added once a release ships it.
//   Loader        is a hand-rolled SVG animated with SMIL (<animateTransform> plus two <animate>
//                 elements driving stroke-dasharray/dashoffset), over a second static ring at 10%
//                 opacity. Playwright's `animations: "disabled"` freezes CSS animations but not
//                 SMIL, so a captured frame has no stable phase and a pixel pair could not be
//                 meaningful. MUI's CircularProgress also has no track ring to pair against.
//
export const sections: Section[] = [buttonSection, textSection, labelSection, linkSection, inputSection, checkboxSection, switchSection, radioSection, badgeSection, bannerSection, meterSection, layerCardSection, tabsSection]
