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


const HomePage: FC<{}> = () => {
    const navigate = useNavigate()
    const theme = useMuiTheme()
    const intl = useIntl()

    return (
        <Paper
            elevation={0}
            style={{
                display: 'flex',
                flexDirection: "row",
                overflow: 'hidden',
                minHeight: 310
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
                data-testid="pages.homepage.container"
                container
                direction="column"
                spacing={1}
                justifyContent="center"
                alignItems="center"
                sx={{
                    display: 'flex',
                    overflow: "auto"
                }}
            >
                <Grid
                    data-testid="pages.homepage.title"
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
                        {intl.formatMessage({ id: "pages.homepage.title", defaultMessage: "Welcome!" })}
                    </Typography>
                </Grid>
                <Grid
                    data-testid="pages.homepage.about"
                    item
                    style={{
                        display: "flex",
                        justifyContent: "flex-start"
                    }}
                >
                    <Typography
                        variant="body1"
                        color="text.secondary"
                    >
                        {intl.formatMessage({ id: "pages.homepage.about", defaultMessage: "This is the online version of a czech freeware game Ants made by Ing. Miroslav Němeček" })}
                    </Typography>
                </Grid>
                <Grid
                    data-testid="pages.homepage.menu_button"
                    item
                    style={{
                        display: "flex",
                        justifyContent: "center"
                    }}
                >
                    <Button
                        onClick={() => navigate("/create_room")}
                        variant="contained"
                        sx={{
                            backgroundColor: theme.palette.text.primary,
                            m: 3
                        }}
                    >
                        {intl.formatMessage({ id: "pages.homepage.new_room_button", defaultMessage: "Create a new Room" })}
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    )
}

export default HomePage