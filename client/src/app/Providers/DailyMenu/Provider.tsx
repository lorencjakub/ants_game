import React, { FC, useState, ReactNode, useEffect } from "react"
import Context from "./Context"
import { IDailyMenu } from '../../../base/utils/Axios/types'


const DailyMenuProvider: FC<{ children: ReactNode, persistKey?: string }> = ({ children, persistKey = "daily_menu" }) => {
    const persistDailyMenu = sessionStorage.getItem(persistKey)
    const [fetchedMenu, setFetchedMenu] = useState<IDailyMenu | null>(persistDailyMenu && JSON.parse(persistDailyMenu) || null)
    const [isFetching, setIsFetching] = useState<boolean>(false)
    const [isRandomMenu, setIsRandomMenu] = useState<boolean>(false)

    useEffect(() => {
        setFetchedMenu(fetchedMenu || null)
        sessionStorage.setItem(persistKey, JSON.stringify(fetchedMenu))
    }, [fetchedMenu])

    return (
        <Context.Provider value={{ fetchedMenu, setFetchedMenu, isFetching, setIsFetching, isRandomMenu, setIsRandomMenu }}>
            {children}
        </Context.Provider>
    )
}

export default DailyMenuProvider