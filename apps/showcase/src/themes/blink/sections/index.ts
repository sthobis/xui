import type { Section } from "../../../gallery/types"
import { alertSection } from "./alert"
import { buttonSection } from "./button"
import { checkboxSection, radioSection } from "./checkbox"
import { inputSection } from "./input"
import { linkSection } from "./link"
import { switchSection } from "./switch"

export const sections: Section[] = [
  buttonSection,
  alertSection,
  checkboxSection,
  radioSection,
  switchSection,
  inputSection,
  linkSection,
]
