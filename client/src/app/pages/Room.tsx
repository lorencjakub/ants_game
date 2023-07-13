import React, { FC, useEffect, useState, useReducer } from 'react'
import {
    Button,
    Paper,
    Typography,
    Grid,
    Stack,
    Avatar
} from "@mui/material"
import { useQuery, useMutation } from '@tanstack/react-query'
import ApiClient from '../../base/utils/Axios/ApiClient'
import {
    IRoomInfoResponse,
    ITurnResponse,
    IPlayerSourceState,
    ISources,
    IWinTurnResponse
} from '../../base/utils/Axios/types'
import { AxiosError } from 'axios'
import { useIntl, FormattedMessage } from "react-intl"
import { useParams } from 'react-router-dom'
import Card from "../components/Card"
import { ICard } from '../../base/utils/Axios/types'
import { usePlayerCards } from '../Providers/PlayerCards'
import { io, Socket } from "socket.io-client"
import Sources from '../components/Sources'
import Loading from '../../base/components/Loading'
import { EventNames } from '../../base/utils/SocketIO/eventNames'


export interface IRoomStatus {
    active: boolean,
    winner?: string
}

const initRoomStatus: IRoomStatus = {
    active: true,
    winner: undefined
}

const roomStatusReducer = (data: IRoomStatus, action: IRoomStatus) => {
    return { ...data, ...action }
}

var socket: Socket

const Room: FC<{}> = () => {
    const { guid } = useParams()
    const intl = useIntl()
    const [myState, setMyState] = useState<ISources | null>(null)
    const [enemyState, setEnemyState] = useState<ISources | null>(null)
    const [roomStatus, setRoomStatus] = useReducer<(data: IRoomStatus, action: IRoomStatus) => IRoomStatus>(roomStatusReducer, initRoomStatus)    //TODO dopsat onError setnutí na true
    const {
        playerCards = [],
        setPlayerCards = (data: ICard[], eventName: string) => {},
        discarded = {},
        setDiscardedCard = (card: ICard) => {}
    } = usePlayerCards()

    const {
        refetch: joinRoom,
		isFetching: collectingRoomData
    } = useQuery<IRoomInfoResponse, AxiosError>(
        ["join_room_query"],
        async () => await ApiClient.joinRoom(guid),
        {
            enabled: false,
            retry: 0,
            onSuccess: (res) => {
                sessionStorage.setItem("Token", res.token)
                setPlayerCards(res.cards, "joinRoom")
            },
            onError: (e) => {
                const errData: any = e?.response?.data
                if (errData && errData.message && (errData.message == "Room is not active anymore")) setRoomStatus({ active: false })
            }
        }
    )

    const {
        mutate: playCard
    } = useMutation<ITurnResponse | IWinTurnResponse, AxiosError, string>({
        mutationFn: async (item_name) => await ApiClient.play(item_name),
        onSuccess: (res: any) => {
            if (res.winner) {
                socket.emit(EventNames.SERVER_WINNER, res.winner)
                setRoomStatus({ active: false, winner: res.winner })
                return 
            }

            socket.emit(EventNames.SERVER_STATE_UPDATE, { discarded: res.discarded, guid: guid, action: "play" })
            setPlayerCards(res.cards, "playCard")
        }
    })

    const {
        mutate: discardCard
    } = useMutation<ITurnResponse, AxiosError, string>({
        mutationFn: async (item_name) => await ApiClient.discard(item_name),
        onSuccess: (res: any) => {
            setPlayerCards(res.cards, "discardCard")
            socket.emit(EventNames.SERVER_STATE_UPDATE, { discarded: res.discarded, guid: guid, action: "discard" })
        }
    })

    useEffect(() => {        
        joinRoom()

        socket = io(
            String(process.env.API_BASE_URL),
            {
                transports: ["websocket"],
                query: { guid: guid }
            }
        )

        socket.on(EventNames.ENTER_ROOM, (data: { [playerToken: string]: ISources }) => {
            if (!sessionStorage.getItem("Token")) return
            const myToken = sessionStorage.getItem("Token")
            const enemyToken = Object.keys(data).filter((k) => k !== sessionStorage.getItem("Token") && k != "data")[0]

            if (data[String(myToken)]) setMyState(data[String(myToken)])
            if (data[String(enemyToken)]) setEnemyState(data[String(enemyToken)])
        })

        socket.on(EventNames.CLIENT_STATE_UPDATE, (data: any) => {
            if (!sessionStorage.getItem("Token")) return
            if ((Object.keys(data).length == 1) && (Object.keys(data)[0] == "discarded")) return setDiscardedCard(data.discarded)
            
            const myToken = sessionStorage.getItem("Token")
            const enemyToken = Object.keys(data).filter((k) => k !== sessionStorage.getItem("Token") && k != "discarded")[0]
            
            if (data[String(myToken)]) setMyState(data[String(myToken)])
            if (data[String(enemyToken)]) setEnemyState(data[String(enemyToken)])
        })

        socket.on(EventNames.CLIENT_WINNER, (token: any) => {
            alert(`Player ${token} wins!`)
            console.log(`Player ${token} wins!`)
        })

        socket.on(EventNames.DISCONNECT, (data) => {
            console.log(data)
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    return (
        <Paper
            elevation={0}
            sx={{ m: 2, p: 2 }}
        >
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
                    backgroundColor: "background.default"
                }}
            >
                <Grid
                    data-testid="pages.room.main_panel"
                    container
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                    style={{
                        display: 'flex',
                        overflow: 'hidden'
                    }}
                    sx={{
                        backgroundColor: "green",
                        minHeight: 300,
                        m: 0,
                        p: 0
                    }}
                >
                    <Grid
                        data-testid="pages.room.player_one_panel"
                        item
                        xs={4}
                        justifyContent="center"
                        alignItems="center"
                        style={{
                            display: 'flex',
                            overflow: 'hidden'
                        }}
                        sx={{
                            backgroundColor: "#fff",
                            minHeight: 300,
                            m: 0,
                            p: 0
                        }}
                    >
                        {
                            (myState) ?
                            <Sources player="Player1" sources={myState} />
                            :
                            <Typography
                                variant="h4"
                                textAlign="end"
                                sx={{
                                    color: "#000",
                                    mb: 2
                                }}
                            >
                                {intl.formatMessage({ id: "pages.room.player_panel.missing_data", defaultMessage: "No data available" })}
                            </Typography>
                        }
                    </Grid>
                    <Grid
                        data-testid="pages.room.battlefield"
                        item
                        xs={4}
                        justifyContent="center"
                        alignItems="center"
                        style={{
                            display: 'flex',
                            overflow: 'hidden'
                        }}
                        sx={{
                            backgroundColor: "red",
                            minHeight: 300,
                            m: 0,
                            p: 0
                        }}
                    >
                        <Card />
                        {(Object.keys(discarded).length === 0) ? null : <Card { ...discarded } />}
                    </Grid>
                    <Grid
                        data-testid="pages.room.player_two_panel"
                        item
                        xs={4}
                        justifyContent="center"
                        alignItems="center"
                        style={{
                            display: 'flex',
                            overflow: 'hidden'
                        }}
                        sx={{
                            backgroundColor: "blue",
                            minHeight: 300,
                            m: 0,
                            p: 0
                        }}
                    >
                        {
                            (enemyState) ?
                            <Sources player="Player2" sources={enemyState} />
                            :
                            <Typography
                                variant="h4"
                                textAlign="end"
                                sx={{
                                    color: "#000",
                                    mb: 2
                                }}
                            >
                                {intl.formatMessage({ id: "pages.room.player_panel.missing_data", defaultMessage: "No data available" })}
                            </Typography>
                        }
                    </Grid>
                </Grid>
                <Grid
                    data-testid="pages.room.card_panel"
                    container
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                    style={{
                        display: 'flex',
                        overflow: 'hidden'
                    }}
                    sx={{
                        backgroundColor: "background.default",
                        height: 200,
                        m: 0,
                        p: 0
                    }}
                >

                    {playerCards.map((data) => {
                        const randomSuffix = (Math.random() + 1).toString(36).substring(2)
                        const key = `${data.unit}_${data.price}_${data.item_name}_${randomSuffix}`

                        return <Card { ...data } discardFn={discardCard} playFn={playCard} key={key} />
                    })}
                </Grid>
            </Grid>
{/*             {(myState && !collectingRoomData) ? null :
                <Loading
                    message={intl.formatMessage({ id: "processing_backdrop_message.loading_data", defaultMessage: "Loading data..." })}
                    sx={{
                        backgroundColor: "background.default",
                        opacity: 0,
                        zIndex: 5
                    }}
                />
            } */}
            {(roomStatus.active) ? null :
                <Loading
                    spinner={<FormattedMessage id="processing_backdrop_message.locked_room" defaultMessage="This room is locked and inactive" />}
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

export default Room
