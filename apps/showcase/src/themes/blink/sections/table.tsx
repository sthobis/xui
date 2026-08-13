import MuiTable from "@mui/material/Table"
import MuiTableBody from "@mui/material/TableBody"
import MuiTableCell from "@mui/material/TableCell"
import MuiTableContainer from "@mui/material/TableContainer"
import MuiTableFooter from "@mui/material/TableFooter"
import MuiTableHead from "@mui/material/TableHead"
import MuiTableRow from "@mui/material/TableRow"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../reference/primitives/Table"
import type { ReactNode } from "react"
import type { Section } from "../../../gallery/types"

// A fixed-width box around both sides. The kit's container and MUI's are both full-width blocks,
// and the columns must not be allowed to size themselves off the cell.
const Box = ({ children }: { children: ReactNode }) => (
  <div style={{ width: 320 }}>{children}</div>
)

// No RefProviders here: the kit's Table is plain React - a <table> and a CSS module, with no MUI
// underneath - so the reference side is already independent of the theme under test.

const rows = [
  ["iad-1", "Healthy"],
  ["ord-2", "Degraded"],
  ["sfo-9", "Healthy"],
] as const

const head = (
  <>
    <TableHeaderCell>Cluster</TableHeaderCell>
    <TableHeaderCell>Status</TableHeaderCell>
  </>
)
const muiHead = (
  <>
    <MuiTableCell>Cluster</MuiTableCell>
    <MuiTableCell>Status</MuiTableCell>
  </>
)

// Table. Five pairs, because a table's styling lives almost entirely in rules that only fire in
// combination - the last body row drops its border, the footer swaps its border to the top edge,
// a hovered row tints its cells rather than itself.
//
// One mapping to note: the kit ties both the hover tint and `cursor: pointer` to a row having an
// `onClick`, through its `.interactive` class. MUI has no such inference - a consumer opts in with
// the `hover` prop - so the theme hangs both on `.MuiTableRow-hover`, which is the nearest thing
// MUI has to "this row responds to the pointer".
//
// SCOPE, all four cases of the AGENTS.md list:
//
//   - `sortable` header cells have NO MUI equivalent that can be reached from a theme. The kit
//     draws three different icons (ArrowUp when ascending, ArrowDown when descending, a 0.4-opacity
//     ChevronsUpDown when idle); MUI's TableSortLabel has ONE `IconComponent` that it rotates 180
//     degrees for descending and fades for idle, so no single icon can produce the kit's three
//     states. Left at MUI's own treatment rather than half-matched.
//   - `sticky` head and footer are unpaired: both are scroll-position styling, and the harness
//     screenshots a settled, unscrolled cell, so a pair would assert nothing.
//   - `truncate` needs a column width to do anything (`max-width: 0` plus ellipsis), which makes it
//     a layout fixture rather than a component test.
//   - the kit's `.row:focus-visible` ring is unpaired: a <tr> is not focusable unless the app gives
//     it a tabIndex, and MUI's TableRow has no prop for that either, so both sides would need
//     hand-written attributes.
export const tableSection: Section = {
  title: "Table",
  pairs: [
    {
      id: "table-default",
      ref: (
        <Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>{head}</TableRow>
              </TableHead>
              <TableBody>
                {rows.map(([name, status]) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ),
      mui: (
        <Box>
          <MuiTableContainer>
            <MuiTable>
              <MuiTableHead>
                <MuiTableRow>{muiHead}</MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {rows.map(([name, status]) => (
                  <MuiTableRow key={name}>
                    <MuiTableCell>{name}</MuiTableCell>
                    <MuiTableCell>{status}</MuiTableCell>
                  </MuiTableRow>
                ))}
              </MuiTableBody>
            </MuiTable>
          </MuiTableContainer>
        </Box>
      ),
    },
    {
      // The compact tier: a smaller type size on the table and tighter padding on every cell.
      id: "table-small",
      ref: (
        <Box>
          <TableContainer>
            <Table size="sm">
              <TableHead>
                <TableRow>{head}</TableRow>
              </TableHead>
              <TableBody>
                {rows.map(([name, status]) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ),
      mui: (
        <Box>
          <MuiTableContainer>
            <MuiTable size="small">
              <MuiTableHead>
                <MuiTableRow>{muiHead}</MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {rows.map(([name, status]) => (
                  <MuiTableRow key={name}>
                    <MuiTableCell>{name}</MuiTableCell>
                    <MuiTableCell>{status}</MuiTableCell>
                  </MuiTableRow>
                ))}
              </MuiTableBody>
            </MuiTable>
          </MuiTableContainer>
        </Box>
      ),
    },
    {
      // The hover tint lands on the CELLS, not the row - see the note above.
      id: "table-hover",
      states: ["default", "hover"],
      ref: (
        <Box>
          <TableContainer>
            <Table>
              <TableBody>
                {rows.map(([name, status], i) => (
                  <TableRow key={name} data-target={i === 0 || undefined} onClick={() => {}}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ),
      mui: (
        <Box>
          <MuiTableContainer>
            <MuiTable>
              <MuiTableBody>
                {rows.map(([name, status], i) => (
                  <MuiTableRow key={name} hover data-target={i === 0 || undefined}>
                    <MuiTableCell>{name}</MuiTableCell>
                    <MuiTableCell>{status}</MuiTableCell>
                  </MuiTableRow>
                ))}
              </MuiTableBody>
            </MuiTable>
          </MuiTableContainer>
        </Box>
      ),
    },
    {
      id: "table-selected",
      ref: (
        <Box>
          <TableContainer>
            <Table>
              <TableBody>
                {rows.map(([name, status], i) => (
                  <TableRow key={name} selected={i === 1}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ),
      mui: (
        <Box>
          <MuiTableContainer>
            <MuiTable>
              <MuiTableBody>
                {rows.map(([name, status], i) => (
                  <MuiTableRow key={name} selected={i === 1}>
                    <MuiTableCell>{name}</MuiTableCell>
                    <MuiTableCell>{status}</MuiTableCell>
                  </MuiTableRow>
                ))}
              </MuiTableBody>
            </MuiTable>
          </MuiTableContainer>
        </Box>
      ),
    },
    {
      // The footer moves its rule to the top edge and drops to the muted ink - and has to hold the
      // table's own type size, which MUI otherwise shrinks to 12px for a footer cell.
      id: "table-footer",
      ref: (
        <Box>
          <TableContainer>
            <Table>
              <TableBody>
                {rows.slice(0, 2).map(([name, status]) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>2 of 9 clusters</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </Box>
      ),
      mui: (
        <Box>
          <MuiTableContainer>
            <MuiTable>
              <MuiTableBody>
                {rows.slice(0, 2).map(([name, status]) => (
                  <MuiTableRow key={name}>
                    <MuiTableCell>{name}</MuiTableCell>
                    <MuiTableCell>{status}</MuiTableCell>
                  </MuiTableRow>
                ))}
              </MuiTableBody>
              <MuiTableFooter>
                <MuiTableRow>
                  <MuiTableCell colSpan={2}>2 of 9 clusters</MuiTableCell>
                </MuiTableRow>
              </MuiTableFooter>
            </MuiTable>
          </MuiTableContainer>
        </Box>
      ),
    },
  ],
}
