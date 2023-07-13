import React from "react"
import {
    render,
    screen,
    act,
    fireEvent, 
    waitFor,
    testMessagesGetter,
    TEST_CONFIG
} from "../testSetup"
import HomePage from "../../app/pages/Home"
import LocaleComponent from "../LocaleTestComponent"
import ApiClient from "../../base/utils/Axios/ApiClient"


async function renderTest(locale: string) {
    localStorage.setItem("locale", locale)

    render(
        <LocaleComponent locale={locale}>
            <HomePage />
        </LocaleComponent>
    )

    const messages = testMessagesGetter(locale)

    expect(localStorage.getItem("locale")).toEqual(locale)
    expect(screen.getByText(messages["pages.homepage.title"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.homepage.about"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.homepage.new_room_button"])).toBeInTheDocument()
}

describe("Test of HomePage render and functionalities", () => {
    test("Render test - cs", async () => {
        await renderTest("cs")
    })

    test("Render test - en", async () => {
        await renderTest("en")
    })

    test("Render test - de", async () => {
        await renderTest("de")
    })

    test("Menu generator's site redirect button", async () => {
        jest.spyOn(ApiClient, "createRoom").mockResolvedValue({
            room: TEST_CONFIG.DEFAULT_ROOM_GUID,
            token: TEST_CONFIG.DEFAULT_PLAYER_TOKEN,
            cards: []
        })

        render(
            <LocaleComponent>
                <HomePage />
            </LocaleComponent>
        )
    
        const button = screen.getByTestId("pages.homepage.new_room_button")?.querySelector("button")
        if (!button) throw Error("Button not found")
        waitFor(() => fireEvent.click(button as HTMLButtonElement))
        await waitFor(() => expect(window.location.pathname).toEqual(`/room/${TEST_CONFIG.DEFAULT_ROOM_GUID}`))
        expect(sessionStorage.getItem("Token")).toEqual(TEST_CONFIG.DEFAULT_PLAYER_TOKEN)
    })
})