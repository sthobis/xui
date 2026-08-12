import { forwardRef } from "react";
import {
    Tabs as MuiTabs,
    Tab as MuiTab,
    type TabsProps as MuiTabsProps,
    type TabProps as MuiTabProps,
} from "@mui/material";
import classnames from "classnames";

import C from "./Tabs.module.css";

export interface TabsProps extends MuiTabsProps {
    scrollable?: boolean;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
    { scrollable, classes, ...rest },
    ref
) {
    return (
        <MuiTabs
            {...rest}
            ref={ref}
            variant={scrollable ? "scrollable" : "standard"}
            scrollButtons={scrollable ? "auto" : false}
            classes={{
                ...classes,
                root: classnames(C.tabs, classes?.root),
                indicator: classnames(C.indicator, classes?.indicator),
            }}
        />
    );
});

export type TabProps = Omit<MuiTabProps, "disableRipple">;

export const Tab = forwardRef<HTMLDivElement, TabProps>(function Tab(
    { classes, ...rest },
    ref
) {
    return (
        <MuiTab
            {...rest}
            ref={ref as React.Ref<HTMLDivElement>}
            disableRipple
            classes={{
                ...classes,
                root: classnames(C.tab, classes?.root),
                selected: classnames(C.tabSelected, classes?.selected),
            }}
        />
    );
});
