from tests.unit.CustomTestCase import CustomTestCase
from application.models import Sources, create_data_dict


class TestSourcesModel(CustomTestCase):
    def test_001_Sources_create_sources(self):
        with self.app.app_context():
            s = Sources.create()

            assert s.id == 1
            assert s.bricks == 5
            assert s.weapons == 5
            assert s.crystals == 5
            assert s.builders == 2
            assert s.soldiers == 2
            assert s.mages == 2
            assert s.fence == 10
            assert s.castle == 30
            assert str(s) == "<Sources ID 1>"

    def test_002_Sources_grow_sources(self):
        with self.app.app_context():
            s = Sources.create()
            s.grow_sources()

            assert s.bricks == 7
            assert s.weapons == 7
            assert s.crystals == 7
            assert s.builders == 2
            assert s.soldiers == 2
            assert s.mages == 2
            assert s.fence == 10
            assert s.castle == 30

    def test_003_Sources_create_data_dict(self):
        with self.app.app_context():
            s = Sources.create()
            expected_data = {
                "bricks": 5,
                "weapons": 5,
                "crystals": 5,
                "builders": 2,
                "soldiers": 2,
                "mages": 2,
                "fence": 10,
                "castle": 30
            }

            assert create_data_dict(s) == expected_data
