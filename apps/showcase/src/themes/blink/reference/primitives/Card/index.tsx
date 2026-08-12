import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import classnames from "classnames";

import C from "./Card.module.css";

type TitleAs = "h2" | "h3" | "h4";

export interface CardProps
    extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    title?: string;
    titleAs?: TitleAs;
    description?: ReactNode;
    icon?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
    {
        title,
        titleAs: TitleTag = "h4",
        description,
        icon,
        actions,
        children,
        footer,
        className,
        ...rest
    },
    ref
) {
    const hasTitleGroup =
        title !== undefined || description !== undefined || icon !== undefined;
    const showHeader = hasTitleGroup || actions !== undefined;
    return (
        <div ref={ref} className={classnames(C.root, className)} {...rest}>
            {showHeader && (
                <div className={C.header}>
                    {hasTitleGroup && (
                        <div className={C.main}>
                            {icon !== undefined && (
                                <span className={C.icon}>{icon}</span>
                            )}
                            <div className={C.titleGroup}>
                                {title !== undefined && (
                                    <TitleTag className={C.title}>
                                        {title}
                                    </TitleTag>
                                )}
                                {description !== undefined && (
                                    <p className={C.description}>
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    {actions !== undefined && (
                        <div className={C.actions}>{actions}</div>
                    )}
                </div>
            )}
            {children !== undefined && <div className={C.body}>{children}</div>}
            {footer !== undefined && <div className={C.footer}>{footer}</div>}
        </div>
    );
});

export default Card;
