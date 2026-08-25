import type { Section } from "../../../gallery/types"
import { accordionSection } from "./accordion"
import { alertSection } from "./alert"
import { buttonGroupSection } from "./button-group"
import { buttonSection } from "./button"
import { badgeSection } from "./badge"
import { avatarSection, cardSection, dividerSection } from "./card"
import { checkboxSection, radioSection } from "./checkbox"
import { formFieldSection, textareaSection } from "./form-field"
import { inputSection } from "./input"
import { linkSection } from "./link"
import { derivedSection } from "./derived"
import { dialogSection, menuSection, popoverSection, tooltipSection } from "./overlay"
import { selectSection } from "./select"
import { iconButtonSection, progressRingSection, spinnerSection } from "./spinner"
import { switchSection } from "./switch"
import { tableSection } from "./table"
import { toggleGroupSection } from "./toggle-group"
import { tabsSection } from "./tabs"

export const sections: Section[] = [
  buttonSection,
  buttonGroupSection,
  accordionSection,
  alertSection,
  avatarSection,
  badgeSection,
  cardSection,
  checkboxSection,
  dialogSection,
  dividerSection,
  radioSection,
  menuSection,
  popoverSection,
  selectSection,
  progressRingSection,
  spinnerSection,
  switchSection,
  tableSection,
  tabsSection,
  toggleGroupSection,
  tooltipSection,
  formFieldSection,
  iconButtonSection,
  inputSection,
  textareaSection,
  linkSection,
  derivedSection,
]
