import { Fragment } from "react"
import MuiStep from "@mui/material/Step"
import MuiStepLabel from "@mui/material/StepLabel"
import MuiStepper from "@mui/material/Stepper"
import type { Section } from "../../../gallery/types"

// COMPOSED TWIN - shadcn ships no stepper. The composition uses its own tokens throughout: a
// `size-6 rounded-full text-xs` counter, `bg-primary text-primary-foreground` for the current step
// and `bg-muted text-muted-foreground` for the rest, `text-sm` labels, and `h-px bg-border`
// connectors. Real utilities, assembled here - read the parity number as "MUI's Stepper renders this
// composition exactly".
//
// SCOPE: a horizontal stepper on its FIRST step, so every counter shows a number. MUI swaps in a
// check glyph for completed steps, drawn from its own icon set rather than lucide, and matching that
// would mean handing MUI a custom step-icon component from the gallery - a bigger surface with no
// pair behind it. Completed steps, the vertical orientation, and error/disabled steps therefore get
// no treatment.
const wrapStyle = { width: 336 } as const

const STEPS = ["Cart", "Address", "Payment"] as const
const ACTIVE = 0

export const stepperSection: Section = {
  title: "Stepper",
  pairs: [
    {
      id: "stepper-horizontal",
      ref: (
        <div style={wrapStyle}>
          {/* Steps size to their content and the connectors take up the slack, which is MUI's own
              layout algorithm rather than an invention here - an equal-width `flex-1` step was tried
              first and put every label somewhere else. One `gap-2` on the row spaces steps from
              connectors, so no element needs padding of its own. */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => (
              <Fragment key={label}>
                {i > 0 && <span className="h-px flex-1 bg-border" />}
                <span className="flex items-center gap-2">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      i === ACTIVE
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`text-sm ${
                      i === ACTIVE ? "font-medium text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiStepper activeStep={ACTIVE}>
            {STEPS.map((label) => (
              <MuiStep key={label}>
                <MuiStepLabel>{label}</MuiStepLabel>
              </MuiStep>
            ))}
          </MuiStepper>
        </div>
      ),
    },
  ],
}
