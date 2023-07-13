from tests.unit import test_client
from tests.unit.webapp.mocking import MOCKED_INIT_ROOM, MOCKED_DISCARD_RESPONSE, MOCKED_STATE_AFTER_TURN,\
    MOCKED_DB_QUERY
from unittest.mock import patch, Mock
import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))


def test_001_security_headers() -> None:
    with patch("application.main.routes.join_room", side_effect=lambda x: None):
        from tests.unit.CustomTestCase import CustomTestCase
        from flask_cors import CORS
        from utils.SecurityManager import SecurityHeaderManager
        from utils.security_settings import set_cors, set_security_headers

        case = CustomTestCase()
        case.setUp()
        app = case.get_app()

        cors_settings = set_cors()
        security_headers = set_security_headers()

        fe_origin = os.environ.get("FE_ORIGIN")

        if fe_origin:
            cors_settings["origins"] = [fe_origin]

        CORS(app, **cors_settings)
        SecurityHeaderManager(app, **security_headers)
        test_client = app.test_client()

        response = test_client.get("/create_room")
        case.tearDown()

        assert response.access_control_allow_headers is None
        assert response.access_control_allow_origin == os.environ.get("FE_ORIGIN")
        assert response.access_control_allow_methods is None
        assert response.access_control_allow_credentials is False

        assert response.headers["Permissions-Policy"] == ", ".join([
            "camera='none'",
            "display-capture='none'",
            "fullscreen='none'",
            "geolocation='none'",
            "microphone='none'"
        ])
        assert response.headers.get("X-Frame-Options") == "SAMEORIGIN"
        assert response.headers.get("X-XSS-Protection") == "1; mode=block"
        assert response.headers.get("X-Content-Type-Options") == "nosniff"
        assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
        assert response.headers.get("Cache-Control") == "max-age=0 must-revalidate no-cache no-storeprivate"
        assert response.headers.get("Access-Control-Allow-Origin") == os.environ.get("FE_ORIGIN")
        assert response.headers["Content-Security-Policy"] == "; ".join([
            "default-src 'self'",
            "connect-src 'self'",
            "img-src 'self' data: https:",
            "style-src 'self' 'unsafe-inline' 'nonce-" + os.environ.get("NONCE") + "'",
            "script-src 'self' blob: cdnjs.cloudflare.com",
            "child-src 'self'",
            "frame-src 'self'",
            "frame-ancestors 'self'",
            "font-src 'self'"
        ])


def test_002_routes_create_room_success(test_client) -> None:
    with patch("application.main.routes.init_room", side_effect=lambda: MOCKED_INIT_ROOM):
        response = test_client.get('/create_room')
        assert response.status_code == 200
        assert response.json == MOCKED_INIT_ROOM


def test_003_routes_create_room_fail(test_client) -> None:
    with patch("application.main.routes.init_room", side_effect=Exception("MockedException")):
        response = test_client.get('/create_room')
        assert response.status_code == 400


def test_004_routes_join_room_success(test_client) -> None:
    with patch("application.main.routes.player_join_room_or_get_data", side_effect=lambda *args: MOCKED_INIT_ROOM):
        response = test_client.get('/join_room/TestRoom')
        assert response.status_code == 200
        assert response.json == MOCKED_INIT_ROOM


def test_005_routes_join_room_fail(test_client) -> None:
    with patch("application.main.routes.player_join_room_or_get_data", side_effect=Exception("MockedException")):
        response = test_client.get('/join_room/TestRoom')
        assert response.status_code == 400


def test_006_routes_leave_room_success(test_client) -> None:
    with patch("application.main.routes.check_room", side_effect=lambda x: None):
        with patch("application.main.routes.player_leave_room", side_effect=lambda x: {}):
            response = test_client.get('/leave_room')
            assert response.status_code == 200
            assert response.json == {}


def test_007_routes_leave_room_fail(test_client) -> None:
    with patch("application.main.routes.check_room", side_effect=lambda x: None):
        with patch("application.services.functions.get_saved_player", side_effect=lambda x: Mock(
                get_player_room=Mock(side_effect=lambda: None))
        ):
            response = test_client.get('/leave_room')
            assert response.status_code == 400
            assert response.data.decode() == "Invalid room"


def test_008_routes_discard_success(test_client) -> None:
    with patch("application.main.routes.check_room", side_effect=lambda x: None):
        with patch("application.main.routes.discard_card", side_effect=lambda x: MOCKED_DISCARD_RESPONSE):
            response = test_client.post('/discard', json={"card_name": "TestCard"})
            assert response.status_code == 200
            assert response.json == MOCKED_DISCARD_RESPONSE


def test_009_routes_discard_fail(test_client) -> None:
    with patch("application.main.routes.check_room", side_effect=lambda x: None):
        response = test_client.post('/discard', json={})
        assert response.status_code == 400
        assert response.data.decode() == "Missing card"


def test_0010_routes_play_card_success(test_client) -> None:
    with patch("application.main.routes.check_room", side_effect=lambda x: None):
        with patch("application.main.routes.use_card_from_hand", side_effect=lambda x: MOCKED_STATE_AFTER_TURN):
            response = test_client.post('/play_card', json={"card_name": "TestCard"})
            assert response.status_code == 200
            assert response.json == MOCKED_STATE_AFTER_TURN


def test_0011_routes_play_card_win(test_client) -> None:
    with patch("application.main.routes.check_room", side_effect=lambda x: None):
        with patch("application.main.routes.use_card_from_hand", side_effect=lambda x: {"winner": "Player1"}):
            response = test_client.post('/play_card', json={"card_name": "TestCard"})
            assert response.status_code == 200
            assert response.json == {"winner": "Player1"}


def test_012_routes_play_card_fail(test_client) -> None:
    with patch("application.main.routes.check_room", side_effect=lambda x: None):
        with patch("application.services.functions.get_saved_player", side_effect=lambda x: Mock(
                get_player_room=Mock(side_effect=lambda: None))
        ):
            response = test_client.post('/play_card', json={})
            assert response.status_code == 400
            assert response.data.decode() == "Missing card"


def test_013_routes_lock_room_success(test_client) -> None:
    with patch("application.main.routes.check_room", side_effect=lambda x: None):
        with patch("application.main.routes.deactivate_room", side_effect=lambda *args: {}):
            response = test_client.get('/lock_room/TestRoom')
            assert response.status_code == 200
            assert response.json == {}


def test_014_routes_lock_room_fail_invalid_room(test_client) -> None:
    with patch("application.main.routes.check_room", side_effect=lambda x: None):
        with patch("application.services.functions.get_saved_player", side_effect=lambda x: Mock(is_host=False)):
            response = test_client.get('/lock_room/TestRoom')
            assert response.status_code == 400
            assert response.data.decode() == "Invalid room"


def test_015_routes_lock_room_fail_non_host(test_client) -> None:
    with patch("application.main.routes.check_room", side_effect=lambda x: None):
        with patch("application.services.functions.Rooms", return_value=MOCKED_DB_QUERY):
            with patch("application.services.functions.get_saved_player", side_effect=lambda x: Mock(is_host=False)):
                response = test_client.get('/lock_room/TestRoom')
                assert response.status_code == 400
                assert response.data.decode() == "Only host player is able to deactivate room"


def test_016_routes_check_locked_room(test_client) -> None:
    with patch("application.services.functions.get_saved_player", side_effect=lambda x: Mock(
        get_player_room=Mock(side_effect=lambda: Mock(active=False)))
    ):
        response = test_client.get('/lock_room/TestRoom')
        assert response.status_code == 400
        assert response.data.decode() == "Room is not active anymore"
