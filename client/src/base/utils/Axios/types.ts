interface INutrientData {
    amount: number,
    ratio: number
}

export interface INutrients {
    carbs: INutrientData,
    energy: INutrientData,
    fats: INutrientData,
    fiber: INutrientData,
    proteins: INutrientData
}

export interface IFood {
    id: number,
    recipe_id?: number,
    cs_name: string,
    en_name?: string,
    de_name?: string,
    portions: number,
    cs_url: string,
    en_url?: string,
    de_url?: string,
    nutrients?: INutrients
}

export interface IDailyMenu {
    foods: {
        breakfast: IFood,
        lunch: IFood,
        snack?: IFood,
        dinner: IFood
    },
    iterations: number,
    nutrients: INutrients
}