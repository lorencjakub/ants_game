import React, { FC } from 'react'
import {
    Paper,
    Grid,
    Typography
} from "@mui/material"
import { useIntl } from "react-intl"


const ErrorPage: FC<{}> = () => {
    const intl = useIntl()

    return (
        <Paper
            elevation={0}
            sx={{
                px: 5,
                py: 2,
                m: 1,
                backgroundColor: "background.default",
                borderRadius: 5
            }}
            style={{
                width: "calc(100% - 16px)",
                height: "calc(100vh - 16px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: 'hidden'
            }}
        >
            <Typography
                variant="h6"
                color="text.primary"
            >
                {intl.formatMessage({ id: "pages.error.title", defaultMessage: "An error occured in application :(" })}
            </Typography>
        </Paper>
    )
}

export default ErrorPage