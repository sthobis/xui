import {
    forwardRef,
    type CSSProperties,
    type HTMLAttributes,
    type ReactNode,
} from "react";
import classnames from "classnames";

import C from "./Avatar.module.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg";
export type AvatarShape = "square" | "circle";
export type AvatarVariant =
    | "plain"
    | "default"
    | "primary"
    | "error"
    | "warning"
    | "success"
    | "info";

const SIZE_PX: Record<AvatarSize, number> = {
    xs: 24,
    sm: 28,
    md: 32,
    lg: 40,
};

const VARIANT_CLASS: Record<AvatarVariant, string> = {
    plain: C.plain,
    default: C.default,
    primary: C.primary,
    error: C.error,
    warning: C.warning,
    success: C.success,
    info: C.info,
};

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
    size?: AvatarSize | number;
    shape?: AvatarShape;
    variant?: AvatarVariant;
    src?: string;
    alt?: string;
    children?: ReactNode;
}

const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
    {
        size = "md",
        shape = "square",
        variant = "plain",
        src,
        alt = "",
        children,
        className,
        style,
        ...rest
    },
    ref
) {
    const px = typeof size === "number" ? size : SIZE_PX[size];

    return (
        <span
            {...rest}
            ref={ref}
            className={classnames(
                C.root,
                VARIANT_CLASS[variant],
                shape === "circle" ? C.circle : C.square,
                className
            )}
            style={{ "--avatar-size": `${px}px`, ...style } as CSSProperties}
        >
            {src !== undefined ? (
                <img className={C.image} src={src} alt={alt} />
            ) : (
                children
            )}
        </span>
    );
});

export default Avatar;
