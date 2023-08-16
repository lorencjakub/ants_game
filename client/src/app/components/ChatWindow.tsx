import React, { FC, useEffect, useRef, useReducer } from "react"
import {
    Paper,
    Button,
    TextField,
    Grid,
    Stack,
    Typography
} from '@mui/material'
import { Send as SendIcon } from "@mui/icons-material"
import { useIntl } from "react-intl"
import { EventNames, chatSocket } from "../../base/Providers/SocketIo"
import { useTheme as useMuiTheme } from "@mui/material/styles"


type TIncomingMessage = { time: string, message: string, player: string }
const initMessages: TIncomingMessage[] = []

const messagesCache = (state: TIncomingMessage[], action: TIncomingMessage) => {
    if (!action || (state.filter(m => ((m.player == action.player) && (m.message == action.message))).length != 0)) return state || initMessages

    var messages = [ ...state ]
    messages.push(action)
    const maxChatLength = parseInt(String(process.env.MAX_CHAT_ROWS)) || 10

    if (messages.length > maxChatLength) {
        return messages.slice(messages.length - 10)
    }

    return messages
}

const NewMessage: FC<{}> = () => {
    const msgRef = useRef<HTMLInputElement | null>(null)
    const intl = useIntl()
    const theme = useMuiTheme()

    const sendMessage = () => {
        if (!msgRef.current || !msgRef.current.value) return

        const textField = msgRef.current
        chatSocket.emit(EventNames.CHAT_MESSAGE, textField.value, sessionStorage.getItem("Token") || "")
        textField.value = ""
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.keyCode == 13) sendMessage()
    }

    return (
        <Stack direction="row" sx={{ backgroundColor: theme.palette.background.paper }}>
            <TextField
                inputRef={msgRef}
                sx={{
                    width: "100%"
                }}
                onKeyDown={handleKeyPress}
                InputProps={{
                    endAdornment: (
                        <Button
                            onClick={sendMessage}
                            sx={{
                                width: 100
                            }}
                            variant="contained"
                            color="primary"
                        >
                            <SendIcon sx={{ color: "text.primary" }} />
                        </Button>
                    )
                }}
                placeholder={intl.formatMessage({ id: "chat_window.new_message.placeholder", defaultMessage: "Type something" })}
            />
        </Stack>
    )
}

const ChatWindow: FC<{}> = () => {
    const [messages, addMessage] = useReducer<(state: TIncomingMessage[], action: TIncomingMessage) => TIncomingMessage[]>(messagesCache, initMessages)

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
                    minHeight: 139
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

export { ChatWindow, NewMessage }