from flask import Flask
import sqlalchemy
from sqlalchemy.exc import SQLAlchemyError
from distinct_types import Union, Tuple


def register_app_error_handlers(app: Flask) -> None:
    # if app.config.get('DEBUG') is True:
    #     app.logger.debug('Skipping error handlers in Debug mode')
    #     return

    @app.errorhandler(SQLAlchemyError)
    def db_error(err: SQLAlchemyError) -> Tuple[Union[str, Exception], int]:
        if isinstance(err, sqlalchemy.exc.InternalError):
            return "Error in database", 400

        return err, 400

    @app.errorhandler(Exception)
    def request_error(err) -> Tuple[str, int]:
        return err.description, err.code


class CustomError(Exception):
    def __init__(self, description):
        self.description = description
        super().__init__()
