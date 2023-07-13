from application.models import *
from extensions import init_cards
from flask import Flask
from unittest.mock import Mock, patch


def create_app_with_mocked_db(app) -> Flask:
    app.testing = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"
    app.config["SQLALCHEMY_ECHO"] = False

    with app.app_context():
        db.create_all()
        init_cards()

    return app


MOCKED_INIT_ROOM = {
    "cards": ["MockedCards"],
    "room": "MockedUUID",
    "token": "MockedUUID"
}

MOCKED_CARD = {
    "item_name": "TestCard",
    "price": 100,
    "type": "test",
    "unit": "test"
}

MOCKED_SOURCES = {
    "bricks": 5,
    "builders": 2,
    "castle": 30,
    "crystals": 5,
    "fence": 10,
    "mages": 2,
    "soldiers": 2,
    "weapons": 5
}

MOCKED_DISCARD_RESPONSE = {
    "cards": [MOCKED_CARD],
    "discarded": MOCKED_CARD
}


MOCKED_STATE_AFTER_TURN = {
    "cards": [MOCKED_CARD],
    "discarded": MOCKED_CARD,
    "state": {
        "Player1": MOCKED_SOURCES,
        "Player2": MOCKED_SOURCES
    }
}

MOCKED_DB_QUERY = Mock(
    query=Mock(
        filter_by=Mock(
            side_effect=lambda *args: Mock(
                first=Mock(
                    side_effect=lambda: Mock()
                ),
                all=Mock(
                    side_effect=lambda: Mock()
                )
            )
        ),
        get=Mock(
            side_effect=lambda *args: Mock(
                first=Mock(
                    side_effect=lambda: Mock()
                ),
                all=Mock(
                    side_effect=lambda: Mock()
                )
            )
        )
    )
)
