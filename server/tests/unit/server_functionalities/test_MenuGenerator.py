from application.services.MenuGenerator import Menu
from application.services.menu_functions import get_recipe
from tests.unit.webapp.mocking import mock_get_menu, mock_get_recipe
from tests.unit.CustomTestCase import CustomTestCase
from unittest.mock import patch
from application.models import CsNutriRecipes


class TestMenuGenerator(CustomTestCase):
    def test_001_MenuGenerator_default_valid(self):
        generator = Menu()

        assert generator.is_valid() is True

    def test_002_MenuGenerator_validation_energy(self):
        for energy in ["string", 1199, 3501, "1800.50"]:
            generator = Menu(energy=energy)

            assert generator.is_valid() is False

        for energy in [1800.50, "1800", 1200, 3500]:
            generator = Menu(energy=energy)

            assert generator.is_valid() is True

    def test_003_MenuGenerator_validation_iterations(self):
        for iterations in ["string", 0, 501, "400.1"]:
            generator = Menu(iterations=iterations)

            assert generator.is_valid() is False

        for iterations in [400.1, "400", 1, 500]:
            generator = Menu(iterations=iterations)

            assert generator.is_valid() is True

    def test_004_MenuGenerator_validation_proteins(self):
        for proteins in ["string", -1, "400.1"]:
            generator = Menu(proteins=proteins)

            assert generator.is_valid() is False

        for proteins in [43.5, "43", 0, 500]:
            generator = Menu(proteins=proteins)

            assert generator.is_valid() is True

    def test_004_MenuGenerator_validation_carbs(self):
        for carbs in ["string", -1, "400.1"]:
            generator = Menu(carbs=carbs)

            assert generator.is_valid() is False

        for carbs in [43.5, "43", 0, 500]:
            generator = Menu(carbs=carbs)

            assert generator.is_valid() is True

    def test_005_MenuGenerator_validation_fats(self):
        for fats in ["string", -1, "400.1"]:
            generator = Menu(fats=fats)

            assert generator.is_valid() is False

        for fats in [43.5, "43", 0, 500]:
            generator = Menu(fats=fats)

            assert generator.is_valid() is True

    def test_006_MenuGenerator_balance_low_nutrients(self):
        generator = Menu(carbs=30, proteins=30, fats=30)
        nutrients = generator.check_balanced_nutrients()

        assert nutrients["carbs"] == nutrients["proteins"] == nutrients["fats"] == 100 / 3

        new_generator = Menu(carbs=41, proteins=25, fats=25)
        new_nutrients = new_generator.check_balanced_nutrients()

        assert new_nutrients["carbs"] == 44
        assert new_nutrients["proteins"] == 28
        assert new_nutrients["fats"] == 28

    def test_007_MenuGenerator_balance_high_nutrients(self):
        generator = Menu(carbs=60, proteins=30, fats=30)
        nutrients = generator.check_balanced_nutrients()

        assert nutrients["carbs"] == 50
        assert nutrients["proteins"] == 25
        assert nutrients["fats"] == 25

    def test_008_MenuGenerator_get_recipe(self):
        with self.app.app_context():
            assert get_recipe(1) == mock_get_recipe()

    def test_009_MenuGenerator_no_satisfied_menu(self):
        with self.app.app_context():
            generator = Menu(energy=1200)

            assert generator.create_menu() is None

    def test_010_MenuGenerator_missing_foods_in_menu(self):
        with self.app.app_context():
            with patch.object(Menu, "_Menu__query_tagged_data", return_value=[]):
                generator = Menu()

                assert generator.is_valid() is True
                assert generator.create_menu() is None

    def test_011_MenuGenerator_satisying_menu(self):
        with self.app.app_context():
            tags = {
                "breakfast_tags": ["1"],
                "lunch_tags": [],
                "snack_tags": [],
                "dinner_tags": []
            }

            generator = Menu(tags=tags, carbs=46, fats=19, proteins=35)

            assert generator.is_valid() is True
            assert generator.create_menu() == mock_get_menu(True)

    def test_012_MenuGenerator_create_menu_tags(self):
        with self.app.app_context():
            tags = {
                "breakfast_tags": ["1"],
                "lunch_tags": [],
                "snack_tags": [],
                "dinner_tags": []
            }

            generator = Menu(tags=tags)

            assert generator.is_valid() is True
            assert generator.generate_menu()[0] == CsNutriRecipes.query.get(1)

            tags["breakfast_tags"] = ["2"]
            new_generator = Menu(tags=tags)

            assert new_generator.is_valid() is True
            assert new_generator.generate_menu()[0] == CsNutriRecipes.query.get(4)

    def test_013_MenuGenerator_create_menu_without_snack(self):
        with self.app.app_context():
            tags = {
                "breakfast_tags": ["1"],
                "lunch_tags": [],
                "snack_tags": [],
                "dinner_tags": []
            }

            generator = Menu(tags=tags, with_snack=False)

            assert generator.is_valid() is True
            assert len(generator.generate_menu()) == 3

    def test_014_MenuGenerator_create_random_menu(self):
        with self.app.app_context():
            generator = Menu(energy=1200, carbs=10, proteins=80, fats=1, random_menu=True)

            assert generator.is_valid() is True
            assert len(generator.generate_menu()) == 4
