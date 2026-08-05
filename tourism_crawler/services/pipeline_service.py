import json
from typing import List, Dict, Any
from tourism_crawler.normalizer.pipeline import NormalizationPipeline
from tourism_crawler.deduplicate.similarity import is_duplicate
from tourism_crawler.deduplicate.merger import merge_records
from tourism_crawler.validator.confidence import calculate_confidence_score
from tourism_crawler.config.logging import logger


class PipelineService:
    """End-to-End Orchestrator: Crawl -> Normalize -> Deduplicate -> Validate -> Save."""

    def __init__(self):
        self.normalizer = NormalizationPipeline()

    def process_records(self, raw_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        logger.info("Starting Pipeline Processing...")
        
        # 1. Normalize
        normalized_records = [self.normalizer.normalize(rec) for rec in raw_records]
        
        # 2. Deduplicate
        unique_records: List[Dict[str, Any]] = []
        for rec in normalized_records:
            duplicate_found = False
            for idx, existing in enumerate(unique_records):
                if is_duplicate(existing, rec):
                    logger.info(f"Duplicate detected between '{existing['name']}' and '{rec['name']}'. Merging...")
                    unique_records[idx] = merge_records(existing, rec)
                    duplicate_found = True
                    break
            if not duplicate_found:
                unique_records.append(rec)

        # 3. Calculate Confidence Score
        for rec in unique_records:
            rec["confidence_score"] = calculate_confidence_score(rec, rec.get("sources_count", 1))

        logger.info(f"Pipeline processing complete. Clean records: {len(unique_records)}")
        return unique_records
