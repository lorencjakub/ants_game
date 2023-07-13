import axios, { AxiosInstance } from "axios"
import {
    IRoomInfoResponse,
    ITurnResponse
} from "./types"


const apiClient = (): AxiosInstance => axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 60000,
    headers: {
        "Content-Type": "application/json",
        "CorsTrigger": "cors",
        "Token": sessionStorage.getItem("Token")
    },
    transformResponse: [(data) => {
        if (data) return JSON.parse(data)
    }]
})


const createRoom = async (): Promise<IRoomInfoResponse> => {
    const response = await apiClient().get<IRoomInfoResponse>("/create_room")
    return response.data
}

const joinRoom = async (guid?: string): Promise<IRoomInfoResponse> => {
    if (!guid) throw { response: { data: { message: "invalid_room" } } }

    const response = await apiClient().get<IRoomInfoResponse>(`/join_room/${guid}`)
    return response.data
}

const leaveRoom = async (): Promise<{}> => {
    const response = await apiClient().get<{}>("leave_room")
    return response.data
}

const lockRoom = async (guid: string): Promise<any> => {
    if (!guid) throw { response: { data: { message: "invalid_room" } } }

    const response = await apiClient().get<any>(`/lock_room/${guid}`)
    return response.data
}

const discard = async (cardName: string): Promise<ITurnResponse> => {
    if (!cardName) throw { response: { data: { message: "no_card" } } }

    const response = await apiClient().post<ITurnResponse>("/discard", { card_name: cardName })
    return response.data
}

const play = async (itemName: string): Promise<ITurnResponse> => {
    if (!itemName) throw { response: { data: { message: "no_card" } } }

    const response = await apiClient().post<ITurnResponse>("/play_card", { card_name: itemName })
    return response.data
}

const ApiClient = {
    createRoom,
    joinRoom,
    leaveRoom,
    lockRoom,
    discard,
    play
}

export default ApiClient