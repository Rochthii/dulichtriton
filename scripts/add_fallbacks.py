import os

files = {}

files["tourism_crawler/config/logging.py"] = '''import logging
import sys
from pathlib import Path

log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

try:
    from loguru import logger as loguru_logger
    logger = loguru_logger
except ImportError:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(name)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_dir / "crawler.log", encoding="utf-8")
        ]
    )
    logger = logging.getLogger("tourism_crawler")

__all__ = ["logger"]
'''

files["tourism_crawler/export/csv_export.py"] = '''import csv
from typing import List, Dict, Any
from tourism_crawler.export.exporter import BaseExporter
from tourism_crawler.config.logging import logger


class CSVExporter(BaseExporter):
    """Export records to CSV format using standard python csv library."""

    def export(self, records: List[Dict[str, Any]], output_filepath: str) -> None:
        logger.info(f"Exporting {len(records)} records to CSV: {output_filepath}")
        if not records:
            return
            
        keys = list(records[0].keys())
        with open(output_filepath, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            for rec in records:
                # convert list/dict values to string for csv
                formatted = {
                    k: str(v) if isinstance(v, (list, dict)) else v
                    for k, v in rec.items()
                }
                writer.writerow(formatted)
        logger.info("CSV Export complete.")
'''

files["tourism_crawler/cli.py"] = '''import sys
import asyncio
import argparse
import json
from tourism_crawler.services.crawler_service import CrawlerService
from tourism_crawler.services.pipeline_service import PipelineService
from tourism_crawler.export.json_export import JSONExporter
from tourism_crawler.export.csv_export import CSVExporter
from tourism_crawler.export.geojson_export import GeoJSONExporter
from tourism_crawler.config.logging import logger


def main():
    parser = argparse.ArgumentParser(description="Tourism Crawler CLI - Tri Tôn District, An Giang")
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Command: crawl
    crawl_parser = subparsers.add_parser("crawl", help="Run crawlers and export JSON")
    crawl_parser.add_argument("--output", default="data/crawled_tri_ton.json", help="Output JSON path")

    # Command: export
    export_parser = subparsers.add_parser("export", help="Export dataset")
    export_parser.add_argument("--input-file", default="data/tri_ton_database.json", help="Input dataset path")
    export_parser.add_argument("--format", choices=["json", "csv", "geojson"], default="geojson", help="Export format")
    export_parser.add_argument("--output", default="data/tri_ton_export.geojson", help="Output path")

    args = parser.parse_args()

    if args.command == "crawl":
        print(f"Starting Tri Tôn Tourism Crawler -> Output: {args.output}")
        async def _run():
            crawler = CrawlerService()
            pipeline = PipelineService()
            
            raw_data = await crawler.run_all()
            clean_records = pipeline.process_records(raw_data)
            
            exporter = JSONExporter()
            exporter.export(clean_records, args.output)
            print(f"CRAWL COMPLETE: Successfully processed {len(clean_records)} records -> {args.output}")

        asyncio.run(_run())

    elif args.command == "export":
        print(f"Exporting {args.input_file} to {args.format} -> Output: {args.output}")
        with open(args.input_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        records = data.get("places", data.get("records", []))
        
        if args.format == "geojson":
            GeoJSONExporter().export(records, args.output)
        elif args.format == "csv":
            CSVExporter().export(records, args.output)
        else:
            JSONExporter().export(records, args.output)
        print(f"EXPORT COMPLETE -> {args.output}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
'''

for filepath, content in files.items():
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print("Standard library fallbacks added successfully.")
