from flask import Request, Response, jsonify
from application.models import Rooms, Players, BuildingCards, SoldiersCards, MagicCards, Sources,\
    mutate_db_object, remove_card_from_deck, create_data_dict
from .auth import get_saved_player
from .error_handlers import CustomError
from distinct_types import Union, List


def init_room():
    new_room = Rooms.create()
    new_room.create_deck()

    sources = Sources.create()
    host_player = Players.create(name="Player1", is_host=True, sources_id=sources.id)
    new_room.add_player(host_player)
    init_cards = draw_cards(host_player, 10)

    return jsonify({
        "room": new_room.guid,
        "host": host_player.token,
        "host_init_cards": [c.item_name for c in init_cards]
    })


def player_join_room(guid: str):
    room = Rooms.query.filter_by(guid=guid).first()
    if not room:
        raise CustomError("Invalid room")

    sources = Sources.create()
    guest_player = Players.create(name="Player2", sources_id=sources.id)
    room.add_player(guest_player)
    init_cards = draw_cards(guest_player, 10)

    return jsonify({
        "room": room.guid,
        "guest": guest_player.token,
        "guest_init_cards": [c.item_name for c in init_cards]
    })


def make_switch_turn(guid: str) -> Response:
    room = Rooms.query.filter_by(guid=guid)
    if not room:
        raise CustomError("Invalid room")

    switched = room.first().switch_turn()
    return jsonify({"player_on_turn": switched.player_on_turn}) if switched else Response("DB error", 400)


def draw_new_card(request: Request):
    player = get_saved_player(request)
    new_player_card = draw_cards(player)

    return jsonify({"new_cards": [c.item_name for c in new_player_card]})


def draw_cards(player: Players, count: int = 1) -> List[Union[BuildingCards, SoldiersCards, MagicCards]]:
    player_room = player.get_player_room()
    deck = mutate_db_object(player_room.cards_in_deck)
    new_cards = []

    for _ in range(0, count):
        new_card = remove_card_from_deck({"room": player_room.id}, deck, lambda x: f'{x}_in_deck')
        new_cards.append(new_card)
        player.add_card(new_card)

    return new_cards


def discard_card(request: Request):
    card_name = request.json.get("card_name")
    if not card_name:
        raise CustomError("Player does not have this card in hand")

    player = get_saved_player(request)
    remove_card(player, card_name)
    new_player_card = draw_cards(player)

    return jsonify({"new_cards": [c.item_name for c in new_player_card]})


def remove_card(player: Players, card_name: str):
    card = [c for c in player.cards if c.item_name == card_name]
    if len(card) == 0:
        raise CustomError("Player does not have this card in hand")

    return remove_card_from_deck({"player": player.id}, card, lambda x: f'player_{x}')


def use_card_from_hand(request: Request):
    player = get_saved_player(request)
    card_name = request.json.get("card_name")

    if not card_name:
        raise CustomError("Player does not have this card in hand")

    new_state = play_card(card_name, player)
    remove_card(player, card_name)
    new_player_card = draw_cards(player)
    new_state.update({"new_card": create_data_dict(new_player_card[0], True)})

    if True:
        make_switch_turn(player.get_player_room())

    return jsonify(new_state)


def play_card(card_name: str, player: Players):
    card = [c for c in player.cards if c.item_name == card_name]
    if not card:
        raise CustomError("Player does not have this card in hand")

    if card[0].price_amount > player.sources.__getattribute__(card[0].price_unit):
        raise CustomError("This card is too expensive for the player")

    room = player.get_player_room()

    if player.id != room.player_on_turn:
        raise CustomError("Player is not on turn now")

    enemy = room.get_enemy(player)

    return {
        player.name: player.apply_cards_effect(card[0]),
        enemy.name: enemy.apply_cards_effect(card[0], True)
    }
