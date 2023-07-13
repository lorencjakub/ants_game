from flask import request, Response
import json
from . import main
from application.services import init_room, player_join_room_or_get_data,\
    discard_card, use_card_from_hand, deactivate_room, check_room, player_leave_room
from application.services.error_handlers import CustomError
import traceback
import logging


@main.before_request
def check_non_activate_room():
    """Check if room is still active, and you are able to manipulate with it"""
    try:
        check_room(request)

    except Exception as e:
        logging.error(traceback.format_exc())
        return Response(json.dumps({"message": e.description if isinstance(e, CustomError) else e.args[0]}), 400)


@main.route("/create_room", methods=["GET"])
def create_room() -> Response:
    """Create a new Game Room as a host player"""
    try:
        return init_room()

    except Exception as e:
        logging.error(traceback.format_exc())
        return Response(json.dumps({"message": e.description if isinstance(e, CustomError) else e.args[0]}), 400)


@main.route("/join_room/<guid>", methods=["GET"])
def join_room(guid: str) -> Response:
    """Join an existing Room as a guest player"""
    try:
        return player_join_room_or_get_data(guid, request)

    except Exception as e:
        logging.error(traceback.format_exc())
        return Response(json.dumps({"message": e.description if isinstance(e, CustomError) else e.args[0]}), 400)


@main.route("/leave_room", methods=["GET"])
def leave_room() -> Response:
    """Join an existing Room as a guest player"""
    try:
        return player_leave_room(request)

    except Exception as e:
        logging.error(traceback.format_exc())
        return Response(json.dumps({"message": e.description if isinstance(e, CustomError) else e.args[0]}), 400)


@main.route("/discard", methods=["POST"])
def discard() -> Response:
    """Discard any card from hand and draw a new card from deck"""
    try:
        return discard_card(request)

    except Exception as e:
        logging.error(traceback.format_exc())
        return Response(json.dumps({"message": e.description if isinstance(e, CustomError) else e.args[0]}), 400)


@main.route("/play_card", methods=["POST"])
def play_card() -> Response:
    """Draw a new card from deck"""
    try:
        return use_card_from_hand(request)

    except Exception as e:
        logging.error(traceback.format_exc())
        return Response(json.dumps({"message": e.description if isinstance(e, CustomError) else e.args[0]}), 400)


@main.route("/lock_room/<guid>", methods=["GET"])
def lock_room(guid: str) -> Response:
    """Lock a room"""
    try:
        return deactivate_room(guid, request)

    except Exception as e:
        logging.error(traceback.format_exc())
        return Response(json.dumps({"message": e.description if isinstance(e, CustomError) else e.args[0]}), 400)
