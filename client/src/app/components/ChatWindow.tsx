import { FC, useEffect} from "react"
import {
    Paper,
    Grid,
    Typography,
    useMediaQuery
} from '@mui/material'
import { EventNames, chatSocket } from "../../base/Providers/SocketIo"
import { NewMessage } from "./NewMessageRow"
import { TIncomingMessage } from "./types"
import { useMessages } from "../Providers/Messages"
import { useTheme } from '@mui/material/styles'


const ChatWindow: FC<{}> = () => {
    const theme = useTheme()
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"))
    const { messages = [], handleNewMessage } = useMessages()

    useEffect(() => {
        if (smallScreen) return

        if (!chatSocket.connected) chatSocket.connect()

        chatSocket.on(EventNames.SERVER_CHAT_MESSAGE, (data: TIncomingMessage) => {
            handleNewMessage && handleNewMessage(data)
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
                style={{
                    display: "flex",
                    flexDirection: "column-reverse"
                }}
            >
                {Object.entries(messages).map(([i, data]) => (
                    <Typography
                        key={`${data.player}-${data.time}-${i}`}
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