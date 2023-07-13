import React, { createContext } from "react"


interface IThemeContext {
    themeMode?: string,
    toggleThemeMode?: () => void
}

const ThemeContext = createContext<Partial<IThemeContext>>({})

export default ThemeContext