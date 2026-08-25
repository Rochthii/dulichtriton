"""
Script khôi phục và chuẩn hóa thông tin Nhà Thiếu Nhi Huyện Tri Tôn lên Supabase Cloud & Master JSON:
- Tọa độ: 10.4230431, 105.0014886
- Địa chỉ: Số 89 Trần Hưng Đạo, Khóm 1, Thị trấn Tri Tôn, An Giang
- Diện tích: 15.280 m2
- Thông tin văn hóa, vui chơi, lớp năng khiếu xác minh 100%
"""
import os
import sys
import json
import urllib.request
import urllib.parse
from dotenv import load_dotenv

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

env_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
if os.path.exists(env_path):
    load_dotenv(env_path)

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL', 'https://knmlbwsmfljlabhvqfid.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')

nha_thieu_nhi_record = {
    "id": "nha-thieu-nhi",
    "name": "Nhà Thiếu Nhi Huyện Tri Tôn",
    "name_en": "Tri Ton Children & Youth Cultural House",
    "slug": "nha-thieu-nhi-tri-ton",
    "category": "culture",
    "subcategory": "Trung tâm Văn hóa & Vui chơi",
    "tourism_category": "Văn hóa & Sinh hoạt cộng đồng",
    "commune": "Thị trấn Tri Tôn",
    "district": "Huyện Tri Tôn",
    "province": "Tỉnh An Giang",
    "address": "Số 89 Đường Trần Hưng Đạo, Khóm 1, Thị trấn Tri Tôn, Tri Tôn, An Giang",
    "latitude": 10.4230431,
    "longitude": 105.0014886,
    "rating": 4.7,
    "price_level": "Miễn phí vé vào cổng",
    "opening_hours": "07:00 - 21:00",
    "open_late": True,
    "best_time": "Buổi chiều mát mẻ (16:30 - 20:30) và các dịp cuối tuần",
    "description": "Trung tâm sinh hoạt văn hóa, vui chơi giải trí và rèn luyện năng khiếu rộng hơn 1,5 ha tại trung tâm thị trấn Tri Tôn. Điểm đến dạo chơi lý tưởng cho các gia đình có trẻ nhỏ và thanh thiếu niên vào buổi chiều tối.",
    "detailed_story": "Khám Phá Nhà Thiếu Nhi Huyện Tri Tôn – Không Gian Văn Hóa & Vui Chơi Năng Động Xứ Bảy Núi\n\n1. Lịch Sử & Quy Mô Công Trình:\n• Địa chỉ: Số 89, đường Trần Hưng Đạo, Khóm 1, Thị trấn Tri Tôn, An Giang.\n• Khánh thành ngày 20/9/2013, đây là công trình Nhà thiếu nhi cấp huyện đầu tiên được xây dựng tại tỉnh An Giang với tổng diện tích khuôn viên hơn 15.280 m².\n• Quy mô bao gồm khu hành chính, hệ thống phòng học năng khiếu (võ thuật Taekwondo, Karatedo, Vovinam, thể dục nhịp điệu, âm nhạc, hội họa), hội trường lớn, sân khấu biểu diễn và khu vui chơi ngoài trời rộng rãi.\n\n2. Hoạt Động & Trải Nghiệm Thực Địa:\n• Không gian vui chơi rộng rãi, thoáng mát rợp bóng cây xanh, là điểm hẹn quen thuộc của các gia đình địa phương và du khách đưa con em đến vui chơi, chạy nhảy thư giãn mỗi buổi chiều tà.\n• Nơi thường xuyên diễn ra các hội thi văn nghệ, giao lưu văn hóa thiếu nhi Khmer - Kinh, các giải thi đấu thể thao phong trào và chương trình Tết Trung Thu, Quốc tế Thiếu nhi rộn rã.",
    "field_tips": "Thích hợp nhất để dạo chơi từ 17:00 – 20:00 khi khuôn viên lên đèn mát mẻ. Gần đó có nhiều quán ăn vặt, trà sữa và đặc sản cháo bò Tri Tôn trên trục đường Trần Hưng Đạo.",
    "is_active": True,
    "is_verified": True
}

def restore_to_supabase():
    print("--- [BƯỚC 1: KHÔI PHỤC LÊN SUPABASE CLOUD] ---")
    url = f"{SUPABASE_URL}/rest/v1/places"
    req = urllib.request.Request(
        url,
        data=json.dumps(nha_thieu_nhi_record).encode('utf-8'),
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        print(f"✓ Đã khôi phục thành công Nhà Thiếu Nhi Huyện Tri Tôn lên Supabase Cloud (Status: {res.status})")

def restore_to_local_json():
    print("\n--- [BƯỚC 2: CẬP NHẬT MASTER DATA CỤC BỘ] ---")
    json_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'triton_pois_full.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        places = json.load(f)

    # Replace or append
    places = [p for p in places if p.get('id') != 'nha-thieu-nhi']
    places.append(nha_thieu_nhi_record)

    # Sort
    places.sort(key=lambda x: (x.get('commune', '') or '', x.get('name', '') or ''))

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(places, f, ensure_ascii=False, indent=2)

    print(f"✓ Đã cập nhật triton_pois_full.json (Tổng số: {len(places)} địa điểm)")

def main():
    print("================================================================================")
    print("🚀 KHÔI PHỤC VÀ CHUẨN HÓA THÔNG TIN: NHÀ THIẾU NHI HUYỆN TRI TÔN")
    print("================================================================================")
    restore_to_supabase()
    restore_to_local_json()
    print("================================================================================")
    return 0

if __name__ == '__main__':
    sys.exit(main())
