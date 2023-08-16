import { EventNames } from "../base/Providers/SocketIo"


var MOCKED_SOCKETIO_EVENTS: { [eventName: string]: ((...args: any) => void)[] } = {}

const mockedEmit = (eventName: string, args: any) => {
    MOCKED_SOCKETIO_EVENTS[eventName].forEach(func => func(...args))
}

const mockedOn = (eventName: string, func: (...args: any) => void) => {
    if (MOCKED_SOCKETIO_EVENTS[eventName]) {
        MOCKED_SOCKETIO_EVENTS[eventName].push(func)
    } else {
        MOCKED_SOCKETIO_EVENTS[eventName] = [func]
    }
}

const mockedDisconnect = () => {
    MOCKED_SOCKETIO_EVENTS = {}
}

const socket = {
    on: mockedOn,
    emit: mockedOn,
    disconnect: mockedDisconnect
}

const io = (url: string, opts?: any) => {
    mockedOn(EventNames.SERVER_STATE_UPDATE, () => {})
    mockedOn(EventNames.SERVER_WINNER, () => {})
    
    return socket
}

// Server emit emulator
const serverSocket = { emit: (eventName: string, ...args: any) => mockedEmit(eventName, args) }

export { io, socket, serverSocket, MOCKED_SOCKETIO_EVENTS }