import { ICard } from "../../base/utils/Axios/types"


interface IInteractiveCard extends Partial<ICard> {
    discardFn?: (itemName: string) => void,
    playFn?: (itemName: string) => void,
    key: string,
    sx?: any,
    discarded?: boolean,
    disabled?: boolean
}

type TIncomingMessage = { time: string, message: string, player: string }

export {
    type IInteractiveCard,
    type TIncomingMessage
}