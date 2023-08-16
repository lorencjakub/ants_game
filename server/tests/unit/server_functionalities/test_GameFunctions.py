from tests.unit.CustomTestCase import CustomTestCase
from unittest.mock import patch, Mock
from application.services.functions import *
from tests.unit.webapp.mocking import MOCKED_SOURCES


class GameFunctions(CustomTestCase):
    def test_001_init_room(self):
        with self.app.app_context():
            expected_data = {
                "cards": [
                    {
                        "item_name": "wall",
                        "price": 1,
                        "type": "building",
                        "unit": "bricks"
                    } for _ in range(10)
                ],
                "room": "TestGuid",
                "token": "TestHostToken"
            }

            with patch("application.services.functions.remove_card_from_deck",
                       side_effect=lambda *args: BuildingCards.query.get(1)
                       ):
                p = Players.create(token="TestHostToken")

                with patch("application.models.models.Players.create",
                           side_effect=lambda **kwargs: p.update(**kwargs)
                           ):
                    r = Rooms.create(guid="TestGuid")

                    with patch("application.models.models.Rooms.create",
                               side_effect=lambda **kwargs: r.update(**kwargs)
                               ):
                        assert init_room().json == expected_data

    def test_002_join_room_add_guest(self):
        with self.app.app_context():
            expected_data = {
                "cards": [
                    {
                        "item_name": "wall",
                        "price": 1,
                        "type": "building",
                        "unit": "bricks"
                    } for _ in range(10)
                ],
                "room": "TestGuid",
                "token": "TestGuestToken"
            }

            with patch("application.services.functions.remove_card_from_deck",
                       side_effect=lambda *args: BuildingCards.query.get(1)
                       ):
                p = Players.create(token="TestGuestToken")

                with patch("application.models.models.Players.create",
                           side_effect=lambda **kwargs: p.update(**kwargs)
                           ):
                    r = Rooms.create(guid="TestGuid")

                    with patch("application.models.models.Rooms.create",
                               side_effect=lambda **kwargs: r.update(**kwargs)
                               ):
                        request = Mock(headers={})

                        assert player_join_room_or_get_data("TestGuid", request).json == expected_data

    def test_003_join_room_get_player_data(self):
        with self.app.app_context():
            expected_data = {
                "cards": [
                    {
                        "item_name": "wall",
                        "price": 1,
                        "type": "building",
                        "unit": "bricks"
                    }
                ],
                "room": "TestGuid",
                "token": "TestToken1"
            }

            p_one = Players.create(token="TestToken1", building_cards=[BuildingCards.query.get(1)])
            p_two = Players.create(token="TestToken2", building_cards=[BuildingCards.query.get(1)])
            Rooms.create(guid="TestGuid", players=[p_one, p_two])
            request = Mock(headers={"Token": "TestToken1"})

            assert player_join_room_or_get_data("TestGuid", request).json == expected_data

    def test_004_join_room_add_guest_with_unknown_token(self):
        with self.app.app_context():
            expected_data = {
                "cards": [
                    {
                        "item_name": "wall",
                        "price": 1,
                        "type": "building",
                        "unit": "bricks"
                    } for _ in range(10)
                ],
                "room": "TestGuid",
                "token": "TestGuestToken"
            }

            with patch("application.services.functions.remove_card_from_deck",
                       side_effect=lambda *args: BuildingCards.query.get(1)
                       ):
                p = Players.create(token="TestToken")
                guest = Players.create(token="TestGuestToken")

                with patch("application.models.models.Players.create",
                           side_effect=lambda **kwargs: guest.update(**kwargs)
                           ):
                    r = Rooms.create(guid="TestGuid", players=[p])

                    with patch("application.models.models.Rooms.create",
                               side_effect=lambda **kwargs: r.update(**kwargs)
                               ):
                        request = Mock(headers={"Token": "UnknownToken"})

                        assert player_join_room_or_get_data("TestGuid", request).json == expected_data

    def test_005_player_leave_room_with_two_players(self):
        with self.app.app_context():
            p_one = Players.create(token="TestToken1")
            p_two = Players.create(token="TestToken2")
            r = Rooms.create(guid="TestGuid", players=[p_one, p_two])
            request = Mock(headers={"Token": "TestToken1"})

            assert player_leave_room(request).json == {}
            assert r.players == [p_two]

    def test_006_player_leave_room_with_one_player(self):
        with self.app.app_context():
            p = Players.create(token="TestToken")
            r = Rooms.create(guid="TestGuid", players=[p])
            request = Mock(headers={"Token": "TestToken"})

            assert player_leave_room(request).json == {}
            assert r.players == []

    def test_007_make_switch_turn(self):
        with self.app.app_context():
            s = Sources.create()
            p_one = Players.create(name="Player1")
            p_two = Players.create(name="Player2", sources=s)
            r = Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_data = {}
            expected_data.update(MOCKED_SOURCES)
            expected_data["bricks"] = MOCKED_SOURCES["bricks"] + 2
            expected_data["weapons"] = MOCKED_SOURCES["weapons"] + 2
            expected_data["crystals"] = MOCKED_SOURCES["crystals"] + 2

            assert create_data_dict(p_two.sources) == MOCKED_SOURCES
            assert make_switch_turn("TestGuid").json == {"player_on_turn": "Player2"}
            assert r.player_on_turn == 2
            assert create_data_dict(p_two.sources) == expected_data

    def test_008_draw_new_card(self):
        with self.app.app_context():
            s = Sources.create(**MOCKED_SOURCES)
            p = Players.create(token="TestToken", sources=s)
            Rooms.create(guid="TestGuid", players=[p])
            bc = BuildingCards.query.get(1)

            with patch("application.services.functions.draw_cards",
                       side_effect=lambda *args: [bc]
                       ):
                request = Mock(headers={"Token": "TestToken"})
                assert draw_new_card(request).json == {"new_cards": [bc.item_name]}

    def test_009_draw_cards(self):
        with self.app.app_context():
            s = Sources.create(**MOCKED_SOURCES)
            p = Players.create(token="TestToken", sources=s)
            Rooms.create(guid="TestGuid", players=[p])
            bc = BuildingCards.query.get(1)

            with patch("application.services.functions.remove_card_from_deck",
                       side_effect=lambda *args: bc
                       ):
                assert draw_cards(p) == [bc]
                assert draw_cards(p, 5) == [bc for _ in range(5)]

    def test_010_discard_card(self):
        with self.app.app_context():
            s_one = Sources.create(**MOCKED_SOURCES)
            s_two = Sources.create(**MOCKED_SOURCES)
            bc = BuildingCards.query.get(1)
            sc = SoldiersCards.query.get(1)
            p_one = Players.create(token="TestToken1", sources=s_one, building_cards=[bc])
            p_two = Players.create(token="TestToken2", sources=s_two, building_cards=[bc])
            Rooms.create(guid="TestGuid", players=[p_one, p_two], soldiers_cards_in_deck=[sc])

            expected_data = {
                "cards": [
                    {
                        "item_name": sc.item_name,
                        "unit": sc.price_unit.value,
                        "price": sc.price_amount,
                        "type": sc.type
                    }
                ],
                "discarded": {
                    "item_name": bc.item_name,
                    "unit": bc.price_unit.value,
                    "price": bc.price_amount,
                    "type": bc.type
                }
            }

            request = Mock(headers={"Token": "TestToken1"}, json={"card_name": "wall"})
            assert discard_card(request).json == expected_data
            assert p_one.cards == [sc]

    def test_011_use_card_from_hand(self):
        with self.app.app_context():
            s_one = Sources.create(**MOCKED_SOURCES)
            s_two = Sources.create(**MOCKED_SOURCES)
            bc = BuildingCards.query.get(1)
            sc = SoldiersCards.query.get(1)
            p_one = Players.create(token="TestToken1", sources=s_one, building_cards=[bc])
            p_two = Players.create(token="TestToken2", sources=s_two, building_cards=[bc])
            r = Rooms.create(guid="TestGuid", players=[p_one, p_two], soldiers_cards_in_deck=[sc])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["bricks"] -= 1
            expected_sources_one["fence"] += 3

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["bricks"] += 2
            expected_sources_two["weapons"] += 2
            expected_sources_two["crystals"] += 2

            expected_data = {
                "cards": [
                    {
                        "item_name": sc.item_name,
                        "unit": sc.price_unit.value,
                        "price": sc.price_amount,
                        "type": sc.type
                    }
                ],
                "discarded": {
                    "item_name": bc.item_name,
                    "unit": bc.price_unit.value,
                    "price": bc.price_amount,
                    "type": bc.type
                },
                "state": {
                    "TestToken1": expected_sources_one,
                    "TestToken2": expected_sources_two
                }
            }

            request = Mock(headers={"Token": "TestToken1"}, json={"card_name": "wall"})
            res = use_card_from_hand(request)

            assert res.json == expected_data
            assert p_one.cards == [sc]
            assert r.player_on_turn == 2
            assert r.cards_in_deck == []

    def test_012_use_card_from_hand_win100(self):
        with self.app.app_context():
            s_one = Sources.create(bricks=40, castle=70)
            s_two = Sources.create()
            bc = BuildingCards.query.filter_by(item_name="babel").first()
            p_one = Players.create(name="Player1", token="TestToken1", sources=s_one, building_cards=[bc])
            p_two = Players.create(name="Player2", token="TestToken2", sources=s_two)
            r = Rooms.create(guid="TestGuid", players=[p_one, p_two])

            request = Mock(headers={"Token": "TestToken1"}, json={"card_name": "babel"})
            res = use_card_from_hand(request)

            assert res.json == {"winner": "TestToken1"}
            assert r.active is False
            assert r.winner == p_one.token

    def test_013_use_card_from_hand_win0(self):
        with self.app.app_context():
            s_one = Sources.create()
            s_two = Sources.create(fence=1, castle=3)
            sc = SoldiersCards.query.filter_by(item_name="rider").first()
            p_one = Players.create(token="TestToken1", sources=s_one, soldiers_cards=[sc])
            p_two = Players.create(token="TestToken2", sources=s_two)
            r = Rooms.create(guid="TestGuid", players=[p_one, p_two])

            request = Mock(headers={"Token": "TestToken1"}, json={"card_name": "rider"})
            res = use_card_from_hand(request)

            assert res.json == {"winner": "TestToken1"}
            assert r.active is False
            assert r.winner == p_one.token

    def test_014_play_card(self):
        with self.app.app_context():
            s_one = Sources.create(**MOCKED_SOURCES)
            s_two = Sources.create(**MOCKED_SOURCES)
            bc = BuildingCards.query.get(1)
            sc = SoldiersCards.query.get(1)
            p_one = Players.create(token="TestToken1", sources=s_one, building_cards=[bc])
            p_two = Players.create(token="TestToken2", sources=s_two, building_cards=[bc])
            r = Rooms.create(guid="TestGuid", players=[p_one, p_two], soldiers_cards_in_deck=[sc])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["bricks"] -= 1
            expected_sources_one["fence"] += 3

            expected_data = {
                "discarded": {
                    "item_name": bc.item_name,
                    "unit": bc.price_unit,
                    "price": bc.price_amount,
                    "type": bc.type
                },
                "state": {
                    "TestToken1": expected_sources_one,
                    "TestToken2": MOCKED_SOURCES
                }
            }

            res = play_card(bc, p_one)

            assert res == expected_data
            assert p_one.cards == [bc]
            assert r.player_on_turn == 1
            assert r.cards_in_deck == [sc]

    def test_015_remove_card_from_deck_player(self):
        with self.app.app_context():
            s = Sources.create(**MOCKED_SOURCES)
            bc = BuildingCards.query.get(1)
            p = Players.create(token="TestToken", sources=s, building_cards=[bc])

            res = remove_card_from_deck({"player":  p.id}, p.cards, lambda x: f'player_{x}')

            assert res == bc
            assert p.cards == []

    def test_016_remove_card_from_deck_room(self):
        with self.app.app_context():
            bc = BuildingCards.query.get(1)
            r = Rooms.create(guid="TestGuid", building_cards_in_deck=[bc])

            res = remove_card_from_deck({"room":  r.id}, r.cards_in_deck, lambda x: f'{x}_in_deck')

            assert res == bc
            assert r.cards_in_deck == []

    def test_017_process_card_effects_bonus(self):
        with self.app.app_context():
            s = {}
            s.update(MOCKED_SOURCES)
            c = create_data_dict(BuildingCards.query.get(1))

            expected_sources = {}
            expected_sources.update(MOCKED_SOURCES)
            expected_sources["fence"] += 3

            res = process_card_effects(s, c, "bonus")

            assert res == expected_sources

    def test_018_process_card_effects_enemy_lost(self):
        with self.app.app_context():
            s = {}
            s.update(MOCKED_SOURCES)
            sc = create_data_dict(SoldiersCards.query.get(1))

            expected_sources = {}
            expected_sources.update(MOCKED_SOURCES)
            expected_sources["fence"] -= 4

            res = process_card_effects(s, sc, "enemy_lost")

            assert res == expected_sources

    def test_019_apply_cards_effect_bonus(self):
        with self.app.app_context():
            s = Sources.create(**MOCKED_SOURCES)
            p = Players.create(token="TestToken", sources=s)
            bc = create_data_dict(BuildingCards.query.get(1))

            expected_sources = {}
            expected_sources.update(MOCKED_SOURCES)
            expected_sources["bricks"] -= 1
            expected_sources["fence"] += 3

            res = apply_cards_effect(p, bc)

            assert res == expected_sources

    def test_020_process_card_effects_enemy_lost(self):
        with self.app.app_context():
            s = Sources.create(**MOCKED_SOURCES)
            p = Players.create(token="TestToken", sources=s)
            sc = create_data_dict(SoldiersCards.query.get(1))

            expected_sources = {}
            expected_sources.update(MOCKED_SOURCES)
            expected_sources["fence"] -= 4

            res = apply_cards_effect(p, sc, True)

            assert res == expected_sources

    def test_021_deactivate_room_no_winner(self):
        with self.app.app_context():
            Players.create(token="TestToken", is_host=True)
            r = Rooms.create(guid="TestGuid")

            request = Mock(headers={"Token": "TestToken"})
            res = deactivate_room("TestGuid", request)

            assert res.json == {}
            assert r.active is False
            assert r.winner is None

    def test_022_deactivate_room_with_winner(self):
        with self.app.app_context():
            p = Players.create(token="TestToken", is_host=True)
            r = Rooms.create(guid="TestGuid")

            request = Mock(headers={"Token": "TestToken"})
            res = deactivate_room("TestGuid", request, p.name)

            assert res.json == {}
            assert r.active is False
            assert r.winner == p.name

    def test_023_get_current_state_in_room(self):
        with self.app.app_context():
            s_one = Sources.create()
            s_two = Sources.create(mages=10)
            p_one = Players.create(token="TestToken1", sources=s_one)
            p_two = Players.create(token="TestToken2", sources=s_two)
            r = Rooms.create(guid="TestGuid", players=[p_one, p_two])

            sources_two = {}
            sources_two.update(MOCKED_SOURCES)
            sources_two["mages"] = 10

            expected_data = {
                "TestToken1": MOCKED_SOURCES,
                "TestToken2": sources_two,
                "on_turn": p_one.name
            }

            res = get_current_state_in_room(r.guid)

            assert res == expected_data
