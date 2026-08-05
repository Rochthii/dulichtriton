import json
import csv
import os
import logging
from typing import List
from tourism_crawler.models.place import PlaceEnrichedModel

logger = logging.getLogger("tourism_crawler")

class DataExporter:
    """Exporter to generate places.json, places.csv, and seed_places.sql."""

    def __init__(self, output_dir: str = "export"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def export_all(self, places: List[PlaceEnrichedModel]):
        self.export_json(places)
        self.export_csv(places)
        self.export_sql_seed(places)

    def export_json(self, places: List[PlaceEnrichedModel]):
        path = os.path.join(self.output_dir, "places.json")
        dict_data = [p.model_dump() for p in places]
        with open(path, "w", encoding="utf-8") as f:
            json.dump(dict_data, f, ensure_ascii=False, indent=2)
        logger.info(f"Exported {len(places)} places to {path}")

    def export_csv(self, places: List[PlaceEnrichedModel]):
        path = os.path.join(self.output_dir, "places.csv")
        dict_data = [p.model_dump() for p in places]
        if not dict_data:
            return
        
        headers = list(dict_data[0].keys())
        with open(path, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            for row in dict_data:
                for k, v in row.items():
                    if isinstance(v, list):
                        row[k] = ", ".join([str(x) for x in v])
                writer.writerow(row)
        logger.info(f"Exported {len(places)} places to {path}")

    def export_sql_seed(self, places: List[PlaceEnrichedModel]):
        path = os.path.join(self.output_dir, "seed_places.sql")
        with open(path, "w", encoding="utf-8") as f:
            f.write("-- SEED DATA FOR DU LICH TRI TON PLACES TABLE\n")
            f.write("TRUNCATE TABLE public.places RESTART IDENTITY CASCADE;\n\n")
            
            for p in places:
                name_esc = p.name.replace("'", "''")
                slug_esc = p.slug.replace("'", "''")
                addr_esc = p.address.replace("'", "''")
                desc_esc = p.description.replace("'", "''")
                comm_esc = p.commune.replace("'", "''")
                
                sql = (
                    f"INSERT INTO public.places ("
                    f"id, place_id, name, slug, category, tourism_category, description, "
                    f"address, commune, district, province, latitude, longitude, geom, "
                    f"google_maps_url, opening_hours, price_level, rating, review_count, "
                    f"recommended_duration, best_visit_time, family_friendly, ticket_required"
                    f") VALUES ("
                    f"'{p.place_id}', '{p.place_id}', '{name_esc}', '{slug_esc}', '{p.category}', "
                    f"'{p.tourism_category}', '{desc_esc}', '{addr_esc}', '{comm_esc}', "
                    f"'Tri Tôn', 'An Giang', {p.latitude}, {p.longitude}, "
                    f"ST_SetSRID(ST_MakePoint({p.longitude}, {p.latitude}), 4326), "
                    f"'{p.google_maps_url}', '{p.opening_hours}', '{p.price_level}', "
                    f"{p.rating}, {p.review_count}, '{p.recommended_duration}', "
                    f"'{p.best_visit_time}', {str(p.family_friendly).lower()}, {str(p.ticket_required).lower()}"
                    f");\n"
                )
                f.write(sql)
        logger.info(f"Exported {len(places)} SQL seed statements to {path}")
