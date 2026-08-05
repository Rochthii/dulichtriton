import asyncio
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
