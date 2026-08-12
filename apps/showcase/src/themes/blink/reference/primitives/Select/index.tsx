import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";
import { ChevronDownIcon } from "lucide-react";
import classnames from "classnames";

import { useFormFieldContext } from "../FormField/FormFieldContext";

import C from "./Select.module.css";

type Size = "sm" | "md" | "lg";

const SIZE_CLASS: Record<Size, string> = {
    sm: C.sm,
    md: C.md,
    lg: C.lg,
};

export type SelectProps = Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "size"
> & {
    size?: Size;
    fullWidth?: boolean;
    placeholder?: string;
    children?: ReactNode;
};

function SelectComponent(
    {
        size = "md",
        fullWidth,
        placeholder,
        disabled,
        required,
        className,
        style,
        id,
        value,
        defaultValue,
        "aria-describedby": ariaDescribedBy,
        children,
        ...rest
    }: SelectProps,
    ref: React.Ref<HTMLSelectElement>
) {
    const ctx = useFormFieldContext();
    const finalId = id ?? ctx?.id;
    const ariaInvalid =
        rest["aria-invalid"] ?? (ctx?.hasError ? true : undefined);
    const isInvalid = ariaInvalid === true || ariaInvalid === "true";
    const describedBy =
        [ariaDescribedBy, ctx?.describedById].filter(Boolean).join(" ") ||
        undefined;

    const isControlled = value !== undefined;
    const hasPlaceholder =
        placeholder !== undefined &&
        (value === "" || value === undefined) &&
        (defaultValue === "" || defaultValue === undefined);

    const computedDefaultValue = isControlled
        ? undefined
        : defaultValue ?? (placeholder !== undefined ? "" : undefined);

    return (
        <div
            data-slot="select"
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
            <select
                {...rest}
                ref={ref}
                id={finalId}
                disabled={disabled}
                required={required ?? ctx?.required}
                value={value}
                defaultValue={computedDefaultValue}
                aria-invalid={ariaInvalid}
                aria-describedby={describedBy}
                data-slot="select-control"
                className={classnames(
                    C.select,
                    hasPlaceholder && C.placeholder
                )}
            >
                {placeholder !== undefined && (
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                )}
                {children}
            </select>
            <span data-slot="select-icon" className={C.chevron}>
                <ChevronDownIcon size={16} />
            </span>
        </div>
    );
}

const Select = forwardRef(SelectComponent);
export default Select;
