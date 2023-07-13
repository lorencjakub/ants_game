import React, { lazy } from "react"


const HomePage = lazy(() => import("../pages/Home"))
const Room = lazy(() => import("../pages/Room"))

const routes = [
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/room/:guid",
        element: <Room />,
    }
]

export default routes