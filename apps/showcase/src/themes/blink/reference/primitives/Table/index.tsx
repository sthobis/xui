import {
    forwardRef,
    type HTMLAttributes,
    type ReactNode,
    type TableHTMLAttributes,
    type TdHTMLAttributes,
    type ThHTMLAttributes,
} from "react";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";
import classnames from "classnames";

import C from "./Table.module.css";

export type TableAlign = "left" | "center" | "right";
export type SortDirection = "asc" | "desc" | false;

const ALIGN_CLASS: Record<TableAlign, string | undefined> = {
    left: undefined,
    center: C.alignCenter,
    right: C.alignRight,
};

/* The bordered, rounded, horizontally-scrollable frame. Kept separate from
   Table so a table rendered inside a Card can skip it (no `bordered` knob). */
export const TableContainer = forwardRef<
    HTMLDivElement,
    HTMLAttributes<HTMLDivElement>
>(function TableContainer({ className, ...rest }, ref) {
    return (
        <div
            ref={ref}
            className={classnames(C.container, className)}
            {...rest}
        />
    );
});

export type TableSize = "sm" | "md";

export type TableProps = TableHTMLAttributes<HTMLTableElement> & {
    /** Row density. `sm` is the compact tier (tighter rows, 14px). Default `md`. */
    size?: TableSize;
};

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
    { size = "md", className, ...rest },
    ref
) {
    return (
        <table
            ref={ref}
            className={classnames(C.table, size === "sm" && C.sm, className)}
            {...rest}
        />
    );
});

export type TableHeadProps = HTMLAttributes<HTMLTableSectionElement> & {
    /** Sticks the header to the top of the scroll container. */
    sticky?: boolean;
};

export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
    function TableHead({ sticky, className, ...rest }, ref) {
        return (
            <thead
                ref={ref}
                className={classnames(C.head, sticky && C.sticky, className)}
                {...rest}
            />
        );
    }
);

export const TableBody = forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...rest }, ref) {
    return (
        <tbody ref={ref} className={classnames(C.body, className)} {...rest} />
    );
});

export type TableFooterProps = HTMLAttributes<HTMLTableSectionElement> & {
    /** Pins the footer to the bottom of the scroll container. */
    sticky?: boolean;
};

/* <tfoot> for a footer row — pagination, totals, metadata. Hold a single
   full-width TableCell (colSpan) for a free-form footer bar, or summary cells. */
export const TableFooter = forwardRef<
    HTMLTableSectionElement,
    TableFooterProps
>(function TableFooter({ sticky, className, ...rest }, ref) {
    return (
        <tfoot
            ref={ref}
            className={classnames(
                C.footer,
                sticky && C.footerSticky,
                className
            )}
            {...rest}
        />
    );
});

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
    selected?: boolean;
};

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
    function TableRow({ selected, className, onClick, ...rest }, ref) {
        return (
            <tr
                ref={ref}
                onClick={onClick}
                className={classnames(
                    C.row,
                    selected && C.rowSelected,
                    onClick && C.interactive,
                    className
                )}
                {...rest}
            />
        );
    }
);

export type TableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement> & {
    align?: TableAlign;
    sortable?: boolean;
    sortDirection?: SortDirection;
    onSort?: () => void;
};

export const TableHeaderCell = forwardRef<
    HTMLTableCellElement,
    TableHeaderCellProps
>(function TableHeaderCell(
    {
        align = "left",
        sortable,
        sortDirection = false,
        onSort,
        className,
        children,
        ...rest
    },
    ref
) {
    const ariaSort = !sortable
        ? undefined
        : sortDirection === "asc"
          ? "ascending"
          : sortDirection === "desc"
            ? "descending"
            : "none";

    return (
        <th
            ref={ref}
            scope="col"
            aria-sort={ariaSort}
            className={classnames(C.headerCell, ALIGN_CLASS[align], className)}
            {...rest}
        >
            {sortable ? (
                <button type="button" className={C.sortButton} onClick={onSort}>
                    {children}
                    <SortIndicator direction={sortDirection} />
                </button>
            ) : (
                children
            )}
        </th>
    );
});

function SortIndicator({ direction }: { direction: SortDirection }) {
    if (direction === "asc")
        return <ArrowUpIcon size={14} className={C.sortIcon} />;
    if (direction === "desc")
        return <ArrowDownIcon size={14} className={C.sortIcon} />;
    return (
        <ChevronsUpDownIcon
            size={14}
            className={classnames(C.sortIcon, C.sortIconIdle)}
        />
    );
}

export type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
    align?: TableAlign;
    /** Single-line ellipsis. Needs a column width to take effect. */
    truncate?: boolean;
    children?: ReactNode;
};

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
    function TableCell({ align = "left", truncate, className, ...rest }, ref) {
        return (
            <td
                ref={ref}
                className={classnames(
                    C.cell,
                    ALIGN_CLASS[align],
                    truncate && C.truncate,
                    className
                )}
                {...rest}
            />
        );
    }
);
