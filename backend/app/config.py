from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Incident Platform"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    database_url: str = "postgresql+psycopg_async://postgres:postgres@db:5432/incidents"
    cors_origins: str = "*"

    # Auth
    admin_username: str = "admin"
    admin_password: str = "admin123"
    responder_username: str = "responder"
    responder_password: str = "responder123"
    jwt_secret: str = "super-secret-change-me"
    jwt_algorithm: str = "HS256"
    jwt_exp_minutes: int = 60

    # Media
    media_dir: str = "uploads"
    media_base_url: str = "http://localhost:8000/media"

    class Config:
        env_file = ".env"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
