import React, { FC, useEffect } from 'react'
import {
    Button,
    Paper,
    Typography,
    Grid,
    Stack,
    useMediaQuery
} from "@mui/material"
import { useQuery, useMutation } from '@tanstack/react-query'
import ApiClient from '../../base/utils/Axios/ApiClient'
import {
    IFood,
    IDailyMenu
} from '../../base/utils/Axios/types'
import { AxiosError } from 'axios'
import RecipeCard from '../components/RecipeCard'
import NutrientsTable from '../components/NutrientTable'
import { useTheme as useMuiTheme } from '@mui/material/styles'
import { useIntl } from "react-intl"
import ProcessingBackdrop from '../components/ProcessingBackdrop'
import { useDailyMenu } from '../Providers/DailyMenu'
import { FormDataProvider, useFormData } from '../Providers/FormData'
import Form from '../components/Form'
import { IFormFields, IFormData } from '../../base/utils/types'


export var DEFAULT_FORM: IFormData = {}

const NewMenuButton: FC<{}> = () => {
    const { formData = {} } = useFormData()
    const { setFetchedMenu, setIsFetching, setIsRandomMenu } = useDailyMenu()
    const theme = useMuiTheme()
    const intl = useIntl()

    const {
        mutate: handleGenerateMenuClick,
        status: generatingMenu
    } = useMutation<IDailyMenu, AxiosError>(
        ["query_daily_menu"],
        async () => await ApiClient.getDailyMenu({ ...formData }),
        {
            retry: 0,
            cacheTime: 0,
            onSuccess: (data) => {
                setFetchedMenu && setFetchedMenu(data)
                setIsRandomMenu && setIsRandomMenu(false)
            }
        }
    )

    useEffect(() => {
        setIsFetching && setIsFetching((generatingMenu === "loading"))
    }, [generatingMenu])

    return (
        <Button
            onClick={() => {
                setFetchedMenu && setFetchedMenu(null)
                handleGenerateMenuClick()
            }}
            data-testid="pages.daily_menu.info.buttons.generate_new_menu"
            sx={{
                backgroundColor: theme.palette.text.primary,
                m: 2
            }}
        >
            <Typography
                variant="body2"
                color="primary.dark"
                noWrap
            >
                {intl.formatMessage({ id: "pages.daily_menu.info.buttons.generate_new_menu", defaultMessage: "New Menu" })}
            </Typography>
        </Button>
    )
}

const RandomMenuButton: FC<{ defaultForm: IFormData }> = ({ defaultForm }) => {
    const { setFormData } = useFormData()
    const { setFetchedMenu, setIsFetching, setIsRandomMenu } = useDailyMenu()
    const theme = useMuiTheme()
    const intl = useIntl()

    const {
        refetch: handleGenerateMenuClick,
        fetchStatus: generatingMenu
    } = useQuery<IDailyMenu, AxiosError>(
        ["query_random_daily_menu"],
        async () => await ApiClient.getRandomDailyMenu(),
        {
            retry: 0,
            cacheTime: 0,
            enabled: false,
            onSuccess: (data) => {
                setFetchedMenu && setFetchedMenu(data)
                setIsRandomMenu && setIsRandomMenu(true)
                setFormData && setFormData(defaultForm)
            }
        }
    )

    useEffect(() => {
        setIsFetching && setIsFetching((generatingMenu === "fetching"))
    }, [generatingMenu])

    return (
        <Button
            onClick={() => {
                setFormData && setFormData({})
                setFetchedMenu && setFetchedMenu(null)
                handleGenerateMenuClick()
            }}
            data-testid="pages.daily_menu.info.buttons.generate_new_random_menu"
            sx={{
                backgroundColor: theme.palette.text.primary,
                m: 2
            }}
        >
            <Typography
                variant="body2"
                color="primary.dark"
                noWrap
            >
                {intl.formatMessage({ id: "pages.daily_menu.info.buttons.generate_new_random_menu", defaultMessage: "New Random Menu" })}
            </Typography>
        </Button>
    )
}

const ResetMenuButton: FC<{}> = () => {
    const { setFormData } = useFormData()
    const { setFetchedMenu } = useDailyMenu()
    const theme = useMuiTheme()
    const intl = useIntl()

    return (
        <Button
            onClick={() => {
                setFormData && setFormData({})
                setFetchedMenu && setFetchedMenu(null)
            }}
            data-testid="pages.daily_menu.info.buttons.generate_new_menu"
            sx={{
                backgroundColor: theme.palette.text.primary,
                m: 2
            }}
        >
            <Typography
                variant="body2"
                color="primary.dark"
                noWrap
            >
                {intl.formatMessage({ id: "pages.daily_menu.info.buttons.generate_new_menu", defaultMessage: "New Menu" })}
            </Typography>
        </Button>
    )
} 

const ResetFormButton: FC<{ defaultForm: IFormData }> = ({ defaultForm }) => {
    const { setFormData } = useFormData()
    const theme = useMuiTheme()
    const intl = useIntl()

    return (
        <Button
            onClick={() => {
                setFormData && setFormData(defaultForm)
            }}
            data-testid="pages.daily_menu.info.buttons.reset_form"
            sx={{
                backgroundColor: theme.palette.text.primary,
                m: 2
            }}
        >
            <Typography
                variant="body2"
                color="primary.dark"
                noWrap
            >
                {intl.formatMessage({ id: "pages.daily_menu.info.buttons.reset_form", defaultMessage: "Reset Form" })}
            </Typography>
        </Button>
    )
}

const DailyMenuInfo: FC<{}> =() => {
    const intl = useIntl()

    const optionsAlergens = {
        "30": intl.formatMessage({ id: "multiselect.options.alergens.gluten_free", defaultMessage: "Gluten Free" }),
        "31": intl.formatMessage({ id: "multiselect.options.alergens.lactose_free", defaultMessage: "Lactose Free" }),
        "33": intl.formatMessage({ id: "multiselect.options.alergens.eggs_free", defaultMessage: "Eggs Free" }),
        "34": intl.formatMessage({ id: "multiselect.options.alergens.nuts_free", defaultMessage: "Nuts Free" })
    }
    
    const optionsPreference = {
        "2": intl.formatMessage({ id: "multiselect.options.preference.no_sugar", defaultMessage: "No sugar" }),
        "3": intl.formatMessage({ id: "multiselect.options.preference.hight_proteins", defaultMessage: "High Proteins" }),
        "4": intl.formatMessage({ id: "multiselect.options.preference.high_fiber", defaultMessage: "High Fiber" }),
        "5": intl.formatMessage({ id: "multiselect.options.preference.low_carbs", defaultMessage: "Low Carbs" }),
        "6": intl.formatMessage({ id: "multiselect.options.preference.low_energy", defaultMessage: "Low Energy" }),
        "7": intl.formatMessage({ id: "multiselect.options.preference.low_fats", defaultMessage: "Low Fats" }),
        "9": intl.formatMessage({ id: "multiselect.options.preference.vegetarian", defaultMessage: "Vegetarian" }),
        "10": intl.formatMessage({ id: "multiselect.options.preference.vegan", defaultMessage: "Vegan" }),
        "12": intl.formatMessage({ id: "multiselect.options.preference.protein_powder", defaultMessage: "Protein Powder" })
    }
    
    const optionsIngredients = {
        "39": intl.formatMessage({ id: "multiselect.options.ingredient.zucchini", defaultMessage: "Zucchini" }),
        "40": intl.formatMessage({ id: "multiselect.options.ingredient.chicken", defaultMessage: "Chicken" }),
        "41": intl.formatMessage({ id: "multiselect.options.ingredient.beef", defaultMessage: "Beef" }),
        "42": intl.formatMessage({ id: "multiselect.options.ingredient.tuna", defaultMessage: "Tuna" }),
        "43": intl.formatMessage({ id: "multiselect.options.ingredient.avocado", defaultMessage: "Avocado" }),
        "44": intl.formatMessage({ id: "multiselect.options.ingredient.peanuts_butter", defaultMessage: "Peanuts Butter" }),
        "45": intl.formatMessage({ id: "multiselect.options.ingredient.chia_seeds", defaultMessage: "Chia Seeds" }),
        "46": intl.formatMessage({ id: "multiselect.options.ingredient.coconut", defaultMessage: "Coconut" }),
        "47": intl.formatMessage({ id: "multiselect.options.ingredient.oat_flakes", defaultMessage: "Oat Flakes" }),
        "48": intl.formatMessage({ id: "multiselect.options.ingredient.sweet_potatoes", defaultMessage: "Sweet Potatoes" }),
        "49": intl.formatMessage({ id: "multiselect.options.ingredient.pumpkin", defaultMessage: "Pumpkin" }),
        "50": intl.formatMessage({ id: "multiselect.options.ingredient.rice", defaultMessage: "Rice" }),
        "51": intl.formatMessage({ id: "multiselect.options.ingredient.quinoa", defaultMessage: "Quinoa" }),
        "52": intl.formatMessage({ id: "multiselect.options.ingredient.salmon", defaultMessage: "Salmon" }),
        "53": intl.formatMessage({ id: "multiselect.options.ingredient.tofu", defaultMessage: "Tofu" }),
        "54": intl.formatMessage({ id: "multiselect.options.ingredient.couscous", defaultMessage: "Couscous" }),
        "55": intl.formatMessage({ id: "multiselect.options.ingredient.eggs", defaultMessage: "Eggs" }),
        "56": intl.formatMessage({ id: "multiselect.options.ingredient.vegetable", defaultMessage: "Vegatable" })
    }
    
    const options = {
        [intl.formatMessage({ id: "multiselect.options.subheaders.alergens", defaultMessage: "Alergens" })]: { ...optionsAlergens },
        [intl.formatMessage({ id: "multiselect.options.subheaders.preference", defaultMessage: "Preference" })]: { ...optionsPreference },
        [intl.formatMessage({ id: "multiselect.options.subheaders.ingredients", defaultMessage: "Ingredients" })]: { ...optionsIngredients }
    }

    const fields: IFormFields = {
        energy: {
            label: intl.formatMessage({ id: "page.form.energy.label", defaultMessage: "Max. energy" }),
            type: "text",
            defaultvalue: 2000
        },
        minimum_energy_check: {
            label: intl.formatMessage({ id: "page.form.energy.minimum_energy_check", defaultMessage: "Allow menu with energy lower than 80% of max. energy" }),
            type: "checkbox",
            defaultvalue: false
        },
        carbs: {
            label: intl.formatMessage({ id: "page.form.energy.carbs_ratio", defaultMessage: "Carbs ratio" }),
            type: "binded_slider",
            defaultvalue: 40
        },
        proteins: {
            label: intl.formatMessage({ id: "page.form.energy.proteins_ratio", defaultMessage: "Proteins ratio" }),
            type: "binded_slider",
            defaultvalue: 40
        },
        fats: {
            label: intl.formatMessage({ id: "page.form.energy.fats_ratio", defaultMessage: "Fats ratio" }),
            type: "binded_slider",
            defaultvalue: 20
        },
        with_snack: {
            label: intl.formatMessage({ id: "page.form.energy.with_snack", defaultMessage: "Include snack" }),
            type: "checkbox",
            defaultvalue: true
        },
        breakfast_tags: {
            label: intl.formatMessage({ id: "page.form.energy.tags.breakfast", defaultMessage: "Breakfast Tags" }),
            type: "multiselect",
            defaultvalue: [],
            selectvalues: options
        },
        lunch_tags: {
            label: intl.formatMessage({ id: "page.form.energy.tags.lunch", defaultMessage: "Lunch Tags" }),
            type: "multiselect",
            defaultvalue: [],
            selectvalues: options
        },
        snack_tags: {
            label: intl.formatMessage({ id: "page.form.energy.tags.snack", defaultMessage: "Snack Tags" }),
            type: "multiselect",
            defaultvalue: [],
            selectvalues: options
        },
        dinner_tags: {
            label: intl.formatMessage({ id: "page.form.energy.tags.dinner", defaultMessage: "Dinner Tags" }),
            type: "multiselect",
            defaultvalue: [],
            selectvalues: options
        },
        iterations: {
            label: intl.formatMessage({ id: "page.form.iterations", defaultMessage: "Max. count of iterations" }),
            type: "slider",
            defaultvalue: 300,
            min: 100,
            max: 500
        }
    }

    Object.entries(fields).map(([fieldName, fieldData]) => {
        DEFAULT_FORM[fieldName as keyof IFormFields] = fieldData.defaultvalue
    })

    return (
        <React.Fragment>
            <Grid
                data-testid="pages.daily_menu.info"
                item
                xs={10}
                justifyContent="center"
                alignItems="center"
                style={{
                    display: 'flex',
                    overflow: 'hidden',
                    flexDirection: "column"
                }}
                sx={{
                    backgroundColor: "background.default"
                }}
            >
                <Grid
                    data-testid="pages.daily_menu.info.title"
                    item
                    xs={10}
                    style={{
                        display: 'flex',
                        overflow: 'hidden',
                        flexDirection: "column",
                        justifyItems: "flex-start"
                    }}
                    sx={{
                        backgroundColor: "background.default"
                    }}
                >
                    <Typography
                        variant="h4"
                        color="text.primary"
                        noWrap
                    >
                        {intl.formatMessage({ id: "pages.daily_menu.info.title", defaultMessage: "Daily Menu Generator" })}
                    </Typography>
                </Grid>
                <Grid
                    data-testid="pages.daily_menu.info.description"
                    item
                    xs={10}
                    style={{
                        display: 'flex',
                        overflow: 'hidden',
                        flexDirection: "column",
                        justifyItems: "flex-start"
                    }}
                    sx={{
                        backgroundColor: "background.default"
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            my: 2
                        }}
                    >
                        {intl.formatMessage({
                            id: "pages.daily_menu.info.description.generator",
                            defaultMessage: "This tool generates random menu in loop until all conditions are fulfilled. Default conditions are:"
                        })}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {intl.formatMessage({
                            id: "pages.daily_menu.info.description.first_condition",
                            defaultMessage: "Summ of daily energy is between 80% and 100% of maximum allowed energy for a day (default maximum energy value is 2000 kcal)."
                        })}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {intl.formatMessage({
                            id: "pages.daily_menu.info.description.second_condition",
                            defaultMessage: "Ratios of fats, proteins and carbs are less or equal of maximum allowed ratio +2.5% tolerance (default ratios are 40% for both of proteins and carbs and 20% for fats)."
                        })}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            my: 2
                        }}
                    >
                        {intl.formatMessage({
                            id: "pages.daily_menu.info.description.ratios",
                            defaultMessage: "An error message will appear if conditions are not fulfilled in allowed count of iterations (300 by default). Then you can try generate menu again."
                        })}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            my: 2
                        }}
                    >
                        {intl.formatMessage({
                            id: "pages.daily_menu.info.description.session",
                            defaultMessage: "Generated menu will be here for you until you will close this browser tab or generate a new menu."
                        })}
                    </Typography>
                </Grid>
                <Grid
                    data-testid="pages.daily_menu.info.buttons"
                    item
                    justifyItems="center"
                    style={{
                        display: 'flex',
                        flexDirection: "column"
                    }}
                    sx={{
                        backgroundColor: "background.default"
                    }}
                >
                    <Form fields={fields} />
                    <Stack
                        direction="row"
                        justifyContent="center"
                    >
                        <ResetFormButton defaultForm={DEFAULT_FORM} />
                        <NewMenuButton />
                        <RandomMenuButton defaultForm={DEFAULT_FORM} />    
                    </Stack>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}

const DailyMenuData: FC<{}> =() => {
    const intl = useIntl()
    const theme = useMuiTheme()
    const { fetchedMenu } = useDailyMenu()
    const isLarge = useMediaQuery(theme.breakpoints.up('lg'))

    return (
        <React.Fragment>
            <Grid
                data-testid="pages.daily_menu.meals"
                item
                xs={8}
                lg={5}
                justifyContent="center"
                alignItems="center"
                style={{
                    display: 'flex',
                    overflow: 'hidden',
                    flexDirection: "column"
                }}
                sx={{
                    backgroundColor: "background.default"
                }}
            >
                <Typography
                    variant="h5"
                    color="text.primary"
                    noWrap
                    sx={{
                        m: 1
                    }}
                >
                    {intl.formatMessage({ id: "pages.daily_menu.meals.title", defaultMessage: "Here is your menu for today. Enjoy!" })}
                </Typography>
                {fetchedMenu?.foods && Object.entries(fetchedMenu?.foods).map(([mealName, food]: [string, IFood]) => {
                    if (food) return (
                        <RecipeCard
                            mealName={mealName as keyof IDailyMenu["foods"]}
                            food={food}
                            key={mealName}
                        />
                    )
                })}
            </Grid>
            <Grid
                data-testid="pages.daily_menu.nutrients_table"
                item
                xs={8}
                lg={5}
                justifyContent="center"
                alignItems="center"
                style={{
                    display: 'flex',
                    overflow: 'hidden',
                    flexDirection: "column"
                }}
                sx={{
                    backgroundColor: "background.default"
                }}
            >
                <Typography
                    variant="h5"
                    color="text.primary"
                    noWrap
                    sx={{
                        m: 1,
                        mt: (isLarge) ? 1 : 5
                    }}
                >
                    {intl.formatMessage({ id: "pages.daily_menu.nutrients_table.title", defaultMessage: "Nutrients table for this day" })}
                </Typography>
                {
                    (!fetchedMenu?.nutrients) ? null:
                    <NutrientsTable nutrients={fetchedMenu?.nutrients} tableName="daily_menu" />
                }
                
                <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                        m: 1,
                        px: 5
                    }}
                >
                    {intl.formatMessage({ id: "pages.daily_menu.nutrients_table.amount_note", defaultMessage: "Ratio of energy is calculated with refferency value 2000 kcal, the refferency value for fiber is 30 g." })}
                </Typography>
                <Stack
                    direction="row"
                    justifyContent="center"
                >
                    <ResetMenuButton />
                    <RandomMenuButton defaultForm={DEFAULT_FORM} />    
                </Stack>
            </Grid>
        </React.Fragment>
    )
}

const DailyMenuPage: FC<{}> = () => {
    const intl = useIntl()
    const theme = useMuiTheme()
    const isLarge = useMediaQuery(theme.breakpoints.up('lg'))
    const { fetchedMenu, isFetching } = useDailyMenu()

    var processingMessages = [
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.chopping_vegetable", defaultMessage: "Chopping vegetable..." }),
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.pepper", defaultMessage: "Little black pepper..." }),
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.not_little_not_much", defaultMessage: "Not too little and not too much - that's important!" }),
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.listers_sandwich", defaultMessage: "Triple fried egg, chilli, chutney sandwich - inspired by reading a book on bacterialogical warfare." }),
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.kebab_diablo", defaultMessage: "Shami kebab diablo - it's like eating molten lava." }),
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.that_hot", defaultMessage: "Do you really like them that hot sir?" }),
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.taters", defaultMessage: "What's taters, precious? What's taters, eh?" }),
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.lembas", defaultMessage: "Lembas bread. One small bite will fill the stomach of a grown man." }),
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.pea_soup", defaultMessage: "If you have pea soup, make sure you eat it before it eats you." }),
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.white_wolf", defaultMessage: "White wolf, did you eat Red Riding Hood?" }),
        intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.ketchup", defaultMessage: "You want ketchup?? With lobster? You want brown ketchup?!" })
    ]

    const shuffleMessages = (messages: string[]): string[] => {
        let currentIndex = messages.length, randomIndex

        while (currentIndex != 0) {
            randomIndex = Math.floor(Math.random() * currentIndex)
            currentIndex--

            [messages[currentIndex], messages[randomIndex]] = [
            messages[randomIndex], messages[currentIndex]]
        }

        return messages
    }

    return (
        <Paper
            elevation={0}
            sx={{ m: 2, p: 2 }}
        >
            <Grid
                data-testid="pages.daily_menu"
                container
                spacing={1}
                justifyContent="center"
                alignItems={(isLarge) ? "flex-start" : "center"}
                direction={(isLarge) ? "row" : "column"}
                style={{
                    display: 'flex',
                    overflow: 'hidden'
                }}
                sx={{
                    backgroundColor: "background.default"
                }}
            >
                <FormDataProvider>
                    {(!fetchedMenu) ? <DailyMenuInfo /> : <DailyMenuData />}
                </FormDataProvider>
            </Grid>
            {(!isFetching) ? null :
                <ProcessingBackdrop
                    messages={shuffleMessages(processingMessages)}
                    sx={{
                        backgroundColor: "background.default",
                        opacity: 0,
                        zIndex: 5
                    }}
                />
            }
        </Paper>
    )
}

export default DailyMenuPage