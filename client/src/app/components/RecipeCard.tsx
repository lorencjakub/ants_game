import React, { FC, useState, useEffect } from "react"
import {
    Button,
    Paper,
    Typography,
    Grid,
    Stack,
    IconButton
} from "@mui/material"
import { keyframes } from '@mui/system'
import { useTheme as useMuiTheme } from '@mui/material/styles'
import { IDailyMenu, IFood } from '../../base/utils/Axios/types'
import { useIntl, FormattedMessage } from "react-intl"
import { useLocale } from "../../base/Providers/Locales"
import {
    Warning as WarningIcon,
    Loop as ChangeIcon
} from '@mui/icons-material'
import { useDailyMenu } from "../Providers/DailyMenu"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import ApiClient from '../../base/utils/Axios/ApiClient'
import { AxiosError } from 'axios'
import { useFormData } from "../Providers/FormData"


const spin = keyframes`
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
`

const RecipeCard: FC<{ mealName: keyof IDailyMenu["foods"], food: IFood }> = ({ mealName, food }) => {
    const theme = useMuiTheme()
    const intl = useIntl()
    const client = useQueryClient()
    const { formData = {} } = useFormData()
    const { isRandomMenu = false, fetchedMenu = { foods: {} }, setIsRandomMenu, setFetchedMenu } = useDailyMenu()
    const { locale } = useLocale()
    const [onlyCz, setOnlyCz] = useState<boolean>(false)
    const [showLoading, setShowLoading] = useState<boolean>(false)

    const handleOpenRecipeClick = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer")
    }

    const mealNames: { [key: string] : string } = {
        breakfast: intl.formatMessage({ id: "containers.layout.content.recipe_card.breakfast", defaultMessage: "Breakfast" }),
        lunch: intl.formatMessage({ id: "containers.layout.content.recipe_card.lunch", defaultMessage: "Lunch" }),
        snack: intl.formatMessage({ id: "containers.layout.content.recipe_card.snack", defaultMessage: "Snack" }),
        dinner: intl.formatMessage({ id: "containers.layout.content.recipe_card.dinner", defaultMessage: "Dinner" }),
    }

    var localRecipeName = food[`${locale}_name` as keyof IFood]
    var localRecipeUrl = food[`${locale}_url` as keyof IFood]

    if (!localRecipeName || !localRecipeUrl) {
        localRecipeName = food.cs_name
        localRecipeUrl = food.cs_url

        if (!onlyCz) setOnlyCz(true)
    }

    const {
        mutate: handleReloadMealClick,
        status: reloadingMenu
    } = useMutation<IDailyMenu, AxiosError>(
        [`reload_meal_${mealName}`],
        async () => await ApiClient.reloadMeal(fetchedMenu?.foods as IDailyMenu["foods"], mealName, formData),
        {
            retry: 0,
            cacheTime: 0,
            onSuccess: (data) => {
                var newMenu = { ...fetchedMenu as IDailyMenu }
                newMenu.foods[mealName] = data.foods[mealName] as IFood
                newMenu.nutrients = data.nutrients

                setFetchedMenu && setFetchedMenu(newMenu)
                setIsRandomMenu && setIsRandomMenu(true)
            }
        }
    )

    useEffect(() => {
        if (client.isMutating()) {
            setTimeout(() => {
                if (client.isMutating()) {
                    setShowLoading(true)
                } else {
                    setShowLoading(false)
                }
            }, 1000)
        } else {
            setShowLoading(false)
        }
    }, [reloadingMenu])

    return (
        <Paper
            elevation={1}
            key={`${mealName}_recipe_key`}
            style={{
                display: 'flex',
                overflow: 'hidden'
            }}
            sx={{
                px: 5,
                py: 2,
                m: 1,
                width: "95%",
                backgroundColor: "primary.dark",
                borderRadius: 5
            }}
        >
            <Grid
                data-testid={`containers.layout.content.recipe_card.${mealName}`}
                container
                direction="column"
            >
                <Grid
                    data-testid={`containers.layout.content.recipe_card.${mealName}.header`}
                    container
                    direction="row"
                >
                    <Grid item xs={6}>
                        <Typography
                            variant="h6"
                            color="text.primary"
                            noWrap
                            sx={{
                                pt: 0.4
                            }}
                        >
                            {mealNames[mealName]}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Stack
                            direction="row"
                            justifyContent="end"
                        >
                            <IconButton
                                data-testid={`containers.layout.content.${mealName}.header.${(isRandomMenu) ? "random_reload_button" : "reload_button"}`}
                                onClick={() => handleReloadMealClick()}
                                sx={{
                                    color: theme.palette.text.primary
                                }}
                            >
                                <ChangeIcon
                                    sx={{
                                        animation: (showLoading) ?  `${spin} 1.3s reverse infinite ease` : undefined
                                    }}
                                />
                            </IconButton>
                        </Stack>
                    </Grid>
                </Grid>
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {localRecipeName as string}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                >
                    <FormattedMessage
                        id="containers.layout.content.recipe_card.portions"
                        defaultMessage="Portions: {portions}"
                        values={{ portions: food.portions }}
                    />
                </Typography>
                <Button
                    variant="outlined"
                    data-testid="containers.layout.content.recipe_source_button"
                    onClick={() => handleOpenRecipeClick(localRecipeUrl as string)}
                    sx={{
                        borderColor: theme.palette.primary.light,
                        maxWidth: 120,
                        mt: 1
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.primary"
                        noWrap
                    >
                        {intl.formatMessage({ id: "containers.layout.content.recipe_card.recipe", defaultMessage: "Recipe" })}
                    </Typography>
                </Button>
                {(onlyCz && (locale !== "cs")) ? 
                    <Grid
                        data-testid={`containers.layout.content.recipe_card.${mealName}.only_cz`}
                        container
                        direction="column"
                        alignItems="center"
                        sx={{
                            mt: 3
                        }}
                    >
                        <WarningIcon />
                        <Typography
                            variant="body2"
                            color="error"
                            noWrap
                        >
                            {intl.formatMessage({ id: "containers.layout.content.recipe_card.only_cz", defaultMessage: "Sadly, this recipe exists in the database only in the czech version." })}
                        </Typography>
                    </Grid>
                    : null
                }
            </Grid>
        </Paper>
    )
}

export default RecipeCard