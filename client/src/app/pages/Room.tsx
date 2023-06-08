import React, { FC, useEffect, useState } from 'react'
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
    ISources
} from '../../base/utils/Axios/types'
import { AxiosError } from 'axios'
import { useIntl } from "react-intl"
import { useParams } from 'react-router-dom'
import Card from "../components/Card"
import { ICard } from '../../base/utils/Axios/types'
import { usePlayerCards } from '../Providers/PlayerCards'
import { io, Socket } from "socket.io-client"


var socket: Socket

const Room: FC<{}> = () => {
    const { guid } = useParams()
    const intl = useIntl()
    const [myState, setMyState] = useState<IPlayerSourceState[]>([])
    const [enemyState, setEnemyState] = useState<IPlayerSourceState[]>([])
    const {
        playerCards = [],
        setPlayerCards = (data: ICard[]) => {},
        discarded,
        setDiscardedCard = (card: ICard) => {}
    } = usePlayerCards()

    const sourcesNames = {
        "bricks": intl.formatMessage({ id: "sources.bricks", defaultMessage: "Bricks" }),
        "builders": intl.formatMessage({ id: "sources.builders", defaultMessage: "Builders" }),
        "weapons": intl.formatMessage({ id: "sources.weapons", defaultMessage: "Weapons" }),
        "soldiers": intl.formatMessage({ id: "sources.soldiers", defaultMessage: "Soldiers" }),
        "crystals": intl.formatMessage({ id: "sources.crystals", defaultMessage: "Crystal" }),
        "mages": intl.formatMessage({ id: "sources.mages", defaultMessage: "Mages" }),
        "castle": intl.formatMessage({ id: "sources.castle", defaultMessage: "Castle" }),
        "fence": intl.formatMessage({ id: "sources.fence", defaultMessage: "Fence" })
    }

    const createSourcesData = (data: ISources): IPlayerSourceState[] => {
        var sources: IPlayerSourceState[] = []
        const keys = ["bricks", "builders", "weapons", "soldiers", "crystals", "mages", "castle", "fence"]
        
        keys.forEach((k) => {
            sources.push({
                name: sourcesNames[k as keyof typeof sourcesNames],
                unit: k,
                amount: data[k as keyof typeof data]
            })
        })

        return sources
    }

    const {
        refetch: joinRoom
    } = useQuery<IRoomInfoResponse, AxiosError>(
        ["join_room_query"],
        async () => await ApiClient.joinRoom(guid),
        {
            enabled: false,
            onSuccess: (res) => {
                sessionStorage.setItem("Token", res.token)
                setPlayerCards(res.cards)
            }
        }
    )

    const {
        mutate: playCard
    } = useMutation<ITurnResponse, AxiosError, string>({
        mutationFn: async (item_name) => await ApiClient.play(item_name),
        onSuccess: (res: any) => {
            if (res.winner) {
                return socket.emit("winner", res.winner)
            }

            socket.emit("state_update", { discarded: res.discarded, guid: guid })
            setPlayerCards(res.cards)
        }
    })

    const {
        mutate: discardCard
    } = useMutation<ITurnResponse, AxiosError, string>({
        mutationFn: async (item_name) => await ApiClient.discard(item_name),
        onSuccess: (res: any) => {
            setPlayerCards(res.cards)
            socket.emit("discard_update", { discarded: res.discarded, guid: guid })
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

        socket.on("connect", (data: any) => {
            console.log(data)
            const myToken = sessionStorage.getItem("Token")
            const enemyToken = Object.keys(data).filter((k) => k !== sessionStorage.getItem("Token"))[0]
            
            if (data[String(myToken)]) setMyState([ ...createSourcesData(data[String(myToken)] || {}) ])
            if (data[String(enemyToken)]) setEnemyState([ ...createSourcesData(data[String(enemyToken)] || {}) ])
        })

        socket.on("state_update", (data: any) => {
            setDiscardedCard(data.discarded)
            
            const myToken = sessionStorage.getItem("Token")
            const enemyToken = Object.keys(data).filter((k) => k !== sessionStorage.getItem("Token") && k != "discarded")[0]
            
            if (data[String(myToken)]) setMyState([ ...createSourcesData(data[String(myToken)] || {}) ])
            if (data[String(enemyToken)]) setEnemyState([ ...createSourcesData(data[String(enemyToken)] || {}) ])
        })

        socket.on("discard_update", (data: any) => {
            setDiscardedCard(data.discarded)
        })

        socket.on("winner", (data: any) => {
            alert(`Player ${data} wins!`)
            console.log(`Player ${data} wins!`)
        })

        socket.on("disconnect", (data) => {
            console.log(data)
        })

        return function cleanup() {
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
                        <Grid
                            data-testid="pages.room.player_one_panel.sources"
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
                                m: 0,
                                p: 0
                            }}
                        >
                            <Typography
                                variant="h5"
                                textAlign="end"
                                sx={{
                                    color: "#000",
                                    mb: 2
                                }}
                            >
                                Player1
                            </Typography>
                            {
                                myState.map((data) => {
                                    const key = `${data.name}_${data.unit}_${data.amount}.player_one`

                                    return (
                                        <Stack
                                            key={`${key}_stack`}
                                            direction="row"
                                            alignItems="center"
                                            sx={{
                                                width: 150
                                            }}
                                        >
                                            <Avatar
                                                key={`${key}_unit`}
                                                src={`/cards/${data.unit}.svg`}
                                                sx={{
                                                    borderRadius: 0,
                                                    width: 20,
                                                    height: 20
                                                }}
                                            />
                                            <Typography
                                                key={`${key}_name`}
                                                variant="body1"
                                                textAlign="start"
                                                sx={{
                                                    mx: 2,
                                                    color: "#000",
                                                    minWidth: 80
                                                }}
                                            >
                                                {`${data.name}: `}
                                            </Typography>
                                            <Typography
                                                key={`${key}_price`}
                                                variant="body1"
                                                textAlign="end"
                                                sx={{
                                                    color: "#000"
                                                }}
                                            >
                                                {data.amount}
                                            </Typography>
                                        </Stack>
                                    )
                                })
                            }
                        </Grid>
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
                        {(!discarded) ? null : <Card { ...discarded } />}
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
                        <Grid
                            data-testid="pages.room.player_two_panel.sources"
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
                                m: 0,
                                p: 0
                            }}
                        >
                            <Typography
                                variant="h5"
                                textAlign="end"
                                sx={{
                                    color: "#000",
                                    mb: 2
                                }}
                            >
                                Player2
                            </Typography>
                            {
                                (!enemyState)
                                ?
                                <Typography
                                    variant="body1"
                                    textAlign="end"
                                    sx={{
                                        color: "#000",
                                        mb: 2
                                    }}
                                >
                                    Waiting for Player2
                                </Typography>
                                :
                                enemyState.map((data) => {
                                    const key = `${data.name}_${data.unit}_${data.amount}.player_two`

                                    return (
                                        <Stack
                                            key={`${key}_stack`}
                                            direction="row"
                                            alignItems="center"
                                            sx={{
                                                width: 150
                                            }}
                                        >
                                            <Avatar
                                                key={`${key}_unit`}
                                                src={`/cards/${data.unit}.svg`}
                                                sx={{
                                                    borderRadius: 0,
                                                    width: 20,
                                                    height: 20
                                                }}
                                            />
                                            <Typography
                                                key={`${key}_name`}
                                                variant="body1"
                                                textAlign="start"
                                                sx={{
                                                    mx: 2,
                                                    color: "#000",
                                                    minWidth: 80
                                                }}
                                            >
                                                {`${data.name}: `}
                                            </Typography>
                                            <Typography
                                                key={`${key}_amount`}
                                                variant="body1"
                                                textAlign="end"
                                                sx={{
                                                    color: "#000"
                                                }}
                                            >
                                                {data.amount}
                                            </Typography>
                                        </Stack>
                                    )
                                })
                            }
                        </Grid>
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
        </Paper>
    )
}

export default Room