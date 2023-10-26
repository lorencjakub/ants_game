import React from "react"
import {
    render,
    screen,
    fireEvent,
    waitFor,
} from "../testSetup"
import {
    TEST_CARD_WALL,
    TEST_CARD_TOWER,
    TEST_CARD_ARCHER,
    TEST_CARD_SORCERER
} from "../MockedApiValues"
import { ICard } from "../../base/utils/Axios/types"
import { AntCard } from "../../app/components/Card"
import { checkRenderedCard } from "../testFunctions"
import { usePlayerCards } from "../../app/Providers/PlayerCards"
import { Button } from "@mui/material"


var CHANGE_CARDS_COUNTER = 0
var DISCARDS_COUNTER = 0

const cardsSet = [
    [ TEST_CARD_WALL, TEST_CARD_TOWER, TEST_CARD_ARCHER ],
    [ TEST_CARD_TOWER, TEST_CARD_WALL, TEST_CARD_SORCERER ],
    []
]

const getCards = (counter: number): ICard[] => {
    return (counter < cardsSet.length) ? cardsSet[counter - 1] : []
}

async function checkCards(cards: ICard[] = [], discarded: Partial<ICard> = {}) {
    if (discarded.item_name) expect(screen.getByTestId(`ant_card.${discarded.item_name}`)).toBeInTheDocument()

    if (cards.length === 0) return
    
    const rgx = new RegExp(`ant_card.(${cards.map(c => c.item_name).join("|")})$`)
    
    await waitFor(() => expect(screen.getAllByTestId(rgx)).toHaveLength(cards.length))
    cards.forEach(card => checkRenderedCard(card))
}

const TestComponent: React.FC<{}> = () => {
    const { playerCards, setPlayerCards, discarded, setDiscardedCard } = usePlayerCards()

    const setCardsInHand = () => {
        CHANGE_CARDS_COUNTER++
        setPlayerCards && setPlayerCards(getCards(CHANGE_CARDS_COUNTER), "TestPlay")
    }

    const discardCard = () => {
        DISCARDS_COUNTER++
        setDiscardedCard && setDiscardedCard(getCards(DISCARDS_COUNTER)[0])
    }

    return (
        <React.Fragment>
            <div data-testid="discarded_cards" >
            {(discarded && (Object.keys(discarded).length !== 0)) ? <AntCard { ...discarded } /> : null}
            </div>
            <div data-testid="player_cards" >
                {(playerCards && (playerCards.length !== 0)) ? playerCards.map(c => <AntCard { ...c } key={c.item_name} />) : null}
            </div>
            <Button data-testid="set_new_cards_button" onClick={setCardsInHand} />
            <Button data-testid="discard_card_button" onClick={discardCard} />
        </React.Fragment>
    )
}

describe(("Provider functionalities"), () => {
    test("Default values", () => {
        render(<TestComponent />)

        expect(screen.queryAllByTestId(/ant_card/)).toHaveLength(0)
    })

    test("Set cards", async () => {
        render(<TestComponent />)

        for (var i = 0; i < 4; i++) {
            fireEvent.click(screen.getByTestId("set_new_cards_button"))
            await checkCards(cardsSet[i])
        }
    })

    test("Discard card", async () => {
        render(<TestComponent />)

        for (var i = 0; i < 4; i++) {
            fireEvent.click(screen.getByTestId("discard_card_button"))
            await checkCards([], (!cardsSet[i]) ? {} : cardsSet[i][0])
        }
    })
})