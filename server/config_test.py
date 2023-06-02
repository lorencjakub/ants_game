import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))

SECRET_KEY = os.environ.get("SECRET_KEY", default="super-secret-key")
SQLALCHEMY_DATABASE_URI = os.environ.get("SQLALCHEMY_DATABASE_URI", default="sqlite://")
SQLALCHEMY_TRACK_MODIFICATIONS = True if os.environ.get("SQLALCHEMY_TRACK_MODIFICATIONS", default=True) == "True" else False
SQLALCHEMY_ECHO = True if os.environ.get("SQLALCHEMY_ECHO", default=True) == "True" else False
FE_ORIGIN = os.environ.get("FE_ORIGIN", default="test")
DB_DRIVERNAME = os.environ.get("DB_DRIVERNAME", default="sqlite")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", default="secret-key")
OPENAI_ORGANIZATION_ID = os.environ.get("OPENAI_ORG_ID", default="org-id")