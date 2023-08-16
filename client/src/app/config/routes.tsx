import React, { lazy } from "react"
import { Navigate } from "react-router-dom"


const HomePage = lazy(() => import("../pages/Home"))
const Room = lazy(() => import("../pages/Room"))
const Invitation = lazy(() => import("../pages/Invitation"))

const routes = [
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/room/:guid",
        element: <Room />,
    },
    {
        path: "/invitation/:guid",
        element: <Invitation />
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]

export default routes