import os

files = {}

files["requirements.txt"] = """playwright>=1.40.0
beautifulsoup4>=4.12.0
requests>=2.31.0
aiohttp>=3.9.0
sqlalchemy>=2.0.0
pgvector>=0.2.0
psycopg2-binary>=2.9.9
asyncpg>=0.29.0
pandas>=2.1.0
openpyxl>=3.1.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
loguru>=0.7.2
tenacity>=8.2.3
rich>=13.7.0
faker>=20.1.0
python-dotenv>=1.0.0
pytest>=7.4.0
pytest-asyncio>=0.23.0
"""

files[".env.example"] = """# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/triton_tourism
SYNC_DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/triton_tourism

# Application Environment
ENV=development
DEBUG=true
LOG_LEVEL=INFO

# Crawler Settings
CRAWLER_HEADLESS=true
CRAWLER_TIMEOUT=30000
CRAWLER_CONCURRENCY=5
CRAWLER_DELAY_SECONDS=1.5
CACHE_DIR=./.cache

# Target Region Filter
TARGET_DISTRICT=Tri Tôn
TARGET_PROVINCE=An Giang
TARGET_COUNTRY=Việt Nam
"""

files["tourism_crawler/__init__.py"] = '''"""
Tourism Crawler - Production Data Engine for Tri Ton District, An Giang, Vietnam.
"""

__version__ = "1.0.0"
__author__ = "Senior Data Engineering Team"
'''

files["tourism_crawler/config/__init__.py"] = '''from tourism_crawler.config.settings import settings
from tourism_crawler.config.logging import logger

__all__ = ["settings", "logger"]
'''

files["tourism_crawler/config/settings.py"] = '''from pydantic_settings import BaseSettings, SettingsConfigDict
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
'''

files["tourism_crawler/config/logging.py"] = '''import sys
from pathlib import Path
from loguru import logger
from tourism_crawler.config.settings import settings

log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

logger.remove()

logger.add(
    sys.stdout,
    level=settings.LOG_LEVEL,
    format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level:<=8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    colorize=True,
)

logger.add(
    log_dir / "crawler_{time:YYYY-MM-DD}.log",
    rotation="10 MB",
    retention="30 days",
    compression="zip",
    level=settings.LOG_LEVEL,
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level:<=8} | {name}:{function}:{line} - {message}",
    encoding="utf-8",
)

__all__ = ["logger"]
'''

for filepath, content in files.items():
    dirname = os.path.dirname(filepath)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Phase 1 complete: Wrote {len(files)} config files.")
