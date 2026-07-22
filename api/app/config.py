import tomllib
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

PYPROJECT_PATH = Path(__file__).resolve().parent.parent / "pyproject.toml"


def get_pyproject_version() -> str:
    try:
        if PYPROJECT_PATH.exists():
            with open(PYPROJECT_PATH, "rb") as f:
                data = tomllib.load(f)
                return data.get("project", {}).get("version", "0.0.0")
    except Exception:
        pass
    return "0.0.0"


class Settings(BaseSettings):
    PROJECT_NAME: str = "TaskFlow API"
    VERSION: str = get_pyproject_version()
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]  # React Dev server

    # We will serve the static files from this directory in production
    STATIC_DIR: str = str(Path(__file__).resolve().parent / "static")

    # Default Database URL (SQLite, PostgreSQL, MySQL)
    DATABASE_URL: str = "sqlite:///./taskflow.db"

    # User Authentication & Session settings
    ALLOW_REGISTRATION: bool = True
    JWT_SECRET_KEY: str = "super-secret-jwt-key-taskflow-change-in-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")


settings = Settings()
