import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env_prod'))

SECRET_KEY = os.environ.get("SECRET_KEY")
SQLALCHEMY_DATABASE_URI = os.environ.get("SQLALCHEMY_DATABASE_URI")
SQLALCHEMY_TRACK_MODIFICATIONS = True if os.environ.get("SQLALCHEMY_TRACK_MODIFICATIONS", default=True) == "True" else False
SQLALCHEMY_ECHO = True if os.environ.get("SQLALCHEMY_ECHO", default=True) == "True" else False
FE_ORIGIN = os.environ.get("FE_ORIGIN")
DB_DRIVERNAME = os.environ.get("DB_DRIVERNAME", default="sqlite")
