import React, { Suspense, lazy, FC } from "react"
import {
    BrowserRouter,
    Route,
    Routes
} from 'react-router-dom'
import Loading from "../components/Loading"
import ErrorBoundary from "../utils/ErrorBoundary"
import { Grid } from "@mui/material"


const Page = lazy(() => import("./Page"))

const Layout: FC<{}> = () => {
    return (
        <ErrorBoundary>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="*"
                        element={
                            <Suspense
                                fallback={
                                    <Grid
                                        container
                                        style={{
                                            width: "100%",
                                            height: "100vh",
                                            display: "flex",
                                            justifyItems: "center",
                                            alignItems: "center"
                                        }}
                                    >
                                        <Loading />
                                    </Grid>
                                }
                            >
                                <Page />
                            </Suspense>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </ErrorBoundary>
    )
}

export default Layout