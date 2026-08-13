import type { Section } from "../../../gallery/types"
import { accordionSection } from "./accordion"
import { alertSection } from "./alert"
import { buttonSection } from "./button"
import { badgeSection } from "./badge"
import { avatarSection, cardSection, dividerSection } from "./card"
import { checkboxSection, radioSection } from "./checkbox"
import { inputSection } from "./input"
import { linkSection } from "./link"
import { switchSection } from "./switch"
import { tabsSection } from "./tabs"

export const sections: Section[] = [
  buttonSection,
  accordionSection,
  alertSection,
  avatarSection,
  badgeSection,
  cardSection,
  checkboxSection,
  dividerSection,
  radioSection,
  switchSection,
  tabsSection,
  inputSection,
  linkSection,
]
