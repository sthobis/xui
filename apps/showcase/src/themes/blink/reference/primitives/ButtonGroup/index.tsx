import { forwardRef, type HTMLAttributes } from "react";
import classnames from "classnames";

import C from "./ButtonGroup.module.css";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement>;

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
    function ButtonGroup({ className, children, ...rest }, ref) {
        return (
            <div
                ref={ref}
                role="group"
                className={classnames(C.group, className)}
                {...rest}
            >
                {children}
            </div>
        );
    }
);

export default ButtonGroup;
