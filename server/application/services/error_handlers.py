from flask import Flask
import sqlalchemy
from sqlalchemy.exc import SQLAlchemyError
from distinct_types import Tuple, Dict, List
import traceback
import logging


errors = {
    "RM_NAC": "Room is not active anymore",
    "RM_INV": "Invalid room",
    "RM_FLL": "This room is already full",
    "CRD_MSN": "Missing card",
    "CRD_PLR": "Player does not have this card in hand",
    "CRD_XPS": "This card is too expensive for the player",
    "CRD_NTF": "Card not found in deck",
    "TRN_PLR": "Player is not on turn now",
    "TRN_SWC": "Error during switching turn",
    "PLR_WTN": "You cannot play until second player join the room",
    "PLR_SRC": "Player does not have any sources",
    "PLR_DCT": "Only host player is able to deactivate room",
    "PLR_NTF": "Player not found in room",
    "PLR_RM": "Player is already in this room",
    "SRC_NTF": "Sources of enemy has not been found"
}


def register_app_error_handlers(app: Flask) -> None:
    if app.config.get('DEBUG') is True:
        app.logger.debug('Skipping error handlers in Debug mode')
        return

    @app.errorhandler(SQLAlchemyError)
    def db_error(err: SQLAlchemyError) -> Tuple[str | Exception, int]:
        logging.error(traceback.format_exc())

        if isinstance(err, sqlalchemy.exc.InternalError):
            return "Error in database", 400

        return err, 400

    @app.errorhandler(Exception)
    def request_error(err) -> Tuple[Dict[str, str], int]:
        logging.error(traceback.format_exc())

        return ({"messages": err.code, "description": err.description}, 400) \
            if isinstance(err, CustomError) else ({"messages": err.args}, 400)


class CustomError(Exception):
    def __init__(self, code: str | List[str]):
        self.code = code if isinstance(code, list) else [code]
        self.description = None if isinstance(code, list) else errors.get(code)
        super().__init__()
