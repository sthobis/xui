import type { Section } from "../types"
import { buttonSection } from "./button"
import { iconButtonSection } from "./icon-button"
import { textFieldSection } from "./text-field"
import { checkboxSection } from "./checkbox"
import { radioSection } from "./radio"
import { switchSection } from "./switch"

export const sections: Section[] = [
  buttonSection,
  iconButtonSection,
  textFieldSection,
  checkboxSection,
  radioSection,
  switchSection,
]
