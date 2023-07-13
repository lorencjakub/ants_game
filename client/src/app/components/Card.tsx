import React, { FC } from "react"
import {
    Typography,
    Card,
    CardHeader,
    CardMedia,
    CardContent,
    Avatar
} from "@mui/material"
import { ICard } from "../../base/utils/Axios/types"
import { useIntl, FormattedMessage } from "react-intl"
import ApiClient from "../../base/utils/Axios/ApiClient"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"


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

export interface IInteractiveCard extends ICard {
    discardFn?: (itemName: string) => void,
    playFn?: (itemName: string) => void,
    key?: string
}

const AntCard: FC<IInteractiveCard> = ({ unit, price, item_name = "deck", type, discardFn = (itemName: string) => {}, playFn = (itemName: string) => {}, key }) => {
    const intl = useIntl()

    const cardLabels: { [itemName: string] : ICard } = {
        "wall": {
            cardName: intl.formatMessage({ id: "cards.wall.name", defaultMessage: "Wall" }),
            message: <FormattedMessage id="cards.fence" defaultMessage="fence +{value}" values={{ value: 3 }} />
        },
        "defense": {
            cardName: intl.formatMessage({ id: "cards.defense.name", defaultMessage: "Defense" }),
            message: <FormattedMessage id="cards.fence" defaultMessage="fence +{value}" values={{ value: 6 }} />
        },
        "school": {
            cardName: intl.formatMessage({ id: "cards.school.name", defaultMessage: "School" }),
            message: intl.formatMessage({ id: "cards.school.message", defaultMessage: "builders +1" })
        },
        "base": {
            cardName: intl.formatMessage({ id: "cards.base.name", defaultMessage: "Base" }),
            message: <FormattedMessage id="cards.castle" defaultMessage="castle +{value}" values={{ value: 2 }} />
        },
        "reserve": {
            cardName: intl.formatMessage({ id: "cards.reserve.name", defaultMessage: "Reserve" }),
            message: intl.formatMessage({ id: "cards.reserve.message", defaultMessage: "castle +8, fence -4" })
        },
        "fence": {
            cardName: intl.formatMessage({ id: "cards.fence.name", defaultMessage: "Fence" }),
            message: <FormattedMessage id="cards.fence" defaultMessage="fence +{value}" values={{ value: 22 }} />
        },
        "wain": {
            cardName: intl.formatMessage({ id: "cards.wain.name", defaultMessage: "Wain" }),
            message: intl.formatMessage({ id: "cards.wain.message", defaultMessage: "castle +8, enemy castle -4" })
        },
        "tower": {
            cardName: intl.formatMessage({ id: "cards.tower.name", defaultMessage: "Tower" }),
            message: <FormattedMessage id="cards.castle" defaultMessage="castle +{value}" values={{ value: 5 }} />
        },
        "babel": {
            cardName: intl.formatMessage({ id: "cards.babel.name", defaultMessage: "Babel" }),
            message: <FormattedMessage id="cards.castle" defaultMessage="castle +{value}" values={{ value: 32 }} />
        },
        "fort": {
            cardName: intl.formatMessage({ id: "cards.fort.name", defaultMessage: "Fort" }),
            message: <FormattedMessage id="cards.castle" defaultMessage="castle +{value}" values={{ value: 20 }} />
        },
        "rider": {
            cardName: intl.formatMessage({ id: "cards.rider.name", defaultMessage: "Rider" }),
            message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 4 }} />
        },
        "banshee": {
            cardName: intl.formatMessage({ id: "cards.banshee.name", defaultMessage: "Banshee" }),
            message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 32 }} />
        },
        "saboteur": {
            cardName: intl.formatMessage({ id: "cards.saboteur.name", defaultMessage: "Saboteur" }),
            message: intl.formatMessage({ id: "cards.saboteur.message", defaultMessage: "enemy stocks -4" })
        },
        "archer": {
            cardName: intl.formatMessage({ id: "cards.archer.name", defaultMessage: "Archer" }),
            message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 2 }} />
        },
        "knight": {
            cardName: intl.formatMessage({ id: "cards.knight.name", defaultMessage: "Knight" }),
            message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 3 }} />
        },
        "platoon": {
            cardName: intl.formatMessage({ id: "cards.platoon.name", defaultMessage: "Platoon" }),
            message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 6 }} />
        },
        "thief": {
            cardName: intl.formatMessage({ id: "cards.thief.name", defaultMessage: "Thief" }),
            message: intl.formatMessage({ id: "cards.thief.message", defaultMessage: "transfer enemy stock 5" })
        },
        "recruit": {
            cardName: intl.formatMessage({ id: "cards.recruit.name", defaultMessage: "Recruit" }),
            message: intl.formatMessage({ id: "cards.recruit.message", defaultMessage: "soldiers +1" })
        },
        "attack": {
            cardName: intl.formatMessage({ id: "cards.attack.name", defaultMessage: "Attack" }),
            message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 12 }} />
        },
        "swat": {
            cardName: intl.formatMessage({ id: "cards.swat.name", defaultMessage: "SWAT" }),
            message: intl.formatMessage({ id: "cards.swat.message", defaultMessage: "enemy castle -10" })
        },
        "curse": {
            cardName: intl.formatMessage({ id: "cards.curse.name", defaultMessage: "Curse" }),
            message: intl.formatMessage({ id: "cards.curse.message", defaultMessage: "all +1, enemies all -1" })
        },
        "conjure_crystals": {
            cardName: intl.formatMessage({ id: "cards.conjure_crystals.name", defaultMessage: "Conjure Crystals" }),
            message: intl.formatMessage({ id: "cards.conjure_crystals.message", defaultMessage: "crystals +8" })
        },
        "conjure_weapons": {
            cardName: intl.formatMessage({ id: "cards.conjure_weapons.name", defaultMessage: "Conjure Weapons" }),
            message: intl.formatMessage({ id: "cards.conjure_weapons.message", defaultMessage: "weapons +8" })
        },
        "conjure_bricks": {
            cardName: intl.formatMessage({ id: "cards.conjure_bricks.name", defaultMessage: "Conjure Bricks" }),
            message: intl.formatMessage({ id: "cards.conjure_bricks.message", defaultMessage: "bricks +8" })
        },
        "crush_weapons": {
            cardName: intl.formatMessage({ id: "cards.crush_weapons.name", defaultMessage: "Crush Weapons" }),
            message: intl.formatMessage({ id: "cards.crush_weapons.message", defaultMessage: "enemy weapons -8" })
        },
        "crush_crystals": {
            cardName: intl.formatMessage({ id: "cards.crush_crystals.name", defaultMessage: "Crush Crystals" }),
            message: intl.formatMessage({ id: "cards.crush_crystals.message", defaultMessage: "enemies crystals -8" })
        },
        "crush_bricks": {
            cardName: intl.formatMessage({ id: "cards.crush_bricks.name", defaultMessage: "Crush Bricks" }),
            message: intl.formatMessage({ id: "cards.crush_bricks.message", defaultMessage: "enemies bricks -8" })
        },
        "dragon": {
            cardName: intl.formatMessage({ id: "cards.dragon.name", defaultMessage: "Dragon" }),
            message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 25 }} />
        },
        "pixies": {
            cardName: intl.formatMessage({ id: "cards.pixies.name", defaultMessage: "Pixies" }),
            message: <FormattedMessage id="cards.castle" defaultMessage="castle +{value}" values={{ value: 22 }} />
        },
        "sorcerer": {
            cardName: intl.formatMessage({ id: "cards.sorcerer.name", defaultMessage: "Sorcerer" }),
            message: intl.formatMessage({ id: "cards.sorcerer.message", defaultMessage: "mages +1" })
        }
    }

    const handleCardRightClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault()
        discardFn(item_name)
    }

    return (
        <Card
            onClick={() => playFn(item_name)}
            onContextMenu={handleCardRightClick}
            sx={{
                m: 0.5,
                height: 195,
                width: 130,
                cursor: "pointer",
                ...getCardStyles(type)
            }}
        >
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
                            />
                        }
                        action={
                            <Typography
                                variant="body1"
                                textAlign="center"
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
                    >
                        {cardLabels[item_name as keyof typeof cardLabels].cardName || ""}
                    </Typography>
                </React.Fragment>
            }
            <CardMedia
                component="img"
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