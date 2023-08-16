import React from "react"
import {
    render,
    screen,
    fireEvent,
    waitFor
} from "../testSetup"
import Card from "../../app/components/Card"
import ApiClient from "../../base/utils/Axios/ApiClient"
import { TEST_CARD_WALL } from "../MockedApiValues"
import { checkRenderedCard } from "../testFunctions"


describe(("Card component render and funcionalities"), () => {
    test("Render of card in player's hand", () => {
        render(<Card { ...TEST_CARD_WALL } />)
    
        checkRenderedCard({ ...TEST_CARD_WALL }, "fence +3")
    })

    test("Render of card in deck", () => {
        render(<Card />)
    
        expect(screen.queryByTestId("ant_card.deck.name")).not.toBeInTheDocument()
        expect(screen.queryByTestId("ant_card.deck.description")).not.toBeInTheDocument()
        expect(screen.queryByTestId("ant_card.deck.price")).not.toBeInTheDocument()
        expect(screen.queryByTestId("ant_card.deck.unit")).not.toBeInTheDocument()
        expect(screen.getByTestId("ant_card.deck.avatar")).toHaveAttribute("src", "/cards/deck.svg")
    })

    test("Play a card from player's hand", async () => {
        jest.spyOn(ApiClient, "play").mockImplementation(jest.fn())
    
        render(<Card { ...TEST_CARD_WALL } playFn={ApiClient.play} />)        
    
        const card = screen.getByTestId(`ant_card.${TEST_CARD_WALL.item_name}`)
        if (!card) throw Error(`Card ${TEST_CARD_WALL.item_name} not found`)
        fireEvent.click(card)
        await waitFor(() => expect(ApiClient.play).toBeCalledWith(TEST_CARD_WALL.item_name))
    })

    test("No play action on card in deck", async () => {
        jest.spyOn(ApiClient, "play").mockImplementation(jest.fn())
    
        render(<Card />)        
    
        const card = screen.getByTestId("ant_card.deck")
        if (!card) throw Error("Card in deck not found")
        fireEvent.click(card)
        await waitFor(() => expect(ApiClient.play).not.toBeCalled())
    })

    test("Discard a card from player's hand", async () => {
        jest.spyOn(ApiClient, "discard").mockImplementation(jest.fn())
    
        render(<Card { ...TEST_CARD_WALL } discardFn={ApiClient.discard} />)

        const card = screen.getByTestId(`ant_card.${TEST_CARD_WALL.item_name}`)
        if (!card) throw Error(`Card ${TEST_CARD_WALL.item_name} not found`)
        fireEvent.contextMenu(card)
        await waitFor(() => expect(ApiClient.discard).toBeCalledWith(TEST_CARD_WALL.item_name))
    })

    test("No discard action on card in deck", async () => {
        jest.spyOn(ApiClient, "discard").mockImplementation(jest.fn())
    
        render(<Card { ...TEST_CARD_WALL } />)

        const card = screen.getByTestId(`ant_card.${TEST_CARD_WALL.item_name}`)
        if (!card) throw Error("Card in deck not found")
        fireEvent.contextMenu(card)
        await waitFor(() => expect(ApiClient.discard).not.toBeCalled())
    })
})