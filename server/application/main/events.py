from flask import session, request
from flask_socketio import emit, join_room, leave_room
from .. import socketio


@socketio.on('connect')
def connect(message):
    """event listener when client connects to the server"""
    print(request.sid)
    print("client has CORRECTLY connected")
    emit("connect",{"data":f"id: {request.sid} is connected"})


@socketio.on('data')
def text(data):
    """event listener when client types a message"""
    print("data from the front end CORRECTLY: ",str(data))
    emit("data",{'data':data,'id':request.sid},broadcast=True)


@socketio.on('disconnect')
def disconnect():
    """event listener when client disconnects to the server"""
    print("user disconnected CORRECTLY")
    emit("disconnect",f"user {request.sid} disconnected",broadcast=True)