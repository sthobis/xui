import MuiBottomNavigation from "@mui/material/BottomNavigation"
import MuiBottomNavigationAction from "@mui/material/BottomNavigationAction"
import { Bell, Home, User } from "lucide-react"
import type { Section } from "../types"

// COMPOSED TWIN - shadcn ships no bottom navigation bar. The composition follows the same surface
// language its header pattern uses, flipped to the bottom edge: `border-t bg-background`, items
// laid out `flex-1 flex-col items-center gap-1 text-xs`, the selected one in `text-foreground` and
// the rest in `text-muted-foreground`. Real utilities, assembled here.
//
// SCOPE: the resting bar with one item selected. `showLabels={false}` (MUI hides an unselected
// item's label unless it is on), and the ripple-driven selection animation, have no pair and get no
// treatment.
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
      shadcn: (
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
  ],
}
