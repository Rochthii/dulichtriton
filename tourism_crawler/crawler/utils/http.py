import aiohttp
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
