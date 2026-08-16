import type { Section } from "../../../gallery/types"
import { buttonSection } from "./button"
import { iconButtonSection } from "./icon-button"
import { textFieldSection } from "./text-field"
import { checkboxSection } from "./checkbox"
import { radioSection } from "./radio"
import { switchSection } from "./switch"
import { selectSection } from "./select"
import { sliderSection } from "./slider"
import { avatarSection } from "./avatar"
import { dividerSection } from "./divider"
import { skeletonSection } from "./skeleton"
import { linkSection } from "./link"
import { chipSection } from "./chip"
import { alertSection } from "./alert"
import { cardSection } from "./card"
import { progressSection } from "./progress"
import { typographySection } from "./typography"
import { tooltipSection } from "./tooltip"
import { breadcrumbSection } from "./breadcrumb"
import { paginationSection } from "./pagination"
import { toggleSection } from "./toggle"
import { buttonGroupSection } from "./button-group"
import { tabsSection } from "./tabs"
import { accordionSection } from "./accordion"
import { tableSection } from "./table"
import { listSection } from "./list"
import { menuSection } from "./menu"
import { popoverSection } from "./popover"
import { dialogSection } from "./dialog"
import { drawerSection } from "./drawer"
import { inputGroupSection } from "./input-group"
import { autocompleteSection } from "./autocomplete"
import { snackbarSection } from "./snackbar"
import { appBarSection } from "./app-bar"
import { formHelperSection } from "./form-helper"
import { fabSection } from "./fab"
import { badgeDotSection } from "./badge-dot"
import { badgeCountSection } from "./badge-count"
import { ratingSection } from "./rating"
import { bottomNavigationSection } from "./bottom-navigation"
import { stepperSection } from "./stepper"
import { tablePaginationSection } from "./table-pagination"
import { imageListSection } from "./image-list"
import { speedDialSection } from "./speed-dial"
import { harnessCanarySection } from "./harness-canary"

export const sections: Section[] = [
  buttonSection,
  iconButtonSection,
  textFieldSection,
  checkboxSection,
  radioSection,
  switchSection,
  selectSection,
  autocompleteSection,
  sliderSection,
  avatarSection,
  dividerSection,
  skeletonSection,
  linkSection,
  chipSection,
  alertSection,
  cardSection,
  progressSection,
  typographySection,
  tooltipSection,
  breadcrumbSection,
  paginationSection,
  toggleSection,
  buttonGroupSection,
  tabsSection,
  accordionSection,
  tableSection,
  listSection,
  menuSection,
  popoverSection,
  dialogSection,
  drawerSection,
  inputGroupSection,
  snackbarSection,
  appBarSection,
  formHelperSection,
  fabSection,
  badgeDotSection,
  badgeCountSection,
  ratingSection,
  bottomNavigationSection,
  stepperSection,
  tablePaginationSection,
  imageListSection,
  speedDialSection,
  // Last, and deliberately so: an intentionally-failing-to-match pair is harness furniture, not a
  // component, and it should be the last thing a reader of the gallery meets. See its own banner.
  harnessCanarySection,
]
