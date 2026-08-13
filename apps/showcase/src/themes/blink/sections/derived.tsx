import MuiAppBar from "@mui/material/AppBar"
import MuiToolbar from "@mui/material/Toolbar"
import MuiTypography from "@mui/material/Typography"
import MuiList from "@mui/material/List"
import MuiListItem from "@mui/material/ListItem"
import MuiListItemButton from "@mui/material/ListItemButton"
import MuiListItemIcon from "@mui/material/ListItemIcon"
import MuiListItemText from "@mui/material/ListItemText"
import MuiLinearProgress from "@mui/material/LinearProgress"
import MuiSkeleton from "@mui/material/Skeleton"
import MuiSlider from "@mui/material/Slider"
import MuiRating from "@mui/material/Rating"
import MuiFab from "@mui/material/Fab"
import MuiBottomNavigation from "@mui/material/BottomNavigation"
import MuiBottomNavigationAction from "@mui/material/BottomNavigationAction"
import MuiBreadcrumbs from "@mui/material/Breadcrumbs"
import MuiPagination from "@mui/material/Pagination"
import MuiStepper from "@mui/material/Stepper"
import MuiStep from "@mui/material/Step"
import MuiStepLabel from "@mui/material/StepLabel"
import MuiImageList from "@mui/material/ImageList"
import MuiImageListItem from "@mui/material/ImageListItem"
import MuiImageListItemBar from "@mui/material/ImageListItemBar"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import MuiFormGroup from "@mui/material/FormGroup"
import MuiCheckbox from "@mui/material/Checkbox"
import MuiSnackbarContent from "@mui/material/SnackbarContent"
import MuiAutocomplete from "@mui/material/Autocomplete"
import MuiTextField from "@mui/material/TextField"
import { HouseIcon, PlusIcon, SearchIcon, SettingsIcon } from "lucide-react"
import type { ReactNode } from "react"
import type { Section } from "../../../gallery/types"

// THE DERIVED TIER's gallery half.
//
// Every pair here omits `ref`, and that is the whole point: these are components MUI ships and the
// Pulse Kit does not, so there is nothing to diff against. The theme builds them from the kit's own
// tokens (see the banner in packages/xui/src/themes/blink.ts), and the harness holds them to the
// weaker claim automatically - PairRow publishes `data-states=""` for a ref-less pair, so the pixel
// suite structurally cannot be asked to judge one.
//
// What DOES cover them is preflight, which compares the MUI cell with the kit's stylesheet against
// the same cell without it. That needs no reference and is exactly the check that catches a derived
// block leaning on someone else's reset - it has already caught one on another theme, twice over.
//
// So: these rows exist to be LOOKED at (they are what fills the blink column of the showcase) and
// to be proved self-contained. They are not proved to match anything.

const Box = ({ children, w = 280 }: { children: ReactNode; w?: number }) => (
  <div style={{ width: w }}>{children}</div>
)

export const derivedSection: Section = {
  title: "Derived (no kit twin)",
  pairs: [
    {
      id: "derived-appbar",
      mui: (
        <Box w={320}>
          <MuiAppBar position="static">
            <MuiToolbar>
              <MuiTypography variant="h4" sx={{ flex: 1 }}>
                Clusters
              </MuiTypography>
              <SettingsIcon size={16} />
            </MuiToolbar>
          </MuiAppBar>
        </Box>
      ),
    },
    {
      id: "derived-list",
      mui: (
        <Box>
          <MuiList>
            <MuiListItem disablePadding>
              <MuiListItemButton selected>
                <MuiListItemIcon>
                  <HouseIcon size={16} />
                </MuiListItemIcon>
                <MuiListItemText primary="Overview" secondary="All regions" />
              </MuiListItemButton>
            </MuiListItem>
            <MuiListItem disablePadding>
              <MuiListItemButton>
                <MuiListItemIcon>
                  <SearchIcon size={16} />
                </MuiListItemIcon>
                <MuiListItemText primary="Search" />
              </MuiListItemButton>
            </MuiListItem>
          </MuiList>
        </Box>
      ),
    },
    {
      id: "derived-progress",
      mui: (
        <Box>
          <MuiLinearProgress variant="determinate" value={62} />
        </Box>
      ),
    },
    {
      id: "derived-skeleton",
      mui: (
        <Box>
          <MuiSkeleton variant="rounded" height={32} />
        </Box>
      ),
    },
    {
      id: "derived-slider",
      mui: (
        <Box>
          <MuiSlider defaultValue={40} />
        </Box>
      ),
    },
    {
      id: "derived-rating",
      mui: <MuiRating value={3} readOnly />,
    },
    {
      id: "derived-fab",
      mui: (
        <MuiFab aria-label="Add">
          <PlusIcon size={20} />
        </MuiFab>
      ),
    },
    {
      id: "derived-fab-extended",
      mui: (
        <MuiFab variant="extended">
          <PlusIcon size={16} />
          &nbsp;Add cluster
        </MuiFab>
      ),
    },
    {
      id: "derived-bottom-navigation",
      mui: (
        <Box>
          <MuiBottomNavigation value={0} showLabels>
            <MuiBottomNavigationAction label="Home" icon={<HouseIcon size={20} />} />
            <MuiBottomNavigationAction label="Search" icon={<SearchIcon size={20} />} />
          </MuiBottomNavigation>
        </Box>
      ),
    },
    {
      id: "derived-breadcrumbs",
      mui: (
        <MuiBreadcrumbs>
          <a href="#derived-breadcrumbs">Regions</a>
          <a href="#derived-breadcrumbs">iad</a>
          <span>Cluster 1</span>
        </MuiBreadcrumbs>
      ),
    },
    {
      id: "derived-pagination",
      mui: <MuiPagination count={5} page={2} />,
    },
    {
      id: "derived-stepper",
      mui: (
        <Box w={320}>
          <MuiStepper activeStep={1}>
            <MuiStep>
              <MuiStepLabel>Pick</MuiStepLabel>
            </MuiStep>
            <MuiStep>
              <MuiStepLabel>Verify</MuiStepLabel>
            </MuiStep>
            <MuiStep>
              <MuiStepLabel>Apply</MuiStepLabel>
            </MuiStep>
          </MuiStepper>
        </Box>
      ),
    },
    {
      id: "derived-image-list",
      mui: (
        <Box w={240}>
          <MuiImageList cols={2} rowHeight={80} sx={{ margin: 0 }}>
            <MuiImageListItem>
              <div style={{ width: "100%", height: 80, background: "#c9ccd6" }} />
              <MuiImageListItemBar title="iad-1" subtitle="Healthy" />
            </MuiImageListItem>
            <MuiImageListItem>
              <div style={{ width: "100%", height: 80, background: "#d6cfc9" }} />
              <MuiImageListItemBar title="ord-2" subtitle="Degraded" />
            </MuiImageListItem>
          </MuiImageList>
        </Box>
      ),
    },
    {
      id: "derived-form-control-label",
      mui: (
        <MuiFormGroup>
          <MuiFormControlLabel control={<MuiCheckbox defaultChecked />} label="Roll up nightly" />
          <MuiFormControlLabel control={<MuiCheckbox />} label="Notify on failure" />
        </MuiFormGroup>
      ),
    },
    {
      id: "derived-snackbar",
      mui: <MuiSnackbarContent message="Rollup scheduled." />,
    },
    {
      id: "derived-autocomplete",
      mui: (
        <Box>
          <MuiAutocomplete
            options={["Washington", "Chicago", "San Francisco"]}
            renderInput={(params) => <MuiTextField {...params} label="Region" />}
          />
        </Box>
      ),
    },
  ],
}
