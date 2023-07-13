import React, { FC, useState } from "react"
import Context from "./Context"
import { ICard } from "../../../base/utils/Axios/types"


const PlayerDataProvider: FC<{ children: any }> = ({ children }) => {
    const [ playerCards, setCards ] = useState<ICard[]>([])
    const [ discarded, setDiscarded ] = useState<ICard | {}>({})
    
    const setPlayerCards = (data: ICard[] = [], eventName: string) => {
        if (data.length === 0) return console.warn(`setPlayerCards function needs some cards during ${eventName} action`)

        var newCards: ICard[] = []
        data.forEach(c => newCards.push(c))
        
        setCards(newCards)
    }

    const setDiscardedCard = (card: ICard) => {
        setDiscarded(card)
    }

    return (
        <Context.Provider value={{ playerCards, setPlayerCards, discarded, setDiscardedCard }}>
            {children}
        </Context.Provider>
    )
}

export default PlayerDataProvider