import { forwardRef } from "react";
import {
    Menu as MuiMenu,
    MenuItem as MuiMenuItem,
    type MenuProps as MuiMenuProps,
    type MenuItemProps as MuiMenuItemProps,
} from "@mui/material";
import classnames from "classnames";

import C from "./Menu.module.css";
import PopTransition from "./PopTransition";

export type MenuProps = MuiMenuProps;

export const Menu = forwardRef<HTMLDivElement, MenuProps>(function Menu(
    { classes, transitionDuration = 150, slots, slotProps, ...rest },
    ref
) {
    return (
        <MuiMenu
            {...rest}
            ref={ref}
            transitionDuration={transitionDuration}
            slots={{ transition: PopTransition, ...slots }}
            slotProps={slotProps}
            classes={{
                ...classes,
                paper: classnames(C.paper, classes?.paper),
                list: classnames(C.list, classes?.list),
            }}
        />
    );
});

export type MenuItemProps = Omit<MuiMenuItemProps, "disableRipple">;

export const MenuItem = forwardRef<HTMLLIElement, MenuItemProps>(
    function MenuItem({ classes, ...rest }, ref) {
        return (
            <MuiMenuItem
                {...rest}
                ref={ref}
                classes={{
                    ...classes,
                    root: classnames(C.item, classes?.root),
                }}
                disableRipple
            />
        );
    }
);
