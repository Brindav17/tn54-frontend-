import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Config:
    # Defaults to a local SQLite file so the app runs with zero setup;
    # point DATABASE_URL at Postgres for anything beyond local dev.
    # `or` (not a second .get() arg) so an unset *or blank* env var both fall
    # through to the default -- an empty string in .env is still "present".
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or (
        f"sqlite:///{os.path.join(BASE_DIR, 'thyroscan.db')}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "dev-secret-change-me"
    JWT_TOKEN_LOCATION = ["headers"]

    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID") or None
