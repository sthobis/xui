import { forwardRef, type ReactNode } from "react";
import { ButtonBase, type ButtonBaseProps } from "@mui/material";
import classnames from "classnames";

import Spinner from "../Spinner";

import C from "./Button.module.css";

type Variant = "primary" | "secondary" | "tonal" | "ghost" | "destructive";
type Size = "xs" | "sm" | "md" | "lg";

export type ButtonProps = Omit<ButtonBaseProps, "className"> & {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    iconOnly?: boolean;
    fullWidth?: boolean;
    children?: ReactNode;
    className?: string;
};

const VARIANT_CLASS: Record<Variant, string> = {
    primary: C.primary,
    secondary: C.secondary,
    tonal: C.tonal,
    ghost: C.ghost,
    destructive: C.destructive,
};

const SIZE_CLASS: Record<Size, string> = {
    xs: C.xs,
    sm: C.sm,
    md: C.md,
    lg: C.lg,
};

const SPINNER_SIZE: Record<Size, number> = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
};

function ButtonComponent(
    {
        variant = "secondary",
        size = "md",
        loading,
        iconOnly,
        fullWidth,
        disabled,
        onClick,
        children,
        className,
        ...rest
    }: ButtonProps,
    ref: React.Ref<HTMLButtonElement>
) {
    return (
        <ButtonBase
            {...rest}
            ref={ref}
            onClick={loading ? undefined : onClick}
            disabled={disabled || loading}
            className={classnames(
                C.root,
                VARIANT_CLASS[variant],
                SIZE_CLASS[size],
                iconOnly && C.iconOnly,
                fullWidth && C.fullWidth,
                loading && C.loading,
                className
            )}
            disableRipple
        >
            <span className={C.content}>{children}</span>
            {loading && (
                <span className={C.spinner}>
                    <Spinner size={SPINNER_SIZE[size]} />
                </span>
            )}
        </ButtonBase>
    );
}

const Button = forwardRef(ButtonComponent);
export default Button;
