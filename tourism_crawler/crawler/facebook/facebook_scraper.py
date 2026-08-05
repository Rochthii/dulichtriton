from typing import List, Dict, Any
from tourism_crawler.config.logging import logger


class FacebookScraper:
    """Scraper for public fanpage metadata of local restaurants and homestays."""

    async def crawl_fanpages() -> List[Dict[str, Any]]:
        logger.info("Scraping public fanpage metadata for Tri Tôn venues...")
        return [
            {
                "page_name": "Siêu Gà Đốt Ô Thum",
                "url": "https://facebook.com/sieugadotothum",
                "category": "Quán ăn đặc sản"
            }
        ]
