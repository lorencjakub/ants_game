import React, { lazy } from "react"


const HomePage = lazy(() => import("../pages/Home"))
const DailyMenuPage = lazy(() => import("../pages/DailyMenu"))

const routes = [
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/menu",
        element: <DailyMenuPage />,
    }
]

export default routes