import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { XIcon } from "lucide-react";
import classnames from "classnames";

import Button from "../Button";

import C from "./Alert.module.css";

export type AlertVariant = "error" | "warning" | "success" | "info";
export type AlertSize = "sm" | "md";

const VARIANT_CLASS: Record<AlertVariant, string> = {
    error: C.error,
    warning: C.warning,
    success: C.success,
    info: C.info,
};

const SIZE_CLASS: Record<AlertSize, string> = {
    sm: C.sm,
    md: C.md,
};

export interface AlertProps
    extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    variant: AlertVariant;
    size?: AlertSize;
    title?: ReactNode;
    children?: ReactNode;
    icon?: ReactNode;
    onClose?: () => void;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
    {
        variant,
        size = "md",
        title,
        children,
        icon,
        onClose,
        className,
        ...rest
    },
    ref
) {
    // No `title` → the message reads as inline prose (Callout-style); the
    // consumer bolds its own lead-in. `title` present → stacked heading + body.
    const hasTitle = title !== undefined;
    return (
        <div
            {...rest}
            ref={ref}
            className={classnames(
                C.root,
                VARIANT_CLASS[variant],
                SIZE_CLASS[size],
                hasTitle ? C.stacked : C.inline,
                className
            )}
            role={variant === "error" ? "alert" : "status"}
        >
            {icon !== undefined && <span className={C.icon}>{icon}</span>}
            <div className={C.content}>
                {hasTitle && <div className={C.title}>{title}</div>}
                {children !== undefined && (
                    <div className={C.body}>{children}</div>
                )}
            </div>
            {onClose !== undefined && (
                <div className={C.actions}>
                    <Button
                        variant="ghost"
                        size="xs"
                        iconOnly
                        aria-label="Dismiss"
                        onClick={onClose}
                        style={{ color: "var(--alert-accent)" }}
                    >
                        <XIcon size={14} />
                    </Button>
                </div>
            )}
        </div>
    );
});

export default Alert;
