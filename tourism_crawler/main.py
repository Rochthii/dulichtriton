import asyncio
import os
import sys
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("tourism_crawler")

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from tourism_crawler.crawler.apify_scraper import ApifyGoogleMapsScraper
from tourism_crawler.services.deduplication_service import DeduplicationService
from tourism_crawler.export.exporter import DataExporter

async def run_pipeline():
    logger.info("==================================================")
    logger.info("STARTING TRI TON GOOGLE MAPS TOURISM DATA PIPELINE")
    logger.info("==================================================")

    # 1. Initialize Apify Google Maps Scraper & Fetch Data
    scraper = ApifyGoogleMapsScraper()
    raw_enriched_places = await scraper.fetch_places_from_apify()

    # 2. Deduplicate Places
    logger.info("Executing Enterprise Deduplication Service...")
    unique_places = DeduplicationService.deduplicate_places(raw_enriched_places)
    logger.info(f"Deduplication Completed. Unique Verified Records: {len(unique_places)}")

    # 3. Export to JSON, CSV, SQL Seed
    logger.info("Exporting Production Assets (places.json, places.csv, seed_places.sql)...")
    exporter = DataExporter(output_dir="export")
    exporter.export_all(unique_places)

    logger.info("==================================================")
    logger.info("SUCCESS: PIPELINE COMPLETED! DATA READY FOR AI RAG")
    logger.info("==================================================")

def main():
    asyncio.run(run_pipeline())

if __name__ == "__main__":
    main()
