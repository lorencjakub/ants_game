from flask import Flask
from extensions import *
from application import create_app, socketio

import os
import sys
import json
from distinct_types import Union, List


BE_ENV = os.environ.get("BE_ENV")


def main_loop() -> Union[None, Flask]:
    host = None
    port = None

    if "--host" in sys.argv:
        host_index = sys.argv.index("--host")
        host = sys.argv[host_index + 1]

    if "--port" in sys.argv or "-p" in sys.argv:
        port_index = sys.argv.index("--port") or sys.argv.index("-p")
        port = int(sys.argv[port_index + 1])

    app = create_app(with_sockets=True)

    with app.app_context():
        empty_db = "instance" not in os.listdir(os.getcwd()) or "database.sqlite3" not in os.listdir(f'{os.getcwd()}\\instance')

        if empty_db:
            from application.models import BuildingCards, SoldiersCards, MagicCards, Rooms
            initialize_db()

        os.system("flask db stamp head")

        if "-m" in sys.argv:
            index_of_message_flag = sys.argv.index("-m")
            message = sys.argv[index_of_message_flag + 1]
            os.system(f'flask db migrate -m "{message}"')

        os.system("flask db upgrade")

    if BE_ENV == "prod":
        return app

    else:
        socketio.run(app, debug=True, port=port, host=host)


if __name__ == "__main__":
    main_loop()
