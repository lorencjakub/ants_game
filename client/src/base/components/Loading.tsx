import React, { FC } from "react"
import {
    Paper,
    Typography,
    CircularProgress,
    Grid,
    Backdrop
} from "@mui/material"


const Loading: FC<{ message?: string, spinner?: JSX.Element, sx?: any }> = ({ message = "", spinner, sx }) => {
    return (
        <Backdrop
            open={true}
            data-testid="containers.layout.content.processing_backdrop"
            sx={{ ...sx }}
        >
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
                        {
                            (spinner) ?
                            spinner
                            :
                            <CircularProgress
                                sx={{
                                    color: "text.primary"
                                }}
                                disableShrink
                            />
                        }
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
                            {message}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Backdrop>
    )
}

export default Loading