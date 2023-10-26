import { IRoomStatus, IPlayerState } from "./types"
import { FormattedMessage } from "react-intl"
import { ISources } from "../../base/utils/Axios/types"


const initRoomStatus: IRoomStatus = {
    active: true,
    winner: undefined,
    message: <FormattedMessage id="processing_backdrop_message.locked_room" defaultMessage="This room is locked and inactive" />
}

const roomStatusReducer = (data: Partial<IRoomStatus>, action: Partial<IRoomStatus>) => {
    return { ...data, ...action }
}

const initState: IPlayerState = { sources: null, changes: {} }

const getSourceChanges = (prevProps: ISources | null, nextProps: ISources | null) => {
    var changes: Partial<ISources> = {}

    if (!prevProps || !nextProps) return {}

    Object.keys(prevProps as ISources).forEach((source) => {
        const s = source as keyof ISources
        const prevSources = prevProps as ISources
        const nextSources = nextProps as ISources

        if (prevSources[s] != nextSources[s]) {
            changes[s] = nextSources[s] - prevSources[s]
        }
    })

    return changes
}

const playerSourcesReducer = (state: IPlayerState, newState: { data?: ISources, cleanup?: boolean }): IPlayerState => {
    const { data = state.sources, cleanup } = newState

    if (!state || !data) return { ...initState }

    const changes = getSourceChanges(state.sources, data)

    return {
        sources: data,
        changes: (cleanup) ? {} : (Object.keys(changes).length == 0) ? state.changes : changes
    }
}

export {
    initRoomStatus,
    initState,
    roomStatusReducer,
    getSourceChanges,
    playerSourcesReducer
}