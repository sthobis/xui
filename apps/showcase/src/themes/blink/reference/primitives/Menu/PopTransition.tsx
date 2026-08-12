import {
    cloneElement,
    forwardRef,
    useCallback,
    useRef,
    type CSSProperties,
    type ReactElement,
    type Ref,
} from "react";
import { Transition, type TransitionStatus } from "react-transition-group";

const DEFAULT_DURATION = 150;
const EASING = "var(--ease-out)";

const OPEN: CSSProperties = {
    opacity: 1,
    transform: "scale(1)",
};

// During exit, keep transform at the open position — only opacity fades.
const EXITING: CSSProperties = {
    opacity: 0,
    transform: "scale(1)",
};

// At rest before opening (or after exit completes), transform is offset.
// Next entry animates both opacity and transform from here.
const CLOSED: CSSProperties = {
    opacity: 0,
    transform: "scale(0.95)",
};

const STATE_STYLES: Record<TransitionStatus, CSSProperties> = {
    entering: OPEN,
    entered: OPEN,
    exiting: EXITING,
    exited: CLOSED,
    unmounted: {},
};

interface PopTransitionProps {
    in?: boolean;
    appear?: boolean;
    timeout?: number | { enter?: number; exit?: number; appear?: number };
    children: ReactElement<{
        style?: CSSProperties;
        ref?: Ref<HTMLElement>;
    }>;
    onEnter?: (node: HTMLElement, isAppearing: boolean) => void;
    onEntered?: (node: HTMLElement, isAppearing: boolean) => void;
    onEntering?: (node: HTMLElement, isAppearing: boolean) => void;
    onExit?: (node: HTMLElement) => void;
    onExited?: (node: HTMLElement) => void;
    onExiting?: (node: HTMLElement) => void;
}

const PopTransition = forwardRef<HTMLElement, PopTransitionProps>(
    function PopTransition(
        {
            in: inProp,
            appear = true,
            timeout = DEFAULT_DURATION,
            children,
            onEnter,
            onEntered,
            onEntering,
            onExit,
            onExited,
            onExiting,
        },
        ref
    ) {
        const nodeRef = useRef<HTMLElement | null>(null);

        const handleRef = useCallback(
            (node: HTMLElement | null) => {
                nodeRef.current = node;
                if (typeof ref === "function") {
                    ref(node);
                } else if (ref) {
                    (ref as { current: HTMLElement | null }).current = node;
                }
                const childRef = (
                    children as { ref?: Ref<HTMLElement> | undefined }
                ).ref;
                if (typeof childRef === "function") {
                    childRef(node);
                } else if (childRef) {
                    (childRef as { current: HTMLElement | null }).current =
                        node;
                }
            },
            [ref, children]
        );

        const duration =
            typeof timeout === "number"
                ? timeout
                : timeout.enter ?? DEFAULT_DURATION;
        const transition = `opacity ${duration}ms ${EASING}, transform ${duration}ms ${EASING}`;

        return (
            <Transition
                in={inProp}
                appear={appear}
                timeout={timeout}
                nodeRef={nodeRef as React.RefObject<HTMLElement>}
                onEnter={(isAppearing: boolean) => {
                    const node = nodeRef.current;
                    if (node) {
                        // Force reflow so the transition animates from the
                        // initial (exit) state instead of jumping to enter.
                        void node.offsetHeight;
                        onEnter?.(node, isAppearing);
                    }
                }}
                onEntered={(isAppearing: boolean) => {
                    const node = nodeRef.current;
                    if (node) onEntered?.(node, isAppearing);
                }}
                onEntering={(isAppearing: boolean) => {
                    const node = nodeRef.current;
                    if (node) onEntering?.(node, isAppearing);
                }}
                onExit={() => {
                    const node = nodeRef.current;
                    if (node) onExit?.(node);
                }}
                onExited={() => {
                    const node = nodeRef.current;
                    if (node) onExited?.(node);
                }}
                onExiting={() => {
                    const node = nodeRef.current;
                    if (node) onExiting?.(node);
                }}
            >
                {(state: TransitionStatus) =>
                    cloneElement(children, {
                        ref: handleRef,
                        style: {
                            transformOrigin: "top center",
                            transition,
                            willChange: "opacity, transform",
                            ...children.props.style,
                            ...STATE_STYLES[state],
                        },
                    })
                }
            </Transition>
        );
    }
);

export default PopTransition;
