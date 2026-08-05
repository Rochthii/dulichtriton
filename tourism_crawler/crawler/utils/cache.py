import json
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
