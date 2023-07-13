import { useContext } from "react"
import Context from "./Context"
export { default as ErrorProvider } from "./Provider"


export function useErrors() {
    return useContext(Context)
}