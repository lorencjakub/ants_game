import React, { createContext } from "react"


interface IErrorContext {
    parseErrorMessage: (error: string) => JSX.Element
}

const Context = createContext<Partial<IErrorContext>>({})

export default Context