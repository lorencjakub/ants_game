import React, { Suspense, lazy, FC } from "react"
import {
    BrowserRouter,
    Route,
    Routes
} from 'react-router-dom'
import Loading from "../components/Loading"


const Page = lazy(() => import("./Page"))

const Layout: FC<{}> = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="*"
                    element={
                        <Suspense
                            fallback={
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100vh",
                                        display: "flex",
                                        justifyItems: "center",
                                        alignItems: "center"
                                    }}
                                >
                                    <Loading />
                                </div>
                            }
                        >
                            <Page />
                        </Suspense>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}

export default Layout