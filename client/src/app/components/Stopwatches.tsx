import { useState, useEffect, FC } from 'react'
import { useParams } from 'react-router-dom'
import { gameSocket, EventNames } from '../../base/Providers/SocketIo'
import {
    Box,
    CircularProgress,
    Typography
} from "@mui/material"


const Stopwatches: FC<{}> = () => {
    const { guid } = useParams()
    const [value, setValue] = useState<number>(parseInt(process.env.DEFAULT_TURN_TIMEOUT || "60"))

    var timer: NodeJS.Timer

    useEffect(() => {
        if (gameSocket.connected && (value == 0)) {
            gameSocket.emit(EventNames.TURN_TIMEOUT, guid)
            clearInterval(timer)
        }
    }, [value])

    useEffect(() => {
        timer = setInterval(() => {
            setValue(current => {
                return (current <= 0) ? 0 : current - 1
            })
        }, 1000)

        return (() => clearInterval(timer))
    }, [])    

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', top: -4 }}>
            <CircularProgress sx={{ color: "text.primary" }} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                    sx={{ pb: 1 }}
                >
                    {value}
                </Typography>
            </Box>
        </Box>
    )
}

export { Stopwatches }