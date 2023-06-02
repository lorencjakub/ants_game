import { useContext } from "react"
import Context from "./Context"
export { default as DailyMenuProvider } from "./Provider"


export function useDailyMenu() {
    return useContext(Context)
}