import { useState } from "react"
import MuiAppBar from "@mui/material/AppBar"
import MuiAutocomplete from "@mui/material/Autocomplete"
import MuiAvatar from "@mui/material/Avatar"
import MuiBadge from "@mui/material/Badge"
import MuiBottomNavigation from "@mui/material/BottomNavigation"
import MuiBottomNavigationAction from "@mui/material/BottomNavigationAction"
import MuiCircularProgress from "@mui/material/CircularProgress"
import MuiDivider from "@mui/material/Divider"
import MuiFab from "@mui/material/Fab"
import MuiPagination from "@mui/material/Pagination"
import MuiRating from "@mui/material/Rating"
import MuiSlider from "@mui/material/Slider"
import MuiStep from "@mui/material/Step"
import MuiStepLabel from "@mui/material/StepLabel"
import MuiStepper from "@mui/material/Stepper"
import MuiTextField from "@mui/material/TextField"
import MuiList from "@mui/material/List"
import MuiListItem from "@mui/material/ListItem"
import MuiListItemButton from "@mui/material/ListItemButton"
import MuiListItemIcon from "@mui/material/ListItemIcon"
import MuiListItemText from "@mui/material/ListItemText"
import MuiToolbar from "@mui/material/Toolbar"
import { GearIcon, HouseIcon } from "@phosphor-icons/react"
import MuiSkeleton from "@mui/material/Skeleton"
import MuiStack from "@mui/material/Stack"
import MuiTable from "@mui/material/Table"
import MuiTableBody from "@mui/material/TableBody"
import MuiTableCell from "@mui/material/TableCell"
import MuiTableContainer from "@mui/material/TableContainer"
import MuiTableRow from "@mui/material/TableRow"
import type { Section } from "../../../gallery/types"

// DERIVED components - ones MUI ships and Kumo does not. Every pair here omits `ref` on purpose:
// there is no Kumo component to diff against, so the harness renders the MUI side alone, publishes
// no states, and the parity suite skips them (see `Pair.ref` in gallery/types.ts). preflight still
// covers them, which is what proves the blocks do not lean on Tailwind's reset.
//
// They are here to be LOOKED AT. A derived value is a considered choice, not ground truth, and the
// only way it gets caught being wrong is a human seeing it next to the extracted components above.
// Looking includes clicking, so the ones MUI makes controlled-only hold their own state below - a
// selected-state colour nobody can reach is a colour nobody checks. Nothing here is diffed against
// a reference, so the only constraint on that state is that it starts where it used to.

/** MUI's BottomNavigation is controlled-only; without `onChange` no action can ever be picked. */
function BottomNavigationDemo() {
  const [value, setValue] = useState(0)
  return (
    <MuiBottomNavigation value={value} onChange={(_, next: number) => setValue(next)} style={{ width: 240 }}>
      <MuiBottomNavigationAction label="Overview" icon={<HouseIcon />} />
      <MuiBottomNavigationAction label="Settings" icon={<GearIcon />} />
    </MuiBottomNavigation>
  )
}

/**
 * The list, with its selection held here rather than pinned to the second row.
 *
 * The composition is deliberate and is the one MUI itself documents for a clickable list -
 * `ListItem > ListItemButton > ListItemIcon + ListItemText` - which is a DIFFERENT shape from the
 * flat `ListItem > ListItemIcon` that most of these themes extract their list styling from. Keeping
 * it that way is what caught the shadcn theme applying an icon rule written for the flat case to
 * this one, where it removed the icon's slot and left the label flush against the glyph.
 */
function ListDemo() {
  const [selected, setSelected] = useState(1)
  const items = [
    { label: "Overview", icon: <HouseIcon /> },
    { label: "Settings", icon: <GearIcon /> },
  ]
  return (
    <MuiList style={{ width: 200 }}>
      {items.map((item, i) => (
        <MuiListItem key={item.label}>
          <MuiListItemButton selected={i === selected} onClick={() => setSelected(i)}>
            <MuiListItemIcon>{item.icon}</MuiListItemIcon>
            <MuiListItemText primary={item.label} />
          </MuiListItemButton>
        </MuiListItem>
      ))}
    </MuiList>
  )
}

export const derivedSection: Section = {
  title: "Derived (no Kumo counterpart)",
  pairs: [
    {
      id: "derived-divider",
      mui: (
        <div style={{ width: 200 }}>
          <MuiDivider />
        </div>
      ),
    },
    {
      id: "derived-avatar",
      mui: (
        <MuiStack direction="row" spacing={1}>
          <MuiAvatar>KU</MuiAvatar>
          <MuiAvatar variant="rounded">MO</MuiAvatar>
        </MuiStack>
      ),
    },
    {
      id: "derived-skeleton",
      mui: (
        <MuiStack spacing={1} style={{ width: 200 }}>
          <MuiSkeleton variant="text" />
          <MuiSkeleton variant="rounded" height={32} />
        </MuiStack>
      ),
    },
    {
      id: "derived-list",
      mui: <ListDemo />,
    },
    {
      id: "derived-app-bar",
      mui: (
        <MuiAppBar position="static" style={{ width: 220 }}>
          <MuiToolbar>Workers</MuiToolbar>
        </MuiAppBar>
      ),
    },
    {
      id: "derived-fab",
      mui: (
        <MuiStack direction="row" spacing={1}>
          <MuiFab>
            <HouseIcon />
          </MuiFab>
          {/* determinate on purpose: an indeterminate spinner is a moving target for preflight,
              which screenshots the same cell on two pages and compares them */}
          <MuiCircularProgress variant="determinate" value={65} />
        </MuiStack>
      ),
    },
    {
      id: "derived-slider",
      mui: (
        <div style={{ width: 200 }}>
          <MuiSlider defaultValue={40} />
        </div>
      ),
    },
    {
      id: "derived-rating-badge",
      mui: (
        <MuiStack direction="row" spacing={3}>
          {/* Not `readOnly`: the hover preview and the click-to-set are half of what a Rating's
              derived styling has to get right, and neither is reachable through a read-only one. */}
          <MuiRating defaultValue={3} />
          <MuiBadge badgeContent={4}>
            <MuiAvatar variant="rounded">KU</MuiAvatar>
          </MuiBadge>
          <MuiBadge variant="dot">
            <MuiAvatar variant="rounded">MO</MuiAvatar>
          </MuiBadge>
        </MuiStack>
      ),
    },
    {
      id: "derived-pagination",
      // `defaultPage`, not `page` - the controlled prop with no `onChange` renders a set of
      // buttons that cannot change the page they claim to select.
      mui: <MuiPagination count={5} defaultPage={2} />,
    },
    {
      id: "derived-stepper",
      mui: (
        <div style={{ width: 300 }}>
          <MuiStepper activeStep={1}>
            <MuiStep>
              <MuiStepLabel>Plan</MuiStepLabel>
            </MuiStep>
            <MuiStep>
              <MuiStepLabel>Build</MuiStepLabel>
            </MuiStep>
            <MuiStep>
              <MuiStepLabel>Ship</MuiStepLabel>
            </MuiStep>
          </MuiStepper>
        </div>
      ),
    },
    {
      id: "derived-bottom-navigation",
      mui: <BottomNavigationDemo />,
    },
    {
      id: "derived-autocomplete",
      mui: (
        <MuiAutocomplete
          style={{ width: 220 }}
          options={["Workers", "Pages", "R2"]}
          renderInput={(params) => <MuiTextField {...params} />}
        />
      ),
    },
    {
      id: "derived-table-container",
      mui: (
        <MuiTableContainer style={{ maxWidth: 220 }}>
          <MuiTable>
            <MuiTableBody>
              <MuiTableRow>
                <MuiTableCell>Worker</MuiTableCell>
                <MuiTableCell>Active</MuiTableCell>
              </MuiTableRow>
            </MuiTableBody>
          </MuiTable>
        </MuiTableContainer>
      ),
    },
  ],
}
