from tests.unit.CustomTestCase import CustomTestCase
from application.models import Rooms, Players, BuildingCards, SoldiersCards, MagicCards, Sources, PlayerBuildingCards,\
    create_data_dict
from pytest import raises
from application.services.error_handlers import CustomError


class TestPlayerModel(CustomTestCase):
    def test_001_Players_create_player_with_sources(self):
        with self.app.app_context():
            s = Sources.create()
            p = Players.create(token="MockedToken", sources=s)

            assert p.id == 1
            assert p.room == []
            assert p.name == "Player"
            assert p.building_cards == []
            assert p.soldiers_cards == []
            assert p.magic_cards == []
            assert p.cards == []
            assert p.is_host is False
            assert p.token == "MockedToken"
            assert p.sources_id == s.id
            assert p.sources == s
            assert str(p) == "<Player ID 1>"

    def test_002_Players_add_card(self):
        with self.app.app_context():
            s = Sources.create()
            p = Players.create(token="MockedToken", sources=s)
            bc = BuildingCards.query.get(1)
            sc = SoldiersCards.query.get(1)
            mc = MagicCards.query.get(1)

            for c in [bc, sc, mc]:
                p.add_card(c)

            assert p.building_cards == [bc]
            assert p.soldiers_cards == [sc]
            assert p.magic_cards == [mc]
            assert p.cards == [bc, sc, mc]

    def test_003_Players_add_card_duplicate_card(self):
        with self.app.app_context():
            s = Sources.create()
            p = Players.create(token="MockedToken", sources=s)
            bc = BuildingCards.query.get(1)

            p.add_card(bc)
            p.add_card(bc)
            card_association = PlayerBuildingCards.query.filter_by(player=p.id, card=bc.id).first()

            assert p.building_cards == [bc]
            assert p.cards == [bc, bc]
            assert card_association.count == 2

    def test_004_Players_get_player_room(self):
        with self.app.app_context():
            p = Players.create(token="MockedToken")
            r = Rooms.create(guid="MockedRoom", players=[p])

            assert p.get_player_room() == r

    def test_005_Players_get_player_room_no_room(self):
        with self.app.app_context():
            p = Players.create(token="MockedToken")

            with raises(CustomError) as e_info:
                p.get_player_room()
                assert str(e_info.value) == "Player not found in any room"

    def test_006_Players_create_data_dict(self):
        with self.app.app_context():
            s = Sources.create()
            p = Players.create(token="MockedToken", sources=s)
            expected_data = {
                "name": "Player",
                "is_host": False,
                "token": "MockedToken",
                "sources_id": s.id
            }

            assert create_data_dict(p) == expected_data
