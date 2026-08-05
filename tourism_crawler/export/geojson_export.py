import json
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
