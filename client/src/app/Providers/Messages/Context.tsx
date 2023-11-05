import React, { createContext } from "react"
import { TIncomingMessage } from "../../components/types"


interface IMessagesContext {
    messages: TIncomingMessage[],
    handleNewMessage: (message: TIncomingMessage) => void,
    clearNewMessages: () => void,
    newMessagesCount: number
}

const Context = createContext<Partial<IMessagesContext>>({})

export default Context