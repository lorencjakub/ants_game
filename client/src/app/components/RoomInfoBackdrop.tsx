import { FC } from "react"
import { ReactJSXElement } from '@emotion/react/types/jsx-namespace'
import { useIntl } from "react-intl"
import { useNavigate } from "react-router-dom"
import {
    Button,
    Grid,
    Typography
} from "@mui/material"



const RoomInfoBackdrop: FC<{ message?: string | ReactJSXElement }> = ({ message }) => {
    const intl = useIntl()
    const navigate = useNavigate()

    return (
        <Grid
            container
            direction="column"
            alignItems="center"
        >
            <Typography
                color="text.primary"
                variant="h5"
                textAlign="center"
                sx={{
                    mb: 2
                }}
            >
                {message}
            </Typography>
            <Button
                variant="contained"
                onClick={() => {
                    sessionStorage.setItem("Token", "")
                    navigate("/")
                }}
                sx={{
                    backgroundColor: "text.primary",
                    maxWidth: 250
                }}
            >
                {intl.formatMessage({ id: "processing_backdrop_message.lock_button", defaultMessage: "Leave battlefield" })}
            </Button>
        </Grid>
    )
}

export { RoomInfoBackdrop }