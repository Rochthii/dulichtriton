import os
import sys
import csv
import json
import unicodedata

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Merge mapping: duplicate_id -> canonical_id
MERGE_INTO = {
    "TT_095": "PL001",
    "TT_096": "PL002",
    "TT_097": "PL010",
    "TT_098": "CK009",
    "TT_099": "CK010",
    "TT_092": "HG002",
    "TT_093": "HG001",
    "TT_094": "PL008",
    "TT_084": "FD014",
    "TT_102": "TT_083",
    "TT_106": "TT_086"
}

# Rename mapping for surviving TT_* records to standard category IDs
RENAME_MAP = {
    "TT_083": "FD018",
    "TT_085": "FD019",
    "TT_086": "FD020",
    "TT_087": "FD021",
    "TT_088": "CF014",
    "TT_089": "CF015",
    "TT_090": "CF016",
    "TT_091": "CF017",
    "TT_100": "PL021",
    "TT_101": "PL022",
    "TT_103": "FD022",
    "TT_104": "FD023",
    "TT_105": "FD024"
}

CATEGORY_MAP = {
    "food_and_restaurants": "Ẩm thực",
    "cafes_and_homestays": "Cà phê & Lưu trú",
    "khmer_pagodas_heritage": "Chùa Khmer",
    "attractions_nature": "Thiên nhiên",
    "checkin_spots": "Check-in"
}

# Enrichment metadata override dictionary for the 13 specified key POIs
ENRICHED_OVERRIDES = {
    "PL001": {
        "name": "Hồ Tà Pạ (Tuyệt Tình Cốc)",
        "category": "Hồ nước",
        "description": "Hồ nước xanh trong ngọc tuyệt đẹp được mệnh danh là Tuyệt Tình Cốc Bảy Núi.",
        "address": "Núi Tà Pạ, Ấp Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang",
        "commune": "Xã Núi Tô",
        "latitude": 10.4216,
        "longitude": 105.0118,
        "opening_hours": "06:00 - 18:00",
        "ticket_price": "Miễn phí",
        "rating": 4.7,
        "review_count": 4700,
        "aliases": ["Hồ Tà Pạ", "Tuyệt Tình Cốc Bảy Núi"],
        "data_flags": ["hours_conflict: TT_095 ghi 08:00-20:00; hồ ngoài trời, khuyến nghị khung an toàn 05:30-18:30"]
    },
    "PL002": {
        "name": "Hồ Soài So",
        "category": "Hồ nước",
        "description": "Hồ thủy lợi thơ mộng soi bóng dãy núi Phụng Hoàng Sơn.",
        "address": "Khu du lịch Soài So, Chân núi Cô Tô, Thị trấn Tri Tôn, Tri Tôn, An Giang",
        "commune": "Thị trấn Tri Tôn",
        "latitude": 10.405,
        "longitude": 105.025,
        "opening_hours": "06:00 - 18:00",
        "ticket_price": "Miễn phí",
        "rating": 4.6,
        "review_count": 2010,
        "aliases": ["Hồ Soài So Bảy Núi"],
        "data_flags": ["coord_outlier: TT_096 (10.386, 105.011) lệch ~2km", "commune_fixed: TT_096 ghi 'Xã Cô Tô' (không tồn tại)"]
    },
    "PL008": {
        "name": "Núi Cô Tô (Phụng Hoàng Sơn)",
        "category": "Núi",
        "description": "Ngọn núi cao 614m - danh sơn Thất Sơn Bảy Núi, có Hồ Soài So và suối Ô Tà Sóc.",
        "address": "Dãy núi Cô Tô (Phụng Hoàng Sơn), Ấp Tô Thuận, Xã Núi Tô, Tri Tôn, An Giang",
        "commune": "Xã Núi Tô",
        "latitude": 10.4,
        "longitude": 105.015,
        "opening_hours": "Tự do",
        "ticket_price": "Miễn phí",
        "rating": 4.7,
        "review_count": 3220,
        "aliases": ["Phụng Hoàng Sơn", "Khu Du Lịch Núi Cô Tô"],
        "data_flags": ["coord_approximate: dãy núi rộng, tọa độ mang tính đại diện", "commune_fixed: TT_094 ghi 'Xã Cô Tô'"]
    },
    "PL010": {
        "name": "Khu Du Lịch Đồi Tức Dụp",
        "category": "Di tích lịch sử",
        "description": "Ngọn đồi 2 triệu đô - căn cứ kháng chiến kiên cường với trận chiến 128 ngày đêm (từ 16/11/1968) và hệ thống hang đá huyền bí.",
        "address": "Khu du lịch Đồi Tức Dụp, Ấp Ninh Hòa, Xã An Tức, Tri Tôn, An Giang",
        "commune": "Xã An Tức",
        "latitude": 10.3702,
        "longitude": 104.9667,
        "opening_hours": "07:00 - 17:00",
        "ticket_price": "60.000 VNĐ",
        "rating": 4.6,
        "review_count": 5200,
        "aliases": ["Đồi 2 triệu đô"],
        "data_flags": ["ticket_price_verify: 60k là dữ liệu nội bộ, cần đối chiếu BQL di tích"]
    },
    "CK009": {
        "name": "Hàng Thốt Nốt Trái Tim An Tức",
        "category": "Check-in",
        "description": "Hàng cây thốt nốt tự nhiên tạo thành hình trái tim độc đáo giữa cánh đồng.",
        "address": "Cụm thốt nốt trái tim, Ấp Ninh Hòa, Xã An Tức, Tri Tôn, An Giang",
        "commune": "Xã An Tức",
        "latitude": 10.3895,
        "longitude": 104.985,
        "opening_hours": "Tự do",
        "ticket_price": "Miễn phí",
        "rating": 4.7,
        "review_count": 3450,
        "aliases": ["Cánh Đồng Thốt Nốt Trái Tim"],
        "data_flags": ["coord_outlier: TT_098 (10.371, 104.975) lệch ~2km; CK009 khớp cluster CK018/CK019"]
    },
    "CK010": {
        "name": "Cổng Trời Tri Tôn Vòm Khmer",
        "category": "Check-in",
        "description": "Cổng chùa Khmer Koh Kas cổ với hoa văn tinh xảo đứng giữa đồng lúa - biểu tượng check-in Tri Tôn.",
        "address": "Cổng chùa Koh Kas, Ấp An Hòa, Xã Châu Lăng, Tri Tôn, An Giang",
        "commune": "Xã Châu Lăng",
        "latitude": 10.441,
        "longitude": 105.002,
        "opening_hours": "Tự do",
        "ticket_price": "Miễn phí",
        "rating": 4.8,
        "review_count": 3770,
        "aliases": ["Cổng Chùa Koh Kas"],
        "data_flags": ["coord_outlier: TT_099 (10.438, 104.981) lệch ~2km", "parent_poi: HG004", "spelling_fixed: Chau Lăng → Châu Lăng"]
    },
    "HG001": {
        "name": "Chùa Tà Pạ (Chùa Núi)",
        "category": "Chùa Khmer",
        "description": "Ngôi chùa Khmer trên ngọn đồi Tà Pạ có kiến trúc tháp nhọn uy nghi, nhìn xuống hồ Tà Pạ.",
        "address": "Ngọn đồi Tà Pạ, Ấp Tà Pạ, Xã Núi Tô, Tri Tôn, An Giang",
        "commune": "Xã Núi Tô",
        "latitude": 10.4208,
        "longitude": 105.0135,
        "opening_hours": "06:00 - 18:00",
        "ticket_price": "Miễn phí",
        "rating": 4.7,
        "review_count": 1870,
        "aliases": ["Chùa Núi Tà Pạ"],
        "data_flags": []
    },
    "HG002": {
        "name": "Chùa Xà Tón (Wat Xvayton)",
        "category": "Chùa Khmer cổ",
        "description": "Ngôi chùa Khmer cổ nhất An Giang (hơn 500 năm tuổi, xây kiên cố 1896, tên gốc nghĩa là 'khỉ đeo'), lưu giữ hơn 100 bộ kinh lá buông - di sản văn hóa phi vật thể quốc gia.",
        "address": "Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang",
        "commune": "Thị trấn Tri Tôn",
        "latitude": 10.4132,
        "longitude": 105.0088,
        "opening_hours": "06:00 - 18:00",
        "ticket_price": "Miễn phí",
        "rating": 4.8,
        "review_count": 2140,
        "aliases": ["Chùa Xvayton", "Wat Xvayton", "Chùa Cũ"],
        "data_flags": ["fact_verified_batch2: di tích quốc gia 1989; kinh lá buông = DSVHPVT quốc gia"]
    },
    "FD014": {
        "name": "Quán Bò 7 Món Ba Chúc",
        "category": "Ẩm thực",
        "description": "Nhà hàng thịt bò Bảy Núi nướng bơ tỏi và lẩu bò trái trúc thơm lừng.",
        "address": "Tỉnh lộ 955N, Ấp An Bình, Thị trấn Ba Chúc, Tri Tôn, An Giang",
        "commune": "Thị trấn Ba Chúc",
        "latitude": 10.496,
        "longitude": 104.909,
        "opening_hours": "09:00 - 21:00",
        "ticket_price": "80k - 200k",
        "rating": 4.6,
        "review_count": 670,
        "aliases": ["Nhà hàng Bò 7 Món Ba Chúc"],
        "data_flags": ["review_count_not_doubled: TT_084 trùng rating/review với FD014 → nghi cùng nguồn"]
    },
    "FD018": {
        "name": "Nhà hàng Gà Đốt Ô Thum Siêu Bó",
        "category": "Ẩm thực",
        "description": "Gà đốt lá chúc giòn da thơm cay bản địa, nướng niêu đất truyền thống tại bờ hồ Ô Thum.",
        "address": "Bờ hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang",
        "commune": "Xã Ô Lâm",
        "latitude": 10.3775,
        "longitude": 104.9921,
        "opening_hours": "08:00 - 20:00",
        "ticket_price": "Tùy món",
        "rating": 4.6,
        "review_count": 1420,
        "aliases": ["Gà Đốt Ô Thum Siêu Bó"],
        "data_flags": ["renamed_from: TT_083"]
    },
    "FD020": {
        "name": "Lò Đường Thốt Nốt Nguyên Chất Châu Lăng - Út Huệ",
        "category": "Ẩm thực",
        "description": "Lò thắng đường thốt nốt mật ngào dẻo thủ công chính gốc.",
        "address": "Tỉnh lộ 941, Ấp An Hòa, Xã Châu Lăng, Tri Tôn, An Giang",
        "commune": "Xã Châu Lăng",
        "latitude": 10.435,
        "longitude": 104.985,
        "opening_hours": "08:00 - 20:00",
        "ticket_price": "Tùy món",
        "rating": 4.9,
        "review_count": 340,
        "aliases": ["Lò Đường Thốt Nốt Út Huệ"],
        "data_flags": ["renamed_from: TT_086", "address_conflict: TT_086 ghi TL941 vs TT_106 ghi TL948 → cần verify thực địa", "review_count_not_doubled"]
    },
    "PL021": {
        "name": "Chợ Trung Tâm Tri Tôn",
        "category": "Chợ",
        "description": "Chợ trung tâm sầm uất ngập tràn ẩm thực bánh bò thốt nốt, bún nước lèo.",
        "address": "Đường Trần Hưng Đạo, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang",
        "commune": "Thị trấn Tri Tôn",
        "latitude": 10.4125,
        "longitude": 105.0068,
        "opening_hours": "05:00 - 20:00",
        "ticket_price": "Miễn phí",
        "rating": 4.5,
        "review_count": 1120,
        "aliases": ["Chợ Tri Tôn"],
        "data_flags": ["spelling_fixed: Tran Hung Dao → Trần Hưng Đạo", "hours_adjusted: chợ truyền thống mở sớm từ 05:00 (CSV ghi 08:00)"]
    },
    "PL022": {
        "name": "Khu Ẩm Thực Chợ Đêm Tri Tôn",
        "category": "Chợ",
        "description": "Khu phố chợ đêm sầm uất bán đồ ăn vặt thốt nốt, xiên nướng, cháo bò.",
        "address": "Quảng trường Quảng Tế, Khóm 3, Thị trấn Tri Tôn, Tri Tôn, An Giang",
        "commune": "Thị trấn Tri Tôn",
        "latitude": 10.4138,
        "longitude": 105.0075,
        "opening_hours": "17:00 - 22:00",
        "ticket_price": "Miễn phí",
        "rating": 4.6,
        "review_count": 780,
        "aliases": ["Chợ Đêm Tri Tôn"],
        "data_flags": ["hours_fixed: CSV ghi 08:00-20:00 bất hợp lý cho chợ đêm → đề xuất 17:00-22:00, cần verify"]
    }
}

def norm_text(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFC", s)
    s = s.replace("Huyện Tri Tôn, ", "").replace(", Huyện Tri Tôn", "").replace("Huyện Tri Tôn", "")
    s = s.replace("Chau Lăng", "Châu Lăng")
    s = s.replace("Tran Hung Dao", "Trần Hưng Đạo")
    s = s.replace("Xã Cô Tô", "Thị trấn Tri Tôn")
    return s.strip()

def main():
    print("=== EXECUTING CANONICAL 106 -> 95 DEDUPLICATION & ENRICHMENT PIPELINE ===")
    
    csv_path = "data/tri_ton_master_cleaned.csv"
    if not os.path.exists(csv_path):
        print(f"ERROR: {csv_path} not found.")
        return

    with open(csv_path, "r", encoding="utf-8-sig") as f:
        reader = list(csv.DictReader(f))

    records_dict = {row["id"]: row for row in reader}
    print(f"1. Loaded raw CSV records: {len(records_dict)}")

    merged_tracker = {}
    
    # Process Merge Mapping
    for dup_id, canon_id in MERGE_INTO.items():
        if dup_id in records_dict:
            merged_tracker.setdefault(canon_id, []).append(dup_id)
            # Delete duplicate row from active dictionary
            del records_dict[dup_id]

    print(f"2. Merged {len(MERGE_INTO)} duplicate records. Active records remaining: {len(records_dict)}")

    final_records = []
    
    for rid, row in records_dict.items():
        # Determine target canonical ID (handle renames)
        target_id = RENAME_MAP.get(rid, rid)
        
        # Check if record has explicit enrichment overrides
        if target_id in ENRICHED_OVERRIDES:
            ov = ENRICHED_OVERRIDES[target_id]
            rec = {
                "id": target_id,
                "name": norm_text(ov["name"]),
                "category": CATEGORY_MAP.get(ov["category"], ov["category"]),
                "description": norm_text(ov["description"]),
                "address": norm_text(ov["address"]),
                "commune": norm_text(ov["commune"]),
                "latitude": float(ov["latitude"]),
                "longitude": float(ov["longitude"]),
                "opening_hours": ov["opening_hours"],
                "ticket_price": ov["ticket_price"],
                "rating": float(ov["rating"]),
                "review_count": int(ov["review_count"]),
                "confidence_score": float(row.get("confidence_score", 95.0)),
                "aliases": ov.get("aliases", []),
                "merged_from": merged_tracker.get(rid, []) + merged_tracker.get(target_id, []),
                "data_flags": ov.get("data_flags", []),
                "is_active": True
            }
        else:
            cat = row.get("category", "attractions_nature")
            cat_display = CATEGORY_MAP.get(cat, cat)
            rec = {
                "id": target_id,
                "name": norm_text(row.get("name", "")),
                "category": cat_display,
                "description": norm_text(row.get("description", "")),
                "address": norm_text(row.get("address", "")),
                "commune": norm_text(row.get("commune", "")),
                "latitude": float(row.get("latitude", 0)),
                "longitude": float(row.get("longitude", 0)),
                "opening_hours": row.get("opening_hours", "07:00 - 18:00"),
                "ticket_price": row.get("ticket_price", "Miễn phí"),
                "rating": float(row.get("rating", 4.5)),
                "review_count": int(row.get("review_count", 100)),
                "confidence_score": float(row.get("confidence_score", 95.0)),
                "aliases": [],
                "merged_from": merged_tracker.get(rid, []) + merged_tracker.get(target_id, []),
                "data_flags": [],
                "is_active": True
            }
            
        final_records.append(rec)

    # Sort final records by ID
    final_records.sort(key=lambda x: x["id"])
    print(f"3. Final Canonical Clean Master Dataset: {len(final_records)} records.")

    # 1. Write Clean CSV (UTF-8-SIG)
    csv_headers = [
        "id", "name", "category", "description", "address", "commune",
        "latitude", "longitude", "opening_hours", "ticket_price",
        "rating", "review_count", "confidence_score", "is_active"
    ]
    with open("data/tri_ton_master_cleaned.csv", "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=csv_headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(final_records)
    print("4. Saved clean CSV: data/tri_ton_master_cleaned.csv")

    # 2. Write Clean JSON (UTF-8)
    with open("data/tri_ton_master_cleaned.json", "w", encoding="utf-8") as f:
        json.dump(final_records, f, ensure_ascii=False, indent=2)
    print("5. Saved clean JSON: data/tri_ton_master_cleaned.json")

    # 3. Write Clean GeoJSON (WGS84)
    features = []
    for r in final_records:
        feat = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [r["longitude"], r["latitude"]]
            },
            "properties": {
                "id": r["id"],
                "name": r["name"],
                "category": r["category"],
                "commune": r["commune"],
                "rating": r["rating"],
                "review_count": r["review_count"]
            }
        }
        features.append(feat)

    geojson_data = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Cơ Sở Dữ Liệu Tọa Độ WGS84 Du Lịch Tri Tôn",
            "version": "10.7.0",
            "total_records": len(features)
        },
        "features": features
    }
    with open("data/tri_ton_master_cleaned.geojson", "w", encoding="utf-8") as f:
        json.dump(geojson_data, f, ensure_ascii=False, indent=2)
    print("6. Saved clean GeoJSON: data/tri_ton_master_cleaned.geojson")

    print(f"SUCCESS! Clean dataset down to EXACTLY {len(final_records)} canonical records.")

if __name__ == "__main__":
    main()
