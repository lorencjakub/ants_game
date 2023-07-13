import { useContext } from "react"
import Context from "./Context"
export { default as ThemeModeProvider } from "./Provider"


export function useThemeMode() {
    return useContext(Context)
}