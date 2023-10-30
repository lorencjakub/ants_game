import { FC, useEffect, useState, useReducer, useCallback } from 'react'
import {
    Button,
    Paper,
    Typography,
    Grid,
    Backdrop,
    useMediaQuery,
    Snackbar,
    Card,
    CardMedia
} from "@mui/material"
import { useMutation } from '@tanstack/react-query'
import ApiClient from '../../base/utils/Axios/ApiClient'
import {
    ITurnResponse,
    ISources,
    IWinTurnResponse,
    TSocketJoinRoomResponse,
    ECardTypes
} from '../../base/utils/Axios/types'
import { AxiosError } from 'axios'
import { useIntl, FormattedMessage } from "react-intl"
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { AntCard } from "../components/Card"
import { ICard } from '../../base/utils/Axios/types'
import { usePlayerCards } from '../Providers/PlayerCards'
import Sources from '../components/Sources'
import Loading from '../../base/components/Loading'
import { ChatWindow } from '../components/ChatWindow'
import { EventNames, gameSocket, WSError } from '../../base/Providers/SocketIo'
import { useTheme } from '@mui/material/styles'
import { useSnackbar } from 'notistack'
import { useErrors } from '../../base/Providers/Errors'
import { Stopwatches } from '../components/Stopwatches'
import { IPlayerState, IRoomStatus } from './types'
import {
    initRoomStatus,
    initState,
    roomStatusReducer,
    playerSourcesReducer
} from "./functions"
import { RoomInfoBackdrop } from '../components/RoomInfoBackdrop'
import { ChatDrawer } from '../components/CustomChatDrawer'
import { getCardStyles } from "../components/functions"


const Room: FC<{}> = () => {
    const { guid } = useParams()
    const intl = useIntl()
    const theme = useTheme()
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    const navigate = useNavigate()
    const { parseErrorMessage } = useErrors()
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"))

    const [searchParams, setSearchParams] = useSearchParams()
    const [creatingRoom, setCreatingRoom] = useState<boolean>(true)
    const [mySources, setMySources] = useReducer<(state: IPlayerState, action: { data?: ISources, cleanup?: boolean }) => IPlayerState>(playerSourcesReducer, initState)
    const [enemySources, setEnemySources] = useReducer<(state: IPlayerState, action: { data?: ISources, cleanup?: boolean }) => IPlayerState>(playerSourcesReducer, initState)
    const [onTurn, setOnTurn] = useState<string>("")
    const [roomStatus, setRoomStatus] = useReducer<(data: Partial<IRoomStatus>, action: Partial<IRoomStatus>) => Partial<IRoomStatus>>(roomStatusReducer, initRoomStatus)
    const {
        playerCards = [],
        setPlayerCards = (data: ICard[], eventName: string) => {},
        discarded = {},
        setDiscardedCard = (card: ICard) => {}
    } = usePlayerCards()
    const [showStopwatches, setShowStopwatches] = useState<boolean>(false)

    useEffect(() => {
        setShowStopwatches(Boolean(onTurn == sessionStorage.getItem("Token") && enemySources.sources && mySources.sources && !creatingRoom))
    }, [onTurn, enemySources.sources, mySources.sources, creatingRoom])

    const {
        mutate: playCard
    } = useMutation<ITurnResponse | IWinTurnResponse, AxiosError, string>({
        mutationFn: async (item_name) => await ApiClient.play(item_name),
        onSuccess: (res: any) => {
            if (res.winner) {
                gameSocket.emit(EventNames.SERVER_WINNER, res.winner, sessionStorage.getItem("Token") || "")
                return 
            }

            gameSocket.emit(EventNames.SERVER_STATE_UPDATE, { discarded: res.discarded, guid: guid, action: "play" }, sessionStorage.getItem("Token"))
            setPlayerCards(res.cards, "playCard")
        }
    })

    const {
        mutate: discardCard
    } = useMutation<ITurnResponse, AxiosError, string>({
        mutationKey: ["discard_card_request"],
        mutationFn: async (item_name) => await ApiClient.discard(item_name),
        onSuccess: (res: any) => {
            gameSocket.emit(EventNames.SERVER_STATE_UPDATE, { discarded: res.discarded, guid: guid, action: "discard" }, sessionStorage.getItem("Token"))
            setPlayerCards(res.cards, "discardCard")
        }
    })

    const memoizedDiscardCard = useCallback(discardCard, [])
    const memoizedPlayCard = useCallback(playCard, [])
    const memoizedCleanup = useCallback(() => {
        setMySources({ cleanup: true })
        setEnemySources({ cleanup: true })
    }, [])

    useEffect(() => {
        if (!gameSocket.connected) gameSocket.connect()

        gameSocket.on(EventNames.ERROR, (error: WSError) => {
            const { event, messages } = error

            if ((event == EventNames.JOIN_GAME) && (messages[0] == "Room is not active anymore")) return setRoomStatus({ active: false })
            
            messages.forEach((e: string) => {
                enqueueSnackbar(
                    parseErrorMessage && parseErrorMessage(e),
                    {
                        variant: "error"
                    }
                )
            })
        })

        gameSocket.on(EventNames.JOIN_GAME, (data: TSocketJoinRoomResponse | any) => {
            if (data.cards) setPlayerCards(data.cards, "createRoom")

            if (data.message && ((data.message as string) == "Room is not active anymore")) setRoomStatus({ active: false })

            setCreatingRoom(false)
            setSearchParams({})
        })

        gameSocket.on(EventNames.SERVER_STATE_UPDATE, (data: any) => {
            const myToken = sessionStorage.getItem("Token")
            if (!sessionStorage.getItem("Token")) return

            const enemyToken = Object.keys(data).filter((k) => ![myToken, "discarded", "on_turn"].includes(k))[0]
            
            if (data[String(myToken)]) setMySources({ data: data[String(myToken)] })

            if (data[String(enemyToken)]) setEnemySources({ data: data[String(enemyToken)] })
            
            if (data.on_turn) setOnTurn(data.on_turn)
            if (data.discarded) setDiscardedCard(data.discarded)
        })

        gameSocket.on(EventNames.CLIENT_WINNER, (winner_token: any) => {
            setRoomStatus({ winner: winner_token })
        })

        gameSocket.on(EventNames.DISCONNECT, (data) => {
            console.log(data)
        })

        gameSocket.emit(EventNames.JOIN_GAME, guid, sessionStorage.getItem("Token") || "")

        gameSocket.on(EventNames.LEAVE_SERVER, (playerToken: string) => {
            setRoomStatus({ active: false, message: intl.formatMessage({ id: "pages.room.enemy_left", defaultMessage: "Enemy left the battlefield!" }) })

            if (playerToken == sessionStorage.getItem("Token")) {
                sessionStorage.setItem("Token", "")
                navigate("/")
            }
        })

        return () => {
            gameSocket.disconnect()
        }
    }, [])

    return (
        (Boolean(roomStatus.winner) || !roomStatus.active)
        ?
        <Backdrop
            open={true}
            style={{
                backgroundColor: theme.palette.background.paper,
                opacity: 0.98,
                zIndex: 5
            }}
        >
            <RoomInfoBackdrop
                message={
                    Boolean(roomStatus.winner) ?
                        (roomStatus.winner == sessionStorage.getItem("Token")) ? 
                            intl.formatMessage({ id: "processing_backdrop_message.winner", defaultMessage: "You win!" })
                            :
                            intl.formatMessage({ id: "processing_backdrop_message.looser", defaultMessage: "You loose!" })
                    :
                    roomStatus.message
                }
            />
        </Backdrop>
        :
        <Paper
            elevation={0}
            sx={{
                m: (smallScreen) ? 0.5 : 2,
                p: (smallScreen) ? 0.5 : 2
            }}
        >
            {(smallScreen) ? <ChatDrawer /> : null}
            <Grid
                data-testid="pages.room"
                container
                spacing={1}
                justifyContent="center"
                alignItems="center"
                direction="column"
                style={{
                    display: 'flex',
                    overflow: 'hidden'
                }}
                sx={{
                    backgroundColor: "background.default",
                    p: 1
                }}
            >
                <Grid
                    data-testid="pages.room.main_panel"
                    container
                    spacing={1}
                    justifyContent="center"
                    alignItems="start"
                    direction="row"
                    style={{
                        display: 'flex',
                        overflow: 'hidden'
                    }}
                    sx={{
                        minHeight: (smallScreen) ? undefined : 300,
                        m: 0,
                        p: 0,
                        my: 2
                    }}
                >
                    <Grid
                        data-testid="pages.room.my_panel"
                        item
                        xs={6}
                        md={2}
                        justifyContent="center"
                        alignItems="start"
                        style={{
                            display: 'flex',
                            overflow: 'hidden'
                        }}
                        sx={{
                            minHeight: (smallScreen) ? undefined : 300,
                            m: 0,
                            p: 0,
                            my: (smallScreen) ? 2 : undefined,
                            maxWidth: (smallScreen) ? 120 : undefined,
                            border: "solid 2px",
                            borderRadius: 3,
                            borderColor: theme.palette.text.primary
                        }}
                    >
                        {
                            (mySources) ?
                            <Sources
                                title={(smallScreen) ? 
                                    intl.formatMessage({ id: "pages.room.player_panel.you", defaultMessage: "You" })
                                    :
                                    intl.formatMessage({ id: "pages.room.player_panel.your_sources", defaultMessage: "Your sources" })
                                }
                                sources={mySources.sources}
                                changes={mySources.changes}
                                cleanup={memoizedCleanup}
                            />
                            :
                            <Typography
                                color="text.primary"
                                variant="h4"
                                textAlign="end"
                                sx={{
                                    mb: 2
                                }}
                            >
                                {intl.formatMessage({ id: "pages.room.player_panel.missing_data", defaultMessage: "No data available" })}
                            </Typography>
                        }
                    </Grid>
                    {(smallScreen) ?
                        null
                        :
                        <Grid
                            data-testid="pages.room.battlefield"
                            item
                            direction={(smallScreen) ? "column" : "row"}
                            xs={12}
                            md={8}
                            justifyContent="center"
                            alignItems="start"
                            style={{
                                display: 'flex',
                                overflow: 'hidden'
                            }}
                            sx={{
                                minHeight: 300,
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
                                    ml: (smallScreen) ? 0 : 4,
                                    mt: (smallScreen) ? 10 : undefined
                                }}
                            >
                                <Grid
                                    container
                                    direction={(smallScreen) ? "column" : "row"}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            mb: 2
                                        }}
                                    >
                                        {intl.formatMessage({ id: "chat_window.title", defaultMessage: "Battle Chat" })}
                                    </Typography>
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
                                            mt: 0.3
                                        }}
                                    >
                                        {intl.formatMessage({ id: "processing_backdrop_message.lock_button", defaultMessage: "Leave battlefield" })}
                                    </Button>
                                </Grid>
                                <ChatWindow />
                            </Grid>
                            <Grid
                                item
                                xs={4}
                                direction="column"
                                justifyContent="center"
                            >
                                <Grid
                                    container
                                    direction="row"
                                    justifyContent="space-between"
                                    sx={{ px: 2 }}
                                >
                                    <Typography
                                        variant="h5"
                                        textAlign="center"
                                        sx={{
                                            mb: 2
                                        }}
                                    >
                                        <FormattedMessage
                                            id="pages.room.battlefield.on_turn"
                                            defaultMessage="On turn: {player}"
                                            values={{
                                                player: (
                                                    (onTurn === sessionStorage.getItem("Token")) ?
                                                    intl.formatMessage({ id: "pages.room.battlefield.on_turn.you", defaultMessage: "You" })
                                                    :
                                                    intl.formatMessage({ id: "pages.room.battlefield.on_turn.enemy", defaultMessage: "Enemy" })
                                                )
                                            }}
                                        />
                                    </Typography>
                                    {(showStopwatches) ? <Stopwatches /> : null}
                                </Grid>
                                <Grid
                                    container
                                    direction="row"
                                    justifyContent="center"
                                >
                                    <AntCard sx={{ mt: 0 }} />
                                    {(Object.keys(discarded).length === 0) ? null : <AntCard { ...discarded } sx={{ mt: 0 }} />}
                                </Grid>
                            </Grid>
                        </Grid>
                    }
                    <Grid
                        data-testid="pages.room.enemy_panel"
                        item
                        xs={6}
                        md={2}
                        justifyContent="center"
                        alignItems={(enemySources.sources) ? "start" : undefined}
                        style={{
                            display: 'flex',
                            overflow: 'hidden'
                        }}
                        sx={{
                            minHeight: (smallScreen) ? undefined : 300,
                            m: 0,
                            p: 0,
                            my: 2,
                            border: "solid 2px",
                            borderRadius: 3,
                            borderColor: theme.palette.text.primary
                        }}
                    >
                        {
                            (enemySources.sources) ?
                            <Sources
                                title={(smallScreen) ?
                                    intl.formatMessage({ id: "pages.room.player_panel.enemy", defaultMessage: "Enemy" })
                                    :
                                    intl.formatMessage({ id: "pages.room.player_panel.enemy_sources", defaultMessage: "Enemy's sources" })
                                }
                                sources={enemySources.sources}
                                changes={enemySources.changes}
                                cleanup={memoizedCleanup}
                            />
                            :
                            <Grid
                                container
                                direction="column"
                                justifyContent="center"
                                alignContent="center"
                            >
                                <Typography
                                    variant="h5"
                                    textAlign="end"
                                    sx={{
                                        color: "#fff",
                                        mb: 2
                                    }}
                                >
                                    {intl.formatMessage({ id: "pages.room.player_panel.missing_data", defaultMessage: "No data available" })}
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        navigator.clipboard.writeText(String(window.location).replace("room", "invitation"))

                                        enqueueSnackbar(
                                            intl.formatMessage({ id: "pages.room.invite_link_copied", defaultMessage: "Invite link copied!" }),
                                            {
                                                variant: "success"
                                            }
                                        )
                                    }}
                                    sx={{ backgroundColor: "text.primary" }}
                                >
                                    {intl.formatMessage({ id: "pages.room.player_panel.invite_player", defaultMessage: "Invite Player" })}
                                </Button>
                            </Grid>
                        }
                    </Grid>
                </Grid>
                <Grid
                    data-testid="pages.room.card_panel"
                    container
                    spacing={1}
                    xs={12}
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                    style={{
                        overflow: (smallScreen) ? "auto" : 'hidden',
                    }}
                    sx={{
                        backgroundColor: "background.default",
                        height: 200,
                        m: 0,
                        mt: (smallScreen) ? 0 : 10,
                        mb: (smallScreen) ? "64px" : undefined,
                        p: 0,
                        position: "relative"
                    }}
                >
                    <Backdrop
                        open={!(roomStatus.winner) && !creatingRoom && (playerCards.length != 0) && (onTurn !== sessionStorage.getItem("Token"))}
                        style={{
                            position: "absolute",
                            backgroundColor: theme.palette.background.paper,
                            opacity: 0.9,
                            zIndex: 100
                        }}
                    >
                        <Typography
                            color="text.primary"
                            variant="body1"
                            sx={{
                                backgroundColor: "#000",
                                p: 2,
                                borderRadius: 3,
                                border: "solid 3px",
                                borderColor: "text.primary"
                            }}
                        >
                            {intl.formatMessage({ id: "pages.room.card_panel.waiting_backdrop", defaultMessage: "Spying enemy's moves..." })}
                        </Typography>
                    </Backdrop>
                    {playerCards.map((data) => {
                        const randomSuffix = (Math.random() + 1).toString(36).substring(2)
                        const key = `${data.unit}_${data.price}_${data.item_name}_${randomSuffix}`

                        return (
                            <AntCard
                                { ...data }
                                discardFn={memoizedDiscardCard}
                                playFn={memoizedPlayCard}
                                key={key}
                                disabled={Boolean(mySources.sources && (mySources.sources[data.unit as keyof ISources] < data.price))}
                                scale={(smallScreen) ? 0.75 : undefined}
                            />
                        )
                    })}
                </Grid>
            </Grid>
            {(!creatingRoom) ? null :
                <Loading
                    message={
                        (searchParams.get("creating")) ?
                        intl.formatMessage({ id: "processing_backdrop_message.creating_room", defaultMessage: "Room is creating..." })
                        :
                        intl.formatMessage({ id: "processing_backdrop_message.", defaultMessage: "Connecting to room..." })
                    }
                    sx={{
                        backgroundColor: "background.default",
                        opacity: 0,
                        zIndex: 5
                    }}
                />
            }
            <Snackbar
                open={smallScreen && showStopwatches}
                message={
                    <Grid
                        container
                        direction="row"
                    >
                        <Typography
                            variant="h5"
                            color="text.primary"
                            textAlign="center"
                            sx={{
                                mr: 4
                            }}
                        >
                            <FormattedMessage
                                id="pages.room.battlefield.on_turn"
                                defaultMessage="On turn: {player}"
                                values={{
                                    player: (
                                        (onTurn === sessionStorage.getItem("Token")) ?
                                        intl.formatMessage({ id: "pages.room.battlefield.on_turn.you", defaultMessage: "You" })
                                        :
                                        intl.formatMessage({ id: "pages.room.battlefield.on_turn.enemy", defaultMessage: "Enemy" })
                                    )
                                }}
                            />
                        </Typography>
                        {(showStopwatches) ? <Stopwatches /> : null}
                    </Grid>
                }
                ContentProps={{
                    sx: {
                        background: theme.palette.background.paper,
                        py: 0,
                        pt: 1,
                        mb: "64px",
                        mr: 13
                    }
                }}
            />
            <Snackbar
                open={smallScreen && (Object.keys(discarded).length !== 0)}
                message={
                    <Card
                        data-testid={`ant_card.${discarded.item_name}_used`}
                        sx={{
                            position: "relative",
                            m: 0.5 * 0.5,
                            height: 195 * 0.5,
                            width: 130 * 0.5,
                            cursor: "default",
                            ...getCardStyles(discarded.type as ECardTypes)
                        }}
                    >
                        {(!(discarded as Partial<ICard> & { discarded: boolean }).discarded) ? null :
                            <CardMedia
                                component="span"
                                data-testid={`ant_card.${discarded.item_name}.discarded_label`}
                                sx={{
                                    backgroundColor: "#000",
                                    p: 0.5 * 0.5
                                }}
                                style={{
                                    position: "absolute",
                                    opacity: 0.9,
                                    backgroundColor: theme.palette.background.paper,
                                    height: "100%",
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center"
                                }}
                            >
                                <Typography
                                    color="text.primary"
                                    variant="body1"
                                    sx={{
                                        backgroundColor: "#000",
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        fontSize: `calc(${theme.typography.body1.fontSize} * 0.5)`
                                    }}
                                >
                                    {intl.formatMessage({ id: "ant_card.discarded.label", defaultMessage: "DISCARDED" })}
                                </Typography>
                            </CardMedia>
                        }
                        <CardMedia
                            component="img"
                            data-testid={`ant_card.${discarded.item_name}.avatar`}
                            image={`/cards/${discarded.item_name}.svg`}
                            sx={{
                                p: 0,
                                m: 0,
                                height: "100%",
                                objectFit: "contain"
                            }}
                        />
                    </Card>
                }
                ContentProps={{
                    sx: {
                        background: theme.palette.background.paper,
                        py: 0,
                        pt: 1,
                        mb: "64px",
                        ml: 33
                    }
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            />
        </Paper>
    )
}

export default Room
