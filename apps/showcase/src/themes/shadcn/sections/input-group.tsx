import MuiIconButton from "@mui/material/IconButton"
import MuiInputAdornment from "@mui/material/InputAdornment"
import MuiTextField from "@mui/material/TextField"
import { Search, X } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { Section } from "../../../gallery/types"

const VALUE = "shadcn"

// Whole, even pixels so both sides start on the same pixel column - see menu.tsx.
const wrapStyle = { width: 224 } as const

export const inputGroupSection: Section = {
  title: "InputGroup",
  pairs: [
    {
      // InputGroup's own box is the same recipe shadcn's Input uses (h-8, rounded-lg, border-input,
      // dark:bg-input/30, the focus ring), which the theme already carries on the outlined input
      // root. What is new here is the ADDON: shadcn insets it with its own padding and a negative
      // margin, where MUI's InputAdornment uses a fixed 8px margin and a height hack.
      id: "inputgroup-start-icon",
      states: ["default", "focus"],
      ref: (
        <div style={wrapStyle}>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Search />
            </InputGroupAddon>
            <InputGroupInput data-target defaultValue={VALUE} />
          </InputGroup>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiTextField
            fullWidth
            defaultValue={VALUE}
            slotProps={{
              htmlInput: { "data-target": true },
              input: {
                startAdornment: (
                  <MuiInputAdornment position="start">
                    <Search />
                  </MuiInputAdornment>
                ),
              },
            }}
          />
        </div>
      ),
    },
    {
      // The trailing button case, which is what the Combobox's clear control is built from.
      // shadcn's InputGroupButton at size="icon-xs" is a 24px ghost square with a radius the
      // multiplicative scale does not produce; MUI reaches it through an added `xsmall` size on
      // IconButton (see the theme's InputGroup banner).
      id: "inputgroup-end-button",
      states: ["default", "focus"],
      ref: (
        <div style={wrapStyle}>
          <InputGroup>
            <InputGroupInput data-target defaultValue={VALUE} />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Clear">
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiTextField
            fullWidth
            defaultValue={VALUE}
            slotProps={{
              htmlInput: { "data-target": true },
              input: {
                endAdornment: (
                  <MuiInputAdornment position="end">
                    <MuiIconButton size="xsmall" aria-label="Clear">
                      <X />
                    </MuiIconButton>
                  </MuiInputAdornment>
                ),
              },
            }}
          />
        </div>
      ),
    },
  ],
}
