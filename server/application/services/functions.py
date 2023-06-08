from flask import Request, Response, jsonify
from extensions import db
from application.models import Rooms, Players, BuildingCards, SoldiersCards, MagicCards, Sources,\
    mutate_db_object, create_data_dict, get_table_by_tablename
from .auth import get_saved_player
from .error_handlers import CustomError
from distinct_types import Union, List, Dict
import enum
import random


def check_room(request: Request) -> None:
    if request.endpoint in ["main.create_room", "main.join_room"] or request.method == "OPTIONS":
        return

    player = get_saved_player(request)
    room = player.get_player_room()

    if not room.active:
        raise CustomError("Room is not active anymore")


def init_room():
    sources = Sources.create()
    host_player = Players.create(name="Player1", is_host=True, sources_id=sources.id)

    new_room = Rooms.create(player_on_turn=host_player.id)
    new_room.create_deck()
    new_room.add_player(host_player)

    init_cards = draw_cards(host_player, 10)

    return jsonify({
        "room": new_room.guid,
        "token": host_player.token,
        "cards": [
            {
                "item_name": c.item_name,
                "unit": c.price_unit,
                "price": c.price_amount,
                "type": c.type
            } for c in init_cards
        ]
    })


def player_join_room(guid: str, request: Request):
    room = Rooms.query.filter_by(guid=guid).first()
    if not room:
        raise CustomError("Invalid room")

    token = request.headers.get("Token")

    if token:
        player_in_room = next((p for p in room.players if p.token == token), None)

        if player_in_room:
            return jsonify({
                "room": room.guid,
                "token": token,
                "cards": [
                    {
                        "item_name": c.item_name,
                        "unit": c.price_unit,
                        "price": c.price_amount,
                        "type": c.type
                    } for c in player_in_room.cards
                ]
            })

    sources = Sources.create()
    guest_player = Players.create(name="Player2", sources_id=sources.id)
    room.add_player(guest_player)
    init_cards = draw_cards(guest_player, 10)

    return jsonify({
        "room": room.guid,
        "token": guest_player.token,
        "cards": [
            {
                "item_name": c.item_name,
                "unit": c.price_unit,
                "price": c.price_amount,
                "type": c.type
            } for c in init_cards
        ]
    })


def player_leave_room(request: Request) -> Response:
    player = get_saved_player(request)
    player_room = player.get_player_room()

    if not player_room:
        raise CustomError("Invalid room")

    player_room.update(players=[p for p in player_room.players if p.id != player.id])

    return jsonify({})


def make_switch_turn(guid: str) -> Response:
    room = Rooms.query.filter_by(guid=guid).first()
    if not room:
        raise CustomError("Invalid room")

    current_player_id = room.player_on_turn
    new_player_id = room.switch_turn().player_on_turn

    if current_player_id == new_player_id:
        raise CustomError("Error during switching turn")

    new_player = Players.get_by_id(new_player_id)
    new_player.sources.grow_sources()

    return jsonify({"player_on_turn": new_player.name})


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
    card = next((c for c in player.cards if c.item_name == card_name), None)
    remove_card(player, card_name)
    draw_cards(player)

    make_switch_turn(player.get_player_room().guid)

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
            "type": card.type
        }
    })


def remove_card(player: Players, card_name: str):
    card = next((c for c in player.cards if c.item_name == card_name), None)
    if not card:
        raise CustomError("Player does not have this card in hand")

    return remove_card_from_deck({"player": player.id}, [card], lambda x: f'player_{x}')


def use_card_from_hand(request: Request):
    current_player = get_saved_player(request)
    card_name = request.json.get("card_name")

    if not card_name:
        raise CustomError("Player does not have this card in hand")

    new_state = play_card(card_name, current_player)
    winner = None

    for p, state in new_state["state"].items():
        if state["castle"] >= 100:
            winner = p
        elif state["castle"] <= 0:
            winner = next((plr for plr in new_state["state"].keys() if p != plr), None)

    if winner:
        deactivate_room(current_player.get_player_room().guid, request, winner)
        return jsonify({"winner": winner})

    remove_card(current_player, card_name)
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
    make_switch_turn(current_player.get_player_room().guid)

    return jsonify(new_state)


def play_card(card_name: str, player: Players):
    card = next((c for c in player.cards if c.item_name == card_name), None)
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

    if card_name == "thief":
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
        owner: Dict[str, str], deck: List[Union[BuildingCards, SoldiersCards, MagicCards]],
        target_table_name
) -> Union[BuildingCards, SoldiersCards, MagicCards]:
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


def process_card_effects(new_sources, card_data, effect):
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


def apply_cards_effect(player, card_data, apply_enemy_effects: bool = False):
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


def deactivate_room(guid: str, request: Request, winner: str = None) -> Response:
    room = Rooms.query.filter_by(guid=guid).first()
    player = get_saved_player(request)

    if not room:
        raise CustomError("Invalid room")

    if not player.is_host:
        raise CustomError("Only host player is able to deactivate room")

    room.update(**{"active": False, "winner": winner} if winner else {"active": False})
    return jsonify({})


def get_current_state_in_room(data):
    guid = data.get("guid")
    room = Rooms.query.filter_by(guid=guid).first()
    state = {}

    if room and room.players:
        players = room.players

        for p in players:
            state[p.token] = create_data_dict(p.sources)

    return state
