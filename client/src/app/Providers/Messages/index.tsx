import { useContext } from "react"
import Context from "./Context"
export { default as MessagesProvider } from "./Provider"


export function useMessages() {
    return useContext(Context)
}