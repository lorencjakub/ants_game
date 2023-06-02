import { IDailyMenu } from "../base/utils/Axios/types"


export const mockedDailyMenuSuccessOnlyCs: IDailyMenu = {
    iterations: 1,
    foods: {
        breakfast: {
            id: 1,
            recipe_id: 1,
            cs_name: "Testovací snídaně",
            cs_url: "Breakfast URL cs",
            portions: 1
        },
        lunch: {
            id: 2,
            recipe_id: 2,
            cs_name: "Testovací oběd",
            cs_url: "Lunch URL cs",
            portions: 1
        },
        snack: {
            id: 3,
            recipe_id: 3,
            cs_name: "Testovací svačina",
            cs_url: "Snack URL cs",
            portions: 1
        },
        dinner: {
            id: 4,
            recipe_id: 4,
            cs_name: "Testovací Večeře",
            cs_url: "Dinner URL cs",
            portions: 1
        },
    },
    nutrients: {
        energy: {
            amount: 2000,
            ratio: 100
        },
        carbs: {
            amount: 100,
            ratio: 40
        },
        proteins: {
            amount: 100,
            ratio: 40
        },
        fats: {
            amount: 50,
            ratio: 20
        },
        fiber: {
            amount: 30,
            ratio: 100
        },
    }
}

var mockedDailyMenuSuccessMultiLangWithoutSnack: IDailyMenu = { ...mockedDailyMenuSuccessOnlyCs }
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.breakfast.en_name = "Test breakfast"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.breakfast.en_url = "Breakfast URL en"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.breakfast.de_name = "Test Frühstück"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.breakfast.de_url = "Frühstück URL en"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.lunch.en_name = "Test lunch"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.lunch.en_url = "Lunch URL en"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.lunch.de_name = "Test Mittagessen"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.lunch.de_url = "Mittagessen URL en"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.dinner.en_name = "Test dinner"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.dinner.en_url = "Dinner URL en"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.dinner.de_name = "Test Abendessen"
mockedDailyMenuSuccessMultiLangWithoutSnack.foods.dinner.de_url = "Abendessen URL en"

export const mockedDailyMenuSuccessMultiLang = mockedDailyMenuSuccessMultiLangWithoutSnack

export const defaultMenuData = {
    energy: 2000,
    carbs: 40,
    proteins: 40,
    fats: 20,
    breakfast_tags: [],
    lunch_tags: [],
    snack_tags: [],
    dinner_tags: [],
    minimum_energy_check: false,
    with_snack: true,
    iterations: 300
}
