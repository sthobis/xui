import { forwardRef, type ReactNode } from "react";
import { Dialog as MuiDialog } from "@mui/material";
import { XIcon } from "lucide-react";
import classnames from "classnames";

import Button from "../Button";
import PopTransition from "../Menu/PopTransition";

import C from "./Dialog.module.css";

type Size = "sm" | "md" | "lg";

const SIZE_CLASS: Record<Size, string> = {
    sm: C.sm,
    md: C.md,
    lg: C.lg,
};

export interface DialogProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    size?: Size;
    dismissible?: boolean;
    children?: ReactNode;
    className?: string;
}

const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
    {
        open,
        onClose,
        title,
        description,
        actions,
        size = "md",
        dismissible = true,
        children,
        className,
    },
    ref
) {
    const showHeader = title !== undefined || dismissible;
    const showBody = description !== undefined || children !== undefined;
    return (
        <MuiDialog
            ref={ref}
            open={open}
            onClose={(_, reason) => {
                if (!dismissible && reason === "backdropClick") return;
                onClose();
            }}
            maxWidth={false}
            transitionDuration={150}
            slots={{ transition: PopTransition }}
            classes={{
                paper: classnames(C.paper, SIZE_CLASS[size], className),
            }}
        >
            {showHeader && (
                <div className={C.header}>
                    {title !== undefined ? (
                        <h2 className={C.title}>{title}</h2>
                    ) : (
                        <span />
                    )}
                    {dismissible && (
                        <Button
                            variant="ghost"
                            size="sm"
                            iconOnly
                            onClick={onClose}
                            aria-label="Close"
                            className={C.closeButton}
                        >
                            <XIcon size={16} />
                        </Button>
                    )}
                </div>
            )}
            {showBody && (
                <div className={C.body}>
                    {description !== undefined && (
                        <p className={C.description}>{description}</p>
                    )}
                    {children}
                </div>
            )}
            {actions !== undefined && <div className={C.footer}>{actions}</div>}
        </MuiDialog>
    );
});

export default Dialog;
