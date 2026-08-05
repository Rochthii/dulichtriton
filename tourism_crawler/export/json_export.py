import json
from typing import List, Dict, Any
from tourism_crawler.export.exporter import BaseExporter
from tourism_crawler.config.logging import logger


class JSONExporter(BaseExporter):
    """Export records to JSON file format."""

    def export(self, records: List[Dict[str, Any]], output_filepath: str) -> None:
        logger.info(f"Exporting {len(records)} records to JSON: {output_filepath}")
        payload = {
            "metadata": {
                "total_records": len(records),
                "district": "Tri Tôn",
                "province": "An Giang"
            },
            "records": records
        }
        with open(output_filepath, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        logger.info("JSON Export complete.")
