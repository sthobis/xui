import MuiTable from "@mui/material/Table"
import MuiTableHead from "@mui/material/TableHead"
import MuiTableBody from "@mui/material/TableBody"
import MuiTableRow from "@mui/material/TableRow"
import MuiTableCell from "@mui/material/TableCell"
import { Table } from "@cloudflare/kumo/components/table"
import type { Section } from "../../../gallery/types"

const ROWS = [
  ["Worker 1", "Active"],
  ["Worker 2", "Paused"],
]

export const tableSection: Section = {
  title: "Table",
  pairs: [
    {
      id: "table-basic",
      ref: (
        <div style={{ width: 240 }}>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Status</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ROWS.map(([n, s]) => (
                <Table.Row key={n}>
                  <Table.Cell>{n}</Table.Cell>
                  <Table.Cell>{s}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      ),
      mui: (
        <div style={{ width: 240 }}>
          <MuiTable>
            <MuiTableHead>
              <MuiTableRow>
                <MuiTableCell>Name</MuiTableCell>
                <MuiTableCell>Status</MuiTableCell>
              </MuiTableRow>
            </MuiTableHead>
            <MuiTableBody>
              {ROWS.map(([n, s]) => (
                <MuiTableRow key={n}>
                  <MuiTableCell>{n}</MuiTableCell>
                  <MuiTableCell>{s}</MuiTableCell>
                </MuiTableRow>
              ))}
            </MuiTableBody>
          </MuiTable>
        </div>
      ),
    },
  ],
}
