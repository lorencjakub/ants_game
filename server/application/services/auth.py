from flask import Request
from application.models import Players


def get_saved_player(request: Request) -> Players | None:
    player = None
    token = request.headers.get("Token")
    if token:
        player = Players.query.filter_by(token=token).first()

    if not player:
        raise KeyError("Invalid player")

    return player
