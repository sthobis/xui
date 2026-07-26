import MuiTable from "@mui/material/Table"
import MuiTableBody from "@mui/material/TableBody"
import MuiTableCell from "@mui/material/TableCell"
import MuiTableContainer from "@mui/material/TableContainer"
import MuiTableHead from "@mui/material/TableHead"
import MuiTableRow from "@mui/material/TableRow"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Section } from "../types"

// Both sides are `w-full` all the way down, so the pair needs an outer box with a real width -
// otherwise the table's width comes from the cell's own intrinsic sizing and the two sides could
// resolve it differently. Narrow enough that the container's overflow-x never engages.
const wrapStyle = { width: "16rem" } as const

export const tableSection: Section = {
  title: "Table",
  pairs: [
    {
      // data-target is the first BODY row: shadcn's hover:bg-muted/50 is on TableRow generally, and
      // a body row is where it reads against the header row's bottom border above it.
      id: "table-basic",
      states: ["default", "hover"],
      shadcn: (
        <div style={wrapStyle}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow data-target>
                <TableCell>Shirt</TableCell>
                <TableCell>2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hat</TableCell>
                <TableCell>1</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiTableContainer>
            <MuiTable>
              <MuiTableHead>
                <MuiTableRow>
                  <MuiTableCell>Item</MuiTableCell>
                  <MuiTableCell>Qty</MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                <MuiTableRow data-target>
                  <MuiTableCell>Shirt</MuiTableCell>
                  <MuiTableCell>2</MuiTableCell>
                </MuiTableRow>
                <MuiTableRow>
                  <MuiTableCell>Hat</MuiTableCell>
                  <MuiTableCell>1</MuiTableCell>
                </MuiTableRow>
              </MuiTableBody>
            </MuiTable>
          </MuiTableContainer>
        </div>
      ),
    },
    {
      // shadcn marks a selected row with data-state="selected"; MUI has a `selected` prop that
      // resolves to .Mui-selected. Covers the one row background the hover state does not.
      id: "table-selected",
      states: ["default", "hover"],
      shadcn: (
        <div style={wrapStyle}>
          <Table>
            <TableBody>
              <TableRow data-target data-state="selected">
                <TableCell>Shirt</TableCell>
                <TableCell>2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Hat</TableCell>
                <TableCell>1</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiTableContainer>
            <MuiTable>
              <MuiTableBody>
                <MuiTableRow data-target selected>
                  <MuiTableCell>Shirt</MuiTableCell>
                  <MuiTableCell>2</MuiTableCell>
                </MuiTableRow>
                <MuiTableRow>
                  <MuiTableCell>Hat</MuiTableCell>
                  <MuiTableCell>1</MuiTableCell>
                </MuiTableRow>
              </MuiTableBody>
            </MuiTable>
          </MuiTableContainer>
        </div>
      ),
    },
  ],
}
