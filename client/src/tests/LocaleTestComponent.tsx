import React, { FC } from "react"
import { messagesGetter } from "../base/Providers/Locales/Provider"
import { IntlProvider } from "react-intl"


const LocaleComponent: FC<{ locale?: string, children?: any }> = ({ locale = "cs", children = null }) => {
    localStorage.setItem("locale", locale)
    const messages = messagesGetter(locale)

    return (
        <IntlProvider locale={locale} messages={messages}>
            {children}
        </IntlProvider>
    )
}

export default LocaleComponent