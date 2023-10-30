import React, { FC } from "react"
import {
    Typography,
    Card,
    CardHeader,
    CardMedia,
    CardContent,
    Avatar,
    useMediaQuery
} from "@mui/material"
import { useIntl } from "react-intl"
import { cardLabels } from "../config/cardLabels"
import { useTheme } from "@mui/material/styles"
import { IInteractiveCard } from "./types"
import { getCardStyles } from "./functions"


const AntCard: FC<Partial<IInteractiveCard>> = ({
    unit,
    price,
    item_name = "deck",
    type = "deck",
    discardFn,
    playFn,
    sx = {},
    discarded = false,
    disabled = false,
    scale = 1
}) => {
    const theme = useTheme()
    const intl = useIntl()
    const smallScreen = useMediaQuery(theme.breakpoints.down("md"))

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
                m: 0.5 * scale,
                height: 195 * scale,
                width: 130 * scale,
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
                        p: 0.5 * scale
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
                            fontSize: `calc(${theme.typography.body1.fontSize} * ${scale}`
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
                        p: 0.5 * scale,
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
                                    width: 20 * scale,
                                    height: 20 * scale
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
                                    mr: 1 * scale,
                                    mt: (smallScreen) ? 0 : 0.25 * scale,
                                    color: "#000",
                                    fontSize: `calc(${theme.typography.body1.fontSize} * ${scale}`
                                }}
                            >
                                {price}
                            </Typography>
                        }
                        sx={{
                            p: 1 * scale,
                            m: 0
                        }}
                    />
                    <Typography
                        variant="body2" 
                        textAlign="center"
                        sx={{
                            p: (smallScreen) ? 0.5 : 0,
                            m: 0,
                            mb: (smallScreen) ? 0 : 1,
                            color: "#000",
                            fontSize: `calc(${theme.typography.body2.fontSize} * ${scale}`
                        }}
                        data-testid={`ant_card.${item_name}.name`}
                        noWrap={smallScreen}
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
                    p: (item_name == "deck") ? 3 * scale : 0,
                    m: 0,
                    maxHeight: (item_name == "deck") ? undefined : 60 * scale,
                    height: (item_name == "deck") ? 195 * scale : undefined,
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
                            pb: (smallScreen) ? 1 : 0,
                            m: 0,
                            color: "#000",
                            fontSize: `calc(${theme.typography.body2.fontSize} * ${scale}`
                        }}
                    >
                        {cardLabels[item_name as keyof typeof cardLabels].message || ""}
                    </Typography>
                </CardContent>
            }
        </Card>
    )
}

export { AntCard }