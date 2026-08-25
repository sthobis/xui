// The second half of the derived tier - the components authored when blink took on ALL of MUI.
//
// Every pair here is ref-less, for the same reason the rest of derived.tsx is: the design system has
// no equivalent, so there is nothing to diff against and `PairRow` publishes `data-states=""` on its
// own. What these rows buy is what that file's banner already sets out - preflight proves the block
// is self-contained rather than leaning on a reset, the behaviour sweeps run over it, and the
// showcase puts it beside blink's real components where a reader can see whether it belongs.
//
// That last one is the actual bar for this tier. See AGENTS.md, "Deriving a component blink has no
// twin for": a derived component is right when nothing about it stands out in a row with the real
// ones - same heights, same radii, same ink, same focus ring, same hover language.
import MuiAccordion from "@mui/material/Accordion"
import MuiAccordionActions from "@mui/material/AccordionActions"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import MuiAccordionSummary from "@mui/material/AccordionSummary"
import MuiButton from "@mui/material/Button"
import MuiCard from "@mui/material/Card"
import MuiCardActionArea from "@mui/material/CardActionArea"
import MuiCardContent from "@mui/material/CardContent"
import MuiCardMedia from "@mui/material/CardMedia"
import MuiAvatar from "@mui/material/Avatar"
import MuiList from "@mui/material/List"
import MuiListItem from "@mui/material/ListItem"
import MuiListItemAvatar from "@mui/material/ListItemAvatar"
import MuiListItemText from "@mui/material/ListItemText"
import MuiListSubheader from "@mui/material/ListSubheader"
import MuiMobileStepper from "@mui/material/MobileStepper"
import MuiScopedCssBaseline from "@mui/material/ScopedCssBaseline"
import MuiStepper from "@mui/material/Stepper"
import MuiStep from "@mui/material/Step"
import MuiStepButton from "@mui/material/StepButton"
import MuiStepContent from "@mui/material/StepContent"
import MuiStepLabel from "@mui/material/StepLabel"
import MuiSvgIcon from "@mui/material/SvgIcon"
import MuiTable from "@mui/material/Table"
import MuiTableFooter from "@mui/material/TableFooter"
import MuiTableRow from "@mui/material/TableRow"
import MuiTabs from "@mui/material/Tabs"
import MuiTab from "@mui/material/Tab"
import MuiTablePagination from "@mui/material/TablePagination"
import MuiTypography from "@mui/material/Typography"
import type { ReactNode } from "react"
import type { Section } from "../../../gallery/types"

const Box = ({ children, w = 280 }: { children: ReactNode; w?: number }) => (
  <div style={{ width: w }}>{children}</div>
)

const noop = () => {}

export const derivedExtraSection: Section = {
  title: "Derived (authored for full MUI coverage)",
  pairs: [
    {
      // AccordionActions continues the details box rather than opening a new one - same 16px
      // gutters, no top rule.
      id: "derived-accordion-actions",
      mui: (
        <Box w={320}>
          <MuiAccordion defaultExpanded>
            <MuiAccordionSummary>Retention policy</MuiAccordionSummary>
            <MuiAccordionDetails>Events older than 30 days are rolled up.</MuiAccordionDetails>
            <MuiAccordionActions>
              <MuiButton variant="text">Cancel</MuiButton>
              <MuiButton variant="contained">Save</MuiButton>
            </MuiAccordionActions>
          </MuiAccordion>
        </Box>
      ),
    },
    {
      // CardActionArea and CardMedia together, which is how a consumer meets both. The two things
      // to look at: the media's top corners against the card's radius, and that the hover is the
      // neutral row hover rather than Material's translucent overlay.
      id: "derived-card-action-area",
      states: ["default", "hover"],
      mui: (
        <Box w={240}>
          <MuiCard>
            <MuiCardActionArea data-target>
              <MuiCardMedia sx={{ height: 96 }} />
              <MuiCardContent>
                <MuiTypography variant="h6">iad-1</MuiTypography>
                <MuiTypography variant="body2">3 clusters online</MuiTypography>
              </MuiCardContent>
            </MuiCardActionArea>
          </MuiCard>
        </Box>
      ),
    },
    {
      // ListSubheader and ListItemAvatar. The avatar gutter is the one to check: blink's avatar is
      // 32px against Material's 40, so MUI's 56px reservation would leave 16px of dead space.
      id: "derived-list-subheader",
      mui: (
        <Box>
          <MuiList subheader={<MuiListSubheader>Regions</MuiListSubheader>}>
            <MuiListItem>
              <MuiListItemAvatar>
                <MuiAvatar>IA</MuiAvatar>
              </MuiListItemAvatar>
              <MuiListItemText primary="iad-1" secondary="Ashburn" />
            </MuiListItem>
            <MuiListItem>
              <MuiListItemAvatar>
                <MuiAvatar>SF</MuiAvatar>
              </MuiListItemAvatar>
              <MuiListItemText primary="sfo-2" secondary="San Francisco" />
            </MuiListItem>
          </MuiList>
        </Box>
      ),
    },
    {
      // MobileStepper's dots. There is no dot anywhere in the design system, so these are the most
      // authored thing in the file - active is the StepIcon's primary, inactive the connector's rule.
      id: "derived-mobile-stepper-dots",
      mui: (
        <Box>
          <MuiMobileStepper
            variant="dots"
            steps={4}
            activeStep={1}
            position="static"
            backButton={
              <MuiButton size="small" variant="text">
                Back
              </MuiButton>
            }
            nextButton={
              <MuiButton size="small" variant="text">
                Next
              </MuiButton>
            }
          />
        </Box>
      ),
    },
    {
      // The progress variant reuses the LinearProgress block's rail rather than inventing a second.
      id: "derived-mobile-stepper-progress",
      mui: (
        <Box>
          <MuiMobileStepper
            variant="progress"
            steps={4}
            activeStep={1}
            position="static"
            backButton={
              <MuiButton size="small" variant="text">
                Back
              </MuiButton>
            }
            nextButton={
              <MuiButton size="small" variant="text">
                Next
              </MuiButton>
            }
          />
        </Box>
      ),
    },
    {
      // ScopedCssBaseline is how a consumer applies blink to PART of a page. Without its block that
      // subtree gets Material's Roboto stack; the pair is here so the typography is visible.
      id: "derived-scoped-baseline",
      mui: (
        <Box>
          <MuiScopedCssBaseline sx={{ padding: 2, borderRadius: 2 }}>
            <MuiTypography variant="h6">Scoped baseline</MuiTypography>
            <MuiTypography variant="body1">
              This subtree carries blink&apos;s type and surface without a global baseline.
            </MuiTypography>
          </MuiScopedCssBaseline>
        </Box>
      ),
    },
    {
      // StepButton and StepContent, the vertical stepper's two missing halves. StepContent hangs off
      // the same rule the connector draws, which is what to check here.
      id: "derived-step-button-content",
      states: ["default", "hover"],
      mui: (
        <Box w={320}>
          <MuiStepper activeStep={1} orientation="vertical">
            <MuiStep>
              <MuiStepButton onClick={noop}>Pick a region</MuiStepButton>
              <MuiStepContent>Choose where the cluster runs.</MuiStepContent>
            </MuiStep>
            <MuiStep>
              <MuiStepButton data-target onClick={noop}>
                Verify billing
              </MuiStepButton>
              <MuiStepContent>Confirm the plan before provisioning.</MuiStepContent>
            </MuiStep>
            <MuiStep>
              <MuiStepLabel>Deploy</MuiStepLabel>
            </MuiStep>
          </MuiStepper>
        </Box>
      ),
    },
    {
      // SvgIcon's size ladder. blink's own icons are lucide and carry explicit sizes, so this block
      // only ever reaches a consumer's <SvgIcon> - which is exactly what this pair renders.
      id: "derived-svg-icon-sizes",
      mui: (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["small", "medium", "large"] as const).map((size) => (
            <MuiSvgIcon key={size} fontSize={size} viewBox="0 0 24 24">
              <path
                d="M12 2 2 7l10 5 10-5-10-5Zm0 9L2 16l10 5 10-5-10-5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </MuiSvgIcon>
          ))}
        </div>
      ),
    },
    {
      // TabScrollButton. Styled from MuiTabs' root rather than its own key - MUI v9 omits
      // MuiTabScrollButton from its Components type. A narrow container is what forces the arrows.
      id: "derived-tab-scroll-buttons",
      mui: (
        <Box w={200}>
          <MuiTabs value={0} variant="scrollable" scrollButtons="auto">
            <MuiTab label="Overview" />
            <MuiTab label="Metrics" />
            <MuiTab label="Logs" />
            <MuiTab label="Settings" />
          </MuiTabs>
        </Box>
      ),
    },
    {
      // TablePaginationActions' arrows. Inside a toolbar they are the xs step, not the standalone
      // 36px ghost button the IconButton block would otherwise hand them.
      id: "derived-table-pagination-actions",
      mui: (
        <Box w={380}>
          <MuiTable>
            <MuiTableFooter>
              <MuiTableRow>
                <MuiTablePagination
                  count={60}
                  page={1}
                  rowsPerPage={10}
                  onPageChange={noop}
                  onRowsPerPageChange={noop}
                />
              </MuiTableRow>
            </MuiTableFooter>
          </MuiTable>
        </Box>
      ),
    },
  ],
}
