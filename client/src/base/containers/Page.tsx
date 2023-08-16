import React, { FC, Suspense, lazy } from 'react'
import {
    BrightnessHigh as LightIcon,
    BrightnessLow as DarkIcon
} from '@mui/icons-material'
import { Switch } from "@mui/material"
import { useThemeMode } from '../Providers/ThemeMode'
import {
    Box,
    Grid,
    Select,
    MenuItem
} from '@mui/material'
import { useRoutes } from 'react-router-dom'
import routes from '../../app/config/routes'
import PageHeader from '../../app/components/PageHeader'
import PageFooter from '../../app/components/PageFooter'
import { useTheme as useMuiTheme } from '@mui/material/styles'
import { useLocale } from '../Providers/Locales'
import Loading from '../components/Loading'
import Scrollbar from "../components/CustomScrollbar"


const NotFoundPage = lazy(() => import("../../app/pages/NotFound"))

const Page: FC<{}> = () => {
    const { themeMode, toggleThemeMode } = useThemeMode()
    const theme = useMuiTheme()
    const { locale, setLocale, getLocaleFlagUrl, allLocales } = useLocale()
    const locales = allLocales || []

    return (
        <div
            data-testid="containers.layout"
            style={{
                display: 'flex',
                flexDirection: "column", 
                margin: 30,
                height: "calc(100vh - 60px)"
            }}
        >
            <Suspense fallback={<Loading />}>
                <Grid
                    data-testid="containers.layout.header.container"
                    container
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                    style={{
                        display: 'flex',
                        overflow: 'hidden',
                        marginLeft: 10,
                        marginRight: 10,
                        marginTop: 20,
                        maxWidth: "calc(100% - 20px)"
                    }}
                    sx={{
                        backgroundColor: "primary",
                        color: "text.primary"
                    }}
                >
                    <PageHeader
                        pageTitle="ANTS ONLINE"
                        appBarContent={
                            <React.Fragment>
                                <Select
                                    value={locale}
                                    onChange={(e) => setLocale && setLocale(e.target.value)}
                                    name="language_select"
                                    data-testid="containers.layout.header.appbar.language_select"
                                >
                                    {locales.map((value: string) => {
                                        return (
                                            <MenuItem
                                                value={value}
                                                key={`language_option_${value}`}
                                            >
                                                <Box
                                                    data-testid="containers.layout.header.appbar.flag"
                                                    component="img"
                                                    src={getLocaleFlagUrl && getLocaleFlagUrl(value) || ""}
                                                    aria-label="logo"
                                                    sx={{
                                                        height: 24,
                                                        width: 24,
                                                        position: "relative",
                                                        top: 3
                                                    }}
                                                />
                                            </MenuItem>
                                        )
                                    })}
                                </Select>
                                <Switch
                                    data-testid="containers.layout.header.appbar.theme_mode_switcher"
                                    checked={(themeMode === "dark")}
                                    onClick={ () => {toggleThemeMode && toggleThemeMode()} }
                                    checkedIcon={<DarkIcon sx={{ bottom: 5, color: theme.palette.text.primary }} />}
                                    icon={<LightIcon sx={{ bottom: 5, color: theme.palette.text.primary }} />}
                                    sx={{
                                        height: 42
                                    }}
                                />
                            </React.Fragment>
                        }
                    />
                </Grid>
                <Scrollbar>
                    <Grid
                        data-testid="containers.layout.content.container"
                        container
                        spacing={1}
                        justifyContent="center"
                        alignItems="center"
                        direction="row"
                        style={{
                            height: 'calc(100% - 146px)',
                            display: 'flex',
                            margin: 10,
                            maxWidth: "calc(100% - 20px)"
                        }}
                        sx={{
                            backgroundColor: "primary",
                            overflow:"scrollbar"
                        }}
                    >
                        <Suspense fallback={<Loading/>}>
                            {useRoutes([...routes]) || <NotFoundPage />}
                        </Suspense>
                    </Grid>
                </Scrollbar>
                <Grid
                    data-testid="containers.layout.footer.container"
                    container
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                    direction="row"
                    style={{
                        display: 'flex',
                        overflow: 'hidden',
                        marginLeft: 10,
                        marginRight: 10,
                        marginBottom: 20,
                        maxWidth: "calc(100% - 20px)"
                    }}
                    sx={{
                        backgroundColor: "primary",
                        color: "text.primary"
                    }}
                >
                    <PageFooter />
                </Grid>
            </Suspense>
        </div>
    )
}

export default Page