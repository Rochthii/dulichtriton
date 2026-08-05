import os

files = {}

# --- DATABASE ENGINE & REPOSITORY ---
files["tourism_crawler/database/__init__.py"] = '''from tourism_crawler.database.connection import get_async_session, init_db
from tourism_crawler.database.repository import BaseRepository

__all__ = ["get_async_session", "init_db", "BaseRepository"]
'''

files["tourism_crawler/database/connection.py"] = '''from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from tourism_crawler.config.settings import settings
from tourism_crawler.models.base import Base
from tourism_crawler.config.logging import logger

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_size=10,
    max_overflow=20
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_async_session():
    """Dependency for providing AsyncSession."""
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    """Initialize database tables if they do not exist."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(f"Database initialization skipped or failed: {e}")
'''

files["tourism_crawler/database/repository.py"] = '''from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from tourism_crawler.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic Repository implementing CRUD operations for AsyncSession."""

    def __init__(self, model: Type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: str) -> Optional[ModelType]:
        stmt = select(self.model).where(self.model.id == id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def list_all(self, limit: int = 100, offset: int = 0) -> List[ModelType]:
        stmt = select(self.model).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def save(self, instance: ModelType) -> ModelType:
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def delete(self, instance: ModelType) -> None:
        await self.session.delete(instance)
        await self.session.commit()
'''

# --- CRAWLER UTILS ---
files["tourism_crawler/crawler/utils/__init__.py"] = '''from tourism_crawler.crawler.utils.http import AsyncHTTPClient
from tourism_crawler.crawler.utils.rate_limiter import AsyncRateLimiter
from tourism_crawler.crawler.utils.user_agent import get_random_user_agent
from tourism_crawler.crawler.utils.cache import FileCache

__all__ = ["AsyncHTTPClient", "AsyncRateLimiter", "get_random_user_agent", "FileCache"]
'''

files["tourism_crawler/crawler/utils/user_agent.py"] = '''import random

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1"
]


def get_random_user_agent() -> str:
    """Return a random modern browser User-Agent string."""
    return random.choice(USER_AGENTS)
'''

files["tourism_crawler/crawler/utils/rate_limiter.py"] = '''import asyncio
import time


class AsyncRateLimiter:
    """Async Token Bucket Rate Limiter to respect target server bandwidth."""

    def __init__(self, requests_per_second: float = 1.0):
        self.delay = 1.0 / max(requests_per_second, 0.1)
        self.last_request_time = 0.0
        self._lock = asyncio.Lock()

    async def wait(self):
        async with self._lock:
            now = time.monotonic()
            elapsed = now - self.last_request_time
            if elapsed < self.delay:
                await asyncio.sleep(self.delay - elapsed)
            self.last_request_time = time.monotonic()
'''

files["tourism_crawler/crawler/utils/cache.py"] = '''import json
import hashlib
from pathlib import Path
from typing import Optional, Any
from tourism_crawler.config.settings import settings


class FileCache:
    """Simple disk cache for raw HTML/JSON responses to prevent duplicate requests."""

    def __init__(self, cache_dir: str = settings.CACHE_DIR):
        self.cache_path = Path(cache_dir)
        self.cache_path.mkdir(exist_ok=True)

    def _get_key(self, url: str) -> str:
        return hashlib.md5(url.encode('utf-8')).hexdigest()

    def get(self, url: str) -> Optional[str]:
        file_file = self.cache_path / f"{self._get_key(url)}.cache"
        if file_file.exists():
            return file_file.read_text(encoding='utf-8')
        return None

    def set(self, url: str, content: str) -> None:
        file_file = self.cache_path / f"{self._get_key(url)}.cache"
        file_file.write_text(content, encoding='utf-8')
'''

files["tourism_crawler/crawler/utils/http.py"] = '''import aiohttp
import asyncio
from typing import Optional, Dict, Any
from tenacity import retry, stop_after_attempt, wait_exponential
from tourism_crawler.crawler.utils.user_agent import get_random_user_agent
from tourism_crawler.crawler.utils.rate_limiter import AsyncRateLimiter
from tourism_crawler.config.logging import logger


class AsyncHTTPClient:
    """Production Async HTTP Client with Rotating User-Agent, Rate Limiter & Tenacity Retries."""

    def __init__(self, rate_limit: float = 2.0):
        self.rate_limiter = AsyncRateLimiter(requests_per_second=rate_limit)
        self._session: Optional[aiohttp.ClientSession] = None

    async def get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=30)
            self._session = aiohttp.ClientSession(timeout=timeout)
        return self._session

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def fetch(self, url: str, headers: Optional[Dict[str, str]] = None) -> Optional[str]:
        await self.rate_limiter.wait()
        session = await self.get_session()
        
        req_headers = {"User-Agent": get_random_user_agent()}
        if headers:
            req_headers.update(headers)

        try:
            async with session.get(url, headers=req_headers) as response:
                if response.status == 200:
                    return await response.text()
                else:
                    logger.warning(f"HTTP GET {url} returned status {response.status}")
                    return None
        except Exception as e:
            logger.error(f"HTTP fetch error for {url}: {e}")
            raise e

    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
'''

for filepath, content in files.items():
    dirname = os.path.dirname(filepath)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Phase 3 complete: Wrote {len(files)} DB and HTTP Utils modules.")
