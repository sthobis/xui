import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import classnames from "classnames";

import C from "./ProgressRing.module.css";

export type ProgressRingSize = "sm" | "md" | "lg";
export type ProgressRingVariant = "default" | "success" | "warning" | "error";

const SIZE_PX: Record<ProgressRingSize, number> = {
    sm: 48,
    md: 64,
    lg: 80,
};

const VARIANT_CLASS: Record<ProgressRingVariant, string> = {
    default: C.default,
    success: C.success,
    warning: C.warning,
    error: C.error,
};

export interface ProgressRingProps extends HTMLAttributes<HTMLSpanElement> {
    value: number;
    size?: ProgressRingSize | number;
    variant?: ProgressRingVariant;
    children?: ReactNode;
    label?: string;
}

const ProgressRing = forwardRef<HTMLSpanElement, ProgressRingProps>(
    function ProgressRing(
        {
            value,
            size = "md",
            variant = "default",
            children,
            label,
            className,
            style,
            ...rest
        },
        ref
    ) {
        const px = typeof size === "number" ? size : SIZE_PX[size];
        const clamped = Math.max(0, Math.min(100, value));
        const stroke = Math.max(3, px * 0.08);
        const radius = (px - stroke) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (clamped / 100) * circumference;
        const center = px / 2;
        const valueFontSize = Math.round(px * 0.31);

        return (
            <span
                {...rest}
                ref={ref}
                className={classnames(
                    C.root,
                    VARIANT_CLASS[variant],
                    className
                )}
                style={{ width: px, height: px, ...style }}
                role="progressbar"
                aria-valuenow={Math.round(clamped)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={label}
            >
                <svg width={px} height={px} aria-hidden="true">
                    <circle
                        className={C.track}
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={stroke}
                    />
                    <circle
                        className={C.progress}
                        cx={center}
                        cy={center}
                        r={radius}
                        strokeWidth={stroke}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform={`rotate(-90 ${center} ${center})`}
                    />
                </svg>
                <span className={C.value} style={{ fontSize: valueFontSize }}>
                    {children ?? Math.round(clamped)}
                </span>
            </span>
        );
    }
);

export default ProgressRing;
