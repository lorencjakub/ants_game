import React, { FC, useState } from 'react'
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

    const toggleDrawer = () => setOpenChat(current => !current)

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
                        // minHeight: 300,
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