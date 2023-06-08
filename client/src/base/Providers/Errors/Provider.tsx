import React, { FC } from "react"
import Context from "./Context"
import { FormattedMessage } from "react-intl"


const ErrorProvider: FC<{ children: any }> = ({ children }) => {
    const errorList: { [key: string] : JSX.Element } = {
        // "no_menu": <FormattedMessage id="api_errors.no_menu" defaultMessage="No generated menu does suit defined nutrient parameters. Please, try it again or change your parameters." />,
        // "wrong_menu_inputs": <FormattedMessage id="api_errors.wrong_menu_inputs" defaultMessage="Wrong inputs" />,
        // "network_error": <FormattedMessage id="api_errors.network_error" defaultMessage="Network Error" />
    }

    const parseErrorMessage = (error: string): JSX.Element => {
        var message: JSX.Element | undefined = undefined
        var messageId = error

        if (error == "Network Error") {
            messageId = "network_error"
        }

        try {
            message = errorList[messageId]
        } catch {
            false
        }

        return message || <FormattedMessage id="errors.unspecified" defaultMessage="An unspecified error" />
    }
    
    return (
        <Context.Provider value={{ parseErrorMessage }}>
            {children}
        </Context.Provider>
    )
}

export default ErrorProvider