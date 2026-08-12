import { forwardRef, type HTMLAttributes } from "react";
import classnames from "classnames";

import C from "./Spinner.module.css";

export type SpinnerSize = "xs" | "sm" | "md" | "lg";

const SIZE_PX: Record<SpinnerSize, number> = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
};

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
    size?: SpinnerSize | number;
    label?: string;
}

const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
    { size = "md", label = "Loading", className, ...rest },
    ref
) {
    const px = typeof size === "number" ? size : SIZE_PX[size];
    const stroke = px <= 14 ? 2 : px <= 20 ? 2.5 : 3;
    const radius = (px - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const dash = circumference * 0.25;

    return (
        <span
            {...rest}
            ref={ref}
            className={classnames(C.root, className)}
            role="status"
            aria-live="polite"
        >
            <svg
                className={C.ring}
                width={px}
                height={px}
                viewBox={`0 0 ${px} ${px}`}
                fill="none"
                aria-hidden="true"
            >
                <circle
                    className={C.track}
                    cx={px / 2}
                    cy={px / 2}
                    r={radius}
                    strokeWidth={stroke}
                />
                <circle
                    className={C.head}
                    cx={px / 2}
                    cy={px / 2}
                    r={radius}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circumference - dash}`}
                    transform={`rotate(-90 ${px / 2} ${px / 2})`}
                />
            </svg>
            <span className={C.srOnly}>{label}</span>
        </span>
    );
});

export default Spinner;
