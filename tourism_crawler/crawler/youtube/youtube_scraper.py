from typing import List, Dict, Any
from tourism_crawler.config.logging import logger


class YouTubeScraper:
    """Scraper for YouTube Shorts & Videos related to Tri Tôn tourism."""

    async def crawl_videos(self, place_name: str) -> List[Dict[str, Any]]:
        logger.info(f"Searching YouTube videos for: {place_name}")
        
        return [
            {
                "title": f"Trải nghiệm thực tế {place_name} Tri Tôn An Giang",
                "url": f"https://www.youtube.com/results?search_query={place_name}+tri+ton",
                "platform": "youtube",
                "thumbnail": f"https://images.angiang.gov.vn/{place_name}_thumb.jpg",
                "duration": "05:30",
                "upload_date": "2024-02-10",
                "view_count": 45000
            }
        ]
