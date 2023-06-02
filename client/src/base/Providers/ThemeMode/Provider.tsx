import React, { FC, useState, useEffect } from "react"
import Context from "./Context"


function reducer(mode: string) {
    switch (mode) {
        case "light":
            return "dark"
        case "dark":
            return "light"
        default:
            console.error("Theme mode is neither light or dark.")
            return "light"
    }
}

const ThemeModeProvider: FC<{ children: any, persistKey?: string, defaultMode?: string }> = ({ children, persistKey = "theme_mode", defaultMode = "dark" }) => {
    const persistThemeMode = localStorage.getItem(persistKey)
    const [themeMode, setThemeMode] = useState<string>(persistThemeMode || defaultMode)

    const toggleThemeMode = () => setThemeMode(reducer(themeMode))
    
    useEffect(() => {
        setThemeMode(themeMode)
        localStorage.setItem(persistKey, themeMode)
    }, [themeMode])

    return (
        <Context.Provider value={{ themeMode, toggleThemeMode }}>
            { children }
        </Context.Provider>
    )
}

export default ThemeModeProvider