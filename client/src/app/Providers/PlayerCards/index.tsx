import { useContext } from "react"
import Context from "./Context"
export { default as PlayerCardsProvider } from "./Provider"


export function usePlayerCards() {
    return useContext(Context)
}