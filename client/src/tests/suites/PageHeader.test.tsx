import React from "react"
import { 
    render,
    screen,
    act,
    fireEvent,
    TEST_CONFIG
} from "../testSetup"
import Page from "../../base/containers/Page"
import flagUrls from "../../app/config/locales/flagUrls.json"


describe("Test of PageHeader functionalities", () => {
    test("Language switcher", async () => {
        render(<Page />)

        expect(localStorage.getItem("locale")).toEqual(TEST_CONFIG.DEFAULT_LANGUAGE)
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
        render(<Page />)
    
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

    test(("App name and app logo home redirect"), async () => {
        render(<Page />)

        window.history.replaceState({}, "", "http://localhost/some/url")
        const appLogo = screen.queryByTestId("containers.layout.header.appbar.logo")
        if (!appLogo) throw Error("Element not found")
        fireEvent.click(appLogo)
        expect(window.location.href).toEqual("http://localhost/")

        window.history.replaceState({}, "", "http://localhost/some/other/url")
        const appName = screen.queryByText("ANTS ONLINE")
        if (!appName) throw Error("Element not found")
        fireEvent.click(appName)
        expect(window.location.href).toEqual("http://localhost/")
    })
})