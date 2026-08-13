import type { HTMLAttributes, MouseEvent } from "react"
import MuiPagination from "@mui/material/Pagination"
import MuiPaginationItem from "@mui/material/PaginationItem"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { Section } from "../../../gallery/types"

const preventDefault = (e: MouseEvent) => e.preventDefault()

// shadcn's PaginationPrevious/PaginationNext (pagination.tsx) are real shadcn `<Button
// variant="ghost" size="default">` instances carrying a lucide icon (`data-icon="inline-start"`/
// `"inline-end"`) plus a text label - MUI's PaginationItem has no `children` slot of its own for
// "previous"/"next" types (only its internal icon slot renders - see the MuiPaginationItem "icon"
// override banner in packages/xui/src/themes/shadcn.ts for why), so the label is injected through
// MUI's own documented `slots.previous`/`slots.next` API (idiomatic MUI, not a gallery style hack -
// all the CSS for this composition lives in the theme's `.MuiPaginationItem-icon` override).
// MUI passes this slot's own `className` (the real `.MuiPaginationItem-icon` class the theme
// themes below) and other DOM props through the `as` mechanism - forwarded onto a real `<span>`
// here (rather than a bare Fragment) so that class actually lands in the DOM and the theme's
// sizing/gap rule for it takes effect, instead of silently being dropped.
function PreviousIcon(props: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props}>
      <ChevronLeft aria-hidden />
      <span>Previous</span>
    </span>
  )
}

function NextIcon(props: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props}>
      <span>Next</span>
      <ChevronRight aria-hidden />
    </span>
  )
}

// shadcn's PaginationPrevious/Next each force ONE side's padding down from the shared Button
// px-2.5 to pl-1.5!/pr-1.5! (see pagination.tsx) - the side nearer the icon. Since MUI's
// PaginationItem collapses "previous" and "next" into the SAME `previousNext` styleOverrides slot
// (no separate slot exists per direction - see MuiPaginationItem's own useUtilityClasses, which
// maps both types to one shared class), a plain distinguishing className is used here as the CSS
// hook the theme's root override keys off (the same kind of plain, idiomatic identifier this
// gallery already uses for `data-target`/`data-portal-target` elsewhere - not a style hack, no
// inline style or sx anywhere in this file).
const previousClassName = "pagination-link-previous"
const nextClassName = "pagination-link-next"

export const paginationSection: Section = {
  title: "Pagination",
  pairs: [
    {
      id: "pagination-basic",
      ref: (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={preventDefault} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" onClick={preventDefault}>
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive onClick={preventDefault}>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" onClick={preventDefault}>
                3
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" onClick={preventDefault} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ),
      mui: (
        <MuiPagination
          count={3}
          page={2}
          renderItem={(item) => (
            <MuiPaginationItem
              {...item}
              className={
                item.type === "previous"
                  ? previousClassName
                  : item.type === "next"
                    ? nextClassName
                    : undefined
              }
              slots={{ previous: PreviousIcon, next: NextIcon }}
            />
          )}
        />
      ),
    },
  ],
}
