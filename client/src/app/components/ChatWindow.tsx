import { FC, useEffect, useReducer } from "react"
import {
    Paper,
    Grid,
    Typography
} from '@mui/material'
import { EventNames, chatSocket } from "../../base/Providers/SocketIo"
import { NewMessage } from "./NewMessageRow"
import { TIncomingMessage } from "./types"
import { messagesCacheReducer, initMessages } from "./functions"


const ChatWindow: FC<{}> = () => {
    const [messages, addMessage] = useReducer<(state: TIncomingMessage[], action: TIncomingMessage) => TIncomingMessage[]>(messagesCacheReducer, initMessages)

    useEffect(() => {
        if (!chatSocket.connected) chatSocket.connect()

        chatSocket.on(EventNames.SERVER_CHAT_MESSAGE, (data: TIncomingMessage) => {
            addMessage(data)
        })

        return () => {
            chatSocket.disconnect()
        }
    }, [])

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
        >
            <Paper
                sx={{
                    p: 1,
                    height: 139,
                    overflowY: "auto"
                }}
                elevation={3}
            >
                {messages.map((data) => (
                    <Typography
                        key={`${data.player}-${data.time}`}
                        variant="body2"
                        color={(data.player == sessionStorage.getItem("Token")) ? "text.primary" : "text.secondary"}
                        fontStyle='italic'
                    >
                        {`${data.time}   ${data.message}`}
                    </Typography>
                ))}
            </Paper>
            <NewMessage />
        </Grid>
    )
}

export { ChatWindow }