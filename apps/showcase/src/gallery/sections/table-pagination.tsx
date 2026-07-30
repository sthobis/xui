import MuiTablePagination from "@mui/material/TablePagination"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Section } from "../types"

// COMPOSED TWIN - shadcn has no TablePagination component. Its data-table docs do show this row, and
// the composition below follows it: `text-sm text-muted-foreground` captions, a ghost icon Button per
// direction, laid out `flex items-center justify-end gap-2`. The parts are installed shadcn (Button)
// and the tokens are real; the arrangement is a decision taken here.
//
// SCOPE: the caption-and-actions row with the rows-per-page control switched OFF
// (`rowsPerPageOptions={[]}`, which is MUI's own way of hiding it). The control is a Select inside a
// toolbar, and MUI gives it a `variant="standard"` of its own with layout quirks that no pair here
// covers; the Select itself is already themed and verified by the select-* pairs. Also uncovered:
// the first/last-page buttons and the disabled edges.
const wrapStyle = { width: 288 } as const

const CAPTION = "1-5 of 13"

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
  ],
}
