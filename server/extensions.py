"""Extensions module. Each extension is initialized in the app factory located in app.py."""
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect
import os
import shutil
import json


db = SQLAlchemy()
migrate = Migrate()


def initialize_db():
    print('No DB found. Creating...')

    if "migrations" in os.listdir(os.getcwd()):
        shutil.rmtree(f'{os.getcwd()}/migrations')

    db.create_all()
    os.system("flask db init")
    init_cards()
    print('A new database has been created.')


def init_cards():
    from application.models import BuildingCards, SoldiersCards, MagicCards

    with open(f'{os.getcwd()}/config/building_cards.json', encoding='utf-8') as b:
        building_cards = json.load(b)

        for bc in building_cards:
            BuildingCards.create(**bc)

    with open(f'{os.getcwd()}/config/soldiers_cards.json', encoding='utf-8') as s:
        soldiers_cards = json.load(s)

        for sc in soldiers_cards:
            SoldiersCards.create(**sc)

    with open(f'{os.getcwd()}/config/magic_cards.json', encoding='utf-8') as m:
        magic_cards = json.load(m)

        for mc in magic_cards:
            MagicCards.create(**mc)
