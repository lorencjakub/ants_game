import { ICard } from "../../base/utils/Axios/types"


interface IInteractiveCard extends Partial<ICard> {
    discardFn?: (itemName: string) => void,
    playFn?: (itemName: string) => void,
    key: string,
    sx?: any,
    discarded?: boolean,
    disabled?: boolean,
    scale?: number
}

type TIncomingMessage = { time: string, message: string, player: string }

const initialMessages: TIncomingMessage[] = []

const messagesCacheReducer = (state: TIncomingMessage[], action: TIncomingMessage) => {
    if (!action || (state.filter(m => ((m.player == action.player) && (m.message == action.message))).length != 0)) return state || initialMessages

    var messages = [ ...state ]
    messages.unshift(action)
    const maxChatLength = parseInt(String(process.env.MAX_CHAT_ROWS)) || 30

    if (messages.length > maxChatLength) {
        return messages.slice(0, maxChatLength)
    }

    return messages
}

export {
    type IInteractiveCard,
    type TIncomingMessage,
    messagesCacheReducer,
    initialMessages
}