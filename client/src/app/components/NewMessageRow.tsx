import { FC, useRef } from "react"
import { useIntl } from "react-intl"
import { useTheme as useMuiTheme } from "@mui/material/styles"
import { chatSocket, EventNames } from "../../base/Providers/SocketIo"
import {
    Stack,
    TextField,
    Button
} from "@mui/material"
import { Send as SendIcon } from "@mui/icons-material"


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

export { NewMessage }