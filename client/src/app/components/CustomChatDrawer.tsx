import React, { FC, useState, useEffect } from 'react'
import {
    Button,
    Typography,
    Grid,
    useMediaQuery,
    Drawer,
    IconButton,
    styled,
    Theme,
    drawerClasses
} from "@mui/material"
import {
    KeyboardArrowRight as RightIcon,
    KeyboardArrowLeft as LeftIcon
} from "@mui/icons-material"
import { useIntl } from "react-intl"
import { ChatWindow } from '../components/ChatWindow'
import { EventNames, gameSocket } from '../../base/Providers/SocketIo'
import { useTheme } from '@mui/material/styles'
import { TIncomingMessage } from './types'
import { chatSocket } from '../../base/Providers/SocketIo'
import { useMessages } from '../Providers/Messages'


const CustomDrawer = styled(Drawer)(
    ({ theme }: { theme?: Theme }) => {
        return {
            [`& .${drawerClasses.paper}`]: {
                position: "relative",
                whiteSpace: "nowrap",
                height: "100%",
                top: "103px",
                overflow: "hidden",
                transition: theme?.transitions.create("width", {
                    easing: theme?.transitions.easing.sharp,
                    duration: theme?.transitions.duration.leavingScreen
                }),
                width: "100%",
                zIndex: (theme?.zIndex.tooltip) ? theme?.zIndex.tooltip + 1 : undefined
            }
        }
    }
)

const ChatDrawer: FC<{}> = () => {
    const intl = useIntl()
    const theme = useTheme()
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"))
    const [chatOpen, setOpenChat] = useState<boolean>(false)
    const { handleNewMessage, newMessagesCount, clearNewMessages } = useMessages()

    const toggleDrawer = () => {
        setOpenChat(current => !current)
        clearNewMessages && clearNewMessages()
    }

    useEffect(() => {
        if (!chatSocket.connected) chatSocket.connect()

        chatSocket.on(EventNames.SERVER_CHAT_MESSAGE, (data: TIncomingMessage) => {
            handleNewMessage && handleNewMessage(data)
        })

        return () => {
            chatSocket.disconnect()
        }
    }, [])

    return (
        <React.Fragment>
            <IconButton
                style={{
                    position: "fixed",
                    left: 15,
                    top: 109,
                    zIndex: theme.zIndex.tooltip + 1,
                    height: 40,
                    width: 40
                }}
                sx={{
                    backgroundColor: "text.primary",
                    borderRadius: "50%"
                }}
                onClick={toggleDrawer}
            >
                {(chatOpen) ? <LeftIcon /> : <RightIcon />}
                {((newMessagesCount == 0) || chatOpen) ?
                    null
                    :
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        style={{
                            position: "fixed",
                            left: 40,
                            top: 105,
                            backgroundColor: theme.palette.success.main,
                            borderRadius: "50%",
                            height: 20,
                            minWidth: 20
                        }}
                    >
                        {newMessagesCount}
                    </Typography>
                }
            </IconButton>
            <Button
                variant="contained"
                onClick={() => {
                    if (gameSocket.connected) gameSocket.emit(EventNames.LEAVE_GAME, sessionStorage.getItem("Token") || "")
                }}
                sx={{
                    backgroundColor: "text.primary",
                    maxWidth: 250,
                    height: 30,
                    px: 2,
                    mt: 0.5
                }}
                style={{
                    position: "fixed",
                    right: 15,
                    top: 110,
                    zIndex: theme.zIndex.tooltip + 1
                }}
            >
                {intl.formatMessage({ id: "processing_backdrop_message.lock_button", defaultMessage: "Leave battlefield" })}
            </Button>
            <CustomDrawer
                anchor="left"
                open={chatOpen}
                onClose={toggleDrawer}
                ModalProps={{
                    keepMounted: false
                }}
            >
                <Grid
                    data-testid="pages.room.battlefield"
                    item
                    direction={(smallScreen) ? "column" : "row"}
                    xs={12}
                    md={8}
                    justifyContent="center"
                    alignItems="center"
                    style={{
                        display: 'flex',
                        overflow: 'hidden'
                    }}
                    sx={{
                        height: "100%",
                        m: 0,
                        p: 0
                    }}
                >
                    <Grid
                        item
                        xs={8}
                        direction="column"
                        justifyContent="center"
                        sx={{
                            ml: (smallScreen) ? 0 : 4
                        }}
                    >
                        <Grid
                            container
                            direction={(smallScreen) ? "column" : "row"}
                            style={{
                                display: "flex",
                                justifyContent: "space-between"
                            }}
                            onClick={() => (smallScreen) ? setOpenChat(current => !current) : {}}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 2
                                }}
                            >
                                {intl.formatMessage({ id: "chat_window.title", defaultMessage: "Battle Chat" })}
                            </Typography>
                        </Grid>
                        <ChatWindow />
                    </Grid>
                </Grid>
            </CustomDrawer>
        </React.Fragment>
    )
}

export { ChatDrawer }