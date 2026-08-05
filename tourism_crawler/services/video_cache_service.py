import json
import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger("tourism_crawler.video_cache")

class VideoCacheService:
    """Cronjob Scraper & Cache Engine for TikTok Shorts and YouTube Reviews."""

    def __init__(self, cache_file: str = "data/tri_ton_videos.json"):
        self.cache_file = cache_file

    def get_cached_videos(self, place_id: str = None) -> List[Dict[str, Any]]:
        """Instant sub-2s video retrieval directly from DB/File cache."""
        if not os.path.exists(self.cache_file):
            return []

        with open(self.cache_file, "r", encoding="utf-8") as f:
            videos = json.load(f)

        if place_id:
            return [v for v in videos if v.get("place_id") == place_id or v.get("is_approved")]
        return videos

    def update_video_cache(self, new_videos: List[Dict[str, Any]]):
        """Nightly cronjob cache update."""
        existing = self.get_cached_videos()
        existing_ids = {v["id"] for v in existing}

        for nv in new_videos:
            if nv["id"] not in existing_ids:
                existing.append(nv)

        with open(self.cache_file, "w", encoding="utf-8") as f:
            json.dump(existing, f, ensure_ascii=False, indent=2)
        logger.info(f"Updated Video Cache with {len(new_videos)} video entries. Total cached: {len(existing)}")
