import asyncio
import os
import sys
import json
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger("tourism_crawler")

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from tourism_crawler.crawler.apify_scraper import ApifyGoogleMapsScraper
from tourism_crawler.services.validation_service import DataValidationService
from tourism_crawler.services.deduplication_service import DeduplicationService
from tourism_crawler.services.recommendation_graph_service import RecommendationGraphService
from tourism_crawler.services.embedding_service import EmbeddingChunkerService
from tourism_crawler.export.exporter import DataExporter

def create_storage_dirs():
    """Create 5-Layer Storage Architecture folders."""
    dirs = [
        "storage/raw",
        "storage/normalized",
        "storage/enriched",
        "storage/verified",
        "storage/exports"
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
    return dirs

async def run_pipeline():
    logger.info("==================================================")
    logger.info("STARTING ENTERPRISE 10-LAYER DATA PIPELINE")
    logger.info("==================================================")

    create_storage_dirs()
    timestamp_str = datetime.now().strftime("%Y-%m-%d")

    # 1. Fetch Raw Data & Save to storage/raw/
    scraper = ApifyGoogleMapsScraper()
    raw_enriched_places = await scraper.fetch_places_from_apify()
    raw_path = f"storage/raw/{timestamp_str}_google_maps_raw.json"
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump([p.model_dump() for p in raw_enriched_places], f, ensure_ascii=False, indent=2)
    logger.info(f"Layer 1: Saved Raw Dumps to {raw_path}")

    # 2. Data Quality Validation
    logger.info("Layer 2: Executing Data Quality Validation Service...")
    validated_places = []
    for place in raw_enriched_places:
        is_valid, errors = DataValidationService.validate_place(place)
        if is_valid:
            validated_places.append(place)
        else:
            logger.warning(f"Validation Rejected Place: {place.name} - Errors: {errors}")
    logger.info(f"Layer 2 Completed. Validated {len(validated_places)} places.")

    # 3. Deduplication Engine
    logger.info("Layer 3: Executing Enterprise Deduplication Service...")
    unique_places = DeduplicationService.deduplicate_places(validated_places)
    logger.info(f"Layer 3 Completed. Unique Verified Records: {len(unique_places)}")

    # 4. Recommendation Graph Engine
    logger.info("Layer 4: Building Proximity Recommendation Graph...")
    graph_places = RecommendationGraphService.build_recommendation_graph(unique_places)
    logger.info(f"Layer 4 Completed. Proximity Graph generated.")

    # 5. Save Enriched & Verified Records to storage/verified/
    verified_path = "storage/verified/places_master_verified.json"
    with open(verified_path, "w", encoding="utf-8") as f:
        json.dump([p.model_dump() for p in graph_places], f, ensure_ascii=False, indent=2)
    logger.info(f"Layer 5: Saved Master Verified Records to {verified_path}")

    # 6. RAG Embedding Chunk Generator
    logger.info("Layer 6: Generating RAG Embedding Chunks for Vector Database...")
    all_chunks = []
    for p in graph_places:
        chunks = EmbeddingChunkerService.generate_rag_passages(p)
        all_chunks.extend(chunks)

    chunk_path = "storage/enriched/rag_embedding_chunks.json"
    with open(chunk_path, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)
    logger.info(f"Layer 6 Completed. Generated {len(all_chunks)} RAG chunks at {chunk_path}")

    # 7. Export Production Assets to export/ and storage/exports/
    logger.info("Layer 7: Exporting Production Assets (places.json, places.csv, seed_places.sql)...")
    exporter = DataExporter(output_dir="export")
    exporter.export_all(graph_places)

    logger.info("==================================================")
    logger.info("SUCCESS: ENTERPRISE 10-LAYER DATA PIPELINE COMPLETED")
    logger.info("==================================================")

def main():
    asyncio.run(run_pipeline())

if __name__ == "__main__":
    main()
