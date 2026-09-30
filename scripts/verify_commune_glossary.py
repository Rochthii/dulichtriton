#!/usr/bin/env python3
"""
VERIFY COMMUNE GLOSSARY COMPLIANCE (P03-006)
Du Lịch Tri Tôn AI System

Kiểm tra và chuẩn hóa 100% nhãn đơn vị hành chính xã/thị trấn theo RULE 02:
Huyện Tri Tôn có đúng 15 đơn vị hành chính hợp pháp (2 thị trấn + 13 xã).
"""

import sys
import json
import csv
from pathlib import Path
from collections import Counter

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO_ROOT = Path(__file__).resolve().parent.parent

# 15 Official Administrative Units of Tri Ton District (RULE 02)
OFFICIAL_COMMUNES = [
    "Thị trấn Tri Tôn",
    "Thị trấn Ba Chúc",
    "Xã An Tức",
    "Xã Châu Lăng",
    "Xã Cô Tô",
    "Xã Lạc Quới",
    "Xã Lê Trì",
    "Xã Lương An Trà",
    "Xã Lương Phi",
    "Xã Núi Tô",
    "Xã Ô Lâm",
    "Xã Tà Đảnh",
    "Xã Tân Tuyến",
    "Xã Vĩnh Gia",
    "Xã Vĩnh Phước",
]

def audit_dataset_communes(dataset_name, items, commune_getter, id_getter):
    counts = Counter()
    non_standard = []
    
    for idx, item in enumerate(items):
        commune = str(commune_getter(item) or "").strip()
        rec_id = id_getter(item)
        counts[commune] += 1
        if commune not in OFFICIAL_COMMUNES:
            non_standard.append({
                "id": rec_id,
                "commune_raw": commune,
                "row": idx
            })
            
    print(f"\n📂 DATASET: {dataset_name} ({len(items)} bản ghi)")
    print(f"   - Phân bố nhãn ({len(counts)} nhãn khác nhau):")
    for comm, cnt in counts.most_common():
        status = "✅ HỢP LỆ" if comm in OFFICIAL_COMMUNES else "❌ NGOÀI GLOSSARY"
        print(f"     • {comm or '<TRỐNG>'}: {cnt} bản ghi [{status}]")
        
    if non_standard:
        print(f"   ⚠️ Phát hiện {len(non_standard)} bản ghi mang nhãn ngoài glossary!")
    else:
        print(f"   🎉 100% bản ghi đều tuân thủ Glossary chuẩn 15 xã/thị trấn!")
        
    return counts, non_standard

def main():
    print("=" * 80)
    print("🏛️ KIỂM THỬ TUÂN THỦ GLOSSARY 15 ĐƠN VỊ HÀNH CHÍNH TRI TÔN (RULE 02 & P03-006)")
    print("=" * 80)
    print(f"Danh mục chuẩn ({len(OFFICIAL_COMMUNES)} đơn vị): {', '.join(OFFICIAL_COMMUNES)}")

    # 1. Master CSV
    with open(REPO_ROOT / "data" / "tri_ton_master_cleaned.csv", "r", encoding="utf-8-sig") as f:
        master_rows = list(csv.DictReader(f))
    audit_dataset_communes("Master CSV", master_rows, lambda r: r.get("commune"), lambda r: r.get("id"))

    # 2. Frontend JSON
    with open(REPO_ROOT / "frontend" / "src" / "data" / "triton_pois_full.json", "r", encoding="utf-8") as f:
        fe_items = json.load(f)
    audit_dataset_communes("Frontend JSON", fe_items, lambda r: r.get("commune"), lambda r: r.get("id"))

    # 3. Live DB Snapshot
    live_path = REPO_ROOT / "docs" / "technical-spec" / "LIVE_DB_PLACES_SNAPSHOT.json"
    if live_path.exists():
        with open(live_path, "r", encoding="utf-8") as f:
            live_items = json.load(f)
        audit_dataset_communes("Live DB Snapshot", live_items, lambda r: r.get("commune"), lambda r: r.get("id"))

    # 4. Review Queue
    with open(REPO_ROOT / "docs" / "technical-spec" / "POI_CONFLICT_REVIEW_QUEUE.json", "r", encoding="utf-8") as f:
        queue_items = json.load(f)
    q_counts, q_non_standard = audit_dataset_communes("Review Queue", queue_items, lambda r: r.get("commune"), lambda r: r.get("ticket_id"))

    print("\n" + "=" * 80)
    print("📌 CHI TIẾT CÁC BẢN GHI MASTER CSV CÓ NHÃN COMMUNE LẠ:")
    print("=" * 80)
    for idx, r in enumerate(master_rows):
        comm = (r.get("commune") or "").strip()
        if comm not in OFFICIAL_COMMUNES:
            print(f" - Row {idx} [{r.get('id')}]: Name: '{r.get('name')}', Commune: '{comm}', Address: '{r.get('address')}'")

    print("\n" + "=" * 80)
    print("📌 CHI TIẾT CÁC TICKET REVIEW QUEUE CẦN CHUẨN HÓA GLOSSARY:")
    print("=" * 80)
    for ns in q_non_standard:
        # Find ticket object
        t_obj = next((t for t in queue_items if t["ticket_id"] == ns["id"]), {})
        print(f" - Ticket {ns['id']}: Name: '{t_obj.get('name')}', Current Commune: '{ns['commune_raw']}', Coords: ({t_obj.get('latitude')}, {t_obj.get('longitude')})")

if __name__ == "__main__":
    main()
