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
import { collapsibleSection } from "./collapsible"
import { tableSection } from "./table"
import { breadcrumbsSection } from "./breadcrumbs"
import { toolbarSection } from "./toolbar"
import { toggleSection } from "./toggle"
import { inputGroupSection } from "./input-group"
import { tooltipSection } from "./tooltip"
import { dropdownSection } from "./dropdown"
import { selectSection } from "./select"
import { popoverSection } from "./popover"
import { dialogSection } from "./dialog"
import { toastSection } from "./toast"
import { derivedSection } from "./derived"

// NO KUMO COUNTERPART. These are the components a pixel pair cannot be built for, and they now
// split two ways.
//
// Some are still absent from the theme entirely - a Kumo component MUI has no equivalent of, so
// there is nothing for a theme to style:
//
//   Empty         is a bordered empty-state card with an illustration slot. MUI has no
//                 empty-state component to pair it against.
//   Flow          is a scrollable canvas with its own custom scrollbar thumbs and per-corner
//                 radii, not a step indicator - its docs example only looks like one. MUI's
//                 Stepper is a different component doing a different job.
//   Pagination    is an InputGroup of first/prev/page-input/next/last built from Kumo's own
//                 buttons. MUI's Pagination renders numbered page buttons and its TablePagination
//                 a rows-per-page select with a range readout - different components, not a
//                 different skin, so there is nothing here a theme could reconcile.
//   Toast's        stack is only partly reachable: a toast is paired title-only, because kumo
//   description   always renders a title AND a description node and MUI's SnackbarContent has one
//                 opaque `message` slot. The shadcn snackbar pair is scoped the same way.
//   Loader        is a hand-rolled SVG animated with SMIL (<animateTransform> plus two <animate>
//                 elements driving stroke-dasharray/dashoffset), over a second static ring at 10%
//                 opacity. Playwright's `animations: "disabled"` freezes CSS animations but not
//                 SMIL, so a captured frame has no stable phase and a pixel pair could not be
//                 meaningful. MUI's CircularProgress also has no track ring to pair against.
//
// The rest go the OTHER way. Where MUI ships a component Kumo does not, leaving it unthemed means
// leaving it stock Material in a Kumo app, which is worse than an imperfect derivation - so those
// are styled from Kumo's tokens and shown in `derivedSection` below, MUI-side only and skipped by
// the parity suite. SkeletonLine is the example that moved: it is not in @cloudflare/kumo 2.9.0 at
// all (the docs site demonstrates it, the published package exports nothing), so MuiSkeleton is
// derived from `bg-kumo-fill` rather than extracted, and should be re-done properly if a release
// ever ships the real component.
//
export const sections: Section[] = [buttonSection, textSection, labelSection, linkSection, inputSection, checkboxSection, switchSection, radioSection, badgeSection, bannerSection, meterSection, layerCardSection, tabsSection, collapsibleSection, tableSection, breadcrumbsSection, toolbarSection, toggleSection, inputGroupSection, tooltipSection, dropdownSection, selectSection, popoverSection, dialogSection, toastSection, derivedSection]
