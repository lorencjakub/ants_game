import React, { FC, useState, useEffect } from "react"
import {
    Paper,
    Typography,
    CircularProgress,
    Grid
} from "@mui/material"
import { useIntl } from "react-intl"


const Loading: FC<{ messages?: string[], defaultMessage?: string, spinner?: JSX.Element }> = ({ messages = [], defaultMessage, spinner }) => {
    const intl = useIntl()
    if (!defaultMessage) defaultMessage = intl.formatMessage({ id: "containers.layout.content.loading.message", defaultMessage: "Loading..." })

    const [processIndex, setProcessIndex] = useState<number>(0)

    const startProcessingMessages = setInterval(() => {
        const nextIndex = (messages && (processIndex < messages.length - 1)) ? processIndex + 1 : 0
        setProcessIndex(nextIndex)
    }, 2000)

    const stopProcessingMessages = () => {
        setProcessIndex(0)
        clearInterval(startProcessingMessages)
    }

    useEffect(() => {
        stopProcessingMessages()
        if (messages.length != 0) startProcessingMessages
        return stopProcessingMessages()
    }, [])

    return (
        <Paper
            elevation={0}
            style={{
                display: 'flex',
                overflow: 'hidden'
            }}
            sx={{
                px: 5,
                py: 2,
                m: 1,
                width: "100%",
                height: "100%",
                backgroundColor: "background.default",
                borderRadius: 5
            }}
        >
            <Grid
                data-testid="containers.layout.content.loading.container"
                container
                direction="column"
                spacing={1}
                justifyContent="center"
                alignItems="center"
            >
                <Grid
                    data-testid="containers.layout.content.loading.spinner"
                    item
                    style={{
                        display: "flex",
                        justifyContent: "center"
                    }}
                >
                    <CircularProgress
                        sx={{
                            color: "text.primary"
                        }}
                        disableShrink
                    />
                </Grid>
                <Grid
                    data-testid="containers.layout.content.loading.message"
                    item
                    style={{
                        display: "flex",
                        justifyContent: "center"
                    }}
                >
                    <Typography
                        variant="h6"
                        color="text.primary"
                    >
                        {(messages.length != 0) ? messages[processIndex] : defaultMessage}
                    </Typography>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default Loading