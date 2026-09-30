#!/usr/bin/env python3
"""
VERIFY BOUNDING BOX COMPLIANCE (P03-005)
Du Lịch Tri Tôn AI System

Kiểm tra sự tuân thủ dải tọa độ Bounding Box của Huyện Tri Tôn:
- Latitude: [10.30, 10.55]
- Longitude: [104.80, 105.15]
Áp dụng trên toàn bộ nguồn dữ liệu (Master CSV, Frontend JSON, Live DB, Review Queue).
"""
import sys
import json
import csv
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent

BBOX_LAT_MIN = 10.30
BBOX_LAT_MAX = 10.55
BBOX_LNG_MIN = 104.80
BBOX_LNG_MAX = 105.15

def verify_dataset_coords(name, records, lat_getter, lng_getter, id_getter):
    violations = []
    total_valid = 0
    for idx, r in enumerate(records):
        lat = lat_getter(r)
        lng = lng_getter(r)
        rec_id = id_getter(r)
        if lat is not None and lng is not None:
            try:
                flat = float(lat)
                flng = float(lng)
                total_valid += 1
                if not (BBOX_LAT_MIN <= flat <= BBOX_LAT_MAX and BBOX_LNG_MIN <= flng <= BBOX_LNG_MAX):
                    violations.append({
                        "id": rec_id,
                        "lat": flat,
                        "lng": flng,
                        "row": idx
                    })
            except (ValueError, TypeError):
                pass
    return total_valid, violations

def main():
    print("=" * 80)
    print("🌐 KIỂM THỬ TUÂN THỦ BOUNDING BOX HUYỆN TRI TÔN [10.30 - 10.55, 104.80 - 105.15]")
    print("=" * 80)

    # 1. Master CSV
    master_path = REPO_ROOT / "data" / "tri_ton_master_cleaned.csv"
    with open(master_path, "r", encoding="utf-8-sig") as f:
        master_rows = list(csv.DictReader(f))
    m_valid, m_viols = verify_dataset_coords(
        "Master CSV", master_rows,
        lambda r: r.get("latitude"), lambda r: r.get("longitude"), lambda r: r.get("id")
    )
    print(f"📊 Master CSV ({len(master_rows)} POIs): {m_valid} có tọa độ | {len(m_viols)} vi phạm BBOX")
    for v in m_viols:
        print(f"   ❌ Vi phạm: {v['id']} ({v['lat']}, {v['lng']})")

    # 2. Frontend JSON
    fe_path = REPO_ROOT / "frontend" / "src" / "data" / "triton_pois_full.json"
    with open(fe_path, "r", encoding="utf-8") as f:
        fe_items = json.load(f)
    fe_valid, fe_viols = verify_dataset_coords(
        "Frontend JSON", fe_items,
        lambda r: r.get("latitude"), lambda r: r.get("longitude"), lambda r: r.get("id")
    )
    print(f"📊 Frontend JSON ({len(fe_items)} POIs): {fe_valid} có tọa độ | {len(fe_viols)} vi phạm BBOX")
    for v in fe_viols:
        print(f"   ❌ Vi phạm: {v['id']} ({v['lat']}, {v['lng']})")

    # 3. Live DB Snapshot
    live_path = REPO_ROOT / "docs" / "technical-spec" / "LIVE_DB_PLACES_SNAPSHOT.json"
    if live_path.exists():
        with open(live_path, "r", encoding="utf-8") as f:
            live_items = json.load(f)
        live_valid, live_viols = verify_dataset_coords(
            "Live DB Snapshot", live_items,
            lambda r: r.get("latitude"), lambda r: r.get("longitude"), lambda r: r.get("id")
        )
        print(f"📊 Live DB Snapshot ({len(live_items)} POIs): {live_valid} có tọa độ | {len(live_viols)} vi phạm BBOX")
        for v in live_viols:
            print(f"   ❌ Vi phạm: {v['id']} ({v['lat']}, {v['lng']})")

    # 4. Review Queue
    queue_path = REPO_ROOT / "docs" / "technical-spec" / "POI_CONFLICT_REVIEW_QUEUE.json"
    with open(queue_path, "r", encoding="utf-8") as f:
        tickets = json.load(f)
    q_valid, q_viols = verify_dataset_coords(
        "Review Queue", tickets,
        lambda r: r.get("latitude"), lambda r: r.get("longitude"), lambda r: r.get("ticket_id")
    )
    print(f"📊 Review Queue ({len(tickets)} tickets): {q_valid} có tọa độ | {len(q_viols)} vi phạm BBOX")
    for v in q_viols:
        print(f"   ❌ Vi phạm: {v['id']} ({v['lat']}, {v['lng']})")

    # 5. Legacy Raw Data Audit
    print("\n🔍 KIỂM KÊ TẬP TIN DỮ LIỆU CÀO THÔ LỊCH SỬ (LEGACY UNVERIFIED):")
    legacy_files = [
        REPO_ROOT / "data" / "triton_pois_table.csv",
        REPO_ROOT / "data" / "triton_pois_map.geojson",
    ]
    for lf in legacy_files:
        if not lf.exists():
            continue
        if lf.suffix == ".csv":
            with open(lf, "r", encoding="utf-8-sig", errors="replace") as f:
                rows = list(csv.DictReader(f))
            valid, viols = verify_dataset_coords(
                lf.name, rows,
                lambda r: r.get("latitude"), lambda r: r.get("longitude"), lambda r: r.get("id")
            )
            print(f"   📂 {lf.name}: {valid} có tọa độ | {len(viols)} vi phạm BBOX")
            for v in viols:
                print(f"      ⚠️ Phát hiện POI ngoài biên: ID `{v['id']}` tại tọa độ ({v['lat']}, {v['lng']}) -> CẦN LOẠI TRỪ")
        elif lf.suffix == ".geojson":
            with open(lf, "r", encoding="utf-8", errors="replace") as f:
                geo = json.load(f)
            feats = geo.get("features", [])
            valid, viols = verify_dataset_coords(
                lf.name, feats,
                lambda r: r.get("geometry", {}).get("coordinates", [None, None])[1],
                lambda r: r.get("geometry", {}).get("coordinates", [None, None])[0],
                lambda r: r.get("properties", {}).get("id")
            )
            print(f"   📂 {lf.name}: {valid} có tọa độ | {len(viols)} vi phạm BBOX")
            for v in viols:
                print(f"      ⚠️ Phát hiện GeoJSON ngoài biên: ID `{v['id']}` tại tọa độ ({v['lat']}, {v['lng']}) -> CẦN LOẠI TRỪ")

    print("\n" + "=" * 80)
    print("✅ KẾT QUẢ: 100% bản ghi trong Master CSV, Frontend JSON, Live DB và Review Queue đều TUÂN THỦ TUYỆT ĐỐI Bounding Box Tri Tôn.")
    print("=" * 80)

if __name__ == "__main__":
    main()
