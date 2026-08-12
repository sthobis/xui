import { forwardRef, type ReactNode } from "react";
import classnames from "classnames";

import C from "./Divider.module.css";

export interface DividerProps {
    orientation?: "horizontal" | "vertical";
    subtle?: boolean;
    children?: ReactNode;
    className?: string;
}

const Divider = forwardRef<HTMLElement, DividerProps>(function Divider(
    { orientation = "horizontal", subtle, children, className },
    ref
) {
    if (children !== undefined && orientation === "horizontal") {
        return (
            <div
                ref={ref as React.Ref<HTMLDivElement>}
                role="separator"
                aria-orientation="horizontal"
                aria-label={typeof children === "string" ? children : undefined}
                className={classnames(
                    C.withLabel,
                    subtle && C.withLabelSubtle,
                    className
                )}
            >
                {children}
            </div>
        );
    }
    return (
        <hr
            ref={ref as React.Ref<HTMLHRElement>}
            role="separator"
            aria-orientation={orientation}
            className={classnames(
                orientation === "vertical" ? C.vertical : C.horizontal,
                subtle && C.subtle,
                className
            )}
        />
    );
});

export default Divider;
