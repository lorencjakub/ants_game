import React from "react"
import {
    render,
    screen,
    act,
    fireEvent,
    waitFor,
    TEST_CONFIG
} from "../testSetup"
import Room from "../../app/pages/Room"
import ApiClient from "../../base/utils/Axios/ApiClient"
import {
    TEST_CARD_WALL,
    TEST_CARD_TOWER,
    TEST_CARD_ARCHER,
    TEST_SOURCES,
    TEST_CARD_SORCERER
} from "../MockedApiValues"
import {
    ISources,
    ICard
} from "../../base/utils/Axios/types"
import { checkRenderedCard } from "../testFunctions"
import { socket, serverSocket, MOCKED_SOCKETIO_EVENTS } from "../MockedSocketIO"
import { EventNames } from "../../base/utils/SocketIO/eventNames"


function getSourcesWithIncrement(sources: ISources, increment: number = 1): ISources {
    return Object.fromEntries(Object.entries({ ...sources }).map(([key, value]): [string, number] => {
        return [key, TEST_CONFIG.SOURCES_INCREMENTS.includes(key) ? value + increment : value]
    })) as any
}

const DEFAULT_PLAYER_2_SOURCES = getSourcesWithIncrement(TEST_SOURCES)
const DEFAULT_PLAYERS_STATES = {
    [TEST_CONFIG.DEFAULT_PLAYER_TOKEN]: { ...TEST_SOURCES },
    "Player2": { ...DEFAULT_PLAYER_2_SOURCES }
}

async function checkCardsInPlayerHand(cards: ICard[], discarded?: ICard["item_name"]) {
    const rgx = new RegExp(`ant_card.(${cards.map(c => c.item_name).join("|")})$`)
    
    await waitFor(() => {
        expect(screen.getByTestId("pages.room.card_panel").children).not.toHaveLength(0)
        expect(screen.getAllByTestId(rgx)).toHaveLength(cards.length)
    })

    cards.forEach(card => checkRenderedCard(card))

    if (discarded) expect(screen.queryByTestId(`ant_card.${discarded}`)).not.toBeInTheDocument()
}

async function renderFullRoom(cards: ICard[])  {
    jest.spyOn(ApiClient, "joinRoom").mockResolvedValue({
        room: TEST_CONFIG.DEFAULT_ROOM_GUID,
        token: TEST_CONFIG.DEFAULT_PLAYER_TOKEN,
        cards: cards
    })

    render(<Room />)

    expect(ApiClient.joinRoom).toBeCalledWith(TEST_CONFIG.DEFAULT_ROOM_GUID)
    
    if (cards.length !== 0) await checkCardsInPlayerHand(cards)

    const events = Object.keys(MOCKED_SOCKETIO_EVENTS)
    TEST_CONFIG.DEFAULT_ROOM_EVENTS.forEach((event) => expect(events.includes(event)).toBeTruthy())
}

function checkStates(dataAvailable: 0 | 1 | 2 = 0, specificPlayerData?: { index: 0 | 1, sources: ISources }) {
    expect(screen.queryAllByText("No data available")).toHaveLength(2 - dataAvailable)

    Object.keys(TEST_SOURCES).forEach((code) => {
        expect(screen.queryAllByTestId(`source_row.${code}`)).toHaveLength(dataAvailable)

        if (specificPlayerData) {
            const { index, sources } = specificPlayerData
            expect(screen.getAllByTestId(`source_row.${code}.amount`)[index]).toHaveTextContent(String(sources[code as keyof typeof sources]))
        }
    })
}

describe(("Room init render"), () => {
    test("Basic render of Room", () => {
        render(<Room />)

        expect(screen.getByTestId("pages.room.main_panel")).toBeInTheDocument()
        expect(screen.getByTestId("pages.room.player_one_panel")).toBeInTheDocument()
        expect(screen.getByTestId("pages.room.player_two_panel")).toBeInTheDocument()
        expect(screen.getByTestId("pages.room.battlefield")).toBeInTheDocument()
        expect(screen.getByTestId("pages.room.card_panel")).toBeInTheDocument()

        expect(screen.getAllByText("No data available")).toHaveLength(2)
        expect(screen.getByTestId("ant_card.deck")).toBeInTheDocument()
        expect(screen.getByTestId("ant_card.deck.avatar")).toHaveAttribute("src", "/cards/deck.svg")
        expect(Array.from(screen.getByTestId("pages.room.card_panel").children)).toHaveLength(0)
    })

    test("Render of Room with Room's data", async () => {
        const cards = [
            TEST_CARD_WALL,
            TEST_CARD_TOWER,
            TEST_CARD_ARCHER
        ]

        await renderFullRoom(cards)
    })

    test("Render of Room with Room's data but no player token", async () => {
        await renderFullRoom([])

        sessionStorage.clear()
        act(() => serverSocket.emit(EventNames.ENTER_ROOM, DEFAULT_PLAYERS_STATES))

        await waitFor(() => checkStates())
    })

    test("Render of Room with Room's data", async () => {
        const cards = [
            TEST_CARD_WALL,
            TEST_CARD_TOWER,
            TEST_CARD_ARCHER
        ]

        sessionStorage.setItem("Token", TEST_CONFIG.DEFAULT_PLAYER_TOKEN)

        await renderFullRoom(cards)

        act(() => serverSocket.emit(EventNames.ENTER_ROOM, DEFAULT_PLAYERS_STATES))
        await waitFor(() => checkStates(2))
    })
})

describe(("Game functionalities"), () => {
    test("Player plays a card - no winner", async () => {
        const cards = [
            TEST_CARD_WALL,
            TEST_CARD_TOWER,
            TEST_CARD_ARCHER
        ]
        const playedCard = TEST_CARD_WALL
        const newCards = cards.map(c => (c.item_name === playedCard.item_name) ? TEST_CARD_SORCERER : c)

        jest.spyOn(ApiClient, "play").mockResolvedValue({
            cards: newCards,
            discarded: TEST_CARD_WALL
        })
        const emitSpy = jest.spyOn(socket, "emit")

        const newMyState = {
            ...TEST_SOURCES,
            bricks: TEST_SOURCES.bricks - TEST_CARD_WALL.price,
            fence: TEST_SOURCES.fence + 3
        }

        const newEnemyState = getSourcesWithIncrement(DEFAULT_PLAYER_2_SOURCES, 2)

        const stateEmitData = {
            discarded: TEST_CARD_WALL,
            [TEST_CONFIG.DEFAULT_PLAYER_TOKEN]: newMyState,
            "Player2": newEnemyState
        }

        sessionStorage.setItem("Token", TEST_CONFIG.DEFAULT_PLAYER_TOKEN)

        await renderFullRoom(cards)

        act(() => serverSocket.emit(EventNames.ENTER_ROOM, DEFAULT_PLAYERS_STATES))
        await waitFor(() => checkStates(2))

        const wallCard = screen.getByTestId(`ant_card.${TEST_CARD_WALL.item_name}`)
        if (!wallCard) throw Error(`Card ${TEST_CARD_WALL.item_name} not found`)
        fireEvent.click(wallCard)

        await checkCardsInPlayerHand(newCards, playedCard.item_name)
        
        expect(emitSpy).toBeCalledWith(EventNames.SERVER_STATE_UPDATE, { discarded: TEST_CARD_WALL, guid: TEST_CONFIG.DEFAULT_ROOM_GUID, action: "play" })
        act(() => serverSocket.emit(EventNames.CLIENT_STATE_UPDATE, stateEmitData))

        checkStates(2, { index: 0, sources: newMyState })
        checkStates(2, { index: 1, sources: newEnemyState })
    })

    test("Player plays a card - player wins", async () => {
        const cards = [
            TEST_CARD_WALL,
            TEST_CARD_TOWER,
            TEST_CARD_ARCHER
        ]
        
        jest.spyOn(ApiClient, "play").mockResolvedValue({ winner: TEST_CONFIG.DEFAULT_PLAYER_TOKEN })
        jest.spyOn(window, 'alert').mockImplementation(() => {})
        const emitSpy = jest.spyOn(socket, "emit")
        sessionStorage.setItem("Token", TEST_CONFIG.DEFAULT_PLAYER_TOKEN)

        await renderFullRoom(cards)

        const wallCard = screen.getByTestId(`ant_card.${TEST_CARD_WALL.item_name}`)
        if (!wallCard) throw Error(`Card ${TEST_CARD_WALL.item_name} not found`)
        fireEvent.click(wallCard)

        await waitFor(() => expect(emitSpy).toBeCalledWith(EventNames.SERVER_WINNER, TEST_CONFIG.DEFAULT_PLAYER_TOKEN))
        act(() => serverSocket.emit(EventNames.CLIENT_WINNER, TEST_CONFIG.DEFAULT_PLAYER_TOKEN))

        await waitFor(() => expect(window.alert).toBeCalledWith(`Player ${TEST_CONFIG.DEFAULT_PLAYER_TOKEN} wins!`))
    })

    test("Player discards a card", async () => {
        const cards = [
            TEST_CARD_WALL,
            TEST_CARD_TOWER,
            TEST_CARD_ARCHER
        ]
        const discardedCard = TEST_CARD_WALL
        const newCards = cards.map(c => (c.item_name === discardedCard.item_name) ? TEST_CARD_SORCERER : c)

        jest.spyOn(ApiClient, "discard").mockResolvedValue({
            cards: newCards,
            discarded: TEST_CARD_WALL
        })
        const emitSpy = jest.spyOn(socket, "emit")

        const newEnemyState = getSourcesWithIncrement(DEFAULT_PLAYER_2_SOURCES, 2)

        const stateEmitData = {
            discarded: TEST_CARD_WALL,
            [TEST_CONFIG.DEFAULT_PLAYER_TOKEN]: TEST_SOURCES,
            "Player2": newEnemyState
        }

        sessionStorage.setItem("Token", TEST_CONFIG.DEFAULT_PLAYER_TOKEN)

        await renderFullRoom(cards)

        act(() => serverSocket.emit(EventNames.ENTER_ROOM, DEFAULT_PLAYERS_STATES))
        await waitFor(() => checkStates(2))

        const wallCard = screen.getByTestId(`ant_card.${TEST_CARD_WALL.item_name}`)
        if (!wallCard) throw Error(`Card ${TEST_CARD_WALL.item_name} not found`)
        fireEvent.contextMenu(wallCard)

        await checkCardsInPlayerHand(newCards, discardedCard.item_name)
        
        expect(emitSpy).toBeCalledWith(EventNames.SERVER_STATE_UPDATE, { discarded: TEST_CARD_WALL, guid: TEST_CONFIG.DEFAULT_ROOM_GUID, action: "discard" })
        act(() => serverSocket.emit(EventNames.CLIENT_STATE_UPDATE, stateEmitData))

        checkStates(2, { index: 0, sources: TEST_SOURCES })
        checkStates(2, { index: 1, sources: newEnemyState })
    })
})