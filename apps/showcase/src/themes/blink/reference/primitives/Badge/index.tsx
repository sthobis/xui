import {
    forwardRef,
    type HTMLAttributes,
    type ReactNode,
    type MouseEvent,
} from "react";
import { XIcon } from "lucide-react";
import classnames from "classnames";

import C from "./Badge.module.css";

export type BadgeVariant =
    | "default"
    | "primary"
    | "error"
    | "warning"
    | "success"
    | "info";

export type BadgeEmphasis = "soft" | "solid";

export type BadgeSize = "xs" | "sm" | "md";

const VARIANT_CLASS: Record<BadgeVariant, string> = {
    default: C.default,
    primary: C.primary,
    error: C.error,
    warning: C.warning,
    success: C.success,
    info: C.info,
};

const SIZE_CLASS: Record<BadgeSize, string> = {
    xs: C.xs,
    sm: C.sm,
    md: C.md,
};

export interface BadgeProps
    extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
    children: ReactNode;
    variant?: BadgeVariant;
    emphasis?: BadgeEmphasis;
    size?: BadgeSize;
    dot?: boolean;
    icon?: ReactNode;
    onClick?: (e: MouseEvent<HTMLElement>) => void;
    onDelete?: () => void;
}

const Badge = forwardRef<HTMLElement, BadgeProps>(function Badge(
    {
        children,
        variant = "default",
        emphasis = "soft",
        size = "sm",
        dot = false,
        icon,
        onClick,
        onDelete,
        className,
        ...rest
    },
    ref
) {
    const isInteractive = onClick !== undefined;
    const rootClass = classnames(
        C.root,
        VARIANT_CLASS[variant],
        emphasis === "solid" ? C.solid : C.soft,
        SIZE_CLASS[size],
        isInteractive && C.interactive,
        className
    );
    const inner = (
        <>
            {dot && <span className={C.dot} aria-hidden="true" />}
            {icon !== undefined && <span className={C.icon}>{icon}</span>}
            <span className={C.label}>{children}</span>
            {onDelete !== undefined && (
                <button
                    type="button"
                    // not a tab stop — a removable badge lives inside a larger
                    // widget (combobox, filter bar) that owns keyboard handling
                    tabIndex={-1}
                    className={C.delete}
                    onClick={e => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    aria-label="Remove"
                >
                    <XIcon size={12} />
                </button>
            )}
        </>
    );
    return isInteractive ? (
        <button
            {...rest}
            ref={ref as React.Ref<HTMLButtonElement>}
            type="button"
            className={rootClass}
            onClick={onClick}
        >
            {inner}
        </button>
    ) : (
        <span
            {...rest}
            ref={ref as React.Ref<HTMLSpanElement>}
            className={rootClass}
        >
            {inner}
        </span>
    );
});

export default Badge;
