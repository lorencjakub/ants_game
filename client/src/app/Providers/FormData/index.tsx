import { useContext } from "react"
import Context from "./Context"
export { default as FormDataProvider } from "./Provider"


export function useFormData() {
    return useContext(Context)
}