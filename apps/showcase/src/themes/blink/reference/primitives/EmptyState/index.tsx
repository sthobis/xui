import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import classnames from "classnames";

import Button from "../Button";

import C from "./EmptyState.module.css";

export type EmptyStateSize = "sm" | "md" | "lg";

export interface EmptyStateAction {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
}

export interface EmptyStateLink {
    label: string;
    href: string;
    external?: boolean;
}

export interface EmptyStateProps
    extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    title: ReactNode;
    description?: ReactNode;
    icon?: ReactNode;
    action?: EmptyStateAction;
    secondaryAction?: EmptyStateAction;
    linkAction?: EmptyStateLink;
    size?: EmptyStateSize;
}

const SIZE_CLASS: Record<EmptyStateSize, string> = {
    sm: C.sm,
    md: C.md,
    lg: C.lg,
};

const BUTTON_SIZE: Record<EmptyStateSize, "sm" | "md" | "lg"> = {
    sm: "sm",
    md: "md",
    lg: "lg",
};

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
    function EmptyState(
        {
            title,
            description,
            icon,
            action,
            secondaryAction,
            linkAction,
            size = "md",
            className,
            ...rest
        },
        ref
    ) {
        const buttonSize = BUTTON_SIZE[size];
        const hasButtons =
            action !== undefined || secondaryAction !== undefined;

        return (
            <div
                ref={ref}
                {...rest}
                className={classnames(C.root, SIZE_CLASS[size], className)}
            >
                {icon !== undefined && (
                    <span className={C.media} aria-hidden="true">
                        {icon}
                    </span>
                )}
                <div className={C.text}>
                    <div className={C.title}>{title}</div>
                    {description !== undefined && (
                        <p className={C.description}>{description}</p>
                    )}
                </div>
                {hasButtons && (
                    <div className={C.actions}>
                        {action !== undefined && (
                            <Button
                                variant="primary"
                                size={buttonSize}
                                loading={action.loading}
                                disabled={action.disabled}
                                onClick={action.onClick}
                            >
                                {action.label}
                            </Button>
                        )}
                        {secondaryAction !== undefined && (
                            <Button
                                variant="secondary"
                                size={buttonSize}
                                loading={secondaryAction.loading}
                                disabled={secondaryAction.disabled}
                                onClick={secondaryAction.onClick}
                            >
                                {secondaryAction.label}
                            </Button>
                        )}
                    </div>
                )}
                {linkAction !== undefined && (
                    <a
                        className={C.link}
                        href={linkAction.href}
                        {...(linkAction.external !== false && {
                            target: "_blank",
                            rel: "noreferrer",
                        })}
                    >
                        {linkAction.label}
                        {linkAction.external !== false && (
                            <ArrowUpRightIcon
                                className={C.linkIcon}
                                aria-hidden="true"
                            />
                        )}
                    </a>
                )}
            </div>
        );
    }
);

export default EmptyState;
