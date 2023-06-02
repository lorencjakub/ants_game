import React, { FC } from "react"
import {
    Grid,
    Typography,
    Link
} from "@mui/material"


const PageFooter: FC<{}> = () => {
    const currentYear = new Date().getFullYear() 
    
    return (
        <React.Fragment>
            <Grid
                data-testid="containers.layout.footer"
                container
                spacing={1}
                justifyContent="center"
                alignItems="center"
                direction="row"
                style={{
                    display: 'flex',
                    overflow: 'hidden',
                }}
                position="absolute"
                sx={{
                    backgroundColor: "primary.dark",
                    p: 2,
                    height: 64,
                    bottom: 0,
                    left: 0,
                    width: "calc('100%')"
                }}
            >
                <Typography
                    variant="body1"
                    color="text.primary"
                    noWrap
                    sx={{
                        mx: 2
                    }}
                >
                    {`2022${(currentYear != 2022) ? `-${currentYear}` : ""} Jakub Lorenc`}
                </Typography>
                <Link
                    variant="body1"
                    color="text.primary"
                    href="https://github.com/lorencjakub/nutri_manager"
                    sx={{
                        mx: 2
                    }}
                >
                    Source Code
                </Link>
            </Grid>
            <div
                style={{
                    alignItems: 'center',
                    minHeight: 56
                }}
            />
        </React.Fragment>
    )
}

export default PageFooter