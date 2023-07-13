import React, { FC, ReactNode } from 'react'
import { Scrollbars } from "react-custom-scrollbars-2"
import { useTheme as useMuiTheme } from "@mui/material/styles"


export interface IScrollBarProps {
    forwardedRef?: (view: any) => any
}

const Scrollbar: FC<{ children: ReactNode }> = ({ children }) => {
    const theme = useMuiTheme()

    return (
        <Scrollbars
            renderThumbVertical={(props) =>
                <div
                    { ...props }
                    style={{
                        background: theme.palette.text.primary,
                        borderRadius: 5,
                        "::hover": {
                            background: theme.palette.text.disabled
                        }
                    }}
                />
            }
            renderThumbHorizontal={(props) =>
                <div
                    { ...props }
                    style={{
                        background: theme.palette.text.primary,
                        borderRadius: 5,
                        "::hover": {
                            background: theme.palette.text.disabled
                        }
                    }}
                />
            }
            renderView={(props) => 
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflow: "scroll",
                        marginRight: -17,
                        marginBottom: -17
                    }}
                    className="view"
                />
            }
        >
            {children}
        </Scrollbars>
    )
}

export default Scrollbar