import { createContext, useContext } from "react";

export type FormFieldContextValue = {
    id: string;
    hasError: boolean;
    /** id of the helper/error message, for the control's aria-describedby */
    describedById?: string;
    required?: boolean;
};

export const FormFieldContext = createContext<FormFieldContextValue | null>(
    null
);

export function useFormFieldContext() {
    return useContext(FormFieldContext);
}
