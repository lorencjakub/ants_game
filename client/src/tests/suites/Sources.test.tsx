import React from "react"
import {
    render,
    screen,
    testMessagesGetter
} from "../testSetup"
import Sources from "../../app/components/Sources"
import { TEST_SOURCES } from "../MockedApiValues"


test("Render of sources", () => {
    const messages = testMessagesGetter()
    
    render(<Sources sources={TEST_SOURCES} title="Player1" />)

    Object.entries(TEST_SOURCES).forEach(([name, value]: [string, number]) => {
        const sourceRow = screen.getByTestId(`source_row.${name}`)
        if (!sourceRow) throw Error(`Source row for ${name} not found!`)

        expect(screen.getByTestId(`source_row.${name}.unit_icon`)?.querySelector("img")).toHaveAttribute("src", `/cards/${name}.svg`)
        expect(screen.getByTestId(`source_row.${name}.unit_name`)).toHaveTextContent(messages[`sources.${name}`])
        expect(screen.getByTestId(`source_row.${name}.amount`)).toHaveTextContent(String(value))
    })
})