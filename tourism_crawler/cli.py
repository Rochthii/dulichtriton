import sys
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
