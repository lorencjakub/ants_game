import { ReactJSXElement } from "@emotion/react/types/jsx-namespace"


export interface IRoomInfoResponse {
    room: string,
    token: string
}

export type TSocketJoinRoomResponse = {
    token: string,
    cards: ICard[],
    on_turn: string
} & {
    [playerToken: string]: ISources
}

export enum ECardTypes {
    BUILDING = "building",
    SOLDIERS = "soldiers",
    MAGIC = "magic",
    DECK = "deck"
}

export enum EUnits {
    BRICKS = "bricks",
    WEAPONS = "weapons",
    CRYSTALS = "crystals"
}

export interface ICard {
    unit: EUnits,
    price: number,
    item_name: string,
    cardName: string | ReactJSXElement,
    message: string | ReactJSXElement,
    type: ECardTypes
}

export interface ISources {
    bricks: number,
    weapons: number,
    crystals: number,
    builders: number,
    soldiers: number,
    mages: number,
    fence: number,
    castle: number
}

export interface ITurnResponse {
    cards: ICard[],
    discarded: ICard
}

export interface IWinTurnResponse {
    winner: string
}

export interface IPlayerSourceState {
    name: string,
    amount: number,
    unit: string
}