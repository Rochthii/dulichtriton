import csv
from typing import List, Dict, Any
from tourism_crawler.export.exporter import BaseExporter
from tourism_crawler.config.logging import logger


class CSVExporter(BaseExporter):
    """Export records to CSV format using standard python csv library."""

    def export(self, records: List[Dict[str, Any]], output_filepath: str) -> None:
        logger.info(f"Exporting {len(records)} records to CSV: {output_filepath}")
        if not records:
            return
            
        all_keys = list({k for rec in records for k in rec.keys()})
        with open(output_filepath, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction="ignore")
            writer.writeheader()
            for rec in records:
                # convert list/dict values to string for csv
                formatted = {
                    k: str(v) if isinstance(v, (list, dict)) else v
                    for k, v in rec.items()
                }
                writer.writerow(formatted)
        logger.info("CSV Export complete.")
