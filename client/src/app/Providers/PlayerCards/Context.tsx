import React, { createContext } from "react"
import { ICard } from "../../../base/utils/Axios/types"


interface IPlayerCardsContext {
    playerCards: ICard[],
    setPlayerCards: (data: ICard[]) => void,
    discarded: ICard | null,
    setDiscardedCard: (card: ICard) => void
}

const Context = createContext<Partial<IPlayerCardsContext>>({})

export default Context