import React from "react"
import {
    screen,
    testMessagesGetter,
    TEST_CONFIG
} from "./testSetup"
import { ICard } from "../base/utils/Axios/types"


const checkRenderedCard = (cardData: ICard, cardDescription: string = "", lang: string = TEST_CONFIG.DEFAULT_LANGUAGE) => {
    const messages = testMessagesGetter(lang)
    const { price, unit, item_name } = { ...cardData }

    expect(screen.getByTestId(`ant_card.${item_name}.name`)).toHaveTextContent(messages[`cards.${item_name}.name`])
    expect(screen.getByTestId(`ant_card.${item_name}.price`)).toHaveTextContent(String(price))
    expect(screen.getByTestId(`ant_card.${item_name}.unit`)?.querySelector("img")).toHaveAttribute("src", `/cards/${unit}.svg`)
    expect(screen.getByTestId(`ant_card.${item_name}.avatar`)).toHaveAttribute("src", `/cards/${item_name}.svg`)

    if (cardDescription) expect(screen.getByText(cardDescription)).toBeInTheDocument()
}

export { checkRenderedCard }