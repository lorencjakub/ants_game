import { Socket, Manager } from "socket.io-client"
import { EventNames } from "./eventNames"


const wsManager = new Manager(
    `${String(process.env.API_BASE_URL)}`,
    {
        transports: ["websocket"],
        query: {
            "Token": sessionStorage.getItem("Token")
        }
    }
)

const gameSocket: Socket = wsManager.socket(
    "/",
    {
        auth: {
            "Token": sessionStorage.getItem("Token")
        }
    }
)

const chatSocket: Socket = wsManager.socket(
    "/chat",
    {
        auth: {
            "Token": sessionStorage.getItem("Token")
        }
    }
)

interface WSError {
    event: EventNames,
    messages: string[]
}

export { EventNames } from "./eventNames"
export {
    gameSocket,
    chatSocket,
    type WSError
}