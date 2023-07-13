import React, { FC, useState, useEffect } from "react"
import {
    Typography,
    Grid,
    Stack,
    Avatar
} from "@mui/material"
import { ISources, IPlayerSourceState } from "../../base/utils/Axios/types"
import { useIntl, FormattedMessage } from "react-intl"


const Sources: FC<{ sources: ISources | null, player: string }> = ({ sources, player }) => {
    const intl = useIntl()
    const [sourcesData, setSourcesData] = useState<IPlayerSourceState[]>([])

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

    const createSourcesData = (data: ISources | null): IPlayerSourceState[] => {
        if (!data) return []

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

    useEffect(() => {
        setSourcesData(createSourcesData(sources))
    }, [sources])

    return (
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
                {player}
            </Typography>
            {
                sourcesData.map((data) => {
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
    )
}

export default Sources