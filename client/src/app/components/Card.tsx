import React, { FC } from "react"
import {
    Typography,
    Card,
    CardHeader,
    CardMedia,
    CardContent,
    Avatar,
    Backdrop
} from "@mui/material"
import { ICard } from "../../base/utils/Axios/types"
import { useIntl, FormattedMessage } from "react-intl"
import ApiClient from "../../base/utils/Axios/ApiClient"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { cardLabels } from "../config/cardLabels"
import { useTheme } from "@mui/material/styles"


const getCardStyles = (type: ICard["type"]) => {
    switch (type) {
        case "building":
            return { backgroundColor: "#ffe5e5", border: "solid 3px red" }

        case "soldiers":
            return { backgroundColor: "#d0f0c0", border: "solid 3px green" }

        case "magic":
            return { backgroundColor: "#afdbf5", border: "solid 3px blue" }

        default:
            return { backgroundColor: "#faba5f", border: "solid 3px #ff5733" }

    }
}

export interface IInteractiveCard extends Partial<ICard> {
    discardFn?: (itemName: string) => void,
    playFn?: (itemName: string) => void,
    key: string,
    sx?: any,
    discarded?: boolean,
    disabled?: boolean
}

const AntCard: FC<Partial<IInteractiveCard>> = ({
    unit,
    price,
    item_name = "deck",
    type = "deck",
    discardFn,
    playFn,
    sx = {},
    discarded = false,
    disabled = false
}) => {
    const theme = useTheme()
    const intl = useIntl()

    const handleCardRightClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        discardFn && discardFn(item_name)
    }

    return (
        <Card
            onClick={(disabled) ? () => {} : () => playFn && playFn(item_name)}
            onContextMenu={handleCardRightClick}
            data-testid={`ant_card.${item_name}`}
            sx={{
                position: "relative",
                m: 0.5,
                height: 195,
                width: 130,
                cursor: (playFn && discardFn) ? "pointer" : "default",
                ...getCardStyles(type),
                ...sx
            }}
        >
            {(!discarded) ? null :
                <CardMedia
                    component="span"
                    data-testid={`ant_card.${item_name}.discarded_label`}
                    sx={{
                        backgroundColor: "#000",
                        p: 0.5
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
                            justifyContent: "center"
                        }}
                    >
                        {intl.formatMessage({ id: "ant_card.discarded.label", defaultMessage: "DISCARDED" })}
                    </Typography>
                </CardMedia>
            }
            {(!disabled) ? null :
                <CardMedia
                    component="span"
                    data-testid={`ant_card.${item_name}.disabled`}
                    sx={{
                        backgroundColor: "#000",
                        p: 0.5,
                        cursor: "default"
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
                />
            }
            {
                (!unit || !price || !cardLabels[item_name as keyof typeof cardLabels]) ? null :
                <React.Fragment>
                    <CardHeader
                        avatar={
                            <Avatar
                                src={`/cards/${unit}.svg`}
                                sx={{
                                    borderRadius: 0,
                                    width: 20,
                                    height: 20
                                }}
                                data-testid={`ant_card.${item_name}.unit`}
                            />
                        }
                        action={
                            <Typography
                                variant="body1"
                                textAlign="center"
                                data-testid={`ant_card.${item_name}.price`}
                                sx={{
                                    mr: 1,
                                    mt: 0.25,
                                    color: "#000"
                                }}
                            >
                                {price}
                            </Typography>
                        }
                        sx={{
                            p: 1,
                            m: 0
                        }}
                    />
                    <Typography
                        variant="body2" 
                        textAlign="center"
                        sx={{
                            p: 0,
                            m: 0,
                            mb: 1,
                            color: "#000"
                        }}
                        data-testid={`ant_card.${item_name}.name`}
                    >
                        {cardLabels[item_name as keyof typeof cardLabels].cardName || ""}
                    </Typography>
                </React.Fragment>
            }
            <CardMedia
                component="img"
                data-testid={`ant_card.${item_name}.avatar`}
                image={`/cards/${item_name}.svg`}
                sx={{
                    p: (item_name == "deck") ? 3 : 0,
                    m: 0,
                    maxHeight: (item_name == "deck") ? undefined : 60,
                    height: (item_name == "deck") ? 195 : undefined,
                    objectFit: "contain"
                }}
            />
            {
                (!cardLabels[item_name as keyof typeof cardLabels]) ? null :
                <CardContent>
                    <Typography
                        data-testid="ant_card.description"
                        variant="body2" 
                        textAlign="center"
                        sx={{
                            p: 0,
                            m: 0,
                            fontSize: 11,
                            color: "#000"
                        }}
                    >
                        {cardLabels[item_name as keyof typeof cardLabels].message || ""}
                    </Typography>
                </CardContent>
            }
        </Card>
    )
}

export default AntCard