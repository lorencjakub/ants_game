import { ReactJSXElement } from '@emotion/react/types/jsx-namespace'
import { ISources } from '../../base/utils/Axios/types'


interface IRoomStatus {
    active: boolean,
    winner?: string,
    message?: string | ReactJSXElement
}

interface IPlayerState {
    sources: ISources | null,
    changes: Partial<ISources>
}

export {
    type IRoomStatus,
    type IPlayerState
}