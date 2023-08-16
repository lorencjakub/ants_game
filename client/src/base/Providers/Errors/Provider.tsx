import React, { FC } from "react"
import Context from "./Context"
import { FormattedMessage } from "react-intl"
import { errorList } from "./errors"


const ErrorProvider: FC<{ children: any }> = ({ children }) => {
    const parseErrorMessage = (error: string): JSX.Element => {
        var message: JSX.Element | undefined = undefined
        var messageId = error

        if (error == "Network Error") {
            messageId = "network_error"
        }

        try {
            message = errorList[messageId]
        } catch {}

        return message || <FormattedMessage id="errors.unspecified" defaultMessage="An unspecified error" />
    }
    
    return (
        <Context.Provider value={{ parseErrorMessage }}>
            {children}
        </Context.Provider>
    )
}

export default ErrorProvider