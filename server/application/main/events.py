from flask import request, current_app, session
from flask_socketio import emit, join_room, leave_room, close_room, ConnectionRefusedError
from .. import socketio
from ..models import Players, Rooms
from ..services.functions import get_current_state_in_room, check_room_and_player_for_ws_events, draw_cards, \
    player_join_room_or_get_data, deactivate_room, make_switch_turn
from ..services.auth import get_saved_player
import traceback
import logging
from ..services.error_handlers import CustomError
from datetime import datetime


@socketio.on('connect')
def connect():
    """event listener when client connects to the server"""
    print(f'{request.sid} is connected to the game')


@socketio.on('disconnect')
def disconnect():
    """event listener when client disconnects to the server"""
    print(f'{request.sid} disconnected from the game')


@socketio.on('connect', namespace="/chat")
def connect():
    """event listener when client connects to the server"""
    try:
        print(f'{request.sid} is connected to the chat')

        token = request.args.get("Token")

        if token:
            room, player = check_room_and_player_for_ws_events(token)
            join_room(room.guid)

            emit("server_chat_message",
                 {"player": player.token, "time": datetime.now().strftime("%H:%M:%S"), "message": f'{player.name} joined the battle!'},
                 to=room.guid,
                 namespace="/chat")

    except Exception as e:
        logging.error(traceback.format_exc())
        emit("error", {"event": "server_chat_message", "message": e.description if isinstance(e, CustomError) else e.args[0]})


@socketio.on('disconnect', namespace="/chat")
def disconnect():
    """event listener when client disconnects to the server"""
    try:
        print(f'{request.sid} disconnected from the chat')

        token = request.args.get("Token")

        if token:
            room, player = check_room_and_player_for_ws_events(token)

            emit("server_chat_message",
                 {"player": player.token, "time": datetime.now().strftime("%H:%M:%S"), "message": f'{player.name} fled in fear!'},
                 to=room.guid,
                 namespace="/chat")

    except Exception as e:
        logging.error(traceback.format_exc())
        emit("error", {"event": "server_chat_message", "message": e.description if isinstance(e, CustomError) else e.args[0]})


@socketio.on('join_room')
def on_join(guid, token: str | None = None):
    try:
        with current_app.app_context():
            data = player_join_room_or_get_data(guid, request=None, token=token)
            join_room(guid)

            emit("join_room", data)

            if token:
                room, player = check_room_and_player_for_ws_events(token)

                if guid != room.guid:
                    target_room = Rooms.query.filter_by(guid=guid).first()

                    if target_room and not target_room.active:
                        raise CustomError("Room is not active anymore")

                    raise Exception("Invalid room")

                emit("server_state_update", get_current_state_in_room(room.guid), to=guid)

    except Exception as e:
        logging.error(traceback.format_exc())
        emit("error", {"event": "join_room", "message": e.description if isinstance(e, CustomError) else e.args[0]})


@socketio.on("server_state_update")
def handle_state_update(data, token: str | None = None):
    """Event listener when player finish his turn, game is going to update state."""
    try:
        room, player = check_room_and_player_for_ws_events(token)
        action = data.get("action")
        state = {
            "discarded": data.get("discarded"),
            "on_turn": Players.query.get(room.player_on_turn).token
        }

        state.update(get_current_state_in_room(data.get("guid")))

        join_room(room.guid)
        emit("server_state_update", state, to=room.guid)

    except Exception as e:
        logging.error(traceback.format_exc())
        emit("error", {"event": "server_state_update", "message": e.description if isinstance(e, CustomError) else e.args[0]})


@socketio.on("leave_room")
def leave_room(token: str):
    """Event listener when player finish his turn, game is going to update state."""
    try:
        room, player = check_room_and_player_for_ws_events(token)
        room.update(active=False)

        join_room(room.guid)
        emit("leave_server", player.token, to=room.guid)

    except Exception as e:
        logging.error(traceback.format_exc())
        emit("error", {"event": "leave_room", "message": e.description if isinstance(e, CustomError) else e.args[0]})


@socketio.on('server_winner')
def winner(winner_name: str, token: str | None = None):
    """event listener when client connects to the server"""
    try:
        room, player = check_room_and_player_for_ws_events(token)
        winner_player = Players.query.filter_by(token=winner_name).first()

        emit("client_winner", winner_player.name, to=room.guid)

        deactivate_room(room.guid, request, winner_player.name, [p for p in room.players if p.is_host][0])

    except Exception as e:
        logging.error(traceback.format_exc())
        emit("error", {"event": "client_winner", "message": e.description if isinstance(e, CustomError) else e.args[0]})


@socketio.on('turn_timeout')
def winner(guid: str):
    """event listener when player did not make his turn in time"""
    try:
        room = Rooms.query.filter_by(guid=guid).first()
        make_switch_turn(room)

        state = {"on_turn": Players.query.get(room.player_on_turn).token}
        state.update(get_current_state_in_room(guid))

        join_room(room.guid)
        emit("server_state_update", state, to=room.guid)

    except Exception as e:
        logging.error(traceback.format_exc())
        emit("error", {"event": "turn_timeout", "message": e.description if isinstance(e, CustomError) else e.args[0]})


@socketio.on("chat_message", namespace="/chat")
def server_chat_message(message: str, token: str | None = None):
    """Event listener when player finish his turn, game is going to update state."""
    try:
        room, player = check_room_and_player_for_ws_events(token)

        join_room(room.guid)
        emit(
            "server_chat_message",
            {"player": player.token, "time": datetime.now().strftime("%H:%M:%S"), "message": message},
            to=room.guid,
            namespace="/chat"
        )

    except Exception as e:
        logging.error(traceback.format_exc())
        emit("error", {"event": "server_chat_message", "message": e.description if isinstance(e, CustomError) else e.args[0]})
