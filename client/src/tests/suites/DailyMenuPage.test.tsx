import React from "react"
import { render, screen, act, fireEvent, waitFor } from "../testSetup"
import DialyMenuPage from "../../app/pages/Room"
import { messagesGetter } from "../../base/Providers/Locales/Provider"
import LocaleComponent from "../LocaleTestComponent"
import ApiClient from "../../base/utils/Axios/ApiClient"
import {
    mockedDailyMenuSuccessOnlyCs,
    mockedDailyMenuSuccessMultiLang
} from "../MockedApiValues"
import { DailyMenuProvider } from "../../app/Providers/DailyMenu"
import { FormDataProvider } from "../../app/Providers"


beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ""
    localStorage.clear()
    sessionStorage.clear()
})

async function renderTest(locale: string) {
    localStorage.setItem("locale", locale)

    await act(async () => {
        render(
            <LocaleComponent locale={locale}>
                <FormDataProvider>
                    <DailyMenuProvider>
                        <DialyMenuPage />
                    </DailyMenuProvider>
                </FormDataProvider>
            </LocaleComponent>
        )
    })

    expect(screen.getByTestId("pages.daily_menu.info")).toBeInTheDocument()
    const messages = messagesGetter(locale)

    expect(localStorage.getItem("locale")).toEqual(locale)
    expect(screen.getByText(messages["pages.daily_menu.info.title"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.info.description.generator"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.info.description.first_condition"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.info.description.second_condition"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.info.description.ratios"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.info.description.session"])).toBeInTheDocument()

    expect(screen.queryByTestId("pages.daily_menu.meals")).not.toBeInTheDocument()
    expect(screen.queryByTestId("containers.layout.content.daily_menu.nutrients_table")).not.toBeInTheDocument()

    expect(screen.getByTestId("pages.form")).toBeInTheDocument()
    expect(screen.getByTestId("energy_text_field")).toBeInTheDocument()
    expect(screen.getByTestId("minimum_energy_check_checkbox")).toBeInTheDocument()
    expect(screen.getByTestId("carbs_slider")).toBeInTheDocument()
    expect(screen.getByTestId("proteins_slider")).toBeInTheDocument()
    expect(screen.getByTestId("fats_slider")).toBeInTheDocument()
    expect(screen.getByTestId("with_snack_checkbox")).toBeInTheDocument()
    expect(screen.getByTestId("breakfast_tags_multiselect")).toBeInTheDocument()
    expect(screen.getByTestId("lunch_tags_multiselect")).toBeInTheDocument()
    expect(screen.getByTestId("snack_tags_multiselect")).toBeInTheDocument()
    expect(screen.getByTestId("dinner_tags_multiselect")).toBeInTheDocument()
    expect(screen.getByTestId("iterations_slider")).toBeInTheDocument()

    expect(screen.getByTestId("pages.daily_menu.info.buttons.reset_form")).toBeInTheDocument()
    expect(screen.getByTestId("pages.daily_menu.info.buttons.generate_new_menu")).toBeInTheDocument()
    expect(screen.getByTestId("pages.daily_menu.info.buttons.generate_new_random_menu")).toBeInTheDocument()
}

describe("Test of DailyMenuPage render", () => {
    test("Initial render test - cs", async () => {
        await renderTest("cs")
    })

    test("Initial render test - en", async () => {
        await renderTest("en")
    })

    test("Initial render test - de", async () => {
        await renderTest("de")
    })
})

describe("Test of DailyMenuPage functionalities", () => {
    test("New menu generating with conditions", async () => {
        jest.spyOn(ApiClient, "getDailyMenu").mockResolvedValue(mockedDailyMenuSuccessOnlyCs)

        await renderTest("en")
    
        const button = screen.getByTestId("pages.daily_menu.info.buttons.generate_new_menu")
        if (!button) throw Error("Button not found")
        await waitFor(() => fireEvent.click(button as HTMLButtonElement))
        expect(ApiClient.getDailyMenu).toBeCalled()
    })

    test("New random menu generating", async () => {
        jest.spyOn(ApiClient, "getDailyMenu").mockResolvedValue(mockedDailyMenuSuccessOnlyCs)

        await renderTest("en")
    
        const button = screen.getByTestId("pages.daily_menu.info.buttons.generate_new_menu")
        if (!button) throw Error("Button not found")
        await waitFor(() => fireEvent.click(button as HTMLButtonElement))
        expect(ApiClient.getDailyMenu).toBeCalled()
    })

    test("New random menu generating", async () => {
        jest.spyOn(ApiClient, "getRandomDailyMenu").mockResolvedValue(mockedDailyMenuSuccessOnlyCs)

        await renderTest("en")
    
        const button = screen.getByTestId("pages.daily_menu.info.buttons.generate_new_random_menu")
        if (!button) throw Error("Button not found")
        await waitFor(() => fireEvent.click(button as HTMLButtonElement))
        expect(ApiClient.getRandomDailyMenu).toBeCalled()
    })

    test("Reset menu form", async () => {
        await renderTest("en")

        const inputs = {
            energyInput: screen.getByTestId("energy_text_field").querySelector("input") as HTMLElement,
            carbsInput: screen.getByTestId("carbs_slider").querySelector("input") as HTMLElement,
            proteinsInput: screen.getByTestId("proteins_slider").querySelector("input") as HTMLElement,
            fatsInput: screen.getByTestId("fats_slider").querySelector("input") as HTMLElement,
            iterationsInput: screen.getByTestId("iterations_slider").querySelector("input") as HTMLElement
        }

        const defaultValues = {
            energyInput: "2000",
            carbsInput: "40",
            proteinsInput: "40",
            fatsInput: "20",
            iterationsInput: "300"
        }

        const newValues = {
            energyInput: "1500",
            carbsInput: "45",
            proteinsInput: "45",
            fatsInput: "10",
            iterationsInput: "450"
        }

        Object.values(inputs).forEach((i) => {
            if (!i) throw Error("Input not found")
        })

        await waitFor(() => fireEvent.change(inputs.energyInput, { target: { value: newValues.energyInput } }))
        await waitFor(() => fireEvent.change(inputs.fatsInput, { target: { value: newValues.fatsInput } }))
        await waitFor(() => fireEvent.change(inputs.iterationsInput, { target: { value: newValues.iterationsInput } }))

        Object.entries(inputs).forEach(([inputName, input]: [string, HTMLElement]) => {
            expect(input).toHaveValue(newValues[inputName as keyof typeof newValues])
        })

        const minimumEnergyInput = screen.getByTestId("minimum_energy_check_checkbox") as HTMLElement
        const snackInput = screen.getByTestId("with_snack_checkbox") as HTMLElement
        
        await waitFor(() => fireEvent.click(minimumEnergyInput))
        await waitFor(() => fireEvent.click(snackInput))

        expect(minimumEnergyInput.querySelector("[data-testid='CheckBoxIcon']")).toBeInTheDocument()
        expect(snackInput.querySelector("[data-testid='CheckBoxOutlineBlankIcon']")).toBeInTheDocument()

        const resetButton = screen.getByTestId("pages.daily_menu.info.buttons.reset_form")
        if (!resetButton) throw Error("Button not found")
        await waitFor(() => fireEvent.click(resetButton))

        Object.entries(inputs).forEach(([inputName, input]: [string, HTMLElement]) => {
            expect(input).toHaveValue(defaultValues[inputName as keyof typeof defaultValues])
        })

        expect(minimumEnergyInput.querySelector("[data-testid='CheckBoxOutlineBlankIcon']")).toBeInTheDocument()
        expect(snackInput.querySelector("[data-testid='CheckBoxIcon']")).toBeInTheDocument()
    })
})