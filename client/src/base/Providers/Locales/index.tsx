import { useContext } from "react"
import Context from "./Context"
export { default as LocaleProvider } from "./Provider"


export function useLocale() {
    return useContext(Context)
}