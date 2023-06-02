import React, { createContext } from "react"
import { IFormData } from "../../../base/utils/types"


interface IFormDataContext {
    formData: IFormData,
    setFormData: (data: IFormData) => void
}

const Context = createContext<Partial<IFormDataContext>>({})

export default Context