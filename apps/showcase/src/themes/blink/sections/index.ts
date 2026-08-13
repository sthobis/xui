import type { Section } from "../../../gallery/types"
import { buttonSection } from "./button"
import { checkboxSection, radioSection } from "./checkbox"
import { inputSection } from "./input"
import { linkSection } from "./link"

export const sections: Section[] = [
  buttonSection,
  checkboxSection,
  radioSection,
  inputSection,
  linkSection,
]
