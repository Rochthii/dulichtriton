import json
import csv
import unicodedata
import os
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def normalize_nfc(text: str) -> str:
    """Normalize text to NFC standard and strip banned administrative phrase 'Huyện Tri Tôn'."""
    if not text:
        return ""
    text = unicodedata.normalize("NFC", text)
    text = text.replace("Huyện Tri Tôn, ", "").replace(", Huyện Tri Tôn", "").replace("Huyện Tri Tôn", "")
    return text.strip()

def validate_bounds(lat: float, lng: float) -> bool:
    """Validate coordinates strictly within Tri Ton bounding box [10.25 - 10.55 Lat, 104.85 - 105.15 Lng]."""
    try:
        lat = float(lat)
        lng = float(lng)
        return 10.25 <= lat <= 10.55 and 104.85 <= lng <= 105.15
    except (ValueError, TypeError):
        return False

def get_dedup_key(name: str, lat: float, lng: float) -> str:
    """Generate unique deduplication key."""
    norm_name = normalize_nfc(name).lower()
    return f"{norm_name}|{round(float(lat), 3)}|{round(float(lng), 3)}"

def main():
    print("=== MASTER DATA CONSOLIDATION PIPELINE (DU LỊCH TRI TÔN) ===")
    
    master_records = []
    seen_keys = set()
    
    # 1. Load Base Master CSV data/tri_ton_master_cleaned.csv
    csv_path = "data/tri_ton_master_cleaned.csv"
    if os.path.exists(csv_path):
        with open(csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = normalize_nfc(row.get("name", ""))
                lat = float(row.get("latitude", 0))
                lng = float(row.get("longitude", 0))
                
                if not validate_bounds(lat, lng):
                    continue
                    
                key = get_dedup_key(name, lat, lng)
                if key not in seen_keys:
                    seen_keys.add(key)
                    record = {
                        "id": row.get("id", f"TT_{len(master_records)+1:03d}"),
                        "name": name,
                        "category": row.get("category", "attractions_nature"),
                        "description": normalize_nfc(row.get("description", "")),
                        "address": normalize_nfc(row.get("address", "")),
                        "commune": normalize_nfc(row.get("commune", "")),
                        "latitude": lat,
                        "longitude": lng,
                        "opening_hours": row.get("opening_hours", "07:00 - 18:00"),
                        "ticket_price": row.get("ticket_price", "Miễn phí"),
                        "rating": float(row.get("rating", 4.5)),
                        "review_count": int(row.get("review_count", 100)),
                        "confidence_score": float(row.get("confidence_score", 95.0)),
                        "is_active": True
                    }
                    master_records.append(record)
                    
    print(f"Base Master Records Loaded: {len(master_records)}")

    # 2. Merge 19 Groups Cleaned Data data/crawled_by_groups_cleaned.json
    groups_path = "data/crawled_by_groups_cleaned.json"
    if os.path.exists(groups_path):
        with open(groups_path, "r", encoding="utf-8") as f:
            group_data = json.load(f)
            for grp_key, grp_val in group_data.items():
                for item in grp_val.get("items", []):
                    name = normalize_nfc(item.get("name", ""))
                    lat = float(item.get("latitude", 0))
                    lng = float(item.get("longitude", 0))
                    
                    if not validate_bounds(lat, lng):
                        continue
                        
                    key = get_dedup_key(name, lat, lng)
                    if key not in seen_keys:
                        seen_keys.add(key)
                        record = {
                            "id": f"TT_{len(master_records)+1:03d}",
                            "name": name,
                            "category": item.get("category", "food_and_restaurants"),
                            "description": normalize_nfc(item.get("description", "")),
                            "address": normalize_nfc(item.get("address", "")),
                            "commune": normalize_nfc(item.get("commune", "")),
                            "latitude": lat,
                            "longitude": lng,
                            "opening_hours": "08:00 - 20:00",
                            "ticket_price": "Tùy món / Dịch vụ",
                            "rating": float(item.get("rating", 4.6)),
                            "review_count": int(item.get("review_count", 200)),
                            "confidence_score": float(item.get("confidence_score", 95.0)),
                            "is_active": True
                        }
                        master_records.append(record)

    print(f"Consolidated Total Unique Records: {len(master_records)}")

    # 3. Write Master CSV data/tri_ton_master_cleaned.csv (UTF-8-SIG)
    headers = [
        "id", "name", "category", "description", "address", "commune",
        "latitude", "longitude", "opening_hours", "ticket_price",
        "rating", "review_count", "confidence_score", "is_active"
    ]
    
    with open("data/tri_ton_master_cleaned.csv", "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(master_records)
    print("Saved consolidated master CSV: data/tri_ton_master_cleaned.csv")

    # 4. Write Master JSON data/tri_ton_master_cleaned.json (UTF-8)
    with open("data/tri_ton_master_cleaned.json", "w", encoding="utf-8") as f:
        json.dump(master_records, f, ensure_ascii=False, indent=2)
    print("Saved consolidated master JSON: data/tri_ton_master_cleaned.json")

    # 5. Write Master GeoJSON data/tri_ton_master_cleaned.geojson (WGS84)
    features = []
    for rec in master_records:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [rec["longitude"], rec["latitude"]]
            },
            "properties": rec
        }
        features.append(feature)
        
    geojson_data = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Cơ Sở Dữ Liệu Tọa Độ WGS84 Du Lịch Tri Tôn",
            "version": "10.2.0",
            "bounding_box": [10.25, 10.55, 104.85, 105.15],
            "total_features": len(features)
        },
        "features": features
    }
    
    with open("data/tri_ton_master_cleaned.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson_data, f, ensure_ascii=False, indent=2)
    print("Saved consolidated GeoJSON: data/tri_ton_master_cleaned.geojson")

    # 6. Write Structured Master Database data/tri_ton_database.json
    category_counts = {}
    for rec in master_records:
        cat = rec["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
        
    database_structure = {
        "metadata": {
            "system_name": "Du Lịch Tri Tôn AI Master Database",
            "version": "10.2.0-CONSOLIDATED",
            "last_updated": "2026-08-05",
            "total_records": len(master_records),
            "bounding_box": [10.25, 10.55, 104.85, 105.15],
            "category_summary": category_counts
        },
        "places": master_records
    }
    
    with open("data/tri_ton_database.json", "w", encoding="utf-8") as f:
        json.dump(database_structure, f, ensure_ascii=False, indent=2)
    print("Saved consolidated Database JSON: data/tri_ton_database.json")

    print("\nSUCCESS: All datasets consolidated cleanly into data/ directory!")

if __name__ == "__main__":
    main()
