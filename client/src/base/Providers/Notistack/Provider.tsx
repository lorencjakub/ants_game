import React, { FC, ReactNode } from "react"
import { SnackbarProvider, useSnackbar, SnackbarKey } from "notistack"
import { IconButton } from "@mui/material"
import { Close as IconClose } from "@mui/icons-material"


const SnackbarCloseButton: FC<{ key: SnackbarKey }> = ({ key }) => {
    const { closeSnackbar } = useSnackbar()

    return (
        <IconButton onClick={(() => closeSnackbar(key))} color="inherit">
            <IconClose />
        </IconButton>
    )
}

const NotistackProvider: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <SnackbarProvider
            autoHideDuration={parseInt(process.env.TOAST_AUTOHIDE || "5000")}
            maxSnack={parseInt(process.env.TOAST_COUNT || "3")}
            preventDuplicate={true}
            hideIconVariant={true}
            action={(key: SnackbarKey) => <SnackbarCloseButton key={key} />}
        >
            { children }
        </SnackbarProvider>
    )
}

export default NotistackProvider