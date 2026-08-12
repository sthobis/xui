import {
    forwardRef,
    useRef,
    type KeyboardEvent,
    type ReactElement,
    type ReactNode,
    type Ref,
} from "react";
import classnames from "classnames";

import C from "./ToggleGroup.module.css";

export type ToggleGroupSize = "xs" | "sm" | "md" | "lg";

export type ToggleGroupOption<T extends string | number> = {
    value: T;
    label?: ReactNode;
    ariaLabel?: string;
};

type CommonProps<T extends string | number> = {
    options: readonly ToggleGroupOption<T>[];
    size?: ToggleGroupSize;
    disabled?: boolean;
    "aria-label"?: string;
    className?: string;
};

type SingleProps<T extends string | number> = CommonProps<T> & {
    type?: "single";
    value: T;
    onChange: (value: T) => void;
};

type MultipleProps<T extends string | number> = CommonProps<T> & {
    type: "multiple";
    value: readonly T[];
    onChange: (value: T[]) => void;
};

export type ToggleGroupProps<T extends string | number> =
    | SingleProps<T>
    | MultipleProps<T>;

const SIZE_CLASS: Record<ToggleGroupSize, string> = {
    xs: C.xs,
    sm: C.sm,
    md: C.md,
    lg: C.lg,
};

function ToggleGroupInner<T extends string | number>(
    props: ToggleGroupProps<T>,
    ref: Ref<HTMLDivElement>
) {
    const {
        options,
        size = "md",
        disabled,
        className,
        "aria-label": ariaLabel,
    } = props;
    const isMultiple = props.type === "multiple";

    const rootRef = useRef<HTMLDivElement | null>(null);
    const setRefs = (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") {
            ref(node);
        } else if (ref) {
            (ref as { current: HTMLDivElement | null }).current = node;
        }
    };

    const isActive = (value: T): boolean => {
        if (props.type === "multiple") return props.value.includes(value);
        return props.value === value;
    };

    const select = (value: T) => {
        if (props.type === "multiple") {
            const next = props.value.includes(value)
                ? props.value.filter(v => v !== value)
                : [...props.value, value];
            props.onChange(next);
        } else {
            props.onChange(value);
        }
    };

    const activeIndex = isMultiple
        ? -1
        : options.findIndex(o => o.value === props.value);

    // Roving tabindex: a single entry point per group. Single -> the active
    // pill (or first if nothing selected). Multiple -> always the first.
    const focusableIndex = isMultiple ? 0 : activeIndex >= 0 ? activeIndex : 0;

    const handleKeyDown = (
        e: KeyboardEvent<HTMLButtonElement>,
        currentIndex: number
    ) => {
        let nextIndex = currentIndex;
        switch (e.key) {
            case "ArrowLeft":
            case "ArrowUp":
                nextIndex =
                    (currentIndex - 1 + options.length) % options.length;
                break;
            case "ArrowRight":
            case "ArrowDown":
                nextIndex = (currentIndex + 1) % options.length;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = options.length - 1;
                break;
            default:
                return;
        }
        e.preventDefault();

        const buttons = rootRef.current?.querySelectorAll<HTMLButtonElement>(
            "button[data-toggle-option]"
        );
        buttons?.[nextIndex]?.focus();

        // Radiogroup convention: arrow keys move focus AND selection.
        // Toolbar convention (multi): arrow keys move focus only; Space/Enter
        // toggles via native button activation.
        if (props.type !== "multiple") {
            select(options[nextIndex].value);
        }
    };

    return (
        <div
            ref={setRefs}
            role={isMultiple ? "group" : "radiogroup"}
            aria-label={ariaLabel}
            aria-disabled={disabled || undefined}
            className={classnames(
                C.root,
                SIZE_CLASS[size],
                disabled && C.disabled,
                className
            )}
            style={{
                gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
            }}
        >
            {!isMultiple && activeIndex >= 0 && (
                <div
                    className={C.slider}
                    style={{
                        width: `${100 / options.length}%`,
                        transform: `translateX(${100 * activeIndex}%)`,
                    }}
                    aria-hidden
                />
            )}
            {options.map((opt, i) => {
                const active = isActive(opt.value);
                return (
                    <button
                        key={String(opt.value)}
                        type="button"
                        data-toggle-option
                        role={isMultiple ? undefined : "radio"}
                        aria-checked={isMultiple ? undefined : active}
                        aria-pressed={isMultiple ? active : undefined}
                        aria-label={opt.ariaLabel}
                        disabled={disabled}
                        tabIndex={disabled ? -1 : i === focusableIndex ? 0 : -1}
                        onClick={() => select(opt.value)}
                        onKeyDown={e => handleKeyDown(e, i)}
                        className={classnames(C.option, active && C.active)}
                    >
                        {opt.label ?? opt.value}
                    </button>
                );
            })}
        </div>
    );
}

// forwardRef erases generics; the cast restores the typed call signature.
const ToggleGroup = forwardRef(ToggleGroupInner) as unknown as <
    T extends string | number = string,
>(
    props: ToggleGroupProps<T> & { ref?: Ref<HTMLDivElement> }
) => ReactElement;

export default ToggleGroup;
