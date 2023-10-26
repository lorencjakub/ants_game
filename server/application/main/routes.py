from flask import request, Response, jsonify
from . import main
from application.services import init_room, player_join_room_or_get_data,\
    discard_card, use_card_from_hand, deactivate_room, check_room, player_leave_room


@main.before_request
def check_non_activate_room():
    """Check if room is still active, and you are able to manipulate with it"""
    check_room(request)


@main.route("/create_room", methods=["GET"])
def create_room() -> Response:
    """Create a new Game Room as a host player"""
    return init_room()


@main.route("/join_room/<guid>", methods=["GET"])
def join_room(guid: str) -> Response:
    """Create a new Player in Room from the invitation"""
    return jsonify(player_join_room_or_get_data(guid, request))


@main.route("/leave_room", methods=["GET"])
def leave_room() -> Response:
    """Join an existing Room as a guest player"""
    return player_leave_room(request)


@main.route("/discard", methods=["POST"])
def discard() -> Response:
    """Discard any card from hand and draw a new card from deck"""
    return discard_card(request, True)


@main.route("/play_card", methods=["POST"])
def play_card() -> Response:
    """Draw a new card from deck"""
    return use_card_from_hand(request)


@main.route("/lock_room/<guid>", methods=["GET"])
def lock_room(guid: str) -> Response:
    """Lock a room"""
    return deactivate_room(guid, request)
