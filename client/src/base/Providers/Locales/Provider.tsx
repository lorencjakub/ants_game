import React, { FC, useState, useEffect } from "react"
import Context from "./Context"
import {
    flagUrls,
    enMessages,
    csMessages,
    deMessages
} from "../../../app/config/locales"


export function messagesGetter(locale: string) {
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

const LocaleProvider: FC<{ children: any, persistKey?: string, defaultLocale?: string }> = ({ children, persistKey = "locale", defaultLocale = "cs" }) => {
    const persistLocale = localStorage.getItem(persistKey)
    const [locale, setLocale] = useState<string>(persistLocale || defaultLocale)
    const flags: { [key: string] : string } = { ...flagUrls}
    const allLocales = Object.keys(flags)

    useEffect(() => {
        setLocale(locale)
        localStorage.setItem(persistKey, locale)
    }, [locale])

    const getLocaleFlagUrl = (locale: string) => {
        return flags[locale || defaultLocale]
    }

    const getMessages = () => {
        return messagesGetter(locale || defaultLocale)
    }

    return (
        <Context.Provider value={{ locale, setLocale, getLocaleFlagUrl, getMessages, allLocales }}>
            { children }
        </Context.Provider>
    )
}

export default LocaleProvider