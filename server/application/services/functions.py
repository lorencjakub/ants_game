from flask import Request, Response, jsonify, has_app_context
import json
from extensions import db
from application.models import Rooms, Players, BuildingCards, SoldiersCards, MagicCards, Sources,\
    create_data_dict, get_table_by_tablename
from .auth import get_saved_player
from .error_handlers import CustomError
from distinct_types import List, Dict, Tuple, Union
import enum
import random


def check_room(request: Request) -> Union[None, Tuple[Rooms, Players]]:
    if request.endpoint == "main.create_room":
        return

    if request.endpoint == "main.join_room" and not request.headers.get("Token"):
        return

    if request.method == "OPTIONS":
        return

    player = get_saved_player(request.headers.get("Token"))
    room = player.get_player_room()

    if not room.active:
        raise CustomError("Room is not active anymore")

    return room, player


def init_room():
    sources = Sources.create()
    host_player = Players.create(name="Player1", is_host=True, sources_id=sources.id)

    new_room = Rooms.create(player_on_turn=host_player.id)
    new_room.add_player(host_player)

    return jsonify({
        "room": new_room.guid,
        "token": host_player.token
    })


def player_join_room_or_get_data(guid: str, request: Request | None, token: str | None = None):
    room = Rooms.query.filter_by(guid=guid).first()

    if not room:
        raise CustomError("Invalid room")

    if len(room.cards_in_deck) == 0:
        room.create_deck()

    if request:
        token = request.headers.get("Token")

    if token:
        player_in_room = next((p for p in room.players if p.token == token), None)

        if player_in_room:
            cards = player_in_room.cards

            if not player_in_room.cards:
                cards = draw_cards(player_in_room, 10)

            return {
                "room": room.guid,
                "token": token,
                "cards": [
                    {
                        "item_name": c.item_name,
                        "unit": c.price_unit,
                        "price": c.price_amount,
                        "type": c.type
                    } for c in cards
                ]
            }

    player = None
    init_cards = []

    if room.is_full:
        player = Players.query.filter_by(token=token).first()
        init_cards = player.cards

    else:
        sources = Sources.create()
        player = Players.create(name="Player2", is_host=True, sources_id=sources.id)

        room.add_player(player)
        init_cards = draw_cards(player, 10)

    return {
        "room": room.guid,
        "token": player.token,
        "cards": [
            {
                "item_name": c.item_name,
                "unit": c.price_unit,
                "price": c.price_amount,
                "type": c.type
            } for c in init_cards
        ]
    }


def player_leave_room(request: Request) -> Response:
    player = get_saved_player(request.headers.get("Token"))
    player_room = player.get_player_room()

    if not player_room:
        raise CustomError("Invalid room")

    player_room.update(players=[p for p in player_room.players if p.id != player.id])

    return jsonify({})


def make_switch_turn(room: Rooms) -> None:
    current_player_id = room.player_on_turn
    new_player_id = room.switch_turn().player_on_turn

    if current_player_id == new_player_id:
        raise CustomError("Error during switching turn")

    new_player = Players.get_by_id(new_player_id)
    new_player.sources.grow_sources()


def draw_new_card(request: Request):
    player = get_saved_player(request.headers.get("Token"))
    new_player_cards = draw_cards(player)

    return jsonify({"new_cards": [c.item_name for c in new_player_cards]})


def draw_cards(player: Players, count: int = 1) -> List[BuildingCards | SoldiersCards | MagicCards]:
    player_room = player.get_player_room()
    new_cards = []

    if len(player_room.cards_in_deck) == 0:
        player_room.create_deck()

    for _ in range(count):
        new_card = remove_card_from_deck({"room": player_room.id}, player_room.cards_in_deck, lambda x: f'{x}_in_deck')
        new_cards.append(new_card)
        player.add_card(new_card)

    return new_cards


def discard_card(request: Request, discarded: bool = False):
    card_name = request.json.get("card_name")
    if not card_name:
        raise CustomError("Missing card")

    player = get_saved_player(request.headers.get("Token"))
    card = next((c for c in player.cards if c.item_name == card_name), None)

    if not card:
        raise CustomError("Player does not have this card in hand")

    remove_card_from_deck({"player": player.id}, [card], lambda x: f'player_{x}')
    draw_cards(player)

    make_switch_turn(player.get_player_room())

    return jsonify({
        "cards": [
            {
                "item_name": c.item_name,
                "unit": c.price_unit,
                "price": c.price_amount,
                "type": c.type
            } for c in player.cards
        ],
        "discarded": {
            "item_name": card.item_name,
            "unit": card.price_unit,
            "price": card.price_amount,
            "type": card.type,
            "discarded": discarded
        },
        "on_turn": player.get_player_room().player_on_turn
    })


def use_card_from_hand(request: Request) -> Response:
    current_player = get_saved_player(request.headers.get("Token"))
    card_name = request.json.get("card_name")

    if not card_name:
        raise CustomError("Missing card")

    card = next((c for c in current_player.cards if c.item_name == card_name), None)

    if not card:
        raise CustomError("Player does not have this card in hand")

    new_state = play_card(card, current_player)
    winner = None

    for p, state in new_state["state"].items():
        if state["castle"] >= 100:
            winner = p
        elif state["castle"] <= 0:
            winner = next((plr for plr in new_state["state"].keys() if p != plr), None)

    if winner:
        return jsonify({"winner": winner})

    remove_card_from_deck({"player": current_player.id}, [card], lambda x: f'player_{x}')
    draw_cards(current_player)

    new_state.update({
        "cards": [
            {
                "item_name": c.item_name,
                "unit": c.price_unit,
                "price": c.price_amount,
                "type": c.type
            } for c in current_player.cards
        ]
    })

    make_switch_turn(current_player.get_player_room())

    new_player_on_turn = current_player.get_player_room().get_enemy(current_player)
    new_state["state"][new_player_on_turn.token] = create_data_dict(new_player_on_turn.sources)

    return jsonify(new_state)


def play_card(card: BuildingCards | SoldiersCards | MagicCards, player: Players) -> \
        Dict[str, Dict[str, str | int | Dict[str, int]] | List[Dict[str, str | int]]]:
    card = next((c for c in player.cards if c.item_name == card.item_name), None)
    if not card:
        raise CustomError("Player does not have this card in hand")

    if card.price_amount > player.sources.__getattribute__(card.price_unit):
        raise CustomError("This card is too expensive for the player")

    room = player.get_player_room()

    if player.id != room.player_on_turn:
        raise CustomError("Player is not on turn now")

    enemy = room.get_enemy(player)
    
    if not enemy:
        raise CustomError("You cannot play until second player join the room")
    
    card_data = create_data_dict(card)

    if card.item_name == "thief":
        enemy_sources = create_data_dict(enemy.sources)
        if not enemy_sources:
            raise CustomError("Sources of enemy has not been found")

        card_data["enemy_lost_amount"] = {}
        card_data["bonus_amount"] = {}

        for material in ["bricks", "weapons", "crystals"]:
            card_data["enemy_lost_amount"][material] = -5 if enemy_sources[material] >= 5 else -enemy_sources[material]
            card_data["bonus_amount"][material] = 5 if enemy_sources[material] >= 5 else enemy_sources[material]

    return {
        "discarded": {
            "item_name": card.item_name,
            "unit": card.price_unit,
            "price": card.price_amount,
            "type": card.type
        },
        "state": {
            player.token: apply_cards_effect(player, card_data),
            enemy.token: apply_cards_effect(enemy, card_data, True)
        }
    }


def remove_card_from_deck(
        owner: Dict[str, str], deck: List[BuildingCards | SoldiersCards | MagicCards],
        target_table_name
) -> BuildingCards | SoldiersCards | MagicCards:
    random_deck = []
    random_deck.extend(deck)
    random.shuffle(random_deck)
    card = random_deck[random.randint(0, len(deck) - 1)]
    model = get_table_by_tablename(target_table_name(card.__tablename__))
    association = model.query.filter_by(card=card.id, **owner).first()

    if not association or association.count == 0:
        raise CustomError("Card not found in deck")

    association.count -= 1
    db.session.add(association)
    db.session.commit()

    return card


def process_card_effects(new_sources, card_data, effect) -> Dict[str, int]:
    if card_data[f'{effect}_unit'] == "none":
        pass

    elif card_data[f'{effect}_unit'] == "all":
        new_sources = {key: value + card_data[f'{effect}_amount'] for key, value in new_sources.items()}

        for ant in ["builders", "soldiers", "mages"]:
            if new_sources[ant] <= 0:
                new_sources[ant] = 1

    elif card_data[f'{effect}_unit'] == "materials":
        if isinstance(card_data[f'{effect}_amount'], dict):
            for material, value in card_data[f'{effect}_amount'].items():
                new_sources[material] += value

        else:
            for material in ["bricks", "weapons", "crystals"]:
                new_sources[material] += card_data[f'{effect}_amount']

    elif card_data[f'{effect}_unit'] == "attack":
        if card_data[f'{effect}_amount'] > new_sources["fence"]:
            new_sources["castle"] -= (card_data[f'{effect}_amount'] - new_sources["fence"])
            new_sources["fence"] = 0

        else:
            new_sources["fence"] -= card_data[f'{effect}_amount']

    else:
        new_sources[card_data[f'{effect}_unit']] += card_data[f'{effect}_amount']

        if card_data["item_name"] == "reserve" and effect == "bonus":
            new_sources["fence"] = new_sources["fence"] - 4 if new_sources["fence"] >= 4 else 0

    return {key: 0 if value < 0 else value for key, value in new_sources.items()}


def apply_cards_effect(player, card_data, apply_enemy_effects: bool = False) -> Dict[str, int]:
    if not player.sources:
        raise CustomError("Player does not have any sources")

    new_sources = create_data_dict(player.sources)

    for key in card_data.keys():
        if isinstance(card_data[key], enum.Enum):
            card_data[key] = card_data[key].value

    if not apply_enemy_effects:
        new_sources[card_data["price_unit"]] -= card_data["price_amount"]

    new_state = process_card_effects(new_sources, card_data, "enemy_lost" if apply_enemy_effects else "bonus")
    player.sources.update(**new_state)

    return new_state


def deactivate_room(guid: str, request: Request, winner: str = None, player_instance: Players = None) -> Response:
    room = Rooms.query.filter_by(guid=guid).first()
    player = player_instance or get_saved_player(request.headers.get("Token"))

    if not room:
        raise CustomError("Invalid room")

    if not winner and not player.is_host:
        raise CustomError("Only host player is able to deactivate room")

    room.update(**{"active": False, "winner": winner} if winner else {"active": False})

    if "socket.io" not in request.url:
        return jsonify({})


def get_current_state_in_room(guid: str):
    room = Rooms.query.filter_by(guid=guid).first()
    state = {}

    if room and room.players:
        players = room.players

        for p in players:
            state[p.token] = create_data_dict(p.sources)

    player_on_turn = Players.query.get(room.player_on_turn)

    state.update({"on_turn": player_on_turn.token})

    return state


def check_room_and_player_for_ws_events(token: str) -> Tuple[Rooms, Players]:
    try:
        player = get_saved_player(token)
        room = player.get_player_room()

        if not room.active:
            raise CustomError("Room is not active anymore")

        return room, player

    except Exception as e:
        if isinstance(e, CustomError):
            raise e

        raise ConnectionRefusedError("Unknown player or room")
