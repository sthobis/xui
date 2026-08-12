import { forwardRef } from "react";
import {
    Popover as MuiPopover,
    type PopoverProps as MuiPopoverProps,
} from "@mui/material";
import classnames from "classnames";

import PopTransition from "../Menu/PopTransition";

import C from "./Popover.module.css";

export type PopoverProps = MuiPopoverProps;

const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
    {
        classes,
        transitionDuration = 150,
        slots,
        slotProps,
        anchorOrigin = { vertical: "bottom", horizontal: "left" },
        transformOrigin = { vertical: "top", horizontal: "left" },
        ...rest
    },
    ref
) {
    return (
        <MuiPopover
            {...rest}
            ref={ref}
            transitionDuration={transitionDuration}
            slots={{ transition: PopTransition, ...slots }}
            slotProps={slotProps}
            anchorOrigin={anchorOrigin}
            transformOrigin={transformOrigin}
            classes={{
                ...classes,
                paper: classnames(C.paper, classes?.paper),
            }}
        />
    );
});

export default Popover;
