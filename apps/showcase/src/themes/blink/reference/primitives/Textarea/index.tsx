import { forwardRef, type TextareaHTMLAttributes } from "react";
import classnames from "classnames";

import { useFormFieldContext } from "../FormField/FormFieldContext";

import C from "./Textarea.module.css";

type Size = "sm" | "md" | "lg";
type Resize = "none" | "vertical";

const SIZE_CLASS: Record<Size, string> = {
    sm: C.sm,
    md: C.md,
    lg: C.lg,
};

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    size?: Size;
    fullWidth?: boolean;
    resize?: Resize;
};

function TextareaComponent(
    {
        size = "md",
        fullWidth,
        resize = "vertical",
        disabled,
        required,
        className,
        style,
        rows = 4,
        id,
        "aria-describedby": ariaDescribedBy,
        ...rest
    }: TextareaProps,
    ref: React.Ref<HTMLTextAreaElement>
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
            data-slot="textarea"
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
            <textarea
                {...rest}
                ref={ref}
                id={finalId}
                rows={rows}
                disabled={disabled}
                required={required ?? ctx?.required}
                aria-invalid={ariaInvalid}
                aria-describedby={describedBy}
                data-slot="textarea-control"
                className={classnames(
                    C.textarea,
                    resize === "none" && C.resizeNone
                )}
            />
        </div>
    );
}

const Textarea = forwardRef(TextareaComponent);
export default Textarea;
