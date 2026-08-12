import { forwardRef, type InputHTMLAttributes } from "react";
import classnames from "classnames";

import C from "./Switch.module.css";

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

function SwitchComponent(
    { className, ...rest }: SwitchProps,
    ref: React.Ref<HTMLInputElement>
) {
    return (
        <input
            {...rest}
            ref={ref}
            type="checkbox"
            role="switch"
            className={classnames(C.root, className)}
        />
    );
}

const Switch = forwardRef(SwitchComponent);
export default Switch;
