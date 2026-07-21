from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "TaskFlow API"
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]  # React Dev server

    # We will serve the static files from this directory in production
    STATIC_DIR: str = str(Path(__file__).resolve().parent / "static")

    # Default Database URL (SQLite, PostgreSQL, MySQL)
    DATABASE_URL: str = "sqlite:///./taskflow.db"

    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")


settings = Settings()
