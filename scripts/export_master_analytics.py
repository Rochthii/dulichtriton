import json
import csv
import os

def export_master_analytics():
    with open("data/tri_ton_master_cleaned.json", "r", encoding="utf-8") as f:
        master_data = json.load(f)
        
    categories = master_data["categories"]
    all_records = []
    
    for cat_name, items in categories.items():
        for item in items:
            item_copy = dict(item)
            item_copy["category_group"] = cat_name
            all_records.append(item_copy)
            
    # 1. Export Master CSV
    all_keys = ["id", "name", "category_group", "category", "address", "commune", "district", "province", "latitude", "longitude", "rating", "review_count", "ticket_price", "opening_hours", "phone", "confidence_score"]
    
    with open("data/tri_ton_master_cleaned.csv", "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=all_keys, extrasaction="ignore")
        writer.writeheader()
        for rec in all_records:
            writer.writerow(rec)
            
    # 2. Export Master GeoJSON
    features = []
    for rec in all_records:
        if "latitude" in rec and "longitude" in rec:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [rec["longitude"], rec["latitude"]]
                },
                "properties": {
                    "id": rec.get("id"),
                    "name": rec.get("name"),
                    "category_group": rec.get("category_group"),
                    "category": rec.get("category"),
                    "address": rec.get("address"),
                    "commune": rec.get("commune"),
                    "rating": rec.get("rating"),
                    "review_count": rec.get("review_count"),
                    "google_maps_url": rec.get("google_maps_url")
                }
            }
            features.append(feature)
            
    geojson = {
        "type": "FeatureCollection",
        "metadata": master_data["metadata"],
        "features": features
    }
    
    with open("data/tri_ton_master_cleaned.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson, f, ensure_ascii=False, indent=2)
        
    print("SUCCESSFULLY EXPORTED MASTER CSV & MASTER GEOJSON!")
    print(f"Total GIS Features Exported: {len(features)}")

if __name__ == "__main__":
    export_master_analytics()
