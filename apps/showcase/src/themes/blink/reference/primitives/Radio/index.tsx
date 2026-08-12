import { forwardRef, type InputHTMLAttributes } from "react";
import classnames from "classnames";

import C from "./Radio.module.css";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

function RadioComponent(
    { className, ...rest }: RadioProps,
    ref: React.Ref<HTMLInputElement>
) {
    return (
        <input
            {...rest}
            ref={ref}
            type="radio"
            className={classnames(C.root, className)}
        />
    );
}

const Radio = forwardRef(RadioComponent);
export default Radio;
