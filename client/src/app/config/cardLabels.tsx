import { FormattedMessage } from "react-intl"
import { ICard } from "../../base/utils/Axios/types"


const cardLabels: { [itemName: string] : Partial<ICard> } = {
    wall: {
        cardName: <FormattedMessage id="cards.wall.name" defaultMessage="Wall" />,
        message: <FormattedMessage id="cards.fence" defaultMessage="fence +{value}" values={{ value: 3 }} />
    },
    defense: {
        cardName: <FormattedMessage id="cards.defense.name" defaultMessage="Defense" />,
        message: <FormattedMessage id="cards.fence" defaultMessage="fence +{value}" values={{ value: 6 }} />
    },
    school: {
        cardName: <FormattedMessage id="cards.school.name" defaultMessage="School" />,
        message: <FormattedMessage id="cards.school.message" defaultMessage="builders +1" />
    },
    base: {
        cardName: <FormattedMessage id="cards.base.name" defaultMessage="Base" />,
        message: <FormattedMessage id="cards.castle" defaultMessage="castle +{value}" values={{ value: 2 }} />
    },
    reserve: {
        cardName: <FormattedMessage id="cards.reserve.name" defaultMessage="Reserve" />,
        message: <FormattedMessage id="cards.reserve.message" defaultMessage="castle +8, fence -4" />
    },
    fence: {
        cardName: <FormattedMessage id="cards.fence.name" defaultMessage="Fence" />,
        message: <FormattedMessage id="cards.fence" defaultMessage="fence +{value}" values={{ value: 22 }} />
    },
    wain: {
        cardName: <FormattedMessage id="cards.wain.name" defaultMessage="Wain" />,
        message: <FormattedMessage id="cards.wain.message" defaultMessage="castle +8, enemy castle -4" />
    },
    tower: {
        cardName: <FormattedMessage id="cards.tower.name" defaultMessage="Tower" />,
        message: <FormattedMessage id="cards.castle" defaultMessage="castle +{value}" values={{ value: 5 }} />
    },
    babel: {
        cardName: <FormattedMessage id="cards.babel.name" defaultMessage="Babel" />,
        message: <FormattedMessage id="cards.castle" defaultMessage="castle +{value}" values={{ value: 32 }} />
    },
    fort: {
        cardName: <FormattedMessage id="cards.fort.name" defaultMessage="Fort" />,
        message: <FormattedMessage id="cards.castle" defaultMessage="castle +{value}" values={{ value: 20 }} />
    },
    rider: {
        cardName: <FormattedMessage id="cards.rider.name" defaultMessage="Rider" />,
        message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 4 }} />
    },
    banshee: {
        cardName: <FormattedMessage id="cards.banshee.name" defaultMessage="Banshee" />,
        message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 32 }} />
    },
    saboteur: {
        cardName: <FormattedMessage id="cards.saboteur.name" defaultMessage="Saboteur" />,
        message: <FormattedMessage id="cards.saboteur.message" defaultMessage="enemy stocks -4" />
    },
    archer: {
        cardName: <FormattedMessage id="cards.archer.name" defaultMessage="Archer" />,
        message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 2 }} />
    },
    knight: {
        cardName: <FormattedMessage id="cards.knight.name" defaultMessage="Knight" />,
        message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 3 }} />
    },
    platoon: {
        cardName: <FormattedMessage id="cards.platoon.name" defaultMessage="Platoon" />,
        message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 6 }} />
    },
    thief: {
        cardName: <FormattedMessage id="cards.thief.name" defaultMessage="Thief" />,
        message: <FormattedMessage id="cards.thief.message" defaultMessage="transfer enemy stock 5" />
    },
    recruit: {
        cardName: <FormattedMessage id="cards.recruit.name" defaultMessage="Recruit" />,
        message: <FormattedMessage id="cards.recruit.message" defaultMessage="soldiers +1" />
    },
    attack: {
        cardName: <FormattedMessage id="cards.attack.name" defaultMessage="Attack" />,
        message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 12 }} />
    },
    swat: {
        cardName: <FormattedMessage id="cards.swat.name" defaultMessage="SWAT" />,
        message: <FormattedMessage id="cards.swat.message" defaultMessage="enemy castle -10" />
    },
    curse: {
        cardName: <FormattedMessage id="cards.curse.name" defaultMessage="Curse" />,
        message: <FormattedMessage id="cards.curse.message" defaultMessage="all +1, enemies all -1" />
    },
    conjure_crystals: {
        cardName: <FormattedMessage id="cards.conjure_crystals.name" defaultMessage="Conjure Crystals" />,
        message: <FormattedMessage id="cards.conjure_crystals.message" defaultMessage="crystals +8" />
    },
    conjure_weapons: {
        cardName: <FormattedMessage id="cards.conjure_weapons.name" defaultMessage="Conjure Weapons" />,
        message: <FormattedMessage id="cards.conjure_weapons.message" defaultMessage="weapons +8" />
    },
    conjure_bricks: {
        cardName: <FormattedMessage id="cards.conjure_bricks.name" defaultMessage="Conjure Bricks" />,
        message: <FormattedMessage id="cards.conjure_bricks.message" defaultMessage="bricks +8" />
    },
    crush_weapons: {
        cardName: <FormattedMessage id="cards.crush_weapons.name" defaultMessage="Crush Weapons" />,
        message: <FormattedMessage id="cards.crush_weapons.message" defaultMessage="enemy weapons -8" />
    },
    crush_crystals: {
        cardName: <FormattedMessage id="cards.crush_crystals.name" defaultMessage="Crush Crystals" />,
        message: <FormattedMessage id="cards.crush_crystals.message" defaultMessage="enemies crystals -8" />
    },
    crush_bricks: {
        cardName: <FormattedMessage id="cards.crush_bricks.name" defaultMessage="Crush Bricks" />,
        message: <FormattedMessage id="cards.crush_bricks.message" defaultMessage="enemies bricks -8" />
    },
    dragon: {
        cardName: <FormattedMessage id="cards.dragon.name" defaultMessage="Dragon" />,
        message: <FormattedMessage id="cards.attack" defaultMessage="attack {value}" values={{ value: 25 }} />
    },
    pixies: {
        cardName: <FormattedMessage id="cards.pixies.name" defaultMessage="Pixies" />,
        message: <FormattedMessage id="cards.castle" defaultMessage="castle +{value}" values={{ value: 22 }} />
    },
    sorcerer: {
        cardName: <FormattedMessage id="cards.sorcerer.name" defaultMessage="Sorcerer" />,
        message: <FormattedMessage id="cards.sorcerer.message" defaultMessage="mages +1" />
    }
}

export { cardLabels }