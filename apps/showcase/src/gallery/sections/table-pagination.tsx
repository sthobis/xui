import MuiTablePagination from "@mui/material/TablePagination"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Section } from "../types"

// COMPOSED TWIN - shadcn has no TablePagination component. Its data-table docs do show this row, and
// the composition below follows it: `text-sm text-muted-foreground` captions, a ghost icon Button per
// direction, laid out `flex items-center justify-end gap-2`. The parts are installed shadcn (Button)
// and the tokens are real; the arrangement is a decision taken here.
//
// SCOPE: two pairs. The first is the caption-and-actions row with the rows-per-page control switched
// off (`rowsPerPageOptions={[]}`, MUI's own way of hiding it); the second turns it on, so the label
// and the Select inside the toolbar are covered too. Still uncovered: the first/last-page buttons,
// and the Select's OPEN menu - that surface is already verified by the select-* pairs.
const wrapStyle = { width: 288 } as const
// The rows-per-page pair needs more room for the label and the Select. Two cells plus their padding
// have to stay inside the gallery column - see app-bar.tsx's note on what happens when they do not.
const rowsWrapStyle = { width: 336 } as const

const CAPTION = "1-5 of 13"
const ROWS_LABEL = "Rows:"
const ROWS_VALUE = "5"
const ROWS_OPTIONS = ["5", "10"] as const

export const tablePaginationSection: Section = {
  title: "TablePagination",
  pairs: [
    {
      id: "tablepagination-basic",
      shadcn: (
        <div style={wrapStyle}>
          <div className="flex h-13 items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">{CAPTION}</span>
            {/* Disabled because the pair sits on page 0 and MUI disables its own previous-page
                button there. The two SVGs are byte-identical - same path, stroke and 16px box - so
                the only thing that showed up was the dimming, as a Δ121 slice exactly the width of
                the chevron glyph. */}
            <Button variant="ghost" size="icon" aria-label="Previous page" disabled>
              <ChevronLeft />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Next page">
              <ChevronRight />
            </Button>
          </div>
        </div>
      ),
      mui: (
        <div style={wrapStyle}>
          <MuiTablePagination
            component="div"
            count={13}
            page={0}
            rowsPerPage={5}
            rowsPerPageOptions={[]}
            onPageChange={() => {}}
            labelDisplayedRows={() => CAPTION}
            // Swapping the chevron glyphs for lucide's is a prop-level choice, not a styling
            // workaround - no theme override can turn one vector into another. Same reasoning as
            // rating.tsx. MUI v9 exposes them as icon slots nested under `actions`, so only the
            // glyphs change and its own buttons (already themed via MuiIconButton) stay in place.
            slots={{
              actions: { previousButtonIcon: ChevronLeft, nextButtonIcon: ChevronRight },
            }}
          />
        </div>
      ),
    },
    {
      id: "tablepagination-rows",
      shadcn: (
        <div style={rowsWrapStyle}>
          <div className="flex h-13 items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground">{ROWS_LABEL}</span>
            {/* The items have to be here even though the menu never opens: Radix derives the
                trigger's displayed label from the matching SelectItem, so without them the trigger
                renders empty and the whole row shifts. */}
            <Select defaultValue={ROWS_VALUE}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_OPTIONS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{CAPTION}</span>
            <Button variant="ghost" size="icon" aria-label="Previous page" disabled>
              <ChevronLeft />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Next page">
              <ChevronRight />
            </Button>
          </div>
        </div>
      ),
      mui: (
        <div style={rowsWrapStyle}>
          <MuiTablePagination
            component="div"
            count={13}
            page={0}
            rowsPerPage={5}
            rowsPerPageOptions={[5, 10]}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            // A short label so the row fits the column. MUI's own default is "Rows per page:".
            labelRowsPerPage={ROWS_LABEL}
            labelDisplayedRows={() => CAPTION}
            slots={{
              actions: { previousButtonIcon: ChevronLeft, nextButtonIcon: ChevronRight },
            }}
          />
        </div>
      ),
    },
  ],
}
