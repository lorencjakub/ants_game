import React from "react"
import { render, screen, act, fireEvent, waitFor } from "../testSetup"
import HomePage from "../../app/pages/Home"
import { messagesGetter } from "../../base/Providers/Locales/Provider"
import LocaleComponent from "../LocaleTestComponent"


beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ""
    localStorage.clear()
})

async function renderTest(locale: string) {
    localStorage.setItem("locale", locale)

    await act(async () => {
        render(
            <LocaleComponent locale={locale}>
                <HomePage />
            </LocaleComponent>
        )
    })

    const messages = messagesGetter(locale)

    expect(localStorage.getItem("locale")).toEqual(locale)
    expect(screen.getByText(messages["pages.homepage.title"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.homepage.about"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.homepage.warning"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.homepage.menu_button"])).toBeInTheDocument()
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

    test("Menu generator's site redirect button", () => {
        render(
            <LocaleComponent>
                <HomePage />
            </LocaleComponent>
        )
    
        const button = screen.getByTestId("pages.homepage.menu_button")?.querySelector("button")
        if (!button) throw Error("Button not found")
        waitFor(() => fireEvent.click(button as HTMLButtonElement))
        expect(window.location.pathname).toEqual("/menu")
    })
})