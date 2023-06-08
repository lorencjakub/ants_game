export interface IRoomInfoResponse {
    room: string,
    token: string,
    cards: ICard[]
}

export interface ICard {
    unit?: "bricks" | "weapons" | "crystals",
    price?: number,
    item_name?: string,
    cardName?: string,
    message?: string | JSX.Element,
    type?: "building" | "soldiers" | "magic" | "deck"
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
    discarder: ICard,
    state: {
        [token: string]: ISources
    }
}

export interface IPlayerSourceState {
    name: string,
    amount: number,
    unit: string
}