enum EventNames {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    JOIN_ROOM = "join_room",
    LEAVE_ROOM = "leave_room",
    LEAVE_SERVER = "leave_server",
    SERVER_STATE_UPDATE = "server_state_update",
    CLIENT_STATE_UPDATE = "client_state_update",
    SERVER_WINNER = "server_winner",
    CLIENT_WINNER = "client_winner",
    CHAT_MESSAGE = "chat_message",
    SERVER_CHAT_MESSAGE = "server_chat_message",
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    ERROR = "error",
    TURN_TIMEOUT = "turn_timeout"
}

export { EventNames }