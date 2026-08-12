import { forwardRef } from "react";
import {
    Accordion as MuiAccordion,
    AccordionDetails as MuiAccordionDetails,
    AccordionSummary as MuiAccordionSummary,
    type AccordionDetailsProps as MuiAccordionDetailsProps,
    type AccordionProps as MuiAccordionProps,
    type AccordionSummaryProps as MuiAccordionSummaryProps,
} from "@mui/material";
import { ChevronDownIcon } from "lucide-react";
import classnames from "classnames";

import C from "./Accordion.module.css";

export type AccordionProps = MuiAccordionProps;

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
    function Accordion(
        { classes, disableGutters = true, square = true, ...rest },
        ref
    ) {
        return (
            <MuiAccordion
                {...rest}
                ref={ref}
                disableGutters={disableGutters}
                square={square}
                classes={{
                    ...classes,
                    root: classnames(C.root, classes?.root),
                }}
            />
        );
    }
);

export type AccordionSummaryProps = MuiAccordionSummaryProps;

export const AccordionSummary = forwardRef<
    HTMLDivElement,
    AccordionSummaryProps
>(function AccordionSummary({ classes, expandIcon, ...rest }, ref) {
    return (
        <MuiAccordionSummary
            {...rest}
            ref={ref}
            expandIcon={
                expandIcon === undefined ? (
                    <ChevronDownIcon size={16} className={C.expandIcon} />
                ) : (
                    expandIcon
                )
            }
            classes={{
                ...classes,
                root: classnames(C.summary, classes?.root),
                content: classnames(C.summaryContent, classes?.content),
            }}
        />
    );
});

export type AccordionDetailsProps = MuiAccordionDetailsProps;

export const AccordionDetails = forwardRef<
    HTMLDivElement,
    AccordionDetailsProps
>(function AccordionDetails({ classes, ...rest }, ref) {
    return (
        <MuiAccordionDetails
            {...rest}
            ref={ref}
            classes={{
                ...classes,
                root: classnames(C.details, classes?.root),
            }}
        />
    );
});
