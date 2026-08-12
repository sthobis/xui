import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    type InputHTMLAttributes,
} from "react";
import classnames from "classnames";

import C from "./Checkbox.module.css";

export type CheckboxProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
> & {
    indeterminate?: boolean;
};

function CheckboxComponent(
    { indeterminate, className, ...rest }: CheckboxProps,
    ref: React.Ref<HTMLInputElement>
) {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = !!indeterminate;
        }
    }, [indeterminate]);

    return (
        <input
            {...rest}
            ref={inputRef}
            type="checkbox"
            className={classnames(C.root, className)}
        />
    );
}

const Checkbox = forwardRef(CheckboxComponent);
export default Checkbox;
