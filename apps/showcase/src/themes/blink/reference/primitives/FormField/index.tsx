import { forwardRef, useMemo, type ReactNode } from "react";
import classnames from "classnames";

import { FormFieldContext } from "./FormFieldContext";

import C from "./FormField.module.css";

export interface FormFieldProps {
    label: string;
    htmlFor: string;
    children: ReactNode;
    helperText?: string;
    error?: string;
    required?: boolean;
    className?: string;
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(function FormField(
    { label, htmlFor, children, helperText, error, required, className },
    ref
) {
    const hasMessage = !!error || !!helperText;
    const describedById = hasMessage ? `${htmlFor}-description` : undefined;
    const ctx = useMemo(
        () => ({ id: htmlFor, hasError: !!error, describedById, required }),
        [htmlFor, error, describedById, required]
    );
    return (
        <div ref={ref} className={classnames(C.root, className)}>
            <FormFieldContext.Provider value={ctx}>
                <label className={C.label} htmlFor={htmlFor}>
                    {label}
                    {required && <span className={C.required}>*</span>}
                </label>
                {children}
                {error ? (
                    <span
                        id={describedById}
                        className={C.errorText}
                        role="alert"
                    >
                        {error}
                    </span>
                ) : helperText ? (
                    <span id={describedById} className={C.helperText}>
                        {helperText}
                    </span>
                ) : null}
            </FormFieldContext.Provider>
        </div>
    );
});

export default FormField;
