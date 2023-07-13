from flask import request
from flask_socketio import emit
from .. import socketio
from application.services.functions import get_current_state_in_room


@socketio.on('connect')
def connect():
    """event listener when client connects to the server"""
    print(f'id: {request.sid} is connected')
    state = {"data": f'id: {request.sid} is connected'}
    state.update(get_current_state_in_room({"guid": request.values.get("guid")}))

    emit("enter_room", state, broadcast=True)


@socketio.on("server_state_update")
def handle_state_update(data):
    """Event listener when player finish his turn, game is going to update state."""
    action = data.get("action")
    state = {"discarded": data.get("discarded")}
    
    if action == "discard":
        emit("client_state_update", state, broadcast=True)
    
    state.update(get_current_state_in_room(data))

    emit("client_state_update", state, broadcast=True)


@socketio.on('server_winner')
def winner(winner_name):
    """event listener when client connects to the server"""

    emit("client_winner", winner_name, broadcast=True)


@socketio.on('disconnect')
def disconnect():
    """event listener when client disconnects to the server"""
    print(f'user {request.sid} disconnected')

    emit("disconnect", f'user {request.sid} disconnected', broadcast=True)
