import pytest
from main_run import create_app
from tests.unit.webapp.mocking import create_app_with_mocked_db
from flask import Flask


@pytest.fixture
def test_client() -> Flask:
    """Configures the app for testing

    Sets app config variable ``TESTING`` to ``True``

    :return: App for testing
    """

    test_app = create_app_with_mocked_db(create_app(with_secutiry=False))
    tester = test_app.test_client()

    yield tester


@pytest.fixture
def test_app() -> Flask:
    """Configures the app for testing

    Sets app config variable ``TESTING`` to ``True``

    :return: App for testing
    """

    test_app = create_app_with_mocked_db(create_app(with_secutiry=False))

    yield test_app
