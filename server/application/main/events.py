from flask import session, request
from flask_socketio import emit, join_room, leave_room
from .. import socketio
from application.models import Rooms, create_data_dict
from application.services.functions import get_current_state_in_room


@socketio.on('connect')
def connect():
    """event listener when client connects to the server"""
    print(f'id: {request.sid} is connected')
    state = {"data": f'id: {request.sid} is connected'}
    state.update(get_current_state_in_room({"guid": request.values.get("guid")}))

    emit("connect", state, broadcast=True)


@socketio.on("state_update")
def handle_state_update(data):
    """Event listener when player finish his turn, game is going to update state."""
    state = {"discarded": data.get("discarded")}
    state.update(get_current_state_in_room(data))

    emit("state_update", state, broadcast=True)


@socketio.on("discard_update")
def handle_discard_update(data):
    """Event listener when player finish his turn, game is going to update state."""

    emit("discard_update", {"discarded": data.get("discarded")}, broadcast=True)


@socketio.on('winner')
def winner(winner_name):
    """event listener when client connects to the server"""

    emit("winner", winner_name, broadcast=True)


@socketio.on('disconnect')
def disconnect():
    """event listener when client disconnects to the server"""
    print(f'user {request.sid} disconnected')

    emit("disconnect", f'user {request.sid} disconnected', broadcast=True)

# @socketio.on('joined', namespace='/chat')
# def joined(message):
#     """Sent by clients when they enter a room.
#     A status message is broadcast to all people in the room."""
#     room = session.get('room')
#     join_room(room)
#     emit('status', {'msg': session.get('name') + ' has entered the room.'}, room=room)
#
#
# @socketio.on('text', namespace='/chat')
# def text(message):
#     """Sent by a client when the user entered a new message.
#     The message is sent to all people in the room."""
#     room = session.get('room')
#     emit('message', {'msg': session.get('name') + ':' + message['msg']}, room=room)
#
#
# @socketio.on('left', namespace='/chat')
# def left(message):
#     """Sent by clients when they leave a room.
#     A status message is broadcast to all people in the room."""
#     room = session.get('room')
#     leave_room(room)
#     emit('status', {'msg': session.get('name') + ' has left the room.'}, room=room)
