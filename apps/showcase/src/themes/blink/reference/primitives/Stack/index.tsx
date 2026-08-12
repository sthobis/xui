import {
    forwardRef,
    type ComponentPropsWithRef,
    type ElementType,
    type ReactElement,
    type ReactNode,
    type Ref,
} from "react";
import classnames from "classnames";

import C from "./Stack.module.css";

type Gap = 1 | 2 | 3 | 4 | 6 | 8 | 10;
type Direction = "row" | "column";
type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between" | "around";

type StackOwnProps = {
    direction?: Direction;
    gap?: Gap;
    align?: Align;
    justify?: Justify;
    wrap?: boolean;
    fullWidth?: boolean;
    even?: boolean;
    children: ReactNode;
    className?: string;
};

export type StackProps<E extends ElementType = "div"> = StackOwnProps & {
    as?: E;
} & Omit<ComponentPropsWithRef<E>, keyof StackOwnProps | "as">;

type PolymorphicRef<E extends ElementType> = ComponentPropsWithRef<E>["ref"];

const DIRECTION_CLASS: Record<Direction, string> = {
    row: C.directionRow,
    column: C.directionColumn,
};

const GAP_CLASS: Record<Gap, string> = {
    1: C.gap1,
    2: C.gap2,
    3: C.gap3,
    4: C.gap4,
    6: C.gap6,
    8: C.gap8,
    10: C.gap10,
};

const ALIGN_CLASS: Record<Align, string> = {
    start: C.alignStart,
    center: C.alignCenter,
    end: C.alignEnd,
    stretch: C.alignStretch,
    baseline: C.alignBaseline,
};

const JUSTIFY_CLASS: Record<Justify, string> = {
    start: C.justifyStart,
    center: C.justifyCenter,
    end: C.justifyEnd,
    between: C.justifyBetween,
    around: C.justifyAround,
};

function StackComponent<E extends ElementType = "div">(
    {
        direction = "column",
        gap,
        align,
        justify,
        wrap,
        fullWidth,
        even,
        as,
        children,
        className,
        ...rest
    }: StackProps<E>,
    ref: PolymorphicRef<E>
) {
    const Component = (as || "div") as ElementType;
    return (
        <Component
            ref={ref as Ref<HTMLElement>}
            className={classnames(
                C.root,
                DIRECTION_CLASS[direction],
                gap !== undefined && GAP_CLASS[gap],
                align && ALIGN_CLASS[align],
                justify && JUSTIFY_CLASS[justify],
                wrap && C.wrap,
                fullWidth && C.fullWidth,
                even && C.even,
                className
            )}
            {...rest}
        >
            {children}
        </Component>
    );
}

const Stack = forwardRef(StackComponent as never) as unknown as <
    E extends ElementType = "div",
>(
    props: StackProps<E> & { ref?: PolymorphicRef<E> }
) => ReactElement | null;

export default Stack;
