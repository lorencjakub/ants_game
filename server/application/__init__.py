from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from utils.SecurityManager import SecurityHeaderManager

from utils.security_settings import set_cors, set_security_headers
from extensions import *
from .services.error_handlers import register_app_error_handlers

import os
import json
from distinct_types import Tuple

BE_ENV = os.environ.get("BE_ENV")
socketio = SocketIO(logger=True, engineio_logger=True)


def create_app(with_secutiry: bool = True, with_sockets: bool = False) -> Flask | Tuple[Flask, SocketIO]:
    """Create application factory
    """
    config_object = f'config_{BE_ENV if BE_ENV is not None else "dev"}'
    app = Flask("nutri_manager")
    app.config.from_object(config_object)

    cors_settings = set_cors()
    security_headers = set_security_headers()
    fe_origin = "*"

    if with_secutiry:
        fe_origin = os.environ.get("FE_ORIGIN", default="http://127.0.0.1:3000")

        if fe_origin:
            try:
                fe_origin = json.loads(fe_origin)

            except json.decoder.JSONDecodeError:
                pass

            cors_settings["origins"] = [*fe_origin] if isinstance(fe_origin, list) else [fe_origin]

        CORS(app, **cors_settings)
        SecurityHeaderManager(app, **security_headers)

    register_extensions(app)
    register_blueprints(app)
    # register_app_error_handlers(app)
    # register_shellcontext(app)
    # register_commands(app)
    # configure_logger(app)

    app.config['CORS_HEADERS'] = 'Content-Type'

    if with_sockets:
        socketio.init_app(
            app,
            cors_allowed_origins=fe_origin,
            engineio=True,
            engineio_logger=app.logger,
            logger=app.logger
        )

    return app


def register_extensions(app: Flask) -> None:
    """Register Flask extensions."""
    db.init_app(app)

    with app.app_context():
        if db.engine.url.drivername == 'sqlite':
            db.session().expire_on_commit = False
            migrate.init_app(app, db, render_as_batch=True)
        else:
            migrate.init_app(app, db)

    return None


def register_blueprints(app: Flask) -> None:
    """Register Flask api."""
    from application.main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return None
