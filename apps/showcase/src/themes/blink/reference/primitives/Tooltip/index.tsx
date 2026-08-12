import {
    Tooltip as MuiTooltip,
    type TooltipProps as MuiTooltipProps,
} from "@mui/material";
import classnames from "classnames";

import C from "./Tooltip.module.css";

export type TooltipProps = MuiTooltipProps;

function Tooltip({
    classes,
    enterDelay = 200,
    leaveDelay = 0,
    placement = "top",
    arrow = true,
    ...rest
}: TooltipProps) {
    return (
        <MuiTooltip
            {...rest}
            enterDelay={enterDelay}
            leaveDelay={leaveDelay}
            placement={placement}
            arrow={arrow}
            classes={{
                ...classes,
                tooltip: classnames(C.tooltip, classes?.tooltip),
                arrow: classnames(C.arrow, classes?.arrow),
            }}
        />
    );
}

export default Tooltip;
