from flask import request, current_app
from flask_socketio import emit, join_room
from .. import socketio
from ..models import Players, Rooms
from ..services.functions import get_current_state_in_room, check_room_and_player_for_ws_events, draw_cards, \
    player_join_room_or_get_data, deactivate_room, make_switch_turn
import traceback
import logging
from ..services.error_handlers import CustomError
from datetime import datetime
from functools import wraps
from typing import Callable


def ws_error_handler(func: Callable):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            func(*args, **kwargs)

        except Exception as err:
            logging.error(traceback.format_exc())
            emit("error", {"event": func.__name__, "messages": err.code if isinstance(err, CustomError) else err.args})

    return wrapper


@socketio.on('connect')
def connect(*args, **kwargs):
    """event listener when client connects to the server"""
    print(f'{request.sid} is connected to the game')


@socketio.on('disconnect')
def disconnect(*args, **kwargs):
    """event listener when client disconnects to the server"""
    print(f'{request.sid} disconnected from the game')


@socketio.on('connect', namespace="/chat")
@ws_error_handler
def connect(*args, **kwargs):
    """event listener when client connects to the server"""
    print(f'{request.sid} is connected to the chat')

    token = request.args.get("Token")

    if token:
        room, player = check_room_and_player_for_ws_events(token)
        join_room(room.guid)

        emit(
            "server_chat_message",
            {"player": player.token, "time": datetime.now().strftime("%H:%M:%S"), "message": f'{player.name} joined the battle!'},
            to=room.guid,
            namespace="/chat"
        )


@socketio.on('disconnect', namespace="/chat")
@ws_error_handler
def disconnect(*args, **kwargs):
    """event listener when client disconnects to the server"""
    print(f'{request.sid} disconnected from the chat')

    token = request.args.get("Token")

    if token:
        room, player = check_room_and_player_for_ws_events(token)
        join_room(room.guid)
        emit(
            "server_chat_message",
            {"player": player.token, "time": datetime.now().strftime("%H:%M:%S"), "message": f'{player.name} fled in fear!'},
            to=room.guid,
            namespace="/chat"
        )


@socketio.on('join_game')
@ws_error_handler
def join_game(guid, token: str | None = None):
    with current_app.app_context():
        data = player_join_room_or_get_data(guid, request=None, token=token)
        join_room(guid)

        emit("join_game", data)

        if token:
            room, player = check_room_and_player_for_ws_events(token)

            if guid != room.guid:
                target_room = Rooms.query.filter_by(guid=guid).first()

                if target_room and not target_room.active:
                    raise CustomError("Room is not active anymore")

                raise CustomError("Invalid room")

            emit("server_state_update", get_current_state_in_room(room.guid), to=guid)


@socketio.on("server_state_update")
@ws_error_handler
def server_state_update(data, token: str | None = None):
    """Event listener when player finish his turn, game is going to update state."""
    room, player = check_room_and_player_for_ws_events(token)
    action = data.get("action")
    state = {
        "discarded": data.get("discarded"),
        "on_turn": Players.query.get(room.player_on_turn).token
    }

    state.update(get_current_state_in_room(data.get("guid")))

    join_room(room.guid)
    emit("server_state_update", state, to=room.guid)


@socketio.on("leave_game")
@ws_error_handler
def leave_game(token: str):
    """Event listener when player finish his turn, game is going to update state."""
    room, player = check_room_and_player_for_ws_events(token)
    room.update(active=False)

    join_room(room.guid)
    emit("leave_server", player.token, to=room.guid)


@socketio.on('server_winner')
@ws_error_handler
def server_winner(winner_token: str, token: str | None = None):
    """event listener when client connects to the server"""
    room, player = check_room_and_player_for_ws_events(token)
    winner_player = Players.query.filter_by(token=winner_token).first()

    join_room(room.guid)
    emit("client_winner", winner_player.token, to=room.guid)

    deactivate_room(room.guid, request, winner_player.token, [p for p in room.players if p.is_host][0])


@socketio.on('turn_timeout')
@ws_error_handler
def turn_timeout(guid: str):
    """event listener when player did not make his turn in time"""
    room = Rooms.query.filter_by(guid=guid).first()
    make_switch_turn(room)

    state = {"on_turn": Players.query.get(room.player_on_turn).token}
    state.update(get_current_state_in_room(guid))

    join_room(room.guid)
    emit("server_state_update", state, to=room.guid)


@socketio.on("chat_message", namespace="/chat")
@ws_error_handler
def chat_message(message: str, token: str | None = None):
    """Event listener when player finish his turn, game is going to update state."""
    room, player = check_room_and_player_for_ws_events(token)

    join_room(room.guid)
    emit(
        "server_chat_message",
        {"player": player.token, "time": datetime.now().strftime("%H:%M:%S"), "message": message},
        to=room.guid,
        namespace="/chat"
    )
