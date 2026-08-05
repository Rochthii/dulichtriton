import os

files = {}

# --- EXPORT MODULES ---
files["tourism_crawler/export/__init__.py"] = '''from tourism_crawler.export.json_export import JSONExporter
from tourism_crawler.export.csv_export import CSVExporter
from tourism_crawler.export.geojson_export import GeoJSONExporter

__all__ = ["JSONExporter", "CSVExporter", "GeoJSONExporter"]
'''

files["tourism_crawler/export/exporter.py"] = '''from abc import ABC, abstractmethod
from typing import List, Dict, Any


class BaseExporter(ABC):
    """Abstract Base Class for Exporters."""

    @abstractmethod
    def export(self, records: List[Dict[str, Any]], output_filepath: str) -> None:
        pass
'''

files["tourism_crawler/export/json_export.py"] = '''import json
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
'''

files["tourism_crawler/export/csv_export.py"] = '''import pandas as pd
from typing import List, Dict, Any
from tourism_crawler.export.exporter import BaseExporter
from tourism_crawler.config.logging import logger


class CSVExporter(BaseExporter):
    """Export records to CSV and Excel format."""

    def export(self, records: List[Dict[str, Any]], output_filepath: str) -> None:
        logger.info(f"Exporting {len(records)} records to CSV/Excel: {output_filepath}")
        df = pd.DataFrame(records)
        if output_filepath.endswith(".xlsx"):
            df.to_excel(output_filepath, index=False)
        else:
            df.to_csv(output_filepath, index=False, encoding="utf-8-sig")
        logger.info("CSV/Excel Export complete.")
'''

files["tourism_crawler/export/geojson_export.py"] = '''import json
from typing import List, Dict, Any
from tourism_crawler.export.exporter import BaseExporter
from tourism_crawler.config.logging import logger


class GeoJSONExporter(BaseExporter):
    """Export places to GeoJSON FeatureCollection format for GIS & Mapping systems."""

    def export(self, records: List[Dict[str, Any]], output_filepath: str) -> None:
        logger.info(f"Exporting {len(records)} records to GeoJSON: {output_filepath}")
        features = []
        for rec in records:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [rec.get("longitude", 0.0), rec.get("latitude", 0.0)]
                },
                "properties": rec
            }
            features.append(feature)

        geojson = {
            "type": "FeatureCollection",
            "name": "Tri_Ton_Tourism_Points",
            "features": features
        }

        with open(output_filepath, "w", encoding="utf-8") as f:
            json.dump(geojson, f, ensure_ascii=False, indent=2)
        logger.info("GeoJSON Export complete.")
'''

# --- SERVICES MODULES ---
files["tourism_crawler/services/__init__.py"] = '''from tourism_crawler.services.crawler_service import CrawlerService
from tourism_crawler.services.pipeline_service import PipelineService

__all__ = ["CrawlerService", "PipelineService"]
'''

files["tourism_crawler/services/crawler_service.py"] = '''from typing import List, Dict, Any
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
'''

files["tourism_crawler/services/pipeline_service.py"] = '''import json
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
'''

# --- CLI MODULE ---
files["tourism_crawler/cli.py"] = '''import asyncio
import click
from rich.console import Console
from rich.table import Table
from tourism_crawler.services.crawler_service import CrawlerService
from tourism_crawler.services.pipeline_service import PipelineService
from tourism_crawler.export.json_export import JSONExporter
from tourism_crawler.export.csv_export import CSVExporter
from tourism_crawler.export.geojson_export import GeoJSONExporter
from tourism_crawler.config.logging import logger

console = Console()


@click.group()
def cli():
    """Tourism Crawler CLI - Production Data Engine for Tri Tôn, An Giang."""
    pass


@cli.command()
@click.option("--output", default="data/crawled_tri_ton.json", help="Output filepath")
def crawl(output: str):
    """Run all crawlers, process pipeline, and export JSON data."""
    console.print("[bold green]Starting Tri Tôn Tourism Crawler...[/bold green]")
    
    async def _run():
        crawler = CrawlerService()
        pipeline = PipelineService()
        
        raw_data = await crawler.run_all()
        clean_records = pipeline.process_records(raw_data)
        
        exporter = JSONExporter()
        exporter.export(clean_records, output)
        
        table = Table(title="Tri Tôn Tourism Crawl Results")
        table.add_column("ID", style="cyan")
        table.add_column("Name", style="bold magenta")
        table.add_column("Category", style="green")
        table.add_column("Commune", style="yellow")
        table.add_column("Confidence Score", style="blue")

        for rec in clean_records:
            table.add_row(
                str(rec.get("id")),
                str(rec.get("name")),
                str(rec.get("category")),
                str(rec.get("commune")),
                f"{rec.get('confidence_score', 100):.1f}%"
            )

        console.print(table)
        console.print(f"[bold green]Crawl completed successfully! Output saved to: {output}[/bold green]")

    asyncio.run(_run())


@cli.command()
@click.option("--input-file", default="data/tri_ton_database.json", help="Input JSON file")
@click.option("--format", default="geojson", type=click.Choice(["json", "csv", "geojson"]), help="Export format")
@click.option("--output", default="data/tri_ton_export.geojson", help="Output filepath")
def export(input_file: str, format: str, output: str):
    """Export existing dataset to JSON, CSV, or GeoJSON."""
    import json
    console.print(f"[bold blue]Exporting {input_file} to format {format}...[/bold blue]")
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    records = data.get("places", data.get("records", []))
    
    if format == "geojson":
        GeoJSONExporter().export(records, output)
    elif format == "csv":
        CSVExporter().export(records, output)
    else:
        JSONExporter().export(records, output)
        
    console.print(f"[bold green]Export complete: {output}[/bold green]")


if __name__ == "__main__":
    cli()
'''

# --- README & TESTS ---
files["README.md"] = '''# Tourism Crawler - Tri Tôn District, An Giang

System for collecting, normalizing, deduplicating, validating, and exporting tourism data for Tri Ton District, An Giang, Vietnam.

## Tech Stack
- Python 3.12
- Playwright, BeautifulSoup4, aiohttp
- SQLAlchemy 2.0 (Async) + PostgreSQL + pgvector
- Pydantic v2, Pandas
- Loguru, Tenacity, Rich

## CLI Usage

```bash
# Run crawler pipeline and save JSON
python -m tourism_crawler.cli crawl --output data/crawled_tri_ton.json

# Export existing dataset to GeoJSON
python -m tourism_crawler.cli export --input-file data/tri_ton_database.json --format geojson --output data/tri_ton_map.geojson
```
'''

files["tests/__init__.py"] = ""

files["tests/test_normalizer.py"] = '''from tourism_crawler.normalizer.text import clean_vietnamese_text
from tourism_crawler.normalizer.phone import normalize_phone_number
from tourism_crawler.normalizer.address import normalize_address


def test_clean_vietnamese_text():
    raw = "  Hồ   Tà   Pạ  "
    cleaned = clean_vietnamese_text(raw)
    assert cleaned == "Hồ Tà Pạ"


def test_normalize_phone_number():
    assert normalize_phone_number("0989123456") == "0989123456"
    assert normalize_phone_number("+84989123456") == "0989123456"


def test_normalize_address():
    res = normalize_address("Núi Tô, Tri Tôn")
    assert res["district"] == "Tri Tôn"
    assert res["province"] == "An Giang"
'''

files["tests/test_deduplicate.py"] = '''from tourism_crawler.deduplicate.similarity import is_duplicate, haversine_distance


def test_haversine_distance():
    # Distance between same coords should be 0
    dist = haversine_distance(10.4216, 105.0118, 10.4216, 105.0118)
    assert dist < 1.0


def test_is_duplicate():
    rec1 = {"name": "Hồ Tà Pạ", "latitude": 10.4216, "longitude": 105.0118}
    rec2 = {"name": "Hồ Tà Pạ Tuyệt Tình Cốc", "latitude": 10.4217, "longitude": 105.0119}
    assert is_duplicate(rec1, rec2) is True
'''

files["tests/test_export.py"] = '''import os
from tourism_crawler.export.json_export import JSONExporter


def test_json_exporter(tmp_path):
    output_file = str(tmp_path / "test_export.json")
    records = [{"id": "PL001", "name": "Hồ Tà Pạ"}]
    
    exporter = JSONExporter()
    exporter.export(records, output_file)
    
    assert os.path.exists(output_file)
'''

for filepath, content in files.items():
    dirname = os.path.dirname(filepath)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Phase 6 complete: Wrote {len(files)} Exporters, Services, CLI & Tests modules.")
