import React from "react"
import {
    render,
    screen,
    act
} from "../testSetup"
import Page from "../../base/containers/Page"
import PageFooter from "../../app/components/PageFooter"


describe("Test of App render", () => {
    test("Layout of site", async () => {
        render(<Page />)
    
        expect(screen.getByTestId("containers.layout")).toBeInTheDocument()

        expect(screen.getByTestId("containers.layout.header.container")).toBeInTheDocument()
        expect(screen.getByTestId("containers.layout.header.appbar.logo")).toBeInTheDocument()
        expect(screen.getByText("ANTS ONLINE")).toBeInTheDocument()

        expect(screen.getByTestId("containers.layout.header.appbar.language_select")).toBeInTheDocument()
        expect(screen.getByTestId("containers.layout.header.appbar.flag")).toBeInTheDocument()

        expect(screen.getByTestId("containers.layout.header.appbar.theme_mode_switcher")).toBeInTheDocument()
        expect(screen.getByTestId("BrightnessLowIcon")).toBeInTheDocument()
        
        expect(screen.getByTestId("containers.layout.content.container")).toBeInTheDocument()
        expect(screen.getByTestId("containers.layout.content.container")).toBeInTheDocument()
        expect(screen.getByTestId("containers.layout.footer.container")).toBeInTheDocument()
    })

    test("Test of Footer - 2023", () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date("2023-04-01"))

        render(<PageFooter />)
    
        expect(screen.getByTestId("containers.layout.footer")).toBeInTheDocument()
        expect(screen.getByText("2023 Jakub Lorenc")).toBeInTheDocument()

        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })

    test("Test of Footer - after 2024", () => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date("2024-04-01"))

        render(<PageFooter />)
    
        expect(screen.getByTestId("containers.layout.footer")).toBeInTheDocument()
        expect(screen.getByText("2023-2024 Jakub Lorenc")).toBeInTheDocument()

        jest.runOnlyPendingTimers()
        jest.useRealTimers()
    })
})