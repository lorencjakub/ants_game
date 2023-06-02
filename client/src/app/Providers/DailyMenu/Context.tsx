import React from "react"
import { IDailyMenu } from '../../../base/utils/Axios/types'


interface IDailyMenuContext {
    fetchedMenu: IDailyMenu | null,
    setFetchedMenu?: (data: IDailyMenu | null) => void,
    isFetching: boolean,
    setIsFetching?: (isFetching: boolean) => void,
    isRandomMenu: boolean,
    setIsRandomMenu?: (isRandom: boolean) => void,
}

const DailyMenuContext = React.createContext<Partial<IDailyMenuContext>>({
    fetchedMenu: undefined,
    isFetching: false,
    isRandomMenu: false
})

export default DailyMenuContext