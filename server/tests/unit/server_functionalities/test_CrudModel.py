from tests.unit.CustomTestCase import CustomTestCase
from application.models import *
from pytest import raises
from application.services.error_handlers import CustomError
import copy


class TestCrudModel(CustomTestCase):
    def test_001_CrudModel_get_table_by_tablename(self):
        with self.app.app_context():
            for model in [
                Rooms,
                Players,
                BuildingCards,
                SoldiersCards,
                MagicCards,
                Sources,
                PlayerBuildingCards,
                PlayerSoldiersCards,
                PlayerMagicCards,
                BuildingCardsInDeck,
                SoldiersCardsInDeck,
                MagicCardsInDeck,
                PlayersInRooms
            ]:
                assert get_table_by_tablename(model.__tablename__) == model

            with raises(CustomError) as e_info:
                get_table_by_tablename("nothing")

                assert str(e_info.value) == "Unknown tablename nothing"

    def test_002_CrudModel_create(self):
        with self.app.app_context():
            assert Rooms.query.all() == []

            r = Rooms.create(guid="MockedRoom")
            assert Rooms.query.all() == [r]

    def test_003_CrudModel_update(self):
        with self.app.app_context():
            Rooms.create(guid="MockedRoom")
            r = copy.deepcopy(Rooms.query.get(1))
            r.update(False, guid="OtherMockedRoom")

            assert r.guid == "OtherMockedRoom"
            assert Rooms.query.get(r.id).guid == "MockedRoom"

            db.session.commit()
            assert r.guid == "OtherMockedRoom"
            assert Rooms.query.get(r.id).guid == "MockedRoom"

            db.session.add(r)
            db.session.commit()
            assert r.guid == "OtherMockedRoom"
            assert Rooms.query.get(r.id).guid == "OtherMockedRoom"

            r.update(guid="MockedRoomAgain")
            assert r.guid == "MockedRoomAgain"
            assert Rooms.query.get(r.id).guid == "MockedRoomAgain"

    def test_004_CrudModel_delete(self):
        with self.app.app_context():
            r = Rooms.create(guid="MockedRoom")
            r.delete()
            assert r is not None
            assert Rooms.query.all() == []

            db_r = Rooms.create(guid="MockedRoom")
            db_r.delete(False)

            assert db_r is not None
            assert Rooms.query.all() is not []

            db.session.commit()
            assert db_r is not None
            assert Rooms.query.all() == []

    def test_005_CrudModel_get_by_id(self):
        with self.app.app_context():
            r = Rooms.create(guid="MockedRoom")

            assert Rooms.get_by_id(1) == r
