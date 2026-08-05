from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    """Production configuration settings for Tourism Crawler."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Application settings
    APP_NAME: str = "Tri Ton Tourism Crawler Engine"
    ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database settings
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/triton_tourism",
        description="Async PostgreSQL Connection URI"
    )
    SYNC_DATABASE_URL: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/triton_tourism",
        description="Sync PostgreSQL Connection URI for migrations"
    )

    # Scraper settings
    CRAWLER_HEADLESS: bool = True
    CRAWLER_TIMEOUT: int = 30000
    CRAWLER_CONCURRENCY: int = 5
    CRAWLER_DELAY_SECONDS: float = 1.5
    MAX_RETRIES: int = 3
    CACHE_DIR: str = "./.cache"

    # Regional Filters (Strict Tri Tôn, An Giang Enforcement)
    TARGET_DISTRICT: str = "Tri Tôn"
    TARGET_PROVINCE: str = "An Giang"
    TARGET_COUNTRY: str = "Việt Nam"

    # Bounding Box for Tri Ton District (Latitude/Longitude validation)
    MIN_LATITUDE: float = 10.2500
    MAX_LATITUDE: float = 10.5500
    MIN_LONGITUDE: float = 104.8500
    MAX_LONGITUDE: float = 105.1500


settings = Settings()
