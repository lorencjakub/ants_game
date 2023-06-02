import React, { createContext } from "react"


interface ILocaleContext {
    locale?: string,
    setLocale?: (locale: string) => void,
    getLocaleFlagUrl?: (locale: string) => string,
    getMessages?: (locale: string) => { [key: string] : string },
    allLocales: string[]
}

const ThemeContext = createContext<Partial<ILocaleContext>>({})

export default ThemeContext