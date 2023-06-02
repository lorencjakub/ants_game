from distinct_types import Union, GeneratedMenuData, RecipeData
from distinct_types import List, Dict
from application.models import *
from flask import Flask


def create_db_mutation(locale: str, recipes: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    This function creates variant of non-cs DB data, but pops the snack recipe,
    so the snack recipe is become as the CS only variant.
    :param locale: language string code
    :param recipes: list of recipe data for DB
    :return: Recipes data with new language code suffix in name and URL. The snack recipe is not included.
    """
    mutation = [r for r in recipes]
    localized_data = []

    for recipe in mutation:
        recipe_data = {}

        for key, value in recipe.items():
            recipe_data[key] = value.replace("cs", locale) if key in ["name", "url"] else value

        localized_data.append(recipe_data)

    return localized_data


TEST_RECIPES_CS = [
    {
        "name": "Test breakfast cs",
        "energy": 455,
        "proteins": 40,
        "fats": 15,
        "carbs": 40,
        "fiber": 10,
        "tags": [15, 1],
        "url": "Test breakfast URL cs",
        "recipe_id": 1,
        "portions": 1
    },
    {
        "name": "Test lunch cs",
        "energy": 552,
        "proteins": 50,
        "fats": 8,
        "carbs": 70,
        "fiber": 10,
        "tags": [16],
        "url": "Test lunch URL cs",
        "recipe_id": 2,
        "portions": 2
    },
    {
        "name": "Test lunch cs",
        "energy": 552,
        "proteins": 50,
        "fats": 8,
        "carbs": 70,
        "fiber": 10,
        "tags": [16],
        "url": "Test lunch URL cs",
        "recipe_id": 2,
        "portions": 2
    },
    {
        "name": "Test snack cs",
        "energy": 165,
        "proteins": 10,
        "fats": 5,
        "carbs": 20,
        "fiber": 5,
        "tags": [34],
        "url": "Test snack URL cs",
        "recipe_id": 3,
        "portions": 3
    }
]

MORE_RECIPES = [
    {
        "name": "Test breakfast2 cs",
        "energy": 500,
        "proteins": 30,
        "fats": 20,
        "carbs": 50,
        "fiber": 10,
        "tags": [15, 2],
        "url": "Test breakfast2 URL cs",
        "recipe_id": 4,
        "portions": 4
    }
]


def create_app_with_mocked_db(app) -> Flask:
    app.testing = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"
    app.config["SQLALCHEMY_ECHO"] = False

    with app.app_context():
        db.create_all()

        more_recipes_cs = list(TEST_RECIPES_CS)

        more_recipes_cs.extend(MORE_RECIPES)

        more_recipes_en = create_db_mutation("en", more_recipes_cs)
        more_recipes_de = create_db_mutation("de", more_recipes_cs)

        cs_data = [CsNutriRecipes(**kwargs) for i, kwargs in enumerate(more_recipes_cs) if i != 2]
        en_data = [EnNutriRecipes(**kwargs) for i, kwargs in enumerate(more_recipes_en) if i != 2]
        de_data = [DeNutriRecipes(**kwargs) for i, kwargs in enumerate(more_recipes_de) if i != 2]

        cs_data.extend(en_data)
        cs_data.extend(de_data)

        s = db.session

        for r in cs_data:
            s.add(r)
        db.session.commit()

    return app


def mock_get_menu(result: Union[bool, None] = None, with_snack: bool = True) -> Union[GeneratedMenuData, str]:
    test_menu = {
        "foods": {
            "breakfast": {
                "id": 1,
                "portions": 1,
                "cs_name": "Test breakfast cs",
                "cs_url": "Test breakfast URL cs",
                "en_name": "Test breakfast en",
                "en_url": "Test breakfast URL en",
                "de_name": "Test breakfast de",
                "de_url": "Test breakfast URL de",
                "recipe_id": 1
            },
            "lunch": {
                "id": 2,
                "portions": 2,
                "cs_name": "Test lunch cs",
                "cs_url": "Test lunch URL cs",
                "en_name": "Test lunch en",
                "en_url": "Test lunch URL en",
                "de_name": "Test lunch de",
                "de_url": "Test lunch URL de",
                "recipe_id": 2
            },
            "dinner": {
                "id": 2,
                "portions": 2,
                "cs_name": "Test lunch cs",
                "cs_url": "Test lunch URL cs",
                "en_name": "Test lunch en",
                "en_url": "Test lunch URL en",
                "de_name": "Test lunch de",
                "de_url": "Test lunch URL de",
                "recipe_id": 2
            },
            "snack": {
                "id": 3,
                "portions": 3,
                "cs_name": "Test snack cs",
                "cs_url": "Test snack URL cs",
                "en_name": "Test snack en",
                "en_url": "Test snack URL en",
                "de_name": "Test snack de",
                "de_url": "Test snack URL de",
                "recipe_id": 3
            }
        },
        "iterations": 1,
        "nutrients": {
            "carbs": {
                "amount": "200 g" if with_snack else "180 g",
                "ratio": 46.0 if with_snack else 46.0
            },
            "energy": {
                "amount": "1724 kcal" if with_snack else "1559 kcal",
                "ratio": 86.0 if with_snack else 78.0
            },
            "fats": {
                "amount": "36 g" if with_snack else "31 g",
                "ratio": 19.0 if with_snack else 18.0
            },
            "fiber": {
                "amount": "35 g" if with_snack else "30 g",
                "ratio": 117.0 if with_snack else 100.0
            },
            "proteins": {
                "amount": "150 g" if with_snack else "140 g",
                "ratio": 35.0 if with_snack else 36.0
            },
        }
    }

    if not with_snack:
        del test_menu["foods"]["snack"]

    def switch(res: Union[bool, None] = None) -> Union[GeneratedMenuData, str]:
        if res is True:
            return test_menu
        elif res is False:
            return False
        elif res is None:
            return None

    return switch(result)


def mock_get_recipe() -> RecipeData:
    return {
        "id": 1,
        "name": "Test breakfast cs",
        "nutrients": {
            "carbs": 40.0,
            "energy": 455.0,
            "fats": 15.0,
            "fiber": 10.0,
            "proteins": 40.0
        },
        "portions": 1,
        "url": "Test breakfast URL cs"
    }
