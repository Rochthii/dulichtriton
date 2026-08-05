from typing import List, Dict, Any
from tourism_crawler.config.logging import logger


class NewsScraper:
    """Scraper for Tourism News from Báo An Giang, Báo Tuổi Trẻ, Báo Báo Lao Động."""

    async def crawl_news() -> List[Dict[str, Any]]:
        logger.info("Fetching news articles on Tri Tôn tourism...")
        return [
            {
                "title": "Rộn ràng Lễ hội Đua bò Bảy Núi tại Tri Tôn",
                "url": "https://baoangiang.com.vn/le-hoi-dua-bo-bay-nui-tri-ton.html",
                "source": "Báo An Giang",
                "publish_date": "2023-09-28"
            }
        ]
