import React from 'react'
import {
    Button,
    Paper,
    Grid,
    Typography,
    List
} from "@mui/material"
import { useNavigate } from 'react-router-dom'
import { useTheme as useMuiTheme } from "@mui/material/styles"
import { useIntl } from "react-intl"
import { useQuery } from '@tanstack/react-query'
import ApiClient from '../../base/utils/Axios/ApiClient'
import { IRoomInfoResponse } from '../../base/utils/Axios/types'
import { AxiosError } from 'axios'
import Loading from '../../base/components/Loading'


const HomePage: React.FC<{}> = () => {
    const navigate = useNavigate()
    const theme = useMuiTheme()
    const intl = useIntl()

    const changelogMessages = [
        intl.formatMessage({ id: "changelog_message_6", defaultMessage: "Error handlers" }),
        intl.formatMessage({ id: "changelog_message_5", defaultMessage: "Added button for leave battlefield + room lock after player left game" }),
        intl.formatMessage({ id: "changelog_message_4", defaultMessage: "Too expensive cards are disabled in player's deck" }),
        intl.formatMessage({ id: "changelog_message_3", defaultMessage: "Fix for switching turn on discard event" }),
        intl.formatMessage({ id: "changelog_message_2", defaultMessage: "Tooltip witch resources changes for both players" }),
        intl.formatMessage({ id: "changelog_message_1", defaultMessage: "60s timeout on player's turn (visible countdown)" }),
    ]

    const {
        refetch: createRoom,
        isFetching: creatingRoom
    } = useQuery<IRoomInfoResponse, AxiosError>(
        ["create_room_query"],
        async () => await ApiClient.createRoom(),
        {
            enabled: false,
            onSuccess: (res) => {
                sessionStorage.setItem("Token", res.token)
                navigate(`/room/${res.room}?creating=true`)
            }
        }
    )

    return (
        <Paper
            elevation={0}
            style={{
                display: 'flex',
                flexDirection: "row",
                overflow: 'hidden',
                minHeight: 310
            }}
            sx={{
                px: 5,
                py: 2,
                m: 1,
                width: "100%",
                height: "100%",
                backgroundColor: "background.default",
                borderRadius: 5
            }}
        >
            <Grid
                data-testid="pages.homepage.container"
                container
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
                sx={{
                    display: 'flex',
                    overflow: "auto"
                }}
            >
                <Grid
                    data-testid="pages.homepage.title"
                    container
                    direction="column"
                    alignItems="center"
                >
                    <Grid
                        data-testid="pages.homepage.title"
                        item
                        style={{
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <Typography
                            variant="h6"
                            color="text.primary"
                        >
                            {intl.formatMessage({ id: "pages.homepage.title", defaultMessage: "Welcome!" })}
                        </Typography>
                    </Grid>
                    <Grid
                        data-testid="pages.homepage.about"
                        item
                        style={{
                            display: "flex",
                            justifyContent: "flex-start"
                        }}
                    >
                        <Typography
                            variant="body1"
                            color="text.secondary"
                        >
                            {intl.formatMessage({ id: "pages.homepage.about", defaultMessage: "This is the online version of a czech freeware game Ants" })}
                        </Typography>
                    </Grid>
                    <Grid
                        data-testid="pages.homepage.new_room_button"
                        item
                        style={{
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <Button
                            onClick={() => {
                                sessionStorage.setItem("Token", "")
                                createRoom()
                            }}
                            variant="contained"
                            sx={{
                                backgroundColor: theme.palette.text.primary,
                                m: 3
                            }}
                        >
                            {intl.formatMessage({ id: "pages.homepage.new_room_button", defaultMessage: "Create a new Room" })}
                        </Button>
                    </Grid>
                </Grid>
                <Grid
                    data-testid="pages.homepage.changelog"
                    container
                    direction="row"
                    justifyContent="center"
                    sx={{ mt: 4 }}
                >
                    <List sx={{ mt: 1 }}>
                        <Typography
                            variant="h5"
                            color="text.primary"
                            sx={{
                                mb: 4
                            }}
                            style={{
                                display: "flex",
                                justifyContent: "center"
                            }}
                        >
                            {intl.formatMessage({ id: "pages.homepage.changelog_title", defaultMessage: "Changelog" })}
                        </Typography>
                        {Object.entries(changelogMessages).map(([i, m]) => (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                key={`changelog_message_${i}`}
                            >
                               •    {m}
                            </Typography>
                        ))}
                    </List>
                </Grid>
            </Grid>
            {(!creatingRoom) ? null :
                <Loading
                    message={intl.formatMessage({ id: "processing_backdrop_message.creating_room", defaultMessage: "Room is creating..." })}
                    sx={{
                        backgroundColor: "background.default",
                        opacity: 0,
                        zIndex: 5
                    }}
                />
            }
        </Paper>
    )
}

export default HomePage