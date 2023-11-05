import { FC, useState, useEffect, useReducer } from "react"
import Context from "./Context"
import { messagesCacheReducer, initialMessages } from "../../components/types"


const MessagesProvider: FC<{ children: any }> = ({ children }) => {
    const [newMessages, setNewMessages] = useState<number>(0)
    const [messages, handleNewMessage] = useReducer(messagesCacheReducer, initialMessages)

    useEffect(() => {
        const incomingMessage = messages[0]
        
        if (!incomingMessage || /fled in fear|joined the battle/.test(incomingMessage.message)) return

        if (incomingMessage?.player != sessionStorage.getItem("Token")) setNewMessages(current => current + 1)
    }, [messages])

    const clearNewMessages = () => setNewMessages(0)

    return (
        <Context.Provider
            value={{
                messages,
                handleNewMessage,
                clearNewMessages,
                newMessagesCount: newMessages
            }}
        >
            {children}
        </Context.Provider>
    )
}

export default MessagesProvider