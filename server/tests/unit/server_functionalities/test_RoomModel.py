from tests.unit.CustomTestCase import CustomTestCase
from application.models import Rooms, Players, BuildingCards, SoldiersCards, MagicCards
from pytest import raises
from application.services.error_handlers import CustomError


class TestRoomModel(CustomTestCase):
    def test_001_Rooms_create_room(self):
        with self.app.app_context():
            r = Rooms.create(guid="MockedRoom")

            assert r.id == 1
            assert r.guid == "MockedRoom"
            assert r.building_cards_in_deck == []
            assert r.soldiers_cards_in_deck == []
            assert r.magic_cards_in_deck == []
            assert r.players == []
            assert r.player_on_turn == 1
            assert r.winner is None
            assert r.active is True
            assert str(r) == "<Room ID 1 with players [] (1 on turn)>"

    def test_002_Rooms_create_room_deck(self):
        with self.app.app_context():
            r = Rooms.create(guid="MockedRoom")
            r.create_deck()

            assert r.building_cards_in_deck == BuildingCards.query.all()
            assert r.soldiers_cards_in_deck == SoldiersCards.query.all()
            assert r.magic_cards_in_deck == MagicCards.query.all()
            assert r.cards_in_deck == [*BuildingCards.query.all(), *SoldiersCards.query.all(), *MagicCards.query.all()]

    def test_003_Rooms_add_player(self):
        with self.app.app_context():
            r = Rooms.create(guid="MockedRoom")
            p = Players.create(token="MockedToken")
            r.add_player(p)

            assert r.players == [p]

    def test_004_Rooms_add_player_to_full_room(self):
        with self.app.app_context():
            p_one = Players.create(token="MockedToken1")
            p_two = Players.create(token="MockedToken2")
            p_three = Players.create(token="MockedToken3")
            r = Rooms.create(guid="MockedRoom", players=[p_one, p_two])

            with raises(CustomError) as e_info:
                r.add_player(p_three)
                assert str(e_info.value) == "This room is already full"

    def test_005_Rooms_add_player_already_in_the_room(self):
        with self.app.app_context():
            p = Players.create(token="MockedToken1")
            r = Rooms.create(guid="MockedRoom", players=[p])

            with raises(CustomError) as e_info:
                r.add_player(p)
                assert str(e_info.value) == "Player is already in this room"

    def test_006_Rooms_remove_player(self):
        with self.app.app_context():
            p = Players.create(token="MockedToken")
            r = Rooms.create(guid="MockedRoom", players=[p])
            r.remove_player(p)

            assert r.players == []

    def test_007_Rooms_remove_player_not_in_room(self):
        with self.app.app_context():
            p = Players.create(token="MockedToken")
            r = Rooms.create(guid="MockedRoom")

            with raises(CustomError) as e_info:
                r.remove_player(p)
                assert str(e_info.value) == "Player not found in this room"

    def test_008_Rooms_get_enemy(self):
        with self.app.app_context():
            p_one = Players.create(token="MockedToken1")
            p_two = Players.create(token="MockedToken2")
            r = Rooms.create(guid="MockedRoom", players=[p_one, p_two])

            assert r.get_enemy(p_one) == p_two

    def test_009_Rooms_switch_turn(self):
        with self.app.app_context():
            p_one = Players.create(token="MockedToken1")
            p_two = Players.create(token="MockedToken2")
            r = Rooms.create(guid="MockedRoom", players=[p_one, p_two])

            assert r.player_on_turn == 1
            r.switch_turn()
            assert r.player_on_turn == 2

    def test_010_Rooms_switch_turn_failed(self):
        with self.app.app_context():
            p = Players.create(token="MockedToken1")
            r = Rooms.create(guid="MockedRoom", players=[p])

            assert r.player_on_turn == 1

            with raises(CustomError) as e_info:
                r.switch_turn()
                assert str(e_info.value) == "Room is not full"

            assert r.player_on_turn == 1
