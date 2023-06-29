from extensions import *
from application import create_app, socketio

import os
import sys


app = create_app(with_sockets=True)
BE_ENV = os.environ.get("BE_ENV")


def prep_server() -> None:
    with app.app_context():
        empty_db = (len(inspect(db.engine).get_table_names()) == 0) if BE_ENV != "test" else False

        if empty_db:
            initialize_db()

        os.system("flask db stamp head")

        if "-m" in sys.argv:
            index_of_message_flag = sys.argv.index("-m")
            message = sys.argv[index_of_message_flag + 1]
            os.system(f'flask db migrate -m "{message}"')

        os.system("flask db upgrade")


if __name__ == "__main__":
    prep_server()

    if BE_ENV not in ["test", "prod"]:
        socketio.run(app, debug=True)
