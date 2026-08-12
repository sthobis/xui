import MuiAvatar from "@mui/material/Avatar"
import MuiDivider from "@mui/material/Divider"
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
