import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

with open('data/triton_pois_full.json', 'r', encoding='utf-8') as f:
    pois = json.load(f)

# Ensure Gà Đốt Ốc Đảo exists as separate POI
existing_ids = {p.get('id'): p for p in pois}
if 'quan-ga-dot-oc-dao-ho-o-thum' not in existing_ids:
    new_poi = {
        "id": "quan-ga-dot-oc-dao-ho-o-thum",
        "place_id": "quan-ga-dot-oc-dao-ho-o-thum",
        "name": "Gà Đốt Ốc Đảo Quán Hồ Ô Thum",
        "slug": "ga-dot-oc-dao-quan-ho-o-thum",
        "category": "food",
        "subcategory": "Quán gà đốt Ô Thum",
        "tourism_category": "Ẩm thực Bảy Núi",
        "description": "Gà Đốt Ốc Đảo Quán Hồ Ô Thum - Mỏm đất nhô ra giữa lòng hồ Ô Thum với tầm nhìn 360 độ ngắm trọn mặt nước xanh biếc.",
        "short_description": "Quán gà đốt mỏm đất view 360 độ ngắm trọn hồ Ô Thum",
        "address": "Mỏm đất Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, Tri Tôn, An Giang",
        "commune": "Xã Ô Lâm",
        "district": "Tri Tôn",
        "province": "An Giang",
        "latitude": 10.3855,
        "longitude": 104.9755,
        "opening_hours": "08:00 - 19:00 (Mỗi ngày)",
        "price_level": "250.000đ - 320.000đ / con",
        "ticket_price": "250.000đ - 320.000đ / con",
        "rating": 4.8,
        "review_count": 80,
        "photos": ["/images/places/ga-dot-o-thum.jpg"],
        "search_keywords": ["gà đốt ốc đảo", "gà đốt ô thum", "hồ ô thum"],
        "travel_tags": ["ẩm thực", "gà đốt", "hồ ô thum", "view hồ"],
        "is_hot": True,
        "is_verified": True,
        "detailed_story": """Gà Đốt Ốc Đảo Quán Hồ Ô Thum – Mỏm Đất Nhô Giữa Lòng Hồ Với View Nước 360 Độ Tuyệt Mỹ

Tọa lạc trên một mỏm đất tự nhiên nhô hẳn ra giữa lòng hồ Ô Thum tựa như một ốc đảo xanh thu nhỏ, Quán Gà Đốt Ốc Đảo mang lại trải nghiệm ẩm thực độc nhất vô nhị với tầm nhìn 360 độ ngắm trọn mặt nước xanh biếc và dãy đồi núi Ô Lâm trập trùng bao quanh.

### 1. Vị Trí "Ốc Đảo" Độc Nhất Vô Nhị

- **Vị trí hành chính:** Bờ Hồ Ô Thum, Ấp Phước Thọ, Xã Ô Lâm, tỉnh An Giang.
- **Địa thế ốc đảo xanh:** Quán được bao bọc ba mặt bởi làn nước hồ trong vắt, gió thổi lồng lộng quanh năm mang lại không khí mát lạnh tự nhiên không cần quạt máy.

### 2. Món Gà Đốt Nồi Đất Vàng Giòn

- **Kỹ thuật đốt gà đỉnh cao:** Gà được đốt trong nồi gang đất dày trên than hồng, da gà xém vàng giòn rụm thơm nức mũi mùi lá chúc, thịt bên trong mềm ngọt mọng nước.
- **Phục vụ đa dạng:** Ngoài gà đốt còn có các món cá lóc nướng trui, lẩu cá lăng nấu măng chua, xôi bắp thốt nốt.

### 3. Trải Nghiệm Ngắm Hoàng Hôn 360 Độ

- **Khung giờ vàng:** 16:30 – 17:45 là khoảnh khắc đẹp nhất khi ánh hoàng hôn nhuộm đỏ cả mặt hồ bao quanh quán.

### 4. Thông Tin Đặt Chỗ

- **Giờ mở cửa:** 08:00 – 19:00 hàng ngày.
- **Giá bán:** 250.000đ – 320.000đ / con."""
    }
    pois.append(new_poi)
    print("✅ Added separate Gà Đốt Ốc Đảo POI!")

with open('data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

with open('frontend/src/data/triton_pois_full.json', 'w', encoding='utf-8') as f:
    json.dump(pois, f, ensure_ascii=False, indent=2)

print(f"Master POIs count: {len(pois)}")
