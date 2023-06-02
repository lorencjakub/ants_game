"""Extensions module. Each extension is initialized in the app factory located in app.py."""
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
import os
import shutil
import json


db = SQLAlchemy()
migrate = Migrate()


def initialize_db():
    print('No DB found. Creating...')

    # if "migrations" in os.listdir(os.getcwd()) and "versions" not in os.listdir(f'{os.getcwd()}/migrations'):
    if "migrations" in os.listdir(os.getcwd()):
        shutil.rmtree(f'{os.getcwd()}/migrations')

    db.create_all()
    os.system("flask db init")
    init_cards()
    print('A new database has been created.')


def init_cards():
    from application.models import BuildingCards, SoldiersCards, MagicCards, Rooms

    with open(f'{os.getcwd()}/config/building_cards.json', encoding='utf-8') as b:
        building_cards = json.load(b)

        for bc in building_cards:
            BuildingCards.create(**create_item_name(bc))

    with open(f'{os.getcwd()}/config/soldiers_cards.json', encoding='utf-8') as s:
        soldiers_cards = json.load(s)

        for sc in soldiers_cards:
            SoldiersCards.create(**create_item_name(sc))

    with open(f'{os.getcwd()}/config/magic_cards.json', encoding='utf-8') as m:
        magic_cards = json.load(m)

        for mc in magic_cards:
            MagicCards.create(**create_item_name(mc))

    db.session.commit()


def create_item_name(data):
    en_name = data.get("en_name")

    if not en_name:
        raise Exception("English version of card name has not been found")

    data["item_name"] = data["en_name"].lower()

    return data
