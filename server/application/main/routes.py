from flask import request, Response
from . import main
from application.services import init_room, player_join_room, make_switch_turn,\
    discard_card, draw_new_card, use_card_from_hand
from application.services.error_handlers import CustomError


@main.route("/create_room", methods=["GET"])
def create_room() -> Response:
    """Create a new Game Room as a host player"""
    try:
        return init_room()

    except Exception as e:
        return Response(e.description if isinstance(e, CustomError) else e.args[0], 400)


@main.route("/join_room/<guid>", methods=["GET"])
def join_room(guid: str) -> Response:
    """Join an existing Room as a guest player"""
    try:
        return player_join_room(guid)

    except Exception as e:
        return Response(e.description if isinstance(e, CustomError) else e.args[0], 400)


@main.route("/switch_turn/<guid>", methods=["GET"])
def switch_turn(guid) -> Response:
    """Switch turn to other player"""
    try:
        return make_switch_turn(guid)

    except Exception as e:
        return Response(e.description if isinstance(e, CustomError) else e.args[0], 400)


@main.route("/discard", methods=["POST"])
def discard() -> Response:
    """Discard any card from hand and draw a new card from deck"""
    try:
        return discard_card(request)

    except Exception as e:
        return Response(e.description if isinstance(e, CustomError) else e.args[0], 400)


@main.route("/draw_card", methods=["GET"])
def draw_card() -> Response:
    """Draw a new card from deck"""
    try:
        return draw_new_card(request)

    except Exception as e:
        return Response(e.description if isinstance(e, CustomError) else e.args[0], 400)


@main.route("/play_card", methods=["POST"])
def play_card() -> Response:
    """Draw a new card from deck"""
    try:
        return use_card_from_hand(request)

    except Exception as e:
        return Response(e.description if isinstance(e, CustomError) else e.args[0], 400)
