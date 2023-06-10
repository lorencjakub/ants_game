from tests.unit.CustomTestCase import CustomTestCase
from unittest.mock import patch, Mock
from application.services.functions import *
from tests.unit.webapp.mocking import MOCKED_SOURCES


class CardsEffects(CustomTestCase):
    def test_001_BasicCards_bonus(self):
        with self.app.app_context():
            s_one = Sources.create(bricks=50)
            s_two = Sources.create()
            c = BuildingCards.query.filter_by(item_name="fence").first()
            p_one = Players.create(token="TestToken1", sources=s_one, building_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["bricks"] = 50 - c.price_amount
            expected_sources_one["fence"] += 22

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == MOCKED_SOURCES

    def test_002_BasicCards_attack_on_fence(self):
        with self.app.app_context():
            s_one = Sources.create()
            s_two = Sources.create()
            c = SoldiersCards.query.filter_by(item_name="rider").first()
            p_one = Players.create(token="TestToken1", sources=s_one, soldiers_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["weapons"] -= c.price_amount

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["fence"] -= 4

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_003_BasicCards_attack_through_fence(self):
        with self.app.app_context():
            s_one = Sources.create()
            s_two = Sources.create(fence=1)
            c = SoldiersCards.query.filter_by(item_name="rider").first()
            p_one = Players.create(token="TestToken1", sources=s_one, soldiers_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["weapons"] -= c.price_amount

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["fence"] = 0
            expected_sources_two["castle"] -= 3

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_004_BasicCards_material_crush_full(self):
        with self.app.app_context():
            s_one = Sources.create()
            s_two = Sources.create(weapons=10)
            c = MagicCards.query.filter_by(item_name="crush_weapons").first()
            p_one = Players.create(token="TestToken1", sources=s_one, magic_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["crystals"] -= c.price_amount

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["weapons"] = 2

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_005_BasicCards_material_crush_partially(self):
        with self.app.app_context():
            s_one = Sources.create()
            s_two = Sources.create(weapons=3)
            c = MagicCards.query.filter_by(item_name="crush_weapons").first()
            p_one = Players.create(token="TestToken1", sources=s_one, magic_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["crystals"] -= c.price_amount

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["weapons"] = 0

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_007_SpecialCards_reserve_full(self):
        with self.app.app_context():
            s_one = Sources.create()
            s_two = Sources.create()
            c = BuildingCards.query.filter_by(item_name="reserve").first()
            p_one = Players.create(token="TestToken1", sources=s_one, building_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["bricks"] -= c.price_amount
            expected_sources_one["fence"] -= 4
            expected_sources_one["castle"] += 8

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == MOCKED_SOURCES

    def test_008_SpecialCards_reserve_partially(self):
        with self.app.app_context():
            s_one = Sources.create(fence=2)
            s_two = Sources.create()
            c = BuildingCards.query.filter_by(item_name="reserve").first()
            p_one = Players.create(token="TestToken1", sources=s_one, building_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["bricks"] -= c.price_amount
            expected_sources_one["fence"] = 0
            expected_sources_one["castle"] += 8

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == MOCKED_SOURCES

    def test_009_SpecialCards_thief_full(self):
        with self.app.app_context():
            s_one = Sources.create(weapons=15)
            s_two = Sources.create(bricks=6, weapons=6)
            c = SoldiersCards.query.filter_by(item_name="thief").first()
            p_one = Players.create(token="TestToken1", sources=s_one, soldiers_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["bricks"] += 5
            expected_sources_one["weapons"] = 5
            expected_sources_one["crystals"] += 5

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["bricks"] = 1
            expected_sources_two["weapons"] = 1
            expected_sources_two["crystals"] = 0

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_010_SpecialCards_thief_partially(self):
        with self.app.app_context():
            s_one = Sources.create(weapons=15)
            s_two = Sources.create(bricks=3, weapons=0)
            c = SoldiersCards.query.filter_by(item_name="thief").first()
            p_one = Players.create(token="TestToken1", sources=s_one, soldiers_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["bricks"] += 3
            expected_sources_one["weapons"] = 0
            expected_sources_one["crystals"] += 5

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["bricks"] = 0
            expected_sources_two["weapons"] = 0
            expected_sources_two["crystals"] -= 5

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_011_SpecialCards_saboteur_full(self):
        with self.app.app_context():
            s_one = Sources.create(weapons=12)
            s_two = Sources.create()
            c = SoldiersCards.query.filter_by(item_name="saboteur").first()
            p_one = Players.create(token="TestToken1", sources=s_one, soldiers_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["weapons"] = 0

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["bricks"] -= 4
            expected_sources_two["weapons"] -= 4
            expected_sources_two["crystals"] -= 4

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_012_SpecialCards_saboteur_partially(self):
        with self.app.app_context():
            s_one = Sources.create(weapons=12)
            s_two = Sources.create(bricks=3, weapons=0)
            c = SoldiersCards.query.filter_by(item_name="saboteur").first()
            p_one = Players.create(token="TestToken1", sources=s_one, soldiers_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["weapons"] = 0

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["bricks"] = 0
            expected_sources_two["weapons"] = 0
            expected_sources_two["crystals"] -= 4

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_013_SpecialCards_wain(self):
        with self.app.app_context():
            s_one = Sources.create(bricks=10)
            s_two = Sources.create()
            c = BuildingCards.query.filter_by(item_name="wain").first()
            p_one = Players.create(token="TestToken1", sources=s_one, building_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["bricks"] = 0
            expected_sources_one["castle"] += 8

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["castle"] -= 4

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_014_SpecialCards_curse_full(self):
        with self.app.app_context():
            s_one = Sources.create(crystals=25)
            s_two = Sources.create()
            c = MagicCards.query.filter_by(item_name="curse").first()
            p_one = Players.create(token="TestToken1", sources=s_one, magic_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {key: value + 1 for key, value in MOCKED_SOURCES.items()}
            expected_sources_one["crystals"] = 1

            expected_sources_two = {key: value - 1 for key, value in MOCKED_SOURCES.items()}

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_015_SpecialCards_curse_partially(self):
        with self.app.app_context():
            s_one = Sources.create(crystals=25)
            s_two = Sources.create(builders=1)
            c = MagicCards.query.filter_by(item_name="curse").first()
            p_one = Players.create(token="TestToken1", sources=s_one, magic_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {key: value + 1 for key, value in MOCKED_SOURCES.items()}
            expected_sources_one["crystals"] = 1

            expected_sources_two = {key: value - 1 for key, value in MOCKED_SOURCES.items()}
            expected_sources_two["builders"] = 1

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two

    def test_016_SpecialCards_swat(self):
        with self.app.app_context():
            s_one = Sources.create(weapons=18)
            s_two = Sources.create()
            c = SoldiersCards.query.filter_by(item_name="swat").first()
            p_one = Players.create(token="TestToken1", sources=s_one, soldiers_cards=[c])
            p_two = Players.create(token="TestToken2", sources=s_two)
            Rooms.create(guid="TestGuid", players=[p_one, p_two])

            expected_sources_one = {}
            expected_sources_one.update(MOCKED_SOURCES)
            expected_sources_one["weapons"] = 0

            expected_sources_two = {}
            expected_sources_two.update(MOCKED_SOURCES)
            expected_sources_two["castle"] -= 10

            play_card(c, p_one)

            assert create_data_dict(p_one.sources) == expected_sources_one
            assert create_data_dict(p_two.sources) == expected_sources_two
