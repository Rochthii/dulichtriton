#!/usr/bin/env python3
"""
DATA SOURCES INVENTORY & RECONCILIATION AUDIT (P03-001)
Du Lịch Tri Tôn AI System

Khảo sát, tính toán SHA-256, kiểm kê số lượng bản ghi (record count),
mã định danh (ID/slug), và đối soát sơ bộ giữa các nguồn dữ liệu POI.
"""

import os
import sys
import json
import csv
import hashlib
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent

def compute_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def inspect_csv(filepath: Path, id_col_candidates=("id", "place_id", "slug", "POI_ID")):
    if not filepath.exists():
        return None
    sha256 = compute_sha256(filepath)
    size = filepath.stat().st_size
    records = []
    
    with open(filepath, "r", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames or []
        id_col = None
        for c in id_col_candidates:
            if c in headers:
                id_col = c
                break
        
        for row_idx, row in enumerate(reader):
            records.append(row)

    ids = [r.get(id_col, "").strip() for r in records if id_col and r.get(id_col)]
    unique_ids = set(ids)
    duplicates = [item for item in ids if ids.count(item) > 1]
    duplicates_set = sorted(list(set(duplicates)))
    
    # Coordinates check
    lat_col = next((c for c in headers if c.lower() in ("latitude", "lat")), None)
    lon_col = next((c for c in headers if c.lower() in ("longitude", "lon", "lng")), None)
    coords_valid = 0
    coords_invalid = 0
    lats = []
    lons = []
    for r in records:
        try:
            if lat_col and lon_col and r.get(lat_col) and r.get(lon_col):
                lat_val = float(r[lat_col])
                lon_val = float(r[lon_col])
                lats.append(lat_val)
                lons.append(lon_val)
                coords_valid += 1
            else:
                coords_invalid += 1
        except (ValueError, TypeError):
            coords_invalid += 1
            
    bbox = None
    if lats and lons:
        bbox = {
            "min_lat": min(lats),
            "max_lat": max(lats),
            "min_lon": min(lons),
            "max_lon": max(lons)
        }

    return {
        "file": str(filepath.relative_to(REPO_ROOT)),
        "size_bytes": size,
        "sha256": sha256,
        "record_count": len(records),
        "headers": headers,
        "id_col": id_col,
        "unique_id_count": len(unique_ids),
        "duplicate_count": len(duplicates_set),
        "duplicate_ids": duplicates_set,
        "ids": ids,
        "coords_valid": coords_valid,
        "coords_invalid": coords_invalid,
        "bbox": bbox,
        "sample_records": records[:2] if records else []
    }

def inspect_json_array(filepath: Path, id_field_candidates=("id", "slug", "place_id")):
    if not filepath.exists():
        return None
    sha256 = compute_sha256(filepath)
    size = filepath.stat().st_size
    
    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        data = json.load(f)
        
    if isinstance(data, dict):
        if "pois" in data and isinstance(data["pois"], list):
            items = data["pois"]
        elif "places" in data and isinstance(data["places"], list):
            items = data["places"]
        elif "features" in data and isinstance(data["features"], list):
            # GeoJSON
            items = []
            for feat in data["features"]:
                props = feat.get("properties", {})
                geom = feat.get("geometry", {})
                props["_geometry"] = geom
                items.append(props)
        else:
            items = [data]
    elif isinstance(data, list):
        items = data
    else:
        items = []

    # Find id field
    id_field = None
    if items and isinstance(items[0], dict):
        for candidate in id_field_candidates:
            if candidate in items[0]:
                id_field = candidate
                break
                
    ids = []
    lats = []
    lons = []
    for item in items:
        if isinstance(item, dict):
            val = str(item.get(id_field, "")).strip() if id_field else ""
            if val:
                ids.append(val)
            # check coords
            lat = item.get("latitude") or item.get("lat")
            lon = item.get("longitude") or item.get("lng") or item.get("lon")
            if lat is not None and lon is not None:
                try:
                    lats.append(float(lat))
                    lons.append(float(lon))
                except (ValueError, TypeError):
                    pass
            elif "_geometry" in item and item["_geometry"].get("coordinates"):
                coords = item["_geometry"]["coordinates"]
                if len(coords) >= 2:
                    lons.append(float(coords[0]))
                    lats.append(float(coords[1]))

    unique_ids = set(ids)
    duplicates = [item for item in ids if ids.count(item) > 1]
    duplicates_set = sorted(list(set(duplicates)))
    
    bbox = None
    if lats and lons:
        bbox = {
            "min_lat": min(lats),
            "max_lat": max(lats),
            "min_lon": min(lons),
            "max_lon": max(lons)
        }

    return {
        "file": str(filepath.relative_to(REPO_ROOT)),
        "size_bytes": size,
        "sha256": sha256,
        "record_count": len(items),
        "id_col": id_field,
        "unique_id_count": len(unique_ids),
        "duplicate_count": len(duplicates_set),
        "duplicate_ids": duplicates_set,
        "ids": ids,
        "bbox": bbox
    }

def inspect_pilot_dir(dirpath: Path):
    if not dirpath.exists() or not dirpath.is_dir():
        return None
    json_files = sorted(list(dirpath.glob("*.json")))
    items = []
    ids = []
    file_hashes = {}
    for jf in json_files:
        fhash = compute_sha256(jf)
        file_hashes[jf.name] = fhash
        with open(jf, "r", encoding="utf-8", errors="replace") as f:
            try:
                rec = json.load(f)
                items.append(rec)
                rec_id = rec.get("id") or rec.get("slug") or rec.get("place_id") or jf.stem
                ids.append(str(rec_id))
            except Exception as e:
                pass
                
    return {
        "directory": str(dirpath.relative_to(REPO_ROOT)),
        "file_count": len(json_files),
        "record_count": len(items),
        "ids": ids,
        "file_hashes": file_hashes
    }

def main():
    print("=" * 80)
    print("🔍 BÁO CÁO KIỂM KÊ VÀ ĐỐI SOÁT CÁC NGUỒN DỮ LIỆU DU LỊCH TRI TÔN (P03-001)")
    print("=" * 80)
    
    data_files = [
        ("csv", REPO_ROOT / "data" / "tri_ton_master_cleaned.csv"),
        ("json", REPO_ROOT / "frontend" / "src" / "data" / "triton_pois_full.json"),
        ("json", REPO_ROOT / "data" / "triton_pois_full.json"),
        ("csv", REPO_ROOT / "data" / "database_du_lich_tri_ton_v3.csv"),
        ("csv", REPO_ROOT / "data" / "google_sheets_v3_export.csv"),
        ("csv", REPO_ROOT / "data" / "triton_pois_table.csv"),
        ("geojson", REPO_ROOT / "data" / "triton_pois_map.geojson"),
    ]
    
    results = {}
    for ftype, fpath in data_files:
        if ftype == "csv":
            res = inspect_csv(fpath)
        else:
            res = inspect_json_array(fpath)
        if res:
            results[res["file"]] = res
            print(f"\n📂 TỆP: {res['file']}")
            print(f"   - Kích thước: {res['size_bytes']:,} bytes")
            print(f"   - SHA-256:   {res['sha256']}")
            print(f"   - Số bản ghi: {res['record_count']}")
            print(f"   - Trường ID:  {res['id_col']} (Unique: {res['unique_id_count']})")
            if res['duplicate_count'] > 0:
                print(f"   - ⚠️ TRÙNG LẶP ({res['duplicate_count']} ID): {res['duplicate_ids']}")
            if res.get('bbox'):
                b = res['bbox']
                print(f"   - Tọa độ BBOX: Lat [{b['min_lat']:.4f} -> {b['max_lat']:.4f}], Lon [{b['min_lon']:.4f} -> {b['max_lon']:.4f}]")

    # Pilot dir
    pilot_res = inspect_pilot_dir(REPO_ROOT / "output_pilot" / "data")
    if pilot_res:
        results["output_pilot/data"] = pilot_res
        print(f"\n📂 THƯ MỤC PILOT: {pilot_res['directory']}")
        print(f"   - Số file JSON: {pilot_res['file_count']}")
        print(f"   - Danh sách ID: {pilot_res['ids']}")

    # Cross-source comparisons
    print("\n" + "=" * 80)
    print("📊 SO SÁNH ĐỐI SOÁT GIỮA CÁC NGUỒN CHÍNH:")
    print("=" * 80)
    
    master_key = "data/tri_ton_master_cleaned.csv".replace("/", os.sep)
    frontend_key = "frontend/src/data/triton_pois_full.json".replace("/", os.sep)
    data_json_key = "data/triton_pois_full.json".replace("/", os.sep)
    
    # Normalize keys
    def find_res(sub):
        for k, v in results.items():
            if sub in k:
                return v
        return None
        
    master = find_res("tri_ton_master_cleaned.csv")
    frontend_json = find_res("frontend" + os.sep + "src" + os.sep + "data" + os.sep + "triton_pois_full.json")
    data_json = find_res("data" + os.sep + "triton_pois_full.json")
    v3_csv = find_res("database_du_lich_tri_ton_v3.csv")
    
    if master and frontend_json:
        m_ids = set(master["ids"])
        f_ids = set(frontend_json["ids"])
        
        common = m_ids.intersection(f_ids)
        m_only = m_ids - f_ids
        f_only = f_ids - m_ids
        
        print(f"\n1. Master CSV ({len(m_ids)} IDs) vs Frontend JSON ({len(f_ids)} IDs):")
        print(f"   - Số ID trùng khớp (Intersection): {len(common)}")
        print(f"   - Số ID chỉ có trong Master CSV:   {len(m_only)} -> {sorted(list(m_only))}")
        print(f"   - Số ID chỉ có trong Frontend JSON: {len(f_only)} -> {sorted(list(f_only))}")
        
    if frontend_json and data_json:
        print(f"\n2. So sánh Frontend JSON vs Data Directory JSON:")
        print(f"   - Frontend JSON SHA-256: {frontend_json['sha256']}")
        print(f"   - Data JSON SHA-256:     {data_json['sha256']}")
        if frontend_json['sha256'] == data_json['sha256']:
            print("   - ✅ HAI FILE HOÀN TOÀN TRÙNG KHỚP 100% (Byte-for-byte identical)")
        else:
            print("   - ⚠️ HAI FILE KHÁC NHAU VỀ NỘI DUNG / CHECKSUM")

    if master and pilot_res:
        p_ids = set(pilot_res["ids"])
        m_ids = set(master["ids"])
        p_common = p_ids.intersection(m_ids)
        p_only = p_ids - m_ids
        print(f"\n3. Master CSV vs Pilot Verified JSON ({len(p_ids)} IDs):")
        print(f"   - Số ID trùng khớp: {len(p_common)} -> {sorted(list(p_common))}")
        print(f"   - Số ID pilot không có trong Master: {len(p_only)} -> {sorted(list(p_only))}")

    # 4. Live DB snapshot comparison
    live_db_ids_path = REPO_ROOT / "docs" / "technical-spec" / "LIVE_DB_PLACES_IDS.json"
    if live_db_ids_path.exists():
        with open(live_db_ids_path, "r", encoding="utf-8") as f:
            live_db_ids = json.load(f)
        ldb_set = set(live_db_ids)
        print(f"\n4. Live DB Places Snapshot ({len(live_db_ids)} records):")
        results["live_database_places_snapshot"] = {
            "record_count": len(live_db_ids),
            "unique_id_count": len(ldb_set),
            "sample_ids": live_db_ids[:5],
            "ids": live_db_ids
        }
        if master:
            m_ids = set(master["ids"])
            db_master_common = ldb_set.intersection(m_ids)
            db_only = ldb_set - m_ids
            m_not_in_db = m_ids - ldb_set
            print(f"   - So với Master CSV ({len(m_ids)} IDs):")
            print(f"     • Khớp chính xác ID: {len(db_master_common)}")
            print(f"     • Chỉ có trong Live DB: {len(db_only)} (UUID-prefixed / unharmonized)")
            print(f"     • Chỉ có trong Master CSV: {len(m_not_in_db)}")
            
        if frontend_json:
            f_ids = set(frontend_json["ids"])
            db_fe_common = ldb_set.intersection(f_ids)
            print(f"   - So với Frontend JSON ({len(f_ids)} IDs):")
            print(f"     • Khớp chính xác ID: {len(db_fe_common)}")
            print(f"     • Chỉ có trong Live DB: {len(ldb_set - f_ids)}")
            print(f"     • Chỉ có trong Frontend JSON: {len(f_ids - ldb_set)}")

    # Output detailed report json
    report_output_path = REPO_ROOT / "docs" / "technical-spec" / "DATA_SOURCES_INVENTORY_REPORT.json"
    with open(report_output_path, "w", encoding="utf-8") as f:
        # Strip large fields before saving json
        serializable = {}
        for k, v in results.items():
            item_copy = dict(v)
            if "sample_records" in item_copy:
                del item_copy["sample_records"]
            serializable[k] = item_copy
        json.dump(serializable, f, ensure_ascii=False, indent=2)
    print(f"\n📄 Đã lưu báo cáo chi tiết dạng JSON tại: {report_output_path.relative_to(REPO_ROOT)}")

if __name__ == "__main__":
    main()
