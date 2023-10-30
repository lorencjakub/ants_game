import { ICard } from "../../base/utils/Axios/types"
import { TIncomingMessage } from "./types"


const getCardStyles = (type: ICard["type"]) => {
    switch (type) {
        case "building":
            return { backgroundColor: "#ffe5e5", border: "solid 3px red" }

        case "soldiers":
            return { backgroundColor: "#d0f0c0", border: "solid 3px green" }

        case "magic":
            return { backgroundColor: "#afdbf5", border: "solid 3px blue" }

        default:
            return { backgroundColor: "#faba5f", border: "solid 3px #ff5733" }

    }
}

const initMessages: TIncomingMessage[] = []

const messagesCacheReducer = (state: TIncomingMessage[], action: TIncomingMessage) => {
    if (!action || (state.filter(m => ((m.player == action.player) && (m.message == action.message))).length != 0)) return state || initMessages

    var messages = [ ...state ]
    messages.push(action)
    const maxChatLength = parseInt(String(process.env.MAX_CHAT_ROWS)) || 6

    if (messages.length > maxChatLength) {
        return messages.slice(messages.length - 6)
    }

    return messages
}

export {
    initMessages,
    getCardStyles,
    messagesCacheReducer
}