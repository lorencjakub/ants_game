import React, { Suspense, lazy, FC, useMemo, useEffect } from "react"
import CircularProgress from '@mui/material/CircularProgress'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { ThemeModeProvider } from '../Providers/ThemeMode'
import { LocaleProvider, useLocale } from "../Providers/Locales"
import {
    QueryClientProvider,
    NotistackProvider
} from "../Providers"
import { IntlProvider } from "react-intl"
import Loading from "../components/Loading"
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import themes from "../../app/config/themes"
import { useThemeMode } from '../Providers/ThemeMode'
import {
    useMediaQuery,
    CssBaseline
} from "@mui/material"
import { ErrorProvider } from "../Providers/Errors"


const Layout = lazy(() => import("./Layout"))
const cache = createCache({
    key: "nutri-react-cache-key",
    nonce: process.env.NONCE || "rAnd0mNonce",
    prepend: true
})

const AppContainer: FC<{}> = () => {
    const { locale, getMessages } = useLocale()
    const messages = useMemo(
        () => (getMessages) ? getMessages(locale || "cs") : {},
        [locale]
    )

    const { themeMode, toggleThemeMode } = useThemeMode()
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

    useEffect(() => {
        if ((themeMode == "light") && prefersDarkMode && toggleThemeMode) toggleThemeMode()    
    }, [])

    const theme = useMemo(
        () => themes[String(themeMode)],
        [themeMode]
    )

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline enableColorScheme>
                <IntlProvider locale={locale || "cs"} messages={messages}>
                    <ErrorProvider>
                        <NotistackProvider>
                            <QueryClientProvider>
                                <Suspense fallback={
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "100vh",
                                            display: "flex",
                                            justifyItems: "center",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Loading />
                                    </div>
                                }>
                                    {<Layout />}
                                </Suspense>
                            </QueryClientProvider>
                        </NotistackProvider>
                    </ErrorProvider>
                </IntlProvider>
            </CssBaseline>
        </MuiThemeProvider>
    )
}

const App: FC<{}> = () => {
    return (
        <Suspense fallback={<CircularProgress />}>
            <CacheProvider value={cache}>
                <LocaleProvider>
                    <ThemeModeProvider>
                        <AppContainer />
                    </ThemeModeProvider>
                </LocaleProvider>
            </CacheProvider>
        </Suspense>
    )
}

export default App