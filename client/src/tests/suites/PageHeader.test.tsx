import React from "react"
import { render, screen, act, fireEvent } from "../testSetup"
import App from "../../base/containers/App"
import flagUrls from "../../app/config/locales/flagUrls.json"


beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ""
    localStorage.clear()
})

describe("Test of PageHeader functionalities", () => {
    test("Language switcher", async () => {
        await act(async () => {
            render(<App />)
        })
    
        expect(localStorage.getItem("locale")).toEqual("cs")
        expect(screen.getByTestId("containers.layout.header.appbar.language_select")).toBeInTheDocument()
        expect(screen.getByTestId("containers.layout.header.appbar.flag")).toBeInTheDocument()
        
        const languageSelect: HTMLElement= screen.getByTestId("containers.layout.header.appbar.language_select")
        if (!languageSelect || !languageSelect.querySelector("input")) throw Error("Element not found")
        expect(languageSelect).toBeInTheDocument()

        for (const [code, url] of Object.entries(flagUrls)) {
            fireEvent.change(languageSelect.querySelector("input") as HTMLInputElement, { target: { value: code} })
            expect(languageSelect.children[0]?.children[0]).toHaveAttribute("src", url)
            expect(localStorage.getItem("locale")).toEqual(code)
        }        
    })
    
    test("Theme mode switcher", async () => {
        await act(async () => {
            render(<App />)
        })
    
        expect(localStorage.getItem("theme_mode")).toEqual("dark")
        expect(screen.getByTestId("containers.layout.header.appbar.theme_mode_switcher")).toBeInTheDocument()
        
        const darkModeIcon = screen.queryByTestId("BrightnessLowIcon")
        if (!darkModeIcon) throw Error("Element not found")
        expect(darkModeIcon).toBeInTheDocument()
        fireEvent.click(darkModeIcon)

        expect(localStorage.getItem("theme_mode")).toEqual("light")
        expect(darkModeIcon).not.toBeInTheDocument()

        const lightModeIcon = screen.queryByTestId("BrightnessHighIcon")
        if (!lightModeIcon) throw Error("Element not found")
        expect(lightModeIcon).toBeInTheDocument()
        fireEvent.click(lightModeIcon)

        expect(localStorage.getItem("theme_mode")).toEqual("dark")
        expect(screen.queryByTestId("BrightnessLowIcon")).toBeInTheDocument()
        expect(lightModeIcon).not.toBeInTheDocument()
    })
})