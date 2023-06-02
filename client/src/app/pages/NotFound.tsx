import React, { FC } from 'react'
import {
    Button,
    Paper,
    Grid,
    Typography
} from "@mui/material"
import { useNavigate } from 'react-router-dom'
import { useTheme as useMuiTheme } from "@mui/material/styles"
import { useIntl } from "react-intl"


const NotFound: FC<{}> = () => {
    const navigate = useNavigate()
    const theme = useMuiTheme()
    const intl = useIntl()

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
                data-testid="pages.not_found.container"
                container
                direction="column"
                spacing={1}
                justifyContent="center"
                alignItems="center"
            >
                <Grid
                    data-testid="pages.not_found.title"
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
                        {intl.formatMessage({ id: "pages.not_found.title", defaultMessage: "Page not found!" })}
                    </Typography>
                </Grid>
                <Grid
                    data-testid="pages.not_found.home_button"
                    item
                    style={{
                        display: "flex",
                        justifyContent: "center"
                    }}
                >
                    <Button
                        onClick={() => navigate("/")}
                        variant="contained"
                        sx={{
                            mt: 2,
                            backgroundColor: theme.palette.text.primary
                        }}
                    >
                        <Typography color="text.secondary">
                            {intl.formatMessage({ id: "pages.not_found.home_button", defaultMessage: "To the homepage" })}
                        </Typography>
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default NotFound