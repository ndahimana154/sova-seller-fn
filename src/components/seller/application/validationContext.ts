import { createContext } from "react";

export const ValidationErrorsContext = createContext<Record<string, string>>({});
