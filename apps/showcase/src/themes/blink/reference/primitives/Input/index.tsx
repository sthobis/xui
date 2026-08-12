import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import classnames from "classnames";

import { useFormFieldContext } from "../FormField/FormFieldContext";

import C from "./Input.module.css";

type Size = "sm" | "md" | "lg";

const SIZE_CLASS: Record<Size, string> = {
    sm: C.sm,
    md: C.md,
    lg: C.lg,
};

export type InputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "prefix"
> & {
    size?: Size;
    fullWidth?: boolean;
    prefix?: ReactNode;
    suffix?: ReactNode;
    startAdornment?: ReactNode;
    endAdornment?: ReactNode;
};

function InputComponent(
    {
        size = "md",
        fullWidth,
        prefix,
        suffix,
        startAdornment,
        endAdornment,
        disabled,
        required,
        className,
        style,
        id,
        "aria-describedby": ariaDescribedBy,
        ...rest
    }: InputProps,
    ref: React.Ref<HTMLInputElement>
) {
    const ctx = useFormFieldContext();
    const finalId = id ?? ctx?.id;
    const ariaInvalid =
        rest["aria-invalid"] ?? (ctx?.hasError ? true : undefined);
    const isInvalid = ariaInvalid === true || ariaInvalid === "true";
    const describedBy =
        [ariaDescribedBy, ctx?.describedById].filter(Boolean).join(" ") ||
        undefined;
    return (
        <div
            data-slot="input"
            className={classnames(
                C.root,
                SIZE_CLASS[size],
                isInvalid && C.error,
                disabled && C.disabled,
                fullWidth && C.fullWidth,
                className
            )}
            style={style}
        >
            {startAdornment !== undefined && (
                <span data-slot="input-adornment" className={C.adornment}>
                    {startAdornment}
                </span>
            )}
            {prefix !== undefined && (
                <span data-slot="input-affix" className={C.affix}>
                    {prefix}
                </span>
            )}
            <input
                {...rest}
                ref={ref}
                id={finalId}
                disabled={disabled}
                required={required ?? ctx?.required}
                aria-invalid={ariaInvalid}
                aria-describedby={describedBy}
                data-slot="input-control"
                className={C.input}
            />
            {suffix !== undefined && (
                <span data-slot="input-affix" className={C.affix}>
                    {suffix}
                </span>
            )}
            {endAdornment !== undefined && (
                <span data-slot="input-adornment" className={C.adornment}>
                    {endAdornment}
                </span>
            )}
        </div>
    );
}

const Input = forwardRef(InputComponent);
export default Input;
