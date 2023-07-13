import React, { FC, useState, useEffect } from "react"
import Context from "./Context"
import {
    flagUrls,
    enMessages,
    csMessages,
    deMessages
} from "../../../app/config/locales"


export function messagesGetter(locale: string): { [key: string]: string } {
    switch (locale) {
        case "cs":
            return csMessages
        case "en":
            return enMessages
        case "de":
            return deMessages
        default:
            throw Error(`No messages found for locale ${locale}`)
    }
}

const LocaleProvider: FC<{ children: any, persistKey?: string, defaultLocale?: string }> = ({ children, persistKey = "locale", defaultLocale = String(process.env.DEFAULT_LANGUAGE) }) => {
    const persistLocale = localStorage.getItem(persistKey)
    const [locale, setLocale] = useState<string>(persistLocale || defaultLocale)
    const flags: { [key: string] : string } = { ...flagUrls}
    const allLocales = Object.keys(flags).filter(l => String(process.env.ACTIVE_LANGUAGES).split(",").includes(l))

    useEffect(() => {
        const lang: string = (process.env.ACTIVE_LANGUAGES || "cs").split(",").includes(locale) ? locale : String(process.env.DEFAULT_LANGUAGE)
        setLocale(lang)
        localStorage.setItem(persistKey, lang)
    }, [locale])

    const getLocaleFlagUrl = (locale: string) => {
        return flags[locale || defaultLocale]
    }

    const getMessages = (locale?: string) => {
        return messagesGetter(locale || String(process.env.DEFAULT_LANGUAGE))
    }

    return (
        <Context.Provider value={{ locale, setLocale, getLocaleFlagUrl, getMessages, allLocales }}>
            { children }
        </Context.Provider>
    )
}

export default LocaleProvider