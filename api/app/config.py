from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "TaskFlow API"
    API_PREFIX: str = "/api"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]  # React Dev server

    # We will serve the static files from this directory in production
    STATIC_DIR: str = "app/static"

    # SQLite Database URL
    DATABASE_URL: str = "sqlite:///./tasks.db"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
