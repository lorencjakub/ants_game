import React from "react"
import { ICard, ISources } from "../base/utils/Axios/types"
import { ECardTypes, EUnits } from "../base/utils/Axios/types"


export const TEST_CARD_WALL: ICard = {
    unit: EUnits.BRICKS,
    price: 1,
    item_name: "wall",
    type: ECardTypes.BUILDING,
    message: "fence +3",
    cardName: "Wall"
}

export const TEST_CARD_TOWER: ICard = {
    unit: EUnits.BRICKS,
    price: 1,
    item_name: "tower",
    type: ECardTypes.BUILDING,
    message: "castle +5",
    cardName: "Tower"
}

export const TEST_CARD_ARCHER: ICard = {
    unit: EUnits.WEAPONS,
    price: 1,
    item_name: "archer",
    type: ECardTypes.SOLDIERS,
    message: "attack +2",
    cardName: "Archer"
}

export const TEST_CARD_SORCERER: ICard = {
    unit: EUnits.WEAPONS,
    price: 8,
    item_name: "sorcerer",
    type: ECardTypes.MAGIC,
    message: "mages +1",
    cardName: "Sorcerer"
}

export const TEST_SOURCES: ISources = {
    bricks: 5,
    builders: 2,
    castle: 30,
    crystals: 5,
    fence: 10,
    mages: 2,
    soldiers: 2,
    weapons: 5
}