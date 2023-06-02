import React from "react"
import { render, screen, act } from "../testSetup"
import App from "../../base/containers/App"
import PageFooter from "../../app/components/PageFooter"


beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ""
    localStorage.clear()
})

describe("Test of App render", () => {
    test("Layout of site", async () => {
        await act(async () => {
            render(<App />)
        })
    
        expect(screen.getByTestId("containers.layout")).toBeInTheDocument()

        expect(screen.getByTestId("containers.layout.header.container")).toBeInTheDocument()
        expect(screen.getByTestId("containers.layout.header.appbar.logo")).toBeInTheDocument()
        expect(screen.getByText("NUTRI MANAGER")).toBeInTheDocument()

        expect(screen.getByTestId("containers.layout.header.appbar.language_select")).toBeInTheDocument()
        expect(screen.getByTestId("containers.layout.header.appbar.flag")).toBeInTheDocument()

        expect(screen.getByTestId("containers.layout.header.appbar.theme_mode_switcher")).toBeInTheDocument()
        expect(screen.getByTestId("BrightnessLowIcon")).toBeInTheDocument()
        
        expect(screen.getByTestId("containers.layout.content.container")).toBeInTheDocument()
        expect(screen.getByTestId("containers.layout.footer.container")).toBeInTheDocument()
    })

    test("Test of Footer - 2022", () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date("2022-04-01"))

        render(<PageFooter />)
    
        expect(screen.getByTestId("containers.layout.footer")).toBeInTheDocument()
        expect(screen.getByText("2022 Jakub Lorenc")).toBeInTheDocument()
    })

    test("Test of Footer - after 2022", () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date("2023-04-01"))

        render(<PageFooter />)
    
        expect(screen.getByTestId("containers.layout.footer")).toBeInTheDocument()
        expect(screen.getByText("2022-2023 Jakub Lorenc")).toBeInTheDocument()
    })
})