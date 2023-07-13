import React from "react"
import { render, screen, act } from "../testSetup"
import NutrientTable from "../../app/components/NutrientTable"
import { messagesGetter } from "../../base/Providers/Locales/Provider"
import LocaleComponent from "../LocaleTestComponent"
import {
    mockedDailyMenuSuccessOnlyCs
} from "../MockedApiValues"
import { INutrients } from "../../base/utils/Axios/types"


beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ""
    localStorage.clear()
    sessionStorage.clear()
})

async function renderTest(data: INutrients, name: string, locale: string = "cs") {
    localStorage.setItem("locale", locale)

    await act(async () => {
        render(
            <LocaleComponent locale={locale}>
                <NutrientTable
                    nutrients={data}
                    tableName={name}
                />
            </LocaleComponent>
        )
    })

    const messages = messagesGetter(locale)

    expect(localStorage.getItem("locale")).toEqual(locale)
    expect(screen.getByText(messages["pages.daily_menu.nutrients_table.carbs"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.nutrients_table.proteins"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.nutrients_table.fats"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.nutrients_table.fiber"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.nutrients_table.energy"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.nutrients_table.nutrient_column"])).toBeInTheDocument()
    expect(screen.getByText(messages["pages.daily_menu.nutrients_table.amount_column"])).toBeInTheDocument()
    expect(screen.getByText(`${messages["pages.daily_menu.nutrients_table.ratio_column"]} %`)).toBeInTheDocument()
}

describe("Test of Nutrient table rendering", () => {
    test("Cs table", async () => {
        const menu = { ...mockedDailyMenuSuccessOnlyCs }

        await renderTest(menu.nutrients, "daily_menu")
    })

    test("En table", async () => {
        const menu = { ...mockedDailyMenuSuccessOnlyCs }

        await renderTest(menu.nutrients, "daily_menu", "en")
    })

    test("De table", async () => {
        const menu = { ...mockedDailyMenuSuccessOnlyCs }

        await renderTest(menu.nutrients, "daily_menu", "de")
    })
})