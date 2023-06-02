import React, { FC, useState } from "react"
import Context from "./Context"
import { IFormData } from "../../../base/utils/types"


const FormDataProvider: FC<{ children: any }> = ({ children }) => {
    const [ formData, setData ] = useState<IFormData>({})
    
    const setFormData = (data: IFormData) => {
        setData(data)
    }

    return (
        <Context.Provider value={{ formData, setFormData }}>
            {children}
        </Context.Provider>
    )
}

export default FormDataProvider