import { useState } from "react"
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
// kumo: Table.Row's only variant. Everything else a kumo table paints lives on the TABLE root as
// descendant selectors (`[&_td]:p-3`, `[&_th]:font-semibold`, ...), which is why the row itself has
// nothing to say until it is selected.
const SELECTED_ROW = 1

// The selection moves with a click on either side, so the selected treatment can be compared on a
// row of the reader's choosing rather than only on the second one. Both sides start on
// SELECTED_ROW, which is the state the pair is measured in; nothing the harness does to this pair
// clicks a row (its only state is `default`).
function KumoSelectableTable() {
  const [selected, setSelected] = useState(SELECTED_ROW)
  return (
    <div style={{ width: 240 }}>
      <Table>
        <Table.Body>
          {ROWS.map(([n, s], i) => (
            <Table.Row
              key={n}
              variant={i === selected ? "selected" : "default"}
              onClick={() => setSelected(i)}
            >
              <Table.Cell>{n}</Table.Cell>
              <Table.Cell>{s}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

function MuiSelectableTable() {
  const [selected, setSelected] = useState(SELECTED_ROW)
  return (
    <div style={{ width: 240 }}>
      <MuiTable>
        <MuiTableBody>
          {ROWS.map(([n, s], i) => (
            <MuiTableRow key={n} selected={i === selected} onClick={() => setSelected(i)}>
              <MuiTableCell>{n}</MuiTableCell>
              <MuiTableCell>{s}</MuiTableCell>
            </MuiTableRow>
          ))}
        </MuiTableBody>
      </MuiTable>
    </div>
  )
}

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
    {
      // A selected row is the one piece of table styling kumo puts on a subcomponent rather than on
      // the root, and MUI's own `.Mui-selected` is an alpha-blended primary tint - a completely
      // different colour - so it needs a pair of its own.
      id: "table-selected",
      ref: <KumoSelectableTable />,
      mui: <MuiSelectableTable />,
    },
  ],
}
