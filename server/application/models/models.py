"""Database module, including the SQLAlchemy database object and DB-related utilities."""
from database import db, PkModel
from sqlalchemy.ext.hybrid import hybrid_property
import enum
import uuid
from distinct_types import Union, List, Dict
import random
from application.services.error_handlers import CustomError
import time


# ENUMS
class UnitChoices(str, enum.Enum):
    none = "none"
    bricks = "bricks"
    weapons = "weapons"
    crystals = "crystals"


class SourcesChoices(str, enum.Enum):
    none = "none"
    bricks = "bricks"
    weapons = "weapons"
    crystals = "crystals"
    builders = "builders"
    soldiers = "soldiers"
    mages = "mages"
    materials = "materials"
    fence = "fence"
    castle = "castle"
    attack = "attack"
    all = "all"


# ASSOCIATIONS
class PlayersInRooms(db.Model):
    __tablename__ = 'players_in_rooms'

    room = db.Column(db.Integer, db.ForeignKey("rooms.id"), primary_key=True)
    player = db.Column(db.Integer, db.ForeignKey("players.id"), primary_key=True)
    populate = db.Column(db.Integer, nullable=False, default=1)


class BuildingCardsInDeck(db.Model):
    __tablename__ = "building_cards_in_deck"

    card = db.Column(db.Integer, db.ForeignKey("building_cards.id"), primary_key=True)
    room = db.Column(db.String(32), db.ForeignKey("rooms.id"), primary_key=True)
    count = db.Column(db.Integer, nullable=False, default=1)


class SoldiersCardsInDeck(db.Model):
    __tablename__ = "soldiers_cards_in_deck"

    card = db.Column(db.Integer, db.ForeignKey("soldiers_cards.id"), primary_key=True)
    room = db.Column(db.String(32), db.ForeignKey("rooms.id"), primary_key=True)
    count = db.Column(db.Integer, nullable=False, default=1)


class MagicCardsInDeck(db.Model):
    __tablename__ = "magic_cards_in_deck"

    card = db.Column(db.Integer, db.ForeignKey("magic_cards.id"), primary_key=True)
    room = db.Column(db.String(32), db.ForeignKey("rooms.id"), primary_key=True)
    count = db.Column(db.Integer, nullable=False, default=1)


class PlayerBuildingCards(db.Model):
    __tablename__ = "player_building_cards"

    card = db.Column(db.Integer, db.ForeignKey("building_cards.id"), primary_key=True)
    player = db.Column(db.Integer, db.ForeignKey("players.id"), primary_key=True)
    count = db.Column(db.Integer, nullable=False, default=1)


class PlayerSoldiersCards(db.Model):
    __tablename__ = "player_soldiers_cards"

    card = db.Column(db.Integer, db.ForeignKey("soldiers_cards.id"), primary_key=True)
    player = db.Column(db.Integer, db.ForeignKey("players.id"), primary_key=True)
    count = db.Column(db.Integer, nullable=False, default=1)


class PlayerMagicCards(db.Model):
    __tablename__ = "player_magic_cards"

    card = db.Column(db.Integer, db.ForeignKey("magic_cards.id"), primary_key=True)
    player = db.Column(db.Integer, db.ForeignKey("players.id"), primary_key=True)
    count = db.Column(db.Integer, nullable=False, default=1)


# MODELS
class Card(PkModel):
    __table_args__ = {'extend_existing': True}
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    en_name = db.Column(db.String(20), nullable=False, default="")
    cs_name = db.Column(db.String(20), nullable=False, default="")
    price_amount = db.Column(db.Integer, db.CheckConstraint('price_amount >= 0 AND price_amount <= 39'), nullable=False,
                             default=0)
    bonus_unit = db.Column(db.Enum(SourcesChoices), default=SourcesChoices.none, nullable=False)
    bonus_amount = db.Column(db.Integer, db.CheckConstraint('bonus_amount >= 0 AND bonus_amount <= 32'), nullable=False,
                             default=0)
    enemy_lost_unit = db.Column(db.Enum(SourcesChoices), default=SourcesChoices.none, nullable=False)
    enemy_lost_amount = db.Column(db.Integer,
                                  db.CheckConstraint('enemy_lost_amount >= -10 AND enemy_lost_amount <= 32'),
                                  nullable=False, default=0)
    item_name = db.Column(db.String(20), nullable=False, default="")
    count_in_deck = db.Column(db.Integer, db.CheckConstraint("count_in_deck >= 0 AND count_in_deck < 64"), default=1)

    def __str__(self) -> str:
        return "<{id} {item_name}>".format(id=self.id, item_name=self.item_name)


class BuildingCards(Card):
    __tablename__ = "building_cards"

    price_unit = db.Column(db.Enum(UnitChoices), default=UnitChoices.bricks, nullable=False)
    color = db.Column(db.String(5), nullable=False, default="red")

    def __str__(self) -> str:
        return "<Building card {item_name} ID {id}>".format(item_name=self.item_name, id=self.id)

    def __repr__(self) -> str:
        return "<Building card {item_name} ID {id}>".format(item_name=self.item_name, id=self.id)


class SoldiersCards(Card):
    __tablename__ = "soldiers_cards"

    price_unit = db.Column(db.Enum(UnitChoices), default=UnitChoices.weapons, nullable=False)
    color = db.Column(db.String(5), nullable=False, default="green")

    def __str__(self) -> str:
        return "<Soldiers card {item_name} ID {id}>".format(item_name=self.item_name, id=self.id)

    def __repr__(self) -> str:
        return "<Soldiers card {item_name} ID {id}>".format(item_name=self.item_name, id=self.id)


class MagicCards(Card):
    __tablename__ = "magic_cards"

    price_unit = db.Column(db.Enum(UnitChoices), default=UnitChoices.crystals, nullable=False)
    color = db.Column(db.String(5), nullable=False, default="blue")

    def __str__(self) -> str:
        return "<Magic card {item_name} ID {id}>".format(item_name=self.item_name, id=self.id)

    def __repr__(self) -> str:
        return "<Magic card {item_name} ID {id}>".format(item_name=self.item_name, id=self.id)


class Players(PkModel):
    __tablename__ = "players"

    id = db.Column(db.Integer, primary_key=True)
    room = db.relationship("Rooms", secondary="players_in_rooms", back_populates="players")
    name = db.Column(db.String(32), nullable=False, default="Player")
    building_cards = db.relationship("BuildingCards", secondary="player_building_cards")
    soldiers_cards = db.relationship("SoldiersCards", secondary="player_soldiers_cards")
    magic_cards = db.relationship("MagicCards", secondary="player_magic_cards")
    is_host = db.Column(db.Boolean, default=False)
    token = db.Column(db.String(32), nullable=False, default="PlayerToken")
    sources_id = db.Column(db.ForeignKey("sources.id"))
    sources = db.relationship("Sources")

    def __str__(self) -> str:
        return "<Player ID {id}>".format(id=self.id)

    def __repr__(self) -> str:
        return "<Player ID {id}>".format(id=self.id)

    @classmethod
    def create(cls, **kwargs):
        kwargs["token"] = str(uuid.uuid4().hex)
        return super().create(**kwargs)

    @hybrid_property
    def cards(self):
        cards_in_deck = []

        for cards in [self.building_cards, self.soldiers_cards, self.magic_cards]:
            if len(cards) != 0:
                cards_in_deck.extend(cards)

        return cards_in_deck

    def add_card(self, card: Union[BuildingCards, SoldiersCards, MagicCards]):
        model = get_table_by_tablename(f'player_{card.__tablename__}')
        association = model.query.filter_by(card=card.id, player=self.id).first()

        if association:
            association.count += 1
            db.session.add(association)
            return db.session.commit()

        hand = mutate_db_object({
            "building_cards": self.building_cards,
            "soldiers_cards": self.soldiers_cards,
            "magic_cards": self.magic_cards
        })

        hand[card.__tablename__].append(card)

        return self.update(**hand)

    def get_player_room(self):
        player_room = Rooms.query.filter(Rooms.players.contains(self)).first()
        if not player_room:
            raise CustomError("Player not found in any room")

        return player_room


class Rooms(PkModel):
    __table_args__ = {'extend_existing': True}
    __tablename__ = "rooms"

    id = db.Column(db.Integer, primary_key=True)
    guid = db.Column(db.String(32), nullable=False)
    building_cards_in_deck = db.relationship("BuildingCards", secondary="building_cards_in_deck")
    soldiers_cards_in_deck = db.relationship("SoldiersCards", secondary="soldiers_cards_in_deck")
    magic_cards_in_deck = db.relationship("MagicCards", secondary="magic_cards_in_deck")
    players = db.relationship("Players", secondary="players_in_rooms", back_populates="room")
    player_on_turn = db.Column(db.Integer, nullable=False, default=1)
    winner = db.Column(db.String(32), nullable=True)
    active = db.Column(db.Boolean, nullable=False, default=True)

    def __str__(self) -> str:
        if not self.active:
            return "<Non-active room ID {id}>".format(id=self.id)

        return "<Room ID {id} with players {players} ({player_on_turn} on turn)>".format(
            id=self.id, players=self.players, player_on_turn=self.player_on_turn)

    def __repr__(self) -> str:
        if not self.active:
            return "<Non-active room ID {id}>".format(id=self.id)

        return "<Room ID {id} with players {players} ({player_on_turn} on turn)>".format(
            id=self.id, players=self.players, player_on_turn=self.player_on_turn)

    @classmethod
    def create(cls):
        return super().create(guid=str(uuid.uuid4().hex))

    @hybrid_property
    def cards_in_deck(self):
        cards_in_deck = []

        for cards in [self.building_cards_in_deck, self.soldiers_cards_in_deck, self.magic_cards_in_deck]:
            if len(cards) != 0:
                cards_in_deck.extend(cards)

        return cards_in_deck

    def switch_turn(self):
        player_on_turn = 1 + (self.player_on_turn == 1)
        return self.update(True, player_on_turn=player_on_turn)

    def add_player(self, p: Players):
        if len(self.players) == 2:
            raise CustomError("This room is already full")

        if p in self.players:
            raise CustomError("Player is already in this room")

        self.players.append(p)
        return self.update(True, players=self.players)

    def remove_player(self, p: Players):
        if p not in self.players:
            raise CustomError("Player not found in this room")

        self.players.remove(p)
        return self.update(True, players=self.players)

    def create_deck(self):
        self.update(
            building_cards_in_deck=BuildingCards.query.all(),
            soldiers_cards_in_deck=SoldiersCards.query.all(),
            magic_cards_in_deck=MagicCards.query.all()
        )

        for b_association in BuildingCardsInDeck.query.all():
            b_association.count = BuildingCards.get_by_id(b_association.card).count_in_deck
            db.session.add(b_association)

        for s_association in SoldiersCardsInDeck.query.all():
            s_association.count = SoldiersCards.get_by_id(s_association.card).count_in_deck
            db.session.add(s_association)

        for m_association in MagicCardsInDeck.query.all():
            m_association.count = MagicCards.get_by_id(m_association.card).count_in_deck
            db.session.add(m_association)

        db.session.commit()

    def get_enemy(self, player) -> Players:
        return [p for p in self.players if p.id != player.id][0]


class Sources(PkModel):
    __tablename__ = "sources"

    id = db.Column(db.Integer, primary_key=True)
    bricks = db.Column(db.Integer, db.CheckConstraint("bricks >= 0"), nullable=False, default=5)
    weapons = db.Column(db.Integer, db.CheckConstraint("weapons >= 0"), nullable=False, default=5)
    crystals = db.Column(db.Integer, db.CheckConstraint("crystals >= 0"), nullable=False, default=5)
    builders = db.Column(db.Integer, db.CheckConstraint("builders >= 0"), nullable=False, default=2)
    soldiers = db.Column(db.Integer, db.CheckConstraint("soldiers >= 0"), nullable=False, default=2)
    mages = db.Column(db.Integer, db.CheckConstraint("mages >= 0"), nullable=False, default=2)
    fence = db.Column(db.Integer, db.CheckConstraint("fence >= 0"), nullable=False, default=10)
    castle = db.Column(db.Integer, db.CheckConstraint("castle >= 0"), nullable=False, default=30)

    def __str__(self) -> str:
        return "<Sources ID {id}>".format(id=self.id)

    def __repr__(self) -> str:
        return "<Sources ID {id}>".format(id=self.id)

    def grow_sources(self):
        new_sources = create_data_dict(self)

        for (source, ant) in [("bricks", "builders"), ("weapons", "soldiers"), ("crystals", "mages")]:
            new_sources[source] += new_sources[ant]

        self.update(**new_sources)


# FUNCTIONS
def mutate_db_object(obj):
    if isinstance(obj, list):
        res = []
        res.extend(obj)
        return res

    elif isinstance(obj, dict):
        res = {}
        res.update(obj)
        return res

    else:
        return obj


def get_table_by_tablename(tablename: str):
    match tablename:
        case "players_in_rooms":
            return PlayersInRooms

        case "building_cards_in_deck":
            return BuildingCardsInDeck

        case "soldiers_cards_in_deck":
            return SoldiersCardsInDeck

        case "magic_cards_in_deck":
            return MagicCardsInDeck

        case "player_building_cards":
            return PlayerBuildingCards

        case "player_soldiers_cards":
            return PlayerSoldiersCards

        case "player_magic_cards":
            return PlayerMagicCards

        case "building_cards":
            return BuildingCards

        case "soldiers_cards":
            return SoldiersCards

        case "magic_cards":
            return MagicCards

        case "rooms":
            return Rooms

        case "players":
            return Players

        case _:
            raise CustomError(f'Unknown tablename {tablename}')


def create_data_dict(obj, delete_id: bool = True):
    obj_id = obj.id
    obj_dict = {}
    obj_dict.update(obj.__dict__)

    try:
        del obj_dict["_sa_instance_state"]

        if delete_id:
            del obj_dict["id"]

    except KeyError:
        pass

    return obj_dict
