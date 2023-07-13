import unittest
import os
from dotenv import load_dotenv
from main_run import create_app
from extensions import db
from tests.unit.webapp.mocking import create_app_with_mocked_db


basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))


class CustomTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.app = create_app_with_mocked_db(create_app())

    def tearDown(self):
        """
        Ensures that the database is emptied for next unit test
        """
        with self.app.app_context():
            db.drop_all()

    def get_app(self):
        return self.app
