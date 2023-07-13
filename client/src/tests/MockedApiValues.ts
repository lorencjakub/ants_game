import React from "react"
import { ICard, ISources } from "../base/utils/Axios/types"


export const TEST_CARD_WALL: ICard = {
    unit: "bricks",
    price: 1,
    item_name: "wall",
    type: "building",
    message: "fence +3"
}

export const TEST_CARD_TOWER: ICard = {
    unit: "bricks",
    price: 1,
    item_name: "tower",
    type: "building",
    message: "castle +5"
}

export const TEST_CARD_ARCHER: ICard = {
    unit: "weapons",
    price: 1,
    item_name: "archer",
    type: "soldiers",
    message: "attack +2"
}

export const TEST_CARD_SORCERER: ICard = {
    unit: "crystals",
    price: 8,
    item_name: "sorcerer",
    type: "magic",
    message: "mages +1"
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