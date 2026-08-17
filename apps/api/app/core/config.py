from functools import lru_cache

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Validated runtime configuration with deliberately safe sending defaults."""

    model_config = SettingsConfigDict(
        env_file="../../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    app_base_url: AnyHttpUrl = "http://localhost:3000"
    api_base_url: AnyHttpUrl = "http://localhost:8000"
    app_secret: str = Field("local-development-only-change-me", min_length=16)
    encryption_key: str = Field("local-development-only-change-me", min_length=16)
    app_admin_email: str = "you@example.com"
    database_url: str = "postgresql+psycopg://outreach:outreach@localhost:5432/outreach"
    global_sending_enabled: bool = False
    default_daily_send_limit: int = Field(default=20, ge=0, le=500)
    default_hourly_send_limit: int = Field(default=5, ge=0, le=100)
    default_time_zone: str = "Africa/Lagos"
    docs_enabled: bool = True

    @property
    def web_origin(self) -> str:
        return str(self.app_base_url).rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()
