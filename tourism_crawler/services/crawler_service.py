from typing import List, Dict, Any
from tourism_crawler.crawler.google_maps.maps_scraper import GoogleMapsScraper
from tourism_crawler.crawler.websites.travel_sites import TravelWebsitesScraper
from tourism_crawler.config.logging import logger


class CrawlerService:
    """Orchestrates all crawlers to fetch raw tourism data."""

    def __init__(self):
        self.gmaps_scraper = GoogleMapsScraper()
        self.travel_scraper = TravelWebsitesScraper()

    async def run_all(self) -> List[Dict[str, Any]]:
        logger.info("Starting Crawler Service execution...")
        gmaps_data = await self.gmaps_scraper.crawl_places()
        travel_data = await self.travel_scraper.crawl()
        
        all_raw = gmaps_data + travel_data
        logger.info(f"Crawler Service fetched total {len(all_raw)} raw records.")
        return all_raw
