from tests.unit import test_client, test_app
from unittest.mock import patch
from application.models import CsNutriRecipes
from application.services.MenuGenerator import Menu
from tests.unit.webapp.mocking import mock_get_menu, mock_get_recipe
import os
import json
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

MOCKED_MENU_SUCCESS = mock_get_menu(True)
MOCKED_MENU_NONE = mock_get_menu()
MOCKED_RECIPE = mock_get_recipe()

DEFAULT_MENU_BODY = {
    "energy": 2000,
    "minimum_energy_check": False,
    "carbs": 40,
    "proteins": 40,
    "fats": 20,
    "with_snack": True,
    "breakfast_tags": [],
    "lunch_tags": [],
    "snack_tags": [],
    "dinner_tags": [],
    "iterations": 300
}

BASIC_SUCCESS_NEW_MENU_BODY = {
    "energy": 2000,
    "minimum_energy_check": False,
    "carbs": 40,
    "proteins": 40,
    "fats": 20,
    "with_snack": True,
    "breakfast_tags": ["1"],
    "lunch_tags": [],
    "snack_tags": [],
    "dinner_tags": [],
    "iterations": 300
}


def test_001_security_headers() -> None:
    with patch("api.routes.menu_generator.get_recipe", return_value=None):
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

        response = test_client.get('/menu/1')
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


def test_002_get_random_menu_success(test_client) -> None:
    with patch("api.routes.menu_generator.generate_random_menu", return_value=mock_get_menu(True)):
        response = test_client.get('/random_menu')

        assert response.status_code == 200
        assert {}.update(response.json) == {}.update(MOCKED_MENU_SUCCESS)


def test_003_get_random_menu_none(test_client) -> None:
    with patch("api.routes.menu_generator.generate_random_menu", return_value=mock_get_menu(None)):
        response = test_client.get('/random_menu')

        assert response.status_code == 400
        assert json.loads(response.data) == {"message": "no_menu"}


def test_004_get_random_menu_fail(test_client) -> None:
    with patch("api.routes.menu_generator.generate_random_menu", return_value=mock_get_menu(False)):
        response = test_client.get('/random_menu')

        assert response.status_code == 400
        assert json.loads(response.data) == {"message": "wrong_menu_inputs"}


def test_005_get_recipe_success(test_client) -> None:
    with patch("api.routes.menu_generator.get_recipe", return_value=mock_get_recipe()):
        response = test_client.get('/menu/1')

        assert response.status_code == 200
        assert response.json == MOCKED_RECIPE


def test_006_get_recipe_fail(test_client) -> None:
    with patch("api.routes.menu_generator.get_recipe", return_value=None):
        response = test_client.get('/menu/1')

        assert response.status_code == 400
        assert json.loads(response.data) == {"message": "recipe_not_found"}


def test_007_get_menu_success(test_client) -> None:
    with patch("api.routes.menu_generator.generate_menu", return_value=mock_get_menu(True)):
        response = test_client.post('/menu', json=DEFAULT_MENU_BODY)

        assert response.status_code == 200
        assert response.json == MOCKED_MENU_SUCCESS


def test_008_get_menu_none(test_client) -> None:
    with patch("api.routes.menu_generator.generate_menu", return_value=mock_get_menu(None)):
        response = test_client.post('/menu', json=DEFAULT_MENU_BODY)

        assert response.status_code == 400
        assert json.loads(response.data) == {"message": "no_menu"}


def test_009_get_menu_fail(test_client) -> None:
    with patch("api.routes.menu_generator.generate_menu", return_value=mock_get_menu(False)):
        response = test_client.post('/menu', json=DEFAULT_MENU_BODY)

        assert response.status_code == 400
        assert json.loads(response.data) == {"message": "wrong_menu_inputs"}


def test_010_get_menu_with_tag_2_fail(test_client) -> None:
    tagged_menu_body = dict(DEFAULT_MENU_BODY)
    tagged_menu_body["breakfast_tags"] = ["2"]

    response = test_client.post('/menu', json=tagged_menu_body)

    assert response.status_code == 400
    assert json.loads(response.data) == {"message": "no_menu"}


def test_011_get_menu_with_tag_2_without_min_energy_success(test_client) -> None:
    tagged_menu_body = dict(DEFAULT_MENU_BODY)
    tagged_menu_body["breakfast_tags"] = ["2"]
    tagged_menu_body["minimum_energy_check"] = True
    tagged_menu_body["carbs"] = 47
    tagged_menu_body["proteins"] = 32
    tagged_menu_body["fats"] = 21

    expected_data = {
        "cs_name": "Test breakfast2 cs",
        "cs_url": "Test breakfast2 URL cs",
        "de_name": "Test breakfast2 de",
        "de_url": "Test breakfast2 URL de",
        "en_name": "Test breakfast2 en",
        "en_url": "Test breakfast2 URL en",
        "id": 4,
        "portions": 4,
        "recipe_id": 4
    }

    response = test_client.post('/menu', json=tagged_menu_body)

    assert response.status_code == 200
    assert json.loads(response.data)["foods"]["breakfast"] == expected_data


def test_012_get_menu_without_snack_fail(test_client) -> None:
    tagged_menu_body = dict(BASIC_SUCCESS_NEW_MENU_BODY)
    tagged_menu_body["with_snack"] = False
    tagged_menu_body["minimum_energy_check"] = True

    response = test_client.post('/menu', json=tagged_menu_body)

    assert response.status_code == 400
    assert json.loads(response.data) == {"message": "no_menu"}


def test_013_get_menu_without_snack_without_min_energy_success(test_client) -> None:
    tagged_menu_body = dict(BASIC_SUCCESS_NEW_MENU_BODY)
    tagged_menu_body["with_snack"] = False
    tagged_menu_body["carbs"] = 46
    tagged_menu_body["proteins"] = 36
    tagged_menu_body["fats"] = 18

    expected_data = mock_get_menu(True, False)

    response = test_client.post('/menu', json=tagged_menu_body)

    assert response.status_code == 200
    assert response.json == expected_data


def test_014_get_meal_success(test_app) -> None:
    with test_app.app_context():
        with patch.object(Menu, "_Menu__query_tagged_data", return_value=[CsNutriRecipes.query.get(1)]):
            tagged_menu_body = {
                "meal_ids": [2, 3, 2],
                "meal_to_reload": "breakfast",
                "menu_data": DEFAULT_MENU_BODY
            }

            expected_data = mock_get_menu(True)
            expected_data["foods"] = {"breakfast": expected_data["foods"]["breakfast"]}

            response = test_app.test_client().post('/reload_meal', json=tagged_menu_body)

            assert response.status_code == 200
            assert response.json == expected_data
