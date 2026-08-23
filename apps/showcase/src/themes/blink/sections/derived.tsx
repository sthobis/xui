// No RefProviders: nothing in this file renders a reference cell at all - every pair here is
// ref-less by definition of the derived tier (see Pair.ref).
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
import MuiTablePagination from "@mui/material/TablePagination"
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
      // Carries a VALUE on purpose, so both of Autocomplete's indicators render at once. That is
      // the construction the theme's `inline-flex` note points at: MUI puts the clear and popup
      // buttons in an `endAdornment` div that is absolutely positioned and NOT a flex container, so
      // a block-level IconButton claims a line each and the two stack, hanging out of the field.
      // The `icon buttons stay inline-level` sweep is what judges that; this pair is what gives it
      // something to judge, and what puts the break on screen in the showcase.
      id: "derived-autocomplete",
      mui: (
        <Box>
          <MuiAutocomplete
            options={["Washington", "Chicago", "San Francisco"]}
            // CONTROLLED, with an onChange that keeps the value - not `defaultValue`. A gallery
            // cell has to render the same thing all run, and this is the only one whose button
            // DESTROYS part of itself: clearing removes the clear indicator from the DOM, so an
            // uncontrolled cell loses a button partway through and every later check sees a
            // different page. It hung the `no ripple` sweep outright, which walks ButtonBases by
            // index against a live list - the press deleted element 135 and the walk then waited
            // out its whole budget on an index that no longer existed.
            value="Chicago"
            onChange={() => {}}
            renderInput={(params) => <MuiTextField {...params} label="Region" />}
          />
        </Box>
      ),
    },
    {
      // The other half of that construction: TablePagination puts its prev/next arrows in a plain
      // div. Page 1 of 3 so both arrows are live - a disabled arrow still lays out, but an enabled
      // pair is what a reader recognises as "one row" or "stacked".
      id: "derived-table-pagination",
      mui: (
        <Box w={320}>
          <MuiTablePagination
            component="div"
            count={13}
            page={1}
            rowsPerPage={5}
            rowsPerPageOptions={[]}
            onPageChange={() => {}}
          />
        </Box>
      ),
    },
    // ---- Labelled fields ----
    //
    // DECISION: the theme keeps supporting `<TextField label>`, these are derived-tier pairs, and
    // they are judged on GEOMETRY rather than on pixels.
    //
    // The alternative was to document `label` as unsupported and tell apps to compose FormField's
    // static FormLabel by hand. That was rejected: `label` is a first-class prop on the most-used
    // MUI input, so a drop-in theme that renders it wrong is worse than one that renders it well,
    // and the theme cannot opt out of Autocomplete's `renderInput` anyway - which is where most
    // apps meet a labelled field.
    //
    // What the theme does instead is take MUI's FLOAT off (see the MuiInputLabel block) so the
    // label becomes an ordinary first child of the FormControl's column - which is already the
    // kit's own FormField layout, transcribed from its module. So no geometry is invented for the
    // label: it inherits the column the kit already describes.
    //
    // That is why these can be ref-less and still held to a real standard. The claim is a relation
    // between the label and the control beside it - in flow, above the control, at the column's own
    // spacing - so each field checks itself with no reference to diff against. The `label placement`
    // sweep in e2e/behavior.spec.ts does the measuring; the pixel suite skips these pairs, as it
    // does every ref-less one.
    //
    // One resting and one filled field per size. Size no longer moves the label under this design,
    // but it does move the CONTROL (32/36/40), and the defect these exist to catch was a label
    // positioned against a box the design system does not have.
    ...(["small", "medium", "large"] as const).map((size) => ({
      id: `derived-textfield-label-${size}`,
      mui: (
        <div style={{ display: "flex", gap: 12 }}>
          <MuiTextField size={size} label="Region" sx={{ width: 130 }} />
          <MuiTextField size={size} label="Region" defaultValue="iad-1" sx={{ width: 130 }} />
        </div>
      ),
    })),
  ],
}
