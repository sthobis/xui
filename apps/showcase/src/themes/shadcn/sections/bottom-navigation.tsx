import MuiBottomNavigation from "@mui/material/BottomNavigation"
import MuiBottomNavigationAction from "@mui/material/BottomNavigationAction"
import { Bell, Home, User } from "lucide-react"
import type { Section } from "../../../gallery/types"

// COMPOSED TWIN - shadcn ships no bottom navigation bar. The composition follows the same surface
// language its header pattern uses, flipped to the bottom edge: `border-t bg-background`, items
// laid out `flex-1 flex-col items-center gap-1 text-xs`, the selected one in `text-foreground` and
// the rest in `text-muted-foreground`. Real utilities, assembled here.
//
// SCOPE: the resting bar with one item selected, with labels on and off. The ripple-driven
// selection animation has no pair and gets no treatment.
const wrapStyle = { width: 288 } as const

const ITEMS = [
  { label: "Home", Icon: Home },
  { label: "Alerts", Icon: Bell },
  { label: "Profile", Icon: User },
] as const

const SELECTED = 0

export const bottomNavigationSection: Section = {
  title: "BottomNavigation",
  pairs: [
    {
      id: "bottomnav-basic",
      ref: (
        <div style={wrapStyle}>
          <div className="flex h-14 items-stretch border-t bg-background">
            {ITEMS.map(({ label, Icon }, i) => (
              <span
                key={label}
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs ${
                  i === SELECTED ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </span>
            ))}
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiBottomNavigation showLabels value={SELECTED}>
            {ITEMS.map(({ label, Icon }) => (
              <MuiBottomNavigationAction key={label} label={label} icon={<Icon />} />
            ))}
          </MuiBottomNavigation>
        </div>
      ),
    },
    {
      // Labels off, which is MUI's default and not a variation on the pair above.
      //
      // MUI hides an unselected label WITHOUT collapsing its space: the text goes to opacity 0 and
      // every icon stays on the same line as the selected item's. The twin does the same, and that
      // is a deliberate choice rather than a copy of MUI's implementation. Dropping the label from
      // the markup instead - the obvious first guess, and what this pair did first - re-centres the
      // unselected icons 10px lower, which reads as a nicer layout and is an opinion nothing here
      // is entitled to hold. shadcn ships no bottom navigation, so there is no ground truth saying
      // the icons should move, and inventing one would make the pair assert a design decision
      // rather than verify the styling the theme actually owns.
      id: "bottomnav-nolabels",
      ref: (
        <div style={wrapStyle}>
          <div className="flex h-14 items-stretch border-t bg-background">
            {ITEMS.map(({ label, Icon }, i) => (
              <span
                key={label}
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs ${
                  i === SELECTED ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span className={i === SELECTED ? undefined : "opacity-0"}>{label}</span>
              </span>
            ))}
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiBottomNavigation value={SELECTED}>
            {ITEMS.map(({ label, Icon }) => (
              <MuiBottomNavigationAction key={label} label={label} icon={<Icon />} />
            ))}
          </MuiBottomNavigation>
        </div>
      ),
    },
  ],
}
