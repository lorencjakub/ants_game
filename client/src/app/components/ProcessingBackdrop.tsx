import React, { FC } from "react"
import Loading from "../../base/components/Loading"
import { Backdrop } from "@mui/material"
import { useIntl } from "react-intl"


const ProcessingBackdrop: FC<{
    messages?: string[],
    loadingDefaultMessage?: string,
    spinner?: JSX.Element,
    sx?: any
}> = ({ messages = [], spinner, loadingDefaultMessage, sx = {} }) => {
    const intl = useIntl()

    const nothingToSay = intl.formatMessage({ id: "containers.layout.content.processing_backdrop.messages.thinking", defaultMessage: "Thinking about what to do..." })
    if (messages.indexOf(nothingToSay) === -1) messages.push(nothingToSay)
   
    return (
        <Backdrop
            open={true}
            data-testid="containers.layout.content.processing_backdrop"
            sx={{ ...sx }}
        >
            <Loading
                messages={messages}
                spinner={spinner}
                defaultMessage={loadingDefaultMessage || nothingToSay}
            />
        </Backdrop>
    )
}

export default ProcessingBackdrop